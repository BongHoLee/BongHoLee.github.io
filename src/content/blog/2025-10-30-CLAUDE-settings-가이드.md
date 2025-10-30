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

## 1. settings.json의 생명주기

### 1.1 파일 생성 시점

```
시나리오 A: 최초 실행
┌─────────────────────────────────────┐
│ claude-code 최초 실행               │
└─────────────┬───────────────────────┘
              │
              ├─> ~/.claude/settings.json 생성 (존재하지 않으면)
              │   (기본값: 빈 객체 또는 최소 설정)
              │
              └─> .claude/settings.json 생성 (프로젝트에 없으면)
                  (사용자가 명시적으로 생성하거나 /config 통해 생성)

시나리오 B: 명시적 생성
┌─────────────────────────────────────┐
│ 사용자가 직접 생성                   │
└─────────────┬───────────────────────┘
              │
              ├─> 텍스트 에디터로 직접 작성
              │   $ vim .claude/settings.json
              │
              └─> /config 명령어 통해 UI에서 생성
```

**실제 생성 패턴:**
```bash
# 패턴 1: 수동 생성 (가장 일반적)
$ mkdir -p .claude
$ cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "deny": ["Read(./.env)"]
  }
}
EOF

# 패턴 2: /config UI 사용
$ claude-code
> /config
# → UI에서 설정 변경 후 저장

# 패턴 3: /permissions 명령어 사용 (즉시 반영)
> /permissions add "Bash(git:*)"
# → 자동으로 settings.json 업데이트
```

### 1.2 로드 시점과 메커니즘

```
Claude Code CLI 시작 시퀀스:
┌──────────────────────────────────────────────────────────┐
│ 1. claude-code 실행                                      │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 2. 설정 파일 스캔 (계층 순서대로)                        │
│    - Enterprise managed settings (있다면)                │
│    - User settings (~/.claude/settings.json)            │
│    - Project settings (.claude/settings.json)           │
│    - Local settings (.claude/settings.local.json)       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 3. 설정 병합 (Merge)                                     │
│    - 하위 → 상위 순서로 덮어쓰기                         │
│    - deny 배열은 모두 합침 (union)                       │
│    - allow 배열도 모두 합침                              │
│    - env 객체는 키 단위로 덮어쓰기                       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 4. 메모리에 최종 설정 로드                                │
│    - 이후 세션 동안 이 설정 유지                         │
│    - 파일 변경해도 재시작 전까지 반영 안 됨              │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 5. REPL 세션 시작                                        │
│    - 이제 사용자와 대화 가능                             │
└──────────────────────────────────────────────────────────┘
```

**구체적인 병합 예시:**

```json
// ~/.claude/settings.json (사용자 전역)
{
  "permissions": {
    "allow": ["Read(**)"],
    "deny": ["Read(./.env)"]
  },
  "env": {
    "DEBUG": "false"
  }
}

// .claude/settings.json (프로젝트)
{
  "permissions": {
    "allow": ["Write(./src/**)"],
    "deny": ["Bash(sudo:*)"]
  },
  "env": {
    "DEBUG": "true",
    "NODE_ENV": "development"
  }
}

// 최종 병합 결과 (메모리 내)
{
  "permissions": {
    "allow": ["Read(**)", "Write(./src/**)"],  // 합쳐짐
    "deny": ["Read(./.env)", "Bash(sudo:*)"]   // 합쳐짐
  },
  "env": {
    "DEBUG": "true",           // 프로젝트 설정이 우선
    "NODE_ENV": "development"  // 프로젝트만 존재
  }
}
```

## 2. 실행 중 상호작용 메커니즘

### 2.1 Claude의 도구 호출 시 Permission 체크

