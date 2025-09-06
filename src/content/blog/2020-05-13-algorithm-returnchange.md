---
title: "Programmer(DP) 거스름돈"
description: "한 번 쯤은 접해봤을 법 한 `거스름돈` 문제이다."
pubDate: 2020-05-13
author: "Bong5"
categories: ["Programming"]
tags: ["Programmers"]
---


### 문제 설명

- [출처](https://programmers.co.kr/learn/courses/30/lessons/12907)

Finn은 편의점에서 야간 아르바이트를 하고 있습니다. 야간에 손님이 너무 없어 심심한 Finn은 손님들께 거스름돈을 n원을 줄 때 방법의 경우의 수를 구하기로 하였습니다.

예를 들어서 손님께 5원을 거슬러 줘야 하고 1원, 2원, 5원이 있다면 다음과 같이 4가지 방법으로 5원을 거슬러 줄 수 있습니다.

- 1원을 5개를 사용해서 거슬러준다.
- 1원을 3개 사용하고 2원을 1개 사용해서 거슬러 준다.
- 1원을 1개 사용하고 2원을 2개 사용해서 거슬러 준다.
- 5원을 1개 사용해서 거슬러 준다.

거슬러 줘야 하는 금액 n과 Finn이 현재 보유하고 있는 돈의 종류 money가 매개변수로 주어질 때, Finn이 n원을 거슬러 줄 방법의 수를 return하도록 solution 함수를 완성해 주세요.

#### 제한사항

- n은 100,000 이하의 자연수입니다.
- 화폐 단위는 100종류 이하입니다.
- 모든 화폐는 무한하게 있다고 가정합니다.
- 정답이 커질 수 있으니, 1,000,000,007로 나눈 나머지를 return 해주세요


#### 입출력 예

| n | money | result |
|---|---|---|
| 5 | [1,2,5] | 4 |


---

### Solution

한 번 쯤은 접해봤을 법 한 `거스름돈` 문제이다.



---

### Code

<script src="https://gist.github.com/BongHoLee/cde624dab22c452dcbdc1d70d86ba68f.js"></script>

코드를 보면 알 수 있듯 먼저 `people` 배열을 오름차순으로 정렬한다.

이후 가장 가벼운 사람의 인덱스를 표시하는 `start`와 가장 무거운 사람의 인덱스를 표시하는 `last`로 두 사람을 추출한다.

만일 `lightPerson + heavyPerson <= limit`이라면 두 명을 구명보트에 동승시키고, `lightPerson + heavyPerson > limit`라면 `heavyPerson`만 구명보트에 탑승시킨다.

이렇게 진행되다가 마지막에 만일 `start == last`가 되는 상황이 오면 한 사람만이 남았다는 의미이므로 `lastBoarded` 변수를 1로 변경해준다.

최종값을 반환할 때 `lastBoarded`가 1이라면 아직 탑승하지 못한 사람이 한 명 있다는 의미이므로 `lifeBoats` 변수에 1을 더해준 후 반환한다.

---

### 몇줄 평

`가장 가벼운 사람 + 가장 무거운 사람 <= 제한 무게`라는 접근법만 파악된다면 어렵지 않은 문제였다.
---



### 참고 및 출처

- 프로그래머스
