---
title: "claude code의 settings.json 가이드"
description: "더 나은 상호작용을 위해 settings.json에 대해 톺아보자"
pubDate: 2025-10-30
author: "Bong5"
tags: ["AI", "thought"]
---

# Claude Code settings.json 완전 정리 (공식문서 + 실전 팁)

## 1. settings.json 개요

settings.json은 Claude Code의 공식 설정 메커니즘으로, 도구 권한, 환경 변수, 훅, MCP 서버 등을 정의합니다.

### 1.1 설정 파일 계층 구조 (우선순위 순)

```
1. Enterprise 관리 설정 (최우선, 재정의 불가)
   ├─ macOS: /Library/Application Support/ClaudeCode/managed-settings.json
   ├─ Linux: /etc/claude-code/managed-settings.json
   └─ Windows: C:\ProgramData\ClaudeCode\managed-settings.json

2. 프로젝트 로컬 설정 (Git 제외, 개인 실험용)
   └─ .claude/settings.local.json

3. 프로젝트 설정 (팀 공유, Git 체크인)
   └─ .claude/settings.json

4. 사용자 설정 (모든 프로젝트 적용)
   └─ ~/.claude/settings.json
```

**핵심 원칙:**
- 상위 우선순위 파일이 하위 파일의 값을 병합하여 재정의
- deny 규칙이 allow 규칙보다 항상 우선
- 설정 변경 후 Claude Code 재시작 필요 (Hot reload 미지원)

## 2. 주요 설정 필드

### 2.1 permissions (권한 제어)

도구 실행 권한을 `deny`, `allow`, `ask` 배열로 제어합니다.

#### 권한 패턴 문법

```
기본 형식:
- ToolName                    : 모든 작업 허용
- ToolName(*)                 : 모든 인자 허용
- ToolName(pattern)           : 패턴 매칭되는 호출만

파일 패턴 (gitignore 문법):
- Read(**)                    : 모든 파일
- Read(./src/**)              : src 디렉토리만
- Read(**/.env)               : 모든 .env 파일

명령어 패턴:
- Bash(git:*)                 : 모든 git 명령
- Bash(npm run test:*)        : npm test 스크립트만
- Bash(sudo:*)                : sudo 명령 차단용
```

#### 주요 도구

| 도구 | 설명 | 패턴 지원 |
|------|------|-----------|
| Read | 파일 읽기 | gitignore 문법 |
| Write | 파일 쓰기 | gitignore 문법 |
| Edit | 파일 수정 | gitignore 문법 |
| Bash | 셸 명령 실행 | 명령어 패턴 |
| WebFetch | HTTPS 요청 | 도메인 지정 가능 |
| WebSearch | 웹 검색 | 패턴 미지원 |