```
Claude 응답 생성 → 도구 호출 필요 판단
┌──────────────────────────────────────────────────────────┐
│ Claude: "파일을 수정하겠습니다"                           │
│ → Edit 도구 호출 준비                                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ CLI: Permission 검증 시작                                │
│ 도구: Edit                                               │
│ 인자: file_path="./src/main.ts"                          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 1단계: deny 규칙 검사 (우선순위 최고)                    │
│                                                          │
│ deny 배열 순회:                                          │
│ ✓ "Read(./.env)" → 해당 없음                            │
│ ✓ "Write(./secrets/**)" → 해당 없음                     │
│ ✓ "Edit(./.env*)" → 해당 없음                           │
│                                                          │
│ → deny 규칙에 매칭 없음, 다음 단계로                     │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 2단계: allow 규칙 검사                                   │
│                                                          │
│ allow 배열 순회:                                         │
│ ✗ "Read(**)" → 도구 불일치                              │
│ ✓ "Edit(./src/**)" → 매칭!                              │
│                                                          │
│ → allow 규칙 매칭, 실행 허용                             │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 3단계: ask 규칙 확인                                     │
│                                                          │
│ ask 배열에 없으므로 사용자 승인 불필요                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 4단계: Hook 실행 (PreToolUse)                           │
│                                                          │
│ matcher "Edit" 검사 → 일치하는 hook 있는지 확인          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 5단계: 도구 실행                                         │
│ Edit(file_path="./src/main.ts", ...)                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 6단계: Hook 실행 (PostToolUse)                          │
│                                                          │
│ 예: prettier 자동 포맷팅                                  │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 7단계: 결과를 Claude에게 반환                            │
│ → Claude가 다음 응답 생성                                │
└──────────────────────────────────────────────────────────┘
```

**차단 시나리오 예시:**

```
상황: Claude가 .env 파일 읽기 시도
┌──────────────────────────────────────────────────────────┐
│ Claude: "환경 변수를 확인하겠습니다"                      │
│ → Read 도구 호출: file_path="./.env"                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ CLI: deny 규칙 검사                                      │
│ ✓ "Read(./.env)" → 매칭!                                │
│                                                          │
│ → 즉시 차단, Claude에게 에러 반환                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Claude에게 전달되는 메시지:                               │
│ "Permission denied: Read(./.env) is blocked"            │
│                                                          │
│ Claude 다음 응답:                                        │
│ "죄송합니다. .env 파일에 접근할 수 없습니다.             │
│  다른 방법으로 환경 설정을 확인하시겠습니까?"             │
└──────────────────────────────────────────────────────────┘
```

### 2.2 ask 규칙의 사용자 상호작용

```
Claude가 ask 규칙에 해당하는 도구 호출 시:
┌──────────────────────────────────────────────────────────┐
│ Claude: "패키지를 설치하겠습니다"                         │
│ → Bash(npm install axios)                               │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ CLI: ask 규칙 매칭                                       │
│ "Bash(npm install:*)" → 매칭!                           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 터미널에 프롬프트 표시:                                   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Claude wants to run:                               │  │
│ │ $ npm install axios                                │  │
│ │                                                    │  │
│ │ Allow? [y/n/always/never]:                        │  │
│ └────────────────────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ├─> y: 이번만 허용
                 ├─> n: 거부
                 ├─> always: 항상 허용 (설정 파일 업데이트)
                 └─> never: 항상 거부 (설정 파일 업데이트)
```

**always/never 선택 시 동작:**

```bash
# 사용자가 "always" 선택
> Allow? [y/n/always/never]: always

# CLI가 자동으로 수행하는 작업:
# 1. .claude/settings.json 읽기
# 2. permissions.ask 배열에서 해당 패턴 제거
# 3. permissions.allow 배열에 추가
# 4. 파일 저장

# Before:
{
  "permissions": {
    "ask": ["Bash(npm install:*)"]
  }
}

# After:
{
  "permissions": {
    "allow": ["Bash(npm install:*)"],
    "ask": []
  }
}
```

## 3. 편집 발생 시점과 방법

### 3.1 사용자 주도 편집

