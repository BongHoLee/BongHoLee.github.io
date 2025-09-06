---
title: "Programmers(KAKAO) 프렌즈 4블록"
description: "2차원 배열 형태의 4블록 문제이다."
pubDate: 2020-03-08
author: "Bong5"
categories: ["Algorithm"]
tags: ["Programmers"]
---


### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/17679)

블라인드 공채 통과한 신입사원 라이언은 신규 게임 개발 업무를 맡게되었다.

이번에 출시할 게임 제목은 "프렌즈 4블록".

같은 모양의 카카오프렌즈 블록이 `2 x 2` 형태로 4개가 붙어있는 경우 사라지면서 점수를 얻는 방식이다.

<img src="/assets/img/algorithms/img3.png" width="100%" height="auto">

만약 판이 위와 같이 주어질 경우, 라이언이 2x2로 배치된 7개 블록과 콘이 2x2로 배치된 4개의 블록이 지워진다.

같은 블록은 2x2에 포함될 수 있으며, 지워지는 조건에 만족하는 2x2 모양이 여러 개 있다면 한꺼번에 지워진다.

<img src="/assets/img/algorithms/img4.png" width="100%" height="auto">

블록이 지워진 후에 위에있는 블록이 아래로 떨어 빈 공간을 채우게 된다.

<img src="/assets/img/algorithms/img5.png" width="100%" height="auto">

만약 빈 공간을 채운 후에 다시 2x2 형태로 같은 모양의 블록이 모이면 다시 지워지고 떨어지고를 반복하게 된다.

<img src="/assets/img/algorithms/img6.png" width="100%" height="auto">

위 초기 배치를 문자로 표시하면 아래와 같다.

```
TTTANT
RRFACC
RRRFCC
TRRRAA
TTMMMF
TMMTTJ
```

각 문자는 라이언(R), 무지(M), 어피치(A), 프로도(F), 네오(N), 튜브(T), 제이지(J), 콘(C)를 의미한다.

입력으로 블록의 첫 배치가 주어졌을 때, 지워지는 블록은 모두 몇 개인지 판단하는 프로그램을 제작하라.

**_입력 형식_**

- 입력으로 판의 높이 m, 폭 n과 판의 배치 정보 board가 들어온다.

- 2 <= n, m <= 30

- board는 길이 n인 문자열 m개의 배열로 주어진다. 블록을 나타내는 문자는 대문자 A에서 Z가 사용된다.

**_출력 형식_**

입력으로 주어진 판 정보를 가지고 몇 개의 블록이 지워질지 출력하라.

**_예제 입출력_**

| m |	n | board | answer |
|---|---|---|---|
| 4 | 5 | [CCBDE, AAADE, AAABF, CCBBF]| 14 |
| 6 | 6 | [TTTANT, RRFACC, RRRFCC, TRRRAA, TTMMMF, TMMTTJ] | 15 |

---

### Solution

2차원 배열 형태의 4블록 문제이다.

언뜻 보면 `BFS/DFS`로 풀어야 하는 문제 같지만 그렇지 않다. 미로찾기와 같이 패턴이 유동적인 것이 아닌 일정한 패턴을 갖고있기 때문에 단순히 루프를 활용한 `완전 탐색`으로 손쉽게 풀 수 있다.

실제로 주어진 입력 역시 최대 30 x 30이기 때문에 시간복잡도가 크지 않다.

다만 문제 해결을 위해 고민해야 할 부분은 있다.

만약 2x2 블록을 찾았다면 해당 블록을 언제 지워줄 것인지를 잘 판단해야 한다. 즉, 지워지고 떨어지는 타이밍이 언제가 될지를 판단해야 한다.

다음으로 지워지고 떨어지는 로직이 필요하겠다.

나같은 경우 다음과 같은 절차로 문제를 해결하였다.

1. `board` 전체에서 각 요소의 [우측, 아래측, 오른쪽 대각선 아래측]이 같은지 (2x2 블록인지)를 검사한다. 만약 2x2 블록이라면 `boolean check[][]` 배열에 체크한다.

2. 2x2 블록이 나온 개수만큼 `changed += 1`을 해준다.

3. `changed > 0`이라면 (2x2 블록이 한 번 이상 존재한다면) `boolean check[][]` 배열에 체크된 요소들을 검사하여 `board`를 지우고 떨어뜨린다.

4. 위 패턴을 `changed == 0`일 때 까지 반복한다.


---


### Code

<script src="https://gist.github.com/BongHoLee/074294d02b05a1949f3c735460c5841c.js"></script>


---

### 몇줄 평

역시나 재미있는 카카오 문제였다.

역시나 시간복잡도 제한을 크게 두지 않고 `구현력`에 초점을 맞춘 문제로써 2x2 블록 찾기, 지워지고 떨어지기에 대한 구현이 주요 사항이었다.

---



### 참고 및 출처
