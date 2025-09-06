---
title: "Programmers(KAKAO) 캐시"
description: "기본적으로 `LRU(Least Recently Used)`에 대한 지식이 필요한 문제이다. 나같은 경우 찾아보기 귀찮아서 예제 입출력을 보고 `캐시 내에서 더 많이 hit한 요소가 가장 오래 유지`하는 것으로 오해하여 `우선순위 큐`를 이용하여 접근을 하였다."
pubDate: 2020-03-08
author: "Bong5"
categories: ["Programming"]
tags: ["Programmers"]
---


### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/17680)

지도개발팀에서 근무하는 제이지는 지도에서 도시 이름을 검색하면 해당 도시와 관련된 맛집 게시물들을 데이터베이스에서 읽어서 보여주는 서비스를 개발하고 있다.

이 프로그램의 테스팅 업무를 담당하고 있는 어피치는 서비스를 오픈하기 전 각 로직에 대한 성능 측정을 수행하였는데, 제이지가 작성한 부분 중 데이터베이스에서 게시물을 가져오는 부분의 실행 시간이 너무 오래 걸린다는 것을 알게되었다.

어피치는 제이지에게 해당 로직을 개선해달라고 닦달하기 시작했고, 제이지는 DB 캐시를 적용하여 성능 개선을 시도하고 있지만 캐시 크기를 얼마로 해야 효율적일지 몰라 난감한 상황이다.

어피치에게 시달리는 제이지를 도와, DB 캐시를 적용할 때 캐시 크기에 따른 실행 시간 측정 프로그램을 완성하시오.

**_입력 형식_**

- 캐시 사이즈 (cacheSize)와 도시 이름 배열(cities)를 입력받는다.

- cacheSize는 정수이며, 범위는 0 <= cacheSize <= 30 이다.

- cities는 도시 이름으로 이뤄진 문자열 배열로, 최대 도시의 수는 100,000개 이다.

- 각 도시의 이름은 공백, 숫자, 특수문자 등이 없는 영문자로 구성되며, 대소문자 구분을 하지 않는다. 도시 이름은 최대 20자로 이루어져 있다.

**_출력 형식_**

- 입력된 도시이름 배열을 순서대로 처리할 때 "총 실행 시간"을 출력한다.

**_조건_**

- 캐시 교체 알고리즘은 `LRU`를 사용한다.

- cache hit일 경우 실행 시간은 1이다.

- cache miss일 경우 실행 시간은 5이다.



**_예제 입출력_**

| cacheSize |	cities | 실행 시간 |
|---|---|---|
| 3 | [Jeju, Pangyo, Seoul, NewYork, LA, Jeju, Pangyo, Seoul, NewYork, LA] | 50 |
| 3 | [Jeju, Pangyo, Seoul, Jeju, Pangyo, Seoul, Jeju, Pangyo, Seoul] | 21 |
| 2 | [Jeju, Pangyo, Seoul, NewYork, LA, SanFrancisco, Seoul, Rome, Paris, Jeju, NewYork, Rome] | 60 |
| 5 | [Jeju, Pangyo, Seoul, NewYork, LA, SanFrancisco, Seoul, Rome, Paris, Jeju, NewYork, Rome] | 52 |
| 2 | [Jeju, Pangyo, NewYork, newyork] | 16 |
| 0 | [Jeju, Pangyo, Seoul, NewYork, LA] | 25 |

---

### Solution

기본적으로 `LRU(Least Recently Used)`에 대한 지식이 필요한 문제이다. 나같은 경우 찾아보기 귀찮아서 예제 입출력을 보고 `캐시 내에서 더 많이 hit한 요소가 가장 오래 유지`하는 것으로 오해하여 `우선순위 큐`를 이용하여 접근을 하였다.

이상하게도 예제는 통과하였지만 당연하게도 채점을 통과하지는 못하였다.

조금 더 살펴보던 와중 오히려 더 간단한 문제였음을 깨달았다.

간단히 `LRU`에 대하여 설명하자면 말 그대로 **_가장 오래전에 사용된 요소를 배제하는 것_** 이다. 즉, 최근에 가장 사용되지 않은(오래된) 요소가 캐시에서 제외되는 1순위가 된다.

그리고 가장 최근에 사용된 요소가 다른 요소들에 비해 캐시에서 가장 오래 유지된다.

이러한 프로세스와 가장 유사한 자료구조는 `Queue`일 것이다. `선입선출`. 즉 가장 먼저 들어온(가장 오래된)요소가 가장 먼저 나가는(가장 먼저 제외되는) 프로세스이므로 문제 해결을 위한 자료구조가 된다.

단, 먼저 들어온 요소가 캐시에서 배제되기 전에 또 호출된다면 (사용된다면) 해당 요소는 다시 캐시에 새롭게 생성된다.

---


### Code

<script src="https://gist.github.com/BongHoLee/5017dcf3de7a8c55f664db47a710a444.js"></script>


---

### 몇줄 평

- 우선순위 큐를 이용한 캐시 문제 해결 역시 재밌게 풀어봄


---



### 참고 및 출처