```
방법 1: 텍스트 에디터로 직접 편집
┌──────────────────────────────────────────────────────────┐
│ $ vim .claude/settings.json                              │
│ # 수정 후 저장                                           │
│ $ claude-code  # 재시작하여 반영                         │
└──────────────────────────────────────────────────────────┘

방법 2: /config UI 사용 (대화형)
┌──────────────────────────────────────────────────────────┐
│ > /config                                                │
│ → 탭 형태 설정 UI 열림                                   │
│ → 변경 후 "Save" 클릭                                    │
│ → 즉시 파일에 저장되지만, 재시작 필요                    │
└──────────────────────────────────────────────────────────┘

방법 3: /permissions 명령어 (즉시 반영!)
┌──────────────────────────────────────────────────────────┐
│ > /permissions add "Edit(./src/**)"                      │
│ → 메모리 내 설정 즉시 업데이트                           │
│ → .claude/settings.json 파일도 자동 업데이트            │
│ → 재시작 불필요!                                         │
└──────────────────────────────────────────────────────────┘

방법 4: /allowed-tools 명령어
┌──────────────────────────────────────────────────────────┐
│ > /allowed-tools add Edit                               │
│ > /allowed-tools remove Bash                            │
│ → 메모리 + 파일 모두 업데이트                           │
└──────────────────────────────────────────────────────────┘
```

### 3.2 시스템 자동 편집

```
시나리오 1: ask 규칙에서 always/never 선택
┌──────────────────────────────────────────────────────────┐
│ Claude: Bash(git push) 실행 요청                         │
│ User: always 선택                                        │
│ → CLI가 자동으로 settings.json 업데이트                 │
│    ask → allow 이동                                      │
└──────────────────────────────────────────────────────────┘

시나리오 2: /permissions 명령어 사용
┌──────────────────────────────────────────────────────────┐
│ > /permissions add "Bash(docker:*)"                      │
│ → settings.json에 자동 추가                              │
│ → 메모리 설정도 즉시 업데이트                            │
└──────────────────────────────────────────────────────────┘

시나리오 3: Git 자동 설정
┌──────────────────────────────────────────────────────────┐
│ 최초 .claude/settings.local.json 생성 시                │
│ → CLI가 자동으로 .gitignore 업데이트                     │
│    .claude/settings.local.json 추가                     │
└──────────────────────────────────────────────────────────┘
```

## 4. Claude의 settings.json 참조 시점

### 4.1 도구 호출마다 검증

```python
# Claude Code CLI 내부 의사 코드

class ToolExecutor:
    def __init__(self, settings):
        self.settings = settings  # 시작 시 로드된 설정
        
    def execute_tool(self, tool_name, tool_args):
        # 1. 매 도구 호출마다 permission 체크
        permission_result = self.check_permission(tool_name, tool_args)
        
        if permission_result == "deny":
            return Error("Permission denied")
            
        elif permission_result == "ask":
            user_choice = self.prompt_user(tool_name, tool_args)
            if user_choice in ["always", "never"]:
                self.update_settings_file(user_choice)  # 파일 업데이트
                self.settings.update(...)  # 메모리 업데이트
            
            if user_choice in ["n", "never"]:
                return Error("User denied")
        
        # 2. PreToolUse hook 실행
        self.run_hooks("PreToolUse", tool_name, tool_args)
        
        # 3. 실제 도구 실행
        result = self.run_tool(tool_name, tool_args)
        
        # 4. PostToolUse hook 실행
        self.run_hooks("PostToolUse", tool_name, tool_args, result)
        
        return result
```

### 4.2 Hook 실행 시점

