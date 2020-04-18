---
layout: post
title: Programmers(KAKAO) 2020_문자열_압축
author: Bong5
categories: [Algorithms/Programmers]
---

### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/62048)

가로 길이가 W cm, 세로 길이가 H cm인 직사각형 종이가 있습니다.

종이에는 가로, 세로 방향과 평행하게 격자 형태로 선이 그어져 있으며, 모든 격자 칸은 1cm x 1cm 크기입니다.

이 종이를 격자 선을 따라 1cm x 1cm의 정사각형으로 잘라 사용할 예정이었는데, 누군가가 이 종이를 대각선 꼭지점 2개를 잇는 방향으로 잘라놓았습니다.

그러므로 현재 직사각형 종이는 크기가 같은 직각삼각형 2개로 나누어진 상태입니다.

새로운 종이를 구할 수 없는 상태이기 때문에, 이 종이에서 원래 종이의 가로, 세로 방향과 평행하게 1cm x 1cm로 잘라 사용할 수 있는 만큼만 사용하기로 하였습니다.

가로의 길이 W와 세로의 길이 H가 주어질 때, 사용할 수 있는 정사각형의 개수를 구하는 `solution` 함수를 완성해 주세요.

#### 제한사항

- W, H : 1억 이하의 자연수

#### 입출력 예제

| W | H | result |
|---|---|---|
| 8 | 12 | 80 |

#### 입출력 예 설명

가로가 8, 세로가 12인 직사각형을 대각선 방향으로 자르면 총 16개의 정사각형을 사용할 수 없게 됩니다. 원래 직사각형에서는 96개의 정사각형을 만들 수 있었으므로, 96 - 16 = 80을 반환합니다.

<img src="/assets/img/square.png" width="100%" height="auto">

---

### Solution

문제를 보면 알 수 있듯이 `패턴 찾기` 문제이다.

번거로운 것은 일반적으로 패턴 찾기는 몇 개의 예를 비교하거나 직접 테스트 케이스를 비교하며 진행하기 마련인데 이 예제의 경우 정사각형을 그리고 대각선을 잇는 테스트 케이스를 직접 그려보기가 여의치 않다.

따라서 문제에서 주어진 단 한개의 테스트 케이스를 이용하여 접근법을 파악해본다면, 우선 아래와 같이 패턴이 반복되는 사각형이 나타나는것을 알 수 있다.

<img src="/assets/img/square2.png" width="100%" height="auto">

자세히 살펴보면 W와 H가 `8 x 12`였던 사각형을 `2 x 3`으로 줄인 사각형으로 계산이 가능함을 알 수 있다.

그리고 `8 x 12`를 `2 x 3`으로 만들기 위한 패턴은 각각 W와 H를 최대 공약수로 나눈 결과이다.

즉 `W = W/gcd(W, H)`, `H = H/gcd(W, H)`가 성립된다.

다음으로 이렇게 최소한으로 쪼개진 사각형에서 대각선을 지나는 부분 사각형의 갯수를 구하면 문제 해결을 위한 패턴 찾기는 완료가 된다.

최소한으로 쪼개진 사각형에서의 대각선을 지나는 부분 사각형 갯수는 간단하게 `W + H - 1` 패턴을 갖는다. 

이제 최소한으로 쪼개진 사각형에서 부분사각형 값을 찾았으므로 최종 결과는 나누어 주었던 최대공약수를 다시 곱해주면 원하는 결과를 얻을 수 있다.

---


### Code

<script src="https://gist.github.com/BongHoLee/c67bdaac4fa1f68c02605dc33b4f00e3.js"></script>


---

### 몇줄 평

테스트 케이스가 한 개 밖에 주어지지 않아 패턴을 찾기 위해 고생했던 문제 중 하나이다.

부분 사각형을 구하는 방식이고 부분 사각형의 크기까지는 구했지만 `최대 공약수` 패턴이 아닌 `재귀` 패턴으로 접근을 잘못하는 바람에 결국 다른 사람의 풀이를 참고해서 풀었다.

직관력이 아쉬웠던 문제였다.

---



### 참고 및 출처