# 📝 블로그 포스팅 가이드

## 개요

Bong5's Tech Blog는 Astro 기반으로 구축된 정적 사이트입니다. 이 가이드는 새로운 포스트를 작성하고 발행하는 방법을 설명합니다.

---

## 🚀 빠른 시작

### 1. 로컬 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/BongHoLee/BongHoLee.github.io.git
cd BongHoLee.github.io

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

개발 서버가 http://localhost:4321 에서 실행됩니다.

### 2. 새 포스트 작성

```bash
# src/content/blog/ 디렉토리에 새 마크다운 파일 생성
# 파일명 형식: YYYY-MM-DD-post-title.md

touch src/content/blog/2025-09-06-new-post-title.md
```

---

## 📄 포스트 작성 형식

### Front Matter (필수)

모든 포스트는 다음과 같은 YAML front matter로 시작해야 합니다:

```yaml
---
title: "포스트 제목"
description: "포스트에 대한 간단한 설명 (SEO용, 150자 이내)"
pubDate: 2025-09-06
author: "Bong5"
categories: ["Programming"]  # 주 카테고리 1개 권장
tags: ["JavaScript", "React", "Frontend"]  # 관련 태그들
heroImage: /assets/images/post-image.jpg  # 선택사항
---
```

### Front Matter 필드 설명

| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `title` | ✅ | 포스트 제목 | "Clean Code 원칙과 실습" |
| `description` | ✅ | SEO용 설명 (150자 이내) | "클린 코드 작성을 위한 핵심 원칙들" |
| `pubDate` | ✅ | 발행 날짜 (YYYY-MM-DD) | 2025-09-06 |
| `author` | ✅ | 작성자 | "Bong5" |
| `categories` | ✅ | 주 카테고리 (1개 권장) | ["Programming"] |
| `tags` | ✅ | 관련 태그들 | ["JavaScript", "React"] |
| `heroImage` | ⭕ | 대표 이미지 경로 | /assets/images/hero.jpg |
| `updatedDate` | ⭕ | 수정 날짜 | 2025-09-07 |

### 카테고리 목록

현재 사용 중인 주요 카테고리:

- **Programming**: 프로그래밍 언어, 기술, 개발 관련
- **Algorithm**: 자료구조, 알고리즘 문제해결
- **Book-Review**: 기술서적 리뷰 및 요약
- **System-Design**: 아키텍처, 설계 패턴
- **DevOps**: 배포, 운영, 도구

---

## 📝 포스트 작성 예시

```markdown
---
title: "React Hooks 완전 정복하기"
description: "React Hooks의 핵심 개념부터 고급 패턴까지 실무에 바로 적용할 수 있는 완전한 가이드"
pubDate: 2025-09-06
author: "Bong5"
categories: ["Programming"]
tags: ["React", "Hooks", "JavaScript", "Frontend"]
---

## 개요

React Hooks는 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 강력한 기능입니다.

## useState 기본 사용법

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}
```

## 결론

React Hooks를 통해 더 깔끔하고 재사용 가능한 코드를 작성할 수 있습니다.
```

---

## 🖼️ 이미지 사용법

### 1. 이미지 파일 업로드

```bash
# public/images/ 디렉토리에 이미지 업로드
cp your-image.jpg public/images/
```

### 2. 포스트에서 이미지 참조

```markdown
<!-- 기본 이미지 -->
![이미지 설명](/images/your-image.jpg)

<!-- 크기 조절이 필요한 경우 HTML 사용 -->
<img src="/images/your-image.jpg" alt="이미지 설명" width="500" />
```

---

## 🚀 배포 과정

### 로컬 테스트

```bash
# 1. 빌드 테스트
npm run build

# 2. 빌드 결과물 미리보기
npm run preview
```

### GitHub에 배포

```bash
# 1. 변경사항 커밋
git add .
git commit -m "새 포스트 추가: React Hooks 완전 정복하기"

# 2. GitHub에 푸시
git push origin master
```

### 자동 배포

- GitHub Actions가 자동으로 빌드 및 배포를 진행합니다
- 약 2-3분 후 https://bongholee.github.io/ 에서 새 포스트를 확인할 수 있습니다

---

## ⚙️ 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (hot reload) |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run astro` | Astro CLI 직접 사용 |

---

## 📋 포스트 작성 체크리스트

### 작성 전
- [ ] 주제와 목적이 명확한가?
- [ ] 기존 포스트와 중복되지 않는가?
- [ ] 카테고리와 태그를 정했는가?

### 작성 중
- [ ] Front matter가 올바르게 작성되었는가?
- [ ] 제목이 명확하고 SEO에 적합한가?
- [ ] 이미지 경로가 정확한가?
- [ ] 코드 블록에 언어가 지정되어 있는가?

### 작성 후
- [ ] 로컬에서 빌드 테스트를 했는가?
- [ ] 맞춤법과 문법을 검토했는가?
- [ ] 링크가 모두 정상 작동하는가?
- [ ] 모바일에서도 잘 보이는가?

---

## 🔧 문제 해결

### 자주 발생하는 문제

1. **빌드 실패**
   ```bash
   # 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **이미지가 표시되지 않음**
   - 이미지 경로가 `/images/`로 시작하는지 확인
   - 파일명의 대소문자 확인

3. **Front matter 오류**
   - YAML 문법이 정확한지 확인
   - 따옴표 사용이 일관된지 확인

### 도움이 필요할 때

- [Astro 공식 문서](https://docs.astro.build/)
- [Markdown 문법 가이드](https://www.markdownguide.org/)
- GitHub Issues에서 문제 보고

---

## 📚 마크다운 문법 참고

### 기본 문법

```markdown
# 제목 1
## 제목 2
### 제목 3

**굵은 글씨**
*기울인 글씨*
~~취소선~~

[링크 텍스트](https://example.com)

> 인용문

- 목록 항목 1
- 목록 항목 2

1. 번호 목록 1
2. 번호 목록 2
```

### 코드 블록

````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```
````

### 표

```markdown
| 헤더 1 | 헤더 2 | 헤더 3 |
|--------|--------|--------|
| 내용 1 | 내용 2 | 내용 3 |
| 내용 4 | 내용 5 | 내용 6 |
```

---

## 🎯 효과적인 포스팅 팁

### 1. 제목 작성법
- 구체적이고 명확하게
- 검색하기 쉬운 키워드 포함
- 길이는 60자 이내 권장

### 2. 설명(Description) 작성법
- 포스트의 핵심 내용 요약
- 독자가 얻을 수 있는 가치 명시
- 150자 이내로 작성

### 3. 태그 선정법
- 5개 이내로 제한
- 구체적이고 관련성 높은 태그 사용
- 일반적인 용어보다는 기술적 용어 선호

### 4. 구조화된 글쓰기
- 개요 → 본문 → 결론 구조
- 소제목으로 내용 분리
- 코드 예제와 설명 균형

---

## 🔄 업데이트 및 수정

### 기존 포스트 수정

1. 해당 포스트 파일을 찾아 수정
2. `updatedDate` 필드 추가 또는 업데이트
3. 변경사항 커밋 및 푸시

```yaml
---
title: "기존 포스트 제목"
pubDate: 2025-09-01
updatedDate: 2025-09-06  # 수정 날짜 추가
---
```

### 포스트 삭제

1. 해당 마크다운 파일 삭제
2. 관련 이미지 파일도 함께 삭제
3. 변경사항 커밋 및 푸시

---

**이제 Astro 기반의 현대적인 블로그에서 효율적으로 포스팅할 수 있습니다! 🚀**