```
Hook 실행 흐름:
┌──────────────────────────────────────────────────────────┐
│ 도구 호출 발생                                            │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ PreToolUse Hook 매칭 검사                                │
│                                                          │
│ settings.hooks.PreToolUse 배열 순회:                     │
│ for each hook:                                           │
│   if hook.matcher matches tool_name:                    │
│     execute hook.command                                │
│     check exit code                                     │
│     if exit_code == 2:                                  │
│       block tool execution                             │
│       return error to Claude                           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 도구 실행                                                 │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ PostToolUse Hook 매칭 검사                               │
│                                                          │
│ settings.hooks.PostToolUse 배열 순회:                    │
│ for each hook:                                           │
│   if hook.matcher matches tool_name:                    │
│     execute hook.command with result                    │
│     (도구는 이미 실행됨, 차단 불가)                       │
└──────────────────────────────────────────────────────────┘
```

### 4.3 env 환경 변수 적용 시점

```bash
# 세션 시작 시 한 번만 적용
┌──────────────────────────────────────────────────────────┐
│ claude-code 시작                                         │
│ → settings.json 로드                                     │
│ → settings.env 객체의 모든 키-값을 프로세스 환경에 설정  │
│                                                          │
│ 예시:                                                     │
│ settings.env = {                                         │
│   "NODE_ENV": "development",                            │
│   "DEBUG": "true"                                       │
│ }                                                        │
│                                                          │
│ 실행되는 작업:                                            │
│ os.environ["NODE_ENV"] = "development"                  │
│ os.environ["DEBUG"] = "true"                            │
│                                                          │
│ 이후 모든 Bash 명령이 이 환경 변수를 상속받음            │
└──────────────────────────────────────────────────────────┘
```

## 5. 실시간 vs 재시작 필요 정리

### 5.1 즉시 반영 (재시작 불필요)

```
✓ /permissions 명령어
  > /permissions add "Bash(git:*)"
  → 메모리 + 파일 모두 즉시 업데이트

✓ /allowed-tools 명령어
  > /allowed-tools add Edit
  → 메모리 + 파일 모두 즉시 업데이트

✓ ask 규칙에서 always/never 선택
  User: always
  → 메모리 + 파일 모두 즉시 업데이트

✓ 권한 모드 전환 (Shift+Tab)
  → 메모리 내 모드만 변경 (파일 변경 없음)
```

### 5.2 재시작 필요

```
✗ 텍스트 에디터로 직접 편집
  $ vim .claude/settings.json
  → 파일만 변경, 메모리는 그대로
  → claude-code 재시작 필요

✗ /config UI에서 변경
  > /config → 설정 변경 → Save
  → 파일만 변경, 메모리는 그대로
  → claude-code 재시작 필요

✗ hooks 추가/변경
  → 파일 편집 후 재시작 필요

✗ env 환경 변수 변경
  → 세션 시작 시에만 로드되므로 재시작 필요

✗ mcpServers 변경
  → MCP 서버 연결은 시작 시에만 수행
```

## 6. 복잡한 상호작용 시나리오

### 시나리오 1: 권한 설정 학습 과정

```
[1단계: 초기 제한적 설정]
User: claude-code 실행
      .claude/settings.json에 최소 권한만 설정

[2단계: Claude의 작업 시도]
Claude: "npm test를 실행하겠습니다"
CLI: ask 규칙에 매칭
     → "Allow? [y/n/always/never]:" 프롬프트

[3단계: 사용자 판단]
User: "이 명령은 항상 안전하므로" → always 선택
CLI: settings.json 자동 업데이트
     ask → allow 이동

[4단계: 다음 시도]
Claude: "npm test를 실행하겠습니다"
CLI: allow 규칙에 매칭
     → 즉시 실행, 프롬프트 없음

[5단계: 위험한 시도]
Claude: "sudo apt-get install..."
CLI: deny 규칙에 매칭
     → 즉시 차단, Claude에게 에러 반환

[6단계: Claude의 대안 제시]
Claude: "죄송합니다. sudo 명령은 사용할 수 없습니다.
        대신 다른 방법을 제안드리겠습니다..."
```

### 시나리오 2: Hook과 Permission의 상호작용