#### 실전 패턴: 안전한 개발 모드

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(./src/**)",
      "Write(./tests/**)",
      "Edit(./src/**)",
      "Edit(./tests/**)",
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)"
    ],
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/**)",
      "Write(./.env*)",
      "Write(./package-lock.json)",
      "Bash(rm -rf *)",
      "Bash(sudo:*)",
      "Bash(git push:*)",
      "Bash(npm publish)"
    ],
    "ask": [
      "Bash(npm install:*)",
      "Bash(git checkout:*)"
    ]
  }
}
```

**설계 원칙:**
- 읽기는 자유롭게, 쓰기는 src/tests만
- 민감 파일(`.env`, `secrets/`)은 완전 차단
- 위험한 명령(sudo, rm -rf, push)은 차단
- 의존성 설치와 브랜치 전환은 승인 요청

### 2.2 env (환경 변수)

세션에 자동으로 설정할 환경 변수를 정의합니다.

```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true",
    "API_BASE_URL": "http://localhost:3000"
  }
}
```

**활용 시나리오:**
- 팀 전체 환경 변수 표준화
- 개발/테스트 환경 자동 설정
- 세션마다 반복 설정 제거

### 2.3 hooks (훅)

도구 실행 전후나 특정 이벤트 시점에 셸 명령을 자동 실행합니다.

#### Hook 이벤트 타입

| 이벤트 | 실행 시점 | 차단 가능 |
|--------|-----------|-----------|
| PreToolUse | 도구 실행 전 | ✓ (exit 2) |
| PostToolUse | 도구 완료 후 | ✗ (이미 실행됨) |
| Notification | Claude 알림 시 | ✗ |
| Stop | 응답 완료 시 | ✓ (exit 2) |

#### Exit Code 동작

- `0`: 성공, 계속 진행
- `1`: 일반 오류, stderr를 사용자에게 표시
- `2`: 차단 (PreToolUse는 도구 차단, PostToolUse는 Claude에 오류 표시)

#### 환경 변수

- `$CLAUDE_TOOL_NAME`: 실행된 도구 이름
- `$CLAUDE_FILE_PATHS`: 영향받은 파일 경로들 (공백 구분)
- `$CLAUDE_PROJECT_DIR`: 프로젝트 루트 디렉토리

#### 실전 팁 1: 데스크톱 알림

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude needs your input\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

**macOS/Linux 알림 명령어:**
- macOS: `osascript -e 'display notification "..." with title "..."'`
- Linux: `notify-send 'Claude Code' 'Awaiting your input'`
- Windows: PowerShell 스크립트 사용

#### 실전 팁 2: Git 워크플로우 자동화

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "git add -A && git commit -m \"Claude Code checkpoint: $(date +%Y-%m-%d_%H:%M:%S)\" || true"
          }
        ]
      }
    ]
  }
}
```

**동작:**
- 세션 완료 시 자동으로 모든 변경사항을 커밋
- 타임스탬프로 체크포인트 생성
- `|| true`로 커밋 실패 시에도 계속 진행

**주의사항:**
- 모든 변경사항이 자동 커밋되므로 의도하지 않은 파일도 포함될 수 있음
- 프로덕션 환경보다는 실험적 개발에 적합
- `.gitignore` 설정을 확실히 해야 함

### 2.4 sandbox (샌드박스 설정)

bash 명령을 파일시스템과 네트워크로부터 격리합니다.

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker"],
    "network": {
      "allowUnixSockets": ["/var/run/docker.sock"]
    }
  }
}
```

**참고:**
- 파일시스템/네트워크 제한은 Read, Edit, WebFetch 권한 규칙으로 구성
- sandbox 설정은 bash 명령 격리에 특화

### 2.5 mcpServers (MCP 서버 설정)

Model Context Protocol 서버로 Claude의 기능을 확장합니다.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    },
    "puppeteer": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/puppeteer"]
    }
  }
}
```

**표준 방식:**
- `.mcp.json` 파일에 정의하는 것이 표준
- settings.json에도 포함 가능
- `--mcp-debug` 플래그로 디버깅 가능

**주요 MCP 서버:**
- `@modelcontextprotocol/server-filesystem`: 파일시스템 접근
- `mcp/puppeteer`: 브라우저 자동화
- Sentry, 데이터베이스 등 커스텀 서버 가능

### 2.6 기타 설정

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "statusLine": "Project: ${PROJECT_NAME} | Branch: ${GIT_BRANCH}",
  "spinnerTipsEnabled": false,
  "cleanupPeriodDays": 30,
  "disableBypassPermissionsMode": "disable"
}
```

## 3. CLAUDE.md: 프로젝트 컨텍스트 관리

### 3.1 개념

CLAUDE.md는 Claude Code가 자동으로 컨텍스트에 로드하는 특수 파일입니다. 프로젝트별 규칙, 컨벤션, 명령어를 문서화하여 매번 설명하지 않아도 Claude가 이해하도록 합니다.

### 3.2 계층적 로딩 순서

```
1. ~/.claude/CLAUDE.md           (전역 설정)
2. <project-root>/CLAUDE.md      (프로젝트 설정)
3. <subdirectory>/CLAUDE.md      (서브디렉토리 설정)
```

더 구체적인(nested) CLAUDE.md가 우선순위를 가집니다.

### 3.3 효과적인 CLAUDE.md 구조

```markdown
# 프로젝트 개요
Spring Boot 기반 커머스 플랫폼 백엔드 API

## 기술 스택
- Kotlin 1.9 + Spring Boot 3.2
- R2DBC + MySQL (reactive)
- Redis (캐싱)
- Gradle Kotlin DSL

## 빌드 & 실행
- 빌드: `./gradlew build`
- 테스트: `./gradlew test`
- 로컬 실행: `./gradlew bootRun`

## 코딩 컨벤션
- 함수명: camelCase, 클래스명: PascalCase
- 파일당 최대 500라인
- 함수당 최대 30라인
- Suspend 함수는 동사 + Async 접미사

## 아키텍처 규칙
- 헥사고날 아키텍처 준수
- domain: 비즈니스 로직만 (외부 의존성 금지)
- application: 유즈케이스 오케스트레이션
- infrastructure: 외부 시스템 연동
- 포트-어댑터 패턴 엄격히 적용

## 테스트 전략
- 비즈니스 로직: 단위 테스트 필수
- 통합 테스트: @SpringBootTest + Testcontainers
- Mockk 사용, MockBean은 최소화

## 주의사항
- `.env` 파일 절대 커밋 금지
- main 브랜치 직접 푸시 금지
- API 응답은 항상 ResponseEntity 래핑
- 트랜잭션 경계는 application 계층에서만
```

### 3.4 CLAUDE.md 최적화 팁

**✅ DO:**
- 프로젝트 특화 규칙과 컨벤션 명시
- 자주 사용하는 명령어 문서화 (빌드, 테스트, 실행)
- 아키텍처 패턴과 설계 원칙 설명
- 알려진 이슈나 주의사항 기록
- 팀 특화 용어나 도메인 지식 정리

**❌ DON'T:**
- 너무 장황하게 작성 (토큰 소비 증가)
- 일반적인 프로그래밍 지식 반복
- 자주 변경되는 동적 정보 포함
- 민감한 정보 (API 키, 비밀번호) 포함
- 500줄 이상 넘어가면 리팩토링 고려

### 3.5 동적 업데이트

**`#` 키를 활용한 실시간 업데이트:**
- 대화 중 `#` 키를 누르면 instruction prompt 열림
- 세션 중 발견한 개선사항을 즉시 CLAUDE.md에 반영
- 자동으로 파일에 추가되어 다음 세션부터 적용

**예시 워크플로우:**
```
1. Claude가 잘못된 패턴 적용
2. 사용자가 올바른 방식 설명
3. `#` 눌러 "앞으로 [올바른 방식] 적용" 추가
4. CLAUDE.md 자동 업데이트
5. 다음 세션부터 자동 적용
```

### 3.6 서브디렉토리 CLAUDE.md 활용

```
project/
├─ CLAUDE.md              # 전체 프로젝트 규칙
├─ src/
│  ├─ CLAUDE.md          # 소스 코드 규칙
│  └─ domain/
│     └─ CLAUDE.md       # 도메인 계층 특화 규칙
└─ tests/
   └─ CLAUDE.md          # 테스트 작성 가이드
```

**예시: `tests/CLAUDE.md`**
```markdown
# 테스트 작성 가이드

## 테스트 네이밍
- `should[동작]When[조건]` 형식
- 예: `shouldReturnUserWhenValidIdProvided`

## Given-When-Then 구조 엄수
```kotlin
@Test
fun `should calculate total price when multiple items exist`() {
    // Given
    val items = listOf(...)
    
    // When
    val result = calculator.calculate(items)
    
    // Then
    assertThat(result).isEqualTo(expected)
}
```

## Fixture 사용
- `TestFixtures.createUser()` 등 재사용 가능한 픽스처 활용
```

## 4. 팀 협업을 위한 표준화 전략

### 4.1 간단하면서 직관적인 표준 설정

**프로젝트 `.claude/settings.json` (Git 체크인)**
```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(./src/**)",
      "Write(./tests/**)",
      "Edit(./src/**)",
      "Edit(./tests/**)",
      "Bash(./gradlew:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)"
    ],
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/**)",
      "Write(./.env*)",
      "Bash(sudo:*)",
      "Bash(git push:*)"
    ],
    "ask": [
      "Bash(git checkout:*)"
    ]
  },
  "env": {
    "SPRING_PROFILES_ACTIVE": "local"
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./gradlew ktlintFormat"
          }
        ]
      }
    ]
  }
}
```

**개인 `.claude/settings.local.json` (Git 제외)**
```json
{
  "permissions": {
    "allow": [
      "Bash(git push origin feature/*)"
    ]
  },
  "env": {
    "DEBUG": "true"
  }
}
```

**`.gitignore` 추가**
```gitignore
.claude/settings.local.json
```

### 4.2 표준화 전략

**이 설정의 철학:**
1. **읽기는 자유, 쓰기는 제한적**: 코드 이해를 막지 않되, 수정은 소스 디렉토리만
2. **민감 정보 완전 차단**: `.env`, `secrets/` 접근 불가
3. **위험한 작업 차단**: push, sudo 등 팀에 영향 주는 작업 차단
4. **자동 포맷팅**: 파일 수정 시 자동으로 ktlint 실행
5. **로컬 환경 분리**: 개인화는 settings.local.json으로

**팀원 온보딩:**
```bash
# 1. 프로젝트 클론
git clone <repository>

# 2. settings.json은 자동으로 로드됨
# 3. 필요시 개인 설정 추가
cat > .claude/settings.local.json << EOF
{
  "env": {
    "MY_CUSTOM_VAR": "value"
  }
}
EOF
```

## 5. 설정 관리 명령어

### 5.1 대화형 설정 관리

```bash
/config          # 탭 형태 Settings UI 열기
/permissions     # 실시간 권한 관리 (재시작 불필요)
/allowed-tools   # 도구 권한 관리 (/allowed-tools add Edit)
/hooks           # Hook 설정 메뉴
```

### 5.2 권한 모드 전환

**`Shift+Tab`으로 순환:**
- **Normal mode**: 기본 모드, permissions 규칙 적용
- **Plan mode**: 파일 분석만 가능, 수정/실행 불가
- **bypassPermissions mode**: 모든 권한 자동 승인 (매우 위험!)

**플래그:**
- `--dangerously-skip-permissions`: 모든 권한 검사 우회 (격리된 환경 전용)
- `disableBypassPermissionsMode: "disable"`: bypassPermissions 모드 차단

## 6. 문제 해결

### 6.1 설정이 적용되지 않을 때

```bash
# 1. JSON 문법 검증
jq . .claude/settings.json

# 2. Claude Code 재시작 (필수)
# settings.json 변경은 재시작 후에만 적용

# 3. 우선순위 확인
cat ~/.claude/settings.json           # 사용자 설정
cat .claude/settings.json              # 프로젝트 설정
cat .claude/settings.local.json       # 로컬 설정
```

### 6.2 Hook 디버깅

```bash
# Hook 명령어 직접 테스트
echo '{"tool_input":{"file_path":"test.ts"}}' | jq -r '.tool_input.file_path'

# 로그 파일로 디버깅
{
  "type": "command",
  "command": "echo \"$CLAUDE_TOOL_NAME: $CLAUDE_FILE_PATHS\" >> /tmp/claude_debug.log"
}
```

---

## 핵심 키워드

**설정 계층**
- Enterprise > 프로젝트 로컬 > 프로젝트 > 사용자
- deny > allow 우선순위
- 재시작 필요 (Hot reload 미지원)

**Permissions**
- gitignore 문법 (`**`, `*`)
- 도구별 세분화 (Read, Write, Edit, Bash)
- 런타임 변경 (`/permissions`)

**Hooks**
- PreToolUse (차단 가능), PostToolUse (자동화)
- Exit code 제어 (0/1/2)
- 환경 변수 활용 ($CLAUDE_FILE_PATHS)

**CLAUDE.md**
- 계층적 로딩 (전역 > 프로젝트 > 서브디렉토리)
- 프로젝트 특화 정보만
- `#` 키로 동적 업데이트

**MCP**
- Model Context Protocol
- `.mcp.json` 표준 위치
- Docker/npx로 서버 실행

**협업**
- settings.json: 팀 공유 (Git 체크인)
- settings.local.json: 개인화 (Git 제외)
- CLAUDE.md: 프로젝트 지식 공유


