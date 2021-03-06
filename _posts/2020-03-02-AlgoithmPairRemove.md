---
layout: post
title: Programmers(Stack) 짝지어 제거하기
author: Bong5
categories: [Algorithms/Programmers]
---

### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/12973)

짝지어 제거하기는, 알파벳 소문자로 이루어진 문자열을 가지고 시작합니다.

먼저 문자열에서 같은 알파벳이 2개 붙어 있는 짝을 찾습니다.

그 다음, 그 둘을 제거한 뒤, 앞뒤로 문자열을 이어붙입니다. 이 과정을 반복해서 문자열을 모두 제거한다면 짝지어 제거하기가 종료됩니다.

문자열 `S`가 주어졌을 때, 짝지어 제거하기를 성공적으론 수행할 수 있는지 반환하는 함수를 완성해주세요.

성공적으로 수행할 수 있따면 1을, 아닐 경우 0을 리턴해주면 됩니다.

예를 들어 문자열 S = `baabaa`라면

b aa baa -> bb aa -> aa ->

의 순서로 문자열을 모두 제거할 수 있으므로 1을 반환합니다.

제한 사항

**_제한 사항_**

- 문자열의 길이 : 1,000,000 이하의 자연수

- 문자열은 모두 소문자로 이루어져 있습니다.

**_예제 입출력_**

| S |	result |
|---|---|
| baabaa | 1 |
| cdcd | 0 |


---

### Solution

문제 자체만 보았을 때 어렵지 않다. 문자열을 검사하여 반복된 문자들을 제거하는 방향으로 생각하면 쉽게 풀린다.

하지만 이 문제의 원하는 답은 단순히 반복 문자들을 제거하는 것 뿐만이 아니다. 문자열의 `길이`에 주목 할 필요가 있다.

문자열의 길이는 총 1,000,000으로 만일 2중 루프 이상을 사용 할 경우 시간복잡도는 상당히 커지게 된다.

즉, 문제에서 원하는 것은 최대 한 번의 루프를 이용하여 문제를 해결하는 것이다.

이 문제를 풀기 위하여 고민해야 할 것은 언어들이 제공하는 문자열 관련 API가 아니다. 나 역시 처음에는 `replace, relaceAll`을 이용하여 문제를 해결하려 했지만 시간 초과가 나는 것을 보고 접근을 달리해야 함을 깨달았다.

문제를 다시 살펴보자. 문제에서 중복 문자열을 제거하는데, 여기서 중복 문자열이란 같은 문자가 연속해서 나옴을 의미한다. 그리고 중복 문자열은 제거한 뒤 그 다음 문자열들이 이어진다.

조금만 주의깊게 살펴보면 프로세스가 `Stack`을 이용하면 쉽게 풀린다는 것을 알 수 있다.

문자열들을 스택에 적재하는데, 현재 문자가 스택의 top과 동일하다면 pop을, 동일하지 않다면 현재 문자를 push를 해줌으로써 단 하나의 loop로 해결이 가능하다.

---

### Code

<script src="https://gist.github.com/BongHoLee/c39c42f83f2b0112651f348b5c97fb06.js"></script>  




`Stack`을 활용하여 문제해결을 해야함을 캐치해야하는 문제이다.

---

### 몇줄 평


> 어떤 자료구조가 효율적인지 고민이 필요함을 느끼게 해준 문제


---



### 참고 및 출처