```
설정:
{
  "permissions": {
    "allow": ["Edit(./src/**)"]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "type": "command",
          "command": "if grep -q 'TODO' \"$file\"; then exit 2; fi"
        }]
      }
    ]
  }
}

실행 흐름:
┌──────────────────────────────────────────────────────────┐
│ Claude: "main.ts를 수정하겠습니다"                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Permission 체크                                          │
│ ✓ Edit(./src/main.ts) → allow 매칭                      │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ PreToolUse Hook 실행                                     │
│ $ if grep -q 'TODO' "./src/main.ts"; then exit 2; fi   │
│ → 파일에 TODO 발견!                                      │
│ → Exit code: 2                                          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Hook이 차단 (exit 2)                                     │
│ → 도구 실행 취소                                         │
│ → Claude에게 에러 메시지 반환:                           │
│   "PreToolUse hook blocked the operation"              │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ Claude: "파일에 TODO가 남아있어 수정할 수 없습니다.      │
│         TODO를 먼저 해결해주시겠습니까?"                  │
└──────────────────────────────────────────────────────────┘
```

## 7. 메모리 vs 파일 상태 비교

```
상황: 파일 편집 후 재시작 전

메모리 내 설정:
{
  "permissions": {
    "allow": ["Read(**)"]
  }
}

파일 (.claude/settings.json):
{
  "permissions": {
    "allow": ["Read(**)", "Write(./src/**)"]  // 방금 추가
  }
}

Claude의 동작:
┌──────────────────────────────────────────────────────────┐
│ Claude: "파일을 수정하겠습니다"                           │
│ → Write 도구 호출                                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ CLI는 메모리 내 설정 사용                                 │
│ → allow: ["Read(**)"]만 확인                            │
│ → Write 권한 없음!                                       │
│ → 차단 또는 ask 프롬프트                                 │
└──────────────────────────────────────────────────────────┘

재시작 후:
┌──────────────────────────────────────────────────────────┐
│ claude-code 재시작                                       │
│ → 파일에서 설정 재로드                                   │
│ → 메모리: {"allow": ["Read(**)", "Write(./src/**)"]}   │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│ 이제 Write 권한 정상 작동                                │
└──────────────────────────────────────────────────────────┘
```

---

## 핵심 인사이트

**1. 로드는 시작 시 한 번, 검증은 매 도구 호출마다**
- settings.json은 CLI 시작 시 한 번만 로드되어 메모리에 유지
- 하지만 권한 검증은 Claude가 도구를 호출할 때마다 수행
- Hook도 매 도구 실행마다 matcher 검사 후 실행

**2. 이중 상태 관리**
- **파일 상태**: 디스크의 settings.json (영구 저장)
- **메모리 상태**: 실행 중인 CLI 프로세스 내 설정
- 불일치 시 메모리 상태가 우선 (재시작 전까지)

**3. 즉시 반영 메커니즘**
- `/permissions`, `/allowed-tools`: 메모리 + 파일 동시 업데이트
- `always/never` 선택: 메모리 + 파일 동시 업데이트
- 이들만 재시작 없이 즉시 적용 가능

**4. Permission 우선순위**
```
deny (최우선) → allow → ask → 기본 거부
```
deny에 매칭되면 allow 무시하고 즉시 차단

**5. Hook의 게이트키퍼 역할**
- PreToolUse: Permission 통과 후 추가 검증 가능 (차단 가능)
- PostToolUse: 이미 실행된 후이므로 검증보다는 자동화용
- exit 2로 차단 시 Claude에게 즉시 피드백

**6. 계층 병합의 복잡성**
- 배열은 합침 (union)
- 객체는 덮어씀 (override)
- deny는 모든 계층에서 합쳐져서 적용

**7. Claude는 "왜 차단되었는지" 모름**
- Permission 거부 시 "Permission denied" 메시지만 받음
- Hook 차단 시 "Hook blocked" 메시지만 받음
- 구체적인 이유는 사용자가 별도로 설명해야 학습

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


