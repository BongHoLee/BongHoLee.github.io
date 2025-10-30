---
title: "claude code의 settings.json 가이드"
description: "더 나은 상호작용을 위해 settings.json에 대해 톺아보자"
pubDate: 2025-10-30
author: "Bong5"
tags: ["AI", "thought"]
---

# Claude Code CLI 완전 가이드

## 목차
1. [개요](#개요)
2. [settings.json 표준 규격](#settingsjson-표준-규격)
3. [실행 메커니즘](#실행-메커니즘)
4. [설정 수정 및 적용](#설정-수정-및-적용)
5. [실전 활용 전략](#실전-활용-전략)
6. [문제 해결](#문제-해결)

---

## 개요

### Claude Code CLI란?
- 터미널 기반 에이전틱 코딩 도구
- 코드베이스와 직접 상호작용 (파일 읽기/쓰기, Git 작업, 테스트 실행 등)
- `.claude/settings.json`을 통한 설정 관리

### 핵심 구성 요소
```
Claude Code CLI
├── settings.json (설정 파일)
├── MCP 서버 (외부 도구 연결)
└── 내장 도구 (Read, Write, Bash, TodoWrite 등)
```

---

## settings.json 표준 규격

### 기본 구조

```json
{
  "mcpServers": {
    "서버이름": {
      "command": "실행명령어",
      "args": ["인자1", "인자2"],
      "env": {
        "환경변수": "값"
      }
    }
  },
  "permissionPolicy": {
    "allowedCommands": ["허용할", "명령어"],
    "blockedCommands": ["차단할", "명령어"],
    "allowedPaths": ["/허용/경로"],
    "blockedPaths": ["/차단/경로"]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["자동승인할도구"],
    "alwaysAsk": ["항상물어볼도구"]
  },
  "security": {
    "dangerouslyAllowAnyCommand": false,
    "requireExplicitFileAccess": true
  }
}
```

### 필드별 상세 설명

#### 1. mcpServers (필수)
MCP(Model Context Protocol) 서버 설정

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
    }
  }
}
```

**스키마:**
- `command`: 실행 가능한 명령어 (문자열)
- `args`: 명령어 인자 배열 (문자열 배열)
- `env`: 환경 변수 객체 (선택적)

#### 2. permissionPolicy (선택적)
명령어 및 파일 접근 제어

```json
{
  "permissionPolicy": {
    "allowedCommands": ["git", "npm", "docker", "./gradlew"],
    "blockedCommands": ["rm -rf", "sudo", "chmod 777"],
    "allowedPaths": [
      "/Users/username/projects",
      "/workspace"
    ],
    "blockedPaths": [
      ".env",
      ".env.production",
      "~/.ssh",
      "/etc"
    ]
  }
}
```

**동작 방식:**
- `blockedCommands`: 최우선 차단 (다른 설정 무시)
- `allowedCommands`: 정의 시 화이트리스트 방식 (명시된 것만 허용)
- `allowedCommands` 미정의 시: 블랙리스트 방식 (blockedCommands만 차단)

#### 3. toolApprovalPolicy (선택적)
도구 실행 승인 정책

```json
{
  "toolApprovalPolicy": {
    "autoApprove": [
      "Read",
      "Glob",
      "Grep"
    ],
    "alwaysAsk": [
      "Write",
      "Edit",
      "Bash"
    ]
  }
}
```

**우선순위:** `alwaysAsk` > `autoApprove`

#### 4. security (선택적)
전역 보안 설정

```json
{
  "security": {
    "dangerouslyAllowAnyCommand": false,
    "requireExplicitFileAccess": true,
    "allowNetworkAccess": false
  }
}
```

---

## 실행 메커니즘

### 전체 흐름도

```
사용자가 claude-code 실행
    ↓
┌─────────────────────────────────────┐
│ 1. 초기화 단계 (한 번만)             │
│  ├─ .claude/settings.json 파싱      │
│  ├─ JSON 스키마 검증                │
│  ├─ MCP 서버 프로세스 시작           │
│  └─ 각 서버에서 도구 목록 수집       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 2. Claude 모델 초기화                │
│  └─ 사용 가능한 전체 도구 목록 전달  │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 3. 사용자 요청 처리 (반복)           │
│  ├─ Claude가 도구 호출 결정          │
│  ├─ CLI가 권한 검증                  │
│  ├─ 필요시 사용자 승인 요청          │
│  └─ 도구 실행 및 결과 반환           │
└─────────────────────────────────────┘
```

### 1. 초기화 단계 (claude-code 실행 시)

```javascript
// 의사 코드
async function initializeCLI() {
  // 1단계: settings.json 로드
  const settingsPath = '.claude/settings.json';
  const settings = JSON.parse(fs.readFileSync(settingsPath));
  
  // 2단계: 스키마 검증
  if (!settings.mcpServers || typeof settings.mcpServers !== 'object') {
    throw new Error('Invalid settings.json: mcpServers must be an object');
  }
  
  // 3단계: MCP 서버 시작
  const mcpClients = {};
  for (const [name, config] of Object.entries(settings.mcpServers)) {
    // 자식 프로세스 생성
    const process = spawn(config.command, config.args, {
      env: { ...process.env, ...config.env },
      stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
    });
    
    // JSON-RPC 2.0 통신 클라이언트 생성
    mcpClients[name] = new McpClient(process.stdin, process.stdout);
  }
  
  // 4단계: 각 MCP 서버에서 도구 목록 가져오기
  const allTools = [];
  for (const client of Object.values(mcpClients)) {
    const response = await client.request({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    });
    allTools.push(...response.result.tools);
  }
  
  // 5단계: 메모리에 저장 (이후 재사용)
  return {
    settings,        // 권한 검증용
    mcpClients,      // 도구 실행용
    allTools         // Claude 모델에 전달
  };
}
```

**중요:** settings.json은 시작 시 한 번만 로드되어 메모리에 상주합니다.

### 2. 도구 실행 단계 (매 호출마다)

```javascript
async function executeTool(toolName, toolArgs, context) {
  const { settings } = context;
  
  // 1단계: 보안 정책 체크 (최우선)
  if (settings.security?.dangerouslyAllowAnyCommand === false) {
    // 추가 검증 수행
  }
  
  // 2단계: 권한 정책 체크
  if (toolName === 'Bash') {
    const command = toolArgs.command;
    
    // 차단 명령어 체크
    if (settings.permissionPolicy?.blockedCommands) {
      for (const blocked of settings.permissionPolicy.blockedCommands) {
        if (command.includes(blocked)) {
          throw new Error(`Blocked command: ${blocked}`);
        }
      }
    }
    
    // 허용 명령어 체크 (정의된 경우만)
    if (settings.permissionPolicy?.allowedCommands) {
      const isAllowed = settings.permissionPolicy.allowedCommands.some(
        allowed => command.startsWith(allowed)
      );
      if (!isAllowed) {
        throw new Error(`Command not in allowedCommands: ${command}`);
      }
    }
  }
  
  // 3단계: 승인 정책 체크
  if (settings.toolApprovalPolicy?.alwaysAsk?.includes(toolName)) {
    const approved = await promptUser(`Execute ${toolName}?\n${JSON.stringify(toolArgs)}\n(y/n): `);
    if (!approved) {
      throw new Error('User rejected tool execution');
    }
  } else if (!settings.toolApprovalPolicy?.autoApprove?.includes(toolName)) {
    // 명시적으로 autoApprove에 없으면 기본적으로 물어봄 (안전 우선)
    const approved = await promptUser(`Execute ${toolName}? (y/n): `);
    if (!approved) {
      throw new Error('User rejected tool execution');
    }
  }
  
  // 4단계: 실제 도구 실행
  return await executeToolInternal(toolName, toolArgs);
}
```

### 검증 우선순위

```
security (전역 보안)
    ↓
permissionPolicy.blockedCommands (명시적 차단)
    ↓
permissionPolicy.allowedCommands (화이트리스트)
    ↓
toolApprovalPolicy.alwaysAsk (사용자 승인 필수)
    ↓
toolApprovalPolicy.autoApprove (자동 승인)
    ↓
기본 동작 (사용자에게 물어봄)
```

---

## 설정 수정 및 적용

### 수정 시점

| 수정 방법 | 시점 | 적용 |
|----------|------|------|
| 사용자 직접 편집 | 언제든지 | 다음 실행 시 |
| CLI 초기 설정 | 첫 실행 시 | 즉시 |
| 설정 명령어 | CLI 버전에 따라 다름 | 즉시 또는 다음 실행 시 |

### 사용자 직접 수정 (주요 방법)

```bash
# 에디터로 편집
vi .claude/settings.json
code .claude/settings.json

# 다음 실행 시 적용됨
claude-code
```

**중요 사항:**
- 현재 실행 중인 세션에는 적용 안 됨
- 설정 변경 후 CLI 재시작 필요
- JSON 문법 오류 시 CLI 시작 실패

### 적용 확인

```bash
# 1. 잘못된 설정으로 테스트
echo '{"mcpServers": "invalid"}' > .claude/settings.json
claude-code
# → 에러 메시지로 스키마 확인 가능

# 2. 권한 테스트
# settings.json에 allowedCommands: ["git"] 설정 후
claude-code
# → "npm install" 시도 시 차단되는지 확인

# 3. 로그 확인 (verbose 모드)
claude-code --verbose
```

### 핫 리로드 미지원

```bash
# 터미널 1: Claude Code 실행 중
claude-code

# 터미널 2: 설정 수정
echo '{"mcpServers": {...}}' > .claude/settings.json

# 터미널 1: 변경사항 적용 안 됨 (메모리에 이미 로드됨)
# → 세션 종료 후 재시작 필요
```

---

## 실전 활용 전략

### 1. 프로젝트 타입별 템플릿 관리

#### 디렉토리 구조
```bash
~/.claude-templates/
├── backend-spring.json
├── backend-kotlin.json
├── frontend-react.json
├── data-pipeline.json
└── review-only.json
```

#### Spring Boot 백엔드 템플릿
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token"
      }
    }
  },
  "permissionPolicy": {
    "allowedCommands": [
      "./gradlew",
      "git",
      "docker",
      "kubectl"
    ],
    "blockedPaths": [
      "src/main/resources/application-prod.yml",
      "src/main/resources/application-prod.properties",
      ".env.production"
    ]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["Read", "Grep", "Glob"],
    "alwaysAsk": ["Write", "Edit", "Bash"]
  }
}
```

#### 데이터 파이프라인 템플릿
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  },
  "permissionPolicy": {
    "allowedCommands": [
      "python",
      "spark-submit",
      "airflow",
      "git"
    ],
    "blockedCommands": [
      "hbase shell",
      "DROP TABLE"
    ]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["Read", "Grep", "Glob", "Bash"],
    "alwaysAsk": ["Write"]
  }
}
```

#### 코드 리뷰 전용 템플릿
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token"
      }
    }
  },
  "permissionPolicy": {
    "allowedCommands": ["git", "gh"],
    "blockedCommands": ["git push", "git commit"]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["Read", "Grep", "Glob"],
    "alwaysAsk": ["Write", "Edit", "Bash"]
  }
}
```

#### 템플릿 적용 스크립트
```bash
#!/bin/bash
# setup-claude.sh

TEMPLATE=$1

if [ -z "$TEMPLATE" ]; then
  echo "Usage: $0 <template-name>"
  echo "Available templates:"
  ls ~/.claude-templates/
  exit 1
fi

TEMPLATE_FILE=~/.claude-templates/${TEMPLATE}.json

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Template not found: $TEMPLATE_FILE"
  exit 1
fi

mkdir -p .claude
cp "$TEMPLATE_FILE" .claude/settings.json

# 환경 변수 치환 (필요시)
if [ -n "$GITHUB_TOKEN" ]; then
  sed -i '' "s/your_token/$GITHUB_TOKEN/" .claude/settings.json
fi

echo "Claude settings configured with template: $TEMPLATE"
echo "Run 'claude-code' to start."
```

**사용 예:**
```bash
# 새 프로젝트 시작
cd my-spring-project
setup-claude.sh backend-spring

# 코드 리뷰 시작
cd target-repository
setup-claude.sh review-only

claude-code
```

### 2. 작업 모드별 설정 전환

#### 개발 모드 (편의성 우선)
```json
{
  "mcpServers": {
    "filesystem": { /* ... */ },
    "github": { /* ... */ }
  },
  "permissionPolicy": {
    "blockedCommands": ["rm -rf /", "sudo rm", "> /dev/sda"],
    "blockedPaths": [".env.production", "/etc", "~/.ssh"]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
  }
}
```

#### 프로덕션 모드 (안전성 우선)
```json
{
  "mcpServers": {
    "filesystem": { /* ... */ }
  },
  "permissionPolicy": {
    "allowedCommands": ["git status", "git diff", "git log"],
    "allowedPaths": ["/workspace/readonly"]
  },
  "toolApprovalPolicy": {
    "autoApprove": ["Read", "Grep", "Glob"],
    "alwaysAsk": ["Write", "Edit", "Bash"]
  },
  "security": {
    "dangerouslyAllowAnyCommand": false,
    "requireExplicitFileAccess": true
  }
}
```

#### 모드 전환 스크립트
```bash
#!/bin/bash
# switch-mode.sh

MODE=$1

case $MODE in
  dev)
    cp .claude/settings.dev.json .claude/settings.json
    echo "Switched to DEVELOPMENT mode (편의성 우선)"
    ;;
  prod)
    cp .claude/settings.prod.json .claude/settings.json
    echo "Switched to PRODUCTION mode (안전성 우선)"
    ;;
  review)
    cp .claude/settings.review.json .claude/settings.json
    echo "Switched to REVIEW mode (읽기 전용)"
    ;;
  *)
    echo "Usage: $0 {dev|prod|review}"
    exit 1
    ;;
esac

echo "Restart claude-code to apply changes."
```

### 3. 안전 장치 설정 (필수 권장)

```json
{
  "mcpServers": { /* ... */ },
  "permissionPolicy": {
    "blockedCommands": [
      "rm -rf",
      "sudo",
      "chmod 777",
      "chmod -R 777",
      "> /dev/sda",
      "dd if=",
      "mkfs",
      ":(){ :|:& };:",
      "curl | sh",
      "wget | sh"
    ],
    "blockedPaths": [
      ".env",
      ".env.local",
      ".env.production",
      ".env.staging",
      "*/secrets/*",
      "*/credentials/*",
      "~/.ssh",
      "~/.aws",
      "/etc",
      "/System",
      "/usr/bin",
      "/usr/sbin"
    ]
  },
  "toolApprovalPolicy": {
    "alwaysAsk": ["Bash", "Write", "Edit"]
  }
}
```

**효과:**
- 실수로 시스템 파일 삭제 방지
- 위험한 셸 명령어 실행 차단
- 민감한 설정 파일 접근 불가
- 중요 파일 수정 시 반드시 승인 필요

### 4. MCP 서버 선택적 로드

#### 최소 구성 (기본)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

#### 필요시 주석 해제 방식
```json
{
  "mcpServers": {
    // 항상 활성화
    "filesystem": { /* ... */ },
    
    // GitHub 작업 시에만 활성화
    // "github": {
    //   "command": "npx",
    //   "args": ["-y", "@modelcontextprotocol/server-github"],
    //   "env": {
    //     "GITHUB_TOKEN": "your_token"
    //   }
    // },
    
    // Slack 연동 시에만 활성화
    // "slack": {
    //   "command": "npx",
    //   "args": ["-y", "@modelcontextprotocol/server-slack"],
    //   "env": {
    //     "SLACK_TOKEN": "your_token"
    //   }
    // }
  }
}
```

**장점:**
- CLI 시작 속도 향상
- 메모리 사용량 감소
- Claude가 불필요한 도구로 혼란스러워하는 것 방지

### 5. 환경별 MCP 설정

#### GitHub Enterprise 환경
```json
{
  "mcpServers": {
    "github-enterprise": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_ghe_token",
        "GITHUB_API_URL": "https://github.company.com/api/v3"
      }
    }
  }
}
```

#### 내부 데이터베이스 연결
```json
{
  "mcpServers": {
    "internal-db": {
      "command": "node",
      "args": ["/opt/mcp-servers/hbase-readonly-server.js"],
      "env": {
        "HBASE_ZOOKEEPER": "zk1.internal:2181,zk2.internal:2181",
        "DB_READ_ONLY": "true",
        "MAX_ROWS": "1000"
      }
    }
  }
}
```

### 6. 주기적 리셋 루틴

#### 수동 정리 체크리스트
```bash
# 1. .claude 디렉토리 백업
cp -r .claude .claude.backup.$(date +%Y%m%d)

# 2. 현재 설정 확인
cat .claude/settings.json | jq '.mcpServers | keys'

# 3. 사용하지 않는 MCP 서버 제거
# settings.json 편집

# 4. 테스트 후 백업 삭제
rm -rf .claude.backup.*
```

#### 자동화 스크립트
```bash
#!/bin/bash
# reset-claude.sh

# 백업
BACKUP_DIR=".claude.backup.$(date +%Y%m%d_%H%M%S)"
cp -r .claude "$BACKUP_DIR"
echo "Backup created: $BACKUP_DIR"

# 기본 템플릿으로 초기화
cp ~/.claude-templates/minimal.json .claude/settings.json

echo "Claude settings reset to minimal configuration."
echo "Backup available at: $BACKUP_DIR"
echo "To restore: cp -r $BACKUP_DIR .claude"
```

**실행 주기:** 월 1회 또는 프레임워크 테스트 후

### 7. 도구 명시적 사용 패턴

#### AskUserQuestion 활용
```
"API 설계 전에 AskUserQuestion 도구를 사용해서 다음 선택지를 제시해줘:
1. 응답 형식: JSON / Protocol Buffers / MessagePack
2. 페이징 방식: offset-based / cursor-based
3. 에러 코드 체계: HTTP only / Custom error codes
각 옵션의 장단점도 함께 설명해줘."
```

#### TodoWrite 강제 사용
```
"대규모 리팩토링 시작 전에:
1. TodoWrite로 전체 작업 계획 수립
2. 각 단계별 의존성 표시
3. 예상 소요 시간 명시
4. 완료 여부를 실시간으로 추적

작업 진행하면서 각 단계 완료할 때마다 TodoWrite 업데이트해줘."
```

#### Explore 에이전트 활용
```
"Task(Explore) 도구로 먼저 코드베이스 탐색해줘:
1. HBase 연결 패턴 찾기
2. 기존 bulk delete 구현 확인
3. 에러 처리 방식 분석

탐색 완료 후 결과를 요약해주고, 그 다음에 구현 시작하자."
```

### 8. 프로젝트 루트 표시

#### .claude 존재 여부로 프로젝트 루트 식별
```bash
# 현재 디렉토리가 Claude Code 프로젝트인지 확인
if [ -d ".claude" ]; then
  echo "✓ Claude Code project detected"
  claude-code
else
  echo "✗ Not a Claude Code project"
  echo "Run 'setup-claude.sh <template>' to initialize"
fi
```

#### Git hook 활용
```bash
# .git/hooks/post-checkout
#!/bin/bash
# 브랜치 전환 시 Claude 설정 확인

if [ ! -f ".claude/settings.json" ]; then
  echo "⚠️  Warning: No Claude settings found in this branch"
  echo "   Consider running 'setup-claude.sh' to initialize"
fi
```

---

## 문제 해결

### 일반적인 오류

#### 1. CLI 시작 실패
```bash
Error: Failed to parse .claude/settings.json
```

**원인:** JSON 문법 오류

**해결:**
```bash
# JSON 유효성 검증
cat .claude/settings.json | jq .

# 오류 있으면 복구
cp .claude.backup.*/settings.json .claude/settings.json

# 또는 최소 구성으로 초기화
echo '{
  "mcpServers": {}
}' > .claude/settings.json
```

#### 2. MCP 서버 시작 실패
```bash
Error: Failed to start MCP server "github"
```

**원인:**
- MCP 서버 패키지 미설치
- 환경 변수 누락
- 잘못된 command/args

**해결:**
```bash
# 수동으로 MCP 서버 실행 테스트
npx -y @modelcontextprotocol/server-github
# 오류 메시지 확인

# 환경 변수 확인
echo $GITHUB_TOKEN

# settings.json에서 해당 서버 제거 또는 수정
```

#### 3. 권한 거부
```bash
Error: Command not in allowedCommands: npm
```

**원인:** permissionPolicy 제약

**해결:**
```json
{
  "permissionPolicy": {
    "allowedCommands": ["git", "npm", "추가할명령어"]
  }
}
```

#### 4. 도구 실행 차단
```bash
Error: Tool execution blocked by security policy
```

**원인:** toolApprovalPolicy 또는 security 설정

**해결:**
```json
{
  "toolApprovalPolicy": {
    "autoApprove": ["차단된도구명"]
  }
}
```

### 디버깅 방법

#### 1. Verbose 모드
```bash
claude-code --verbose
# 또는
CLAUDE_LOG_LEVEL=debug claude-code
```

#### 2. 로그 확인
```bash
# 로그 위치 (예시, 환경에 따라 다름)
tail -f ~/.claude/logs/session.log
tail -f ~/.claude/logs/mcp.log
```

#### 3. 최소 설정으로 테스트
```json
{
  "mcpServers": {}
}
```

#### 4. MCP 서버 개별 테스트
```bash
# MCP 서버를 직접 실행하여 오류 확인
npx -y @modelcontextprotocol/server-filesystem /tmp

# JSON-RPC 요청 수동 전송
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
  npx -y @modelcontextprotocol/server-filesystem /tmp
```

### 설정 검증 체크리스트

```bash
# 1. JSON 문법 검증
jq . .claude/settings.json > /dev/null && echo "✓ Valid JSON" || echo "✗ Invalid JSON"

# 2. 필수 필드 확인
jq 'has("mcpServers")' .claude/settings.json

# 3. MCP 서버 스키마 확인
jq '.mcpServers | to_entries[] | select(.value.command == null or .value.args == null)' .claude/settings.json

# 4. 권한 설정 확인
jq '.permissionPolicy' .claude/settings.json

# 5. 전체 구조 시각화
jq 'keys' .claude/settings.json
```

### 복구 절차

#### 설정 손상 시
```bash
# 1. 백업에서 복구
cp .claude.backup.YYYYMMDD/settings.json .claude/settings.json

# 2. 기본 설정으로 초기화
echo '{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}' > .claude/settings.json

# 3. 검증 후 재시작
jq . .claude/settings.json
claude-code
```

---

## 참고 자료

### 공식 문서
- Claude Code: https://docs.claude.com/en/docs/claude-code
- MCP 프로토콜: https://spec.modelcontextprotocol.io/
- MCP 서버 목록: https://github.com/modelcontextprotocol/servers

### 유용한 명령어

```bash
# Claude Code 버전 확인
claude-code --version

# 도움말
claude-code --help

# MCP 서버 목록 확인 (CLI 내에서)
# "너가 가지고 있는 도구 전체 목록을 보여줘"

# 설정 파일 위치
ls -la .claude/

# 전역 npm 패키지 확인
npm list -g --depth=0 | grep claude
```

### 환경 변수

```bash
# GitHub Token
export GITHUB_TOKEN="ghp_your_token"

# 로그 레벨
export CLAUDE_LOG_LEVEL="debug"

# MCP 서버 타임아웃
export MCP_TIMEOUT="30000"
```

---

## 핵심 체크리스트

### 프로젝트 시작 시
- [ ] 프로젝트 타입에 맞는 템플릿 선택
- [ ] settings.json 생성 및 검증
- [ ] 안전 장치 설정 (blockedCommands, blockedPaths)
- [ ] MCP 서버 환경 변수 설정
- [ ] JSON 문법 검증 (`jq . .claude/settings.json`)

### 주기적 점검 (월 1회)
- [ ] 사용하지 않는 MCP 서버 제거
- [ ] 권한 정책 재검토
- [ ] 설정 백업
- [ ] 도구 사용 로그 분석

### 문제 발생 시
- [ ] JSON 문법 오류 확인
- [ ] MCP 서버 개별 테스트
- [ ] Verbose 모드로 실행
- [ ] 최소 설정으로 격리 테스트
- [ ] 백업에서 복구

---

## 마무리

이 문서는 Claude Code CLI의 settings.json 메커니즘과 실전 활용 전략을 정리한 것입니다.

**핵심 원칙:**
1. settings.json은 명확한 스키마를 가진 구조화된 설정 파일
2. CLI 시작 시 한 번 로드되어 메모리에 상주
3. 설정 변경은 CLI 재시작 후 적용
4. 안전성과 편의성의 균형을 프로젝트 특성에 맞게 조정

**권장 워크플로우:**
1. 프로젝트 타입별 템플릿 준비
2. 작업 모드별 설정 전환 스크립트 작성
3. 안전 장치를 기본으로 설정
4. 주기적인 설정 정리 및 최적화
