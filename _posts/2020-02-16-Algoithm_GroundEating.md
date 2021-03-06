---
layout: post
title: Programmers(재귀/DP)_땅따먹기
author: Bong5
categories: [Algorithms/Programmers]
---

### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/12913)

땅따먹기 게임을 하려고 합니다. 땅따먹기 게임의 땅(land)는 총 N행 4열로 이루어져 있고, 모든 칸에는 점수가 쓰여있습니다.

1행부터 땅을 밟으며 한 행씩 내려올 때, 각 행의 4칸 중 한 칸만 밟으면서 내려와야 합니다.

단, 땅따먹기 게임에는 한 행씩 내려올 때, 같은 열을 반복해서 밟을 수 없다는 규칙이 있습니다.

예를들면,

```
| 1 | 2 | 3 | 5 |

| 5 | 6 | 7 | 8 |

| 4 | 3 | 2 | 1 |
```
로 땅이 주어졌을 때, 1행에서 네번째 칸(5)를 밟았으면, 2행의 네 번째 칸(8)은 밟을 수 없습니다.

마지막 행 까지 내려왔을 때, 얻을 수 있는 점수의 최대값을 return하는 solution 함수를 만들어주세요.

위 예의 경우 1행의 네번째 칸(5), 2행의 세번째 칸(7), 3행의 첫번째 칸(4)를 밟아 16점이 최고점이 됩니다.

**_제한 사항_**

- 행의 개수 N : 100,000 이하의 자연수

- 열의 개수는 4개 이고, 땅(land)는 2차원 배열로 주어집니다.

- 점수 : 100 이하의 자연수


**_예제 입출력_**

| n |	land |
|---|---|
|[[1,2,3,5],[5,6,7,8],[4,3,2,1]]| 16 |


---

### Solution

2차원 배열의 `loop` 또는 `재귀`를 이용하여 해결이 가능하다. 또한 `시간 초과`를 피하기 위해 `메모제이션`을 활용해야 보다 효율적인 코드를 짤 수 있겠다.

나같은 경우 피보나치 수열과 같이 `분기`가 필요한 `반복구조`의 경우 `재귀`를 이용하여 푸는 방식을 선호하기 때문에 해당 코드 역시 `재귀적`인 관점으로 접근하였다.

`접근법` 자체는 상당히 간단하다. **_각 행의 각 요소들이 이전 행에서 선택한 요소와 다른 열인 경우에 대하여 계산된 값(더한 값)들을 비교하고 그 중 최대값을 산출하면 된다._**

재귀적으로 호출된 각 함수들은 **_현재 행의 각 요소(땅)들 중 이전 행에서 밟은 땅과 다른 요소들을 밟았을 때의 값들 중 최대값을 계산한다._**

물론 재귀적으로 호출되기 때문에 **_현재 행의 각 요소들을 계산하기 위해서는 다음 행들의 계산 결과들이 필요하고, 다음 행들의 계산 결과는 재귀호출의 결과이다._**

결과적으로 위와 같은 접근법을 따랐을 때에는 **_모든 경우의 수에 대하여 계산 후 걔 중 최대값을 산출하는 방식이다._**

이 접근법으로 원하는 결과는 산출된다. 하지만 한 가지 문제가 있다. 바로 `중복된 계산`이 존재한다는 점이다. 바로 이 `중복된 계산` 때문에 `메모이제이션`이 필요하다. 그렇다면 언제 `중복된 계산`이 발생할까? 예제로 주어진 입출력을 보자. 첫 번째 행의 최대값을 구하기 위해서는 첫 번째 행의 각 요소(땅) `([1, 2, 3, 5])`을 밟은 모든 경우의 수를 구해야 한다. 만일 첫 번째 땅`(1)`을 밟았다면 그 다음 행`([5, 6, 7, 8])` 중 직전 행과 동일한 열의 요소(땅)인 `(5)`를 제외한 나머지 `(6, 7, 8)`에 대한 경우의 수를 구해야 한다.

이렇게 마지막 행까지 계산된 결과를 이용하여 최대값을 구했다면 이제 첫 행의 첫 번째 요소(땅)인 `(1)`에 대한 값을 구한 것이다. 이제 그 다음 요소인 `(2)`에 대한 결과를 얻기 위해 동일한 과정을 거친다.

여기서 `중복된 계산`이 발생한다. 자 우리는 `(1)`에 대한 결과를 얻기 위해 **_각 행들의 각 요소들이 갖는 값들을 재귀적으로 이미 호출_** 한 바 있다. 그렇다면 `(2)`에 대한 결과를 얻기 위해 같은 계산, 같은 재귀호출을 반복해서 해야 할 필요가 있을까? 즉, 두 번째 행의 첫 번째 요소인 `(5)`를 밟았을 때의 계산 결과를 이미 알고있다면, 그리고 그 값을 어딘가에 저장해 두었다면 우리는 더 이상 `(5)`를 밟은 이후의 재귀 호출을 위해 불필요한 메모리 낭비를 할 필요가 없다. 그리고 이러한 값을 저장하기 위해 바로 `메모이제이션`이 필요하다.

말이 너무 장황했지만 결국은 `각 행의 각 요소들에 대한 계산을 위해 재귀를 활용하고 이전 계산들을 보관하기 위한 메모이제이션을 활용`하는게 핵심이다.

아래 코드를 보면 좀 더 이해하기 수월할 것이다.

---

### Code
<script src="https://gist.github.com/BongHoLee/b49feaa22e3487998e8177e7bd94c79a.js"></script>

요지는 `dp` 배열에 각 결과값들을 저장하고, `중복 계산`을 피하기 위해 `dp`에 저장된 결과값들을 활용하는 것이다.

---

### 몇줄 평

> 재귀를 활용한 문제해결이 조금씩 더 익숙해져 가는것 같아 뿌듯

> 각 분기되는 경우가 for 루프로 구현됨

> 스스로 `dp`에 대한 접근을 이용하여 문제를 해결함에 따른 뿌듯

---

### 2020-04-16 일자로 코드 일부 수정 (접근법 및 로직은 동일)



### 참고 및 출처
