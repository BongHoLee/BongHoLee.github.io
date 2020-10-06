---
layout: post
title: Programmers(Heap) 라면공장
author: Bong5
categories: [Algorithms/Programmers]
---

### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/42629)

라면공장에서는 하루에 밀가루를 1톤씩 사용합니다. 원래 밀가루를 공급받던 공장의 고장으로 앞으로 `k`일 이후에야 밀가루를 공급받을 수 있기 때문에 해외 공장에서 밀가루를 수입해야 합니다.

해외 공장에서는 향후 밀가루를 공급할 수 있는 `날짜`와 `수량`을 알려주었고, 라면공장에서는 운송비를 줄이기 위해 `최소한의 횟수`로 밀가루를 공급받고 싶습니다.

- 현재 공장에 남아있는 밀가루의 수량 : `stock`
- 밀가루 공급 일정 : `dates`
- 공급 일정에 공급 가능한 밀가루 수량 : `supplies`
- 원래 공장으로부터 공급받을 수 있는 시점 : `k`

위와 같은 데이터들이 주어졌을 떄 밀가루가 떨어지지 않고 공장을 운영하기 위해서 `최소한 몇 번` 해외의 공장으로부터 밀가루를 공급받아야 하는지를 return 하도록 solution을 작성하세요.

**_제한 사항_**

- `stock`에 있는 밀가루는 오늘(0일 이후)부터 사용됩니다.
- `stock`과 `k`는 2 ~ 100,000 입니다.
- `dates`의 각 원소는 1 이상 k 이하입니다.
- `supplies`의 각 원소는 1 이상 1,000 이하입니다.
- `dates`와 `supplies`의 길이는 1 이상 2,000 이하입니다.
- `k`일 째에는 밀가루가 충분히 공급되기 때문에 k-1일에 사용할 수량까지만 확보하면 됩니다.
- `dates`에 들어있는 `날짜는 오름차순 정렬`되어 있습니다.
- `dates`에 들어있는 날짜에 공급되는 밀가루는 작업 시작 전 새벽에 공급되는 것을 기준으로 합니다. 예를 들어 9일째에 밀가루가 바닥나더라도, 10일째에 공급받으면 10일째에는 공장을 운영할 수 있습니다.
- 밀가루가 바닥나는 경우는 주어지지 않습니다.

**_예제 입출력_**

| stock |	dates | supplies | k | result |
|---|---|---|---|---|
| 4 | [4, 10, 15] | [20, 5, 10] | 30 | 2 |

**_입출력 예 설명_**

- 현재 밀가루가 4톤 남아 있기 때문에 오늘과 1일 후~3일 후까지 사용하고 나면 모든 밀가루를 다 사용합니다. 따라서 4일 후에는 반드시 밀가루를 공급받아야 합니다.
- 4일째 공급받고 나면 15일 이후 아침에는 9톤의 밀가루가 남아있게 되고, 이때 10톤을 더 공급받으면 19톤이 남아있게 됩니다. 15일 이후부터 29일 이후까지 필요한 밀가루는 15톤이므로 더 이상의 공급은 필요 없습니다.
- 따라서 총 2회의 밀가루를 공급받으면 됩니다.

---

### Solution

`Heap` 유형으로 분류되었지만 문제 풀이의 흐름을 먼저 살펴보자.

지문을 보면 알 수 있듯이 단순히 `supplies`의 값이 큰 순서만을 의식해서는 안되고, 현재 남은 밀가루 수량인 `stock`과 밀가루 공급 일정인 `dates`를 고려해야한다.

1. `stock`이 다 떨어지기 전에 밀가루 공급을 받아야한다. 즉, `dates`의 요소 들 중 `stock` 이하의 날짜에서 공급을 받아야 한다.

2. 만일 `dates`의 요소들 중 `stock`이하의 요소가 많이 있다면, (ex: stock==10, dates==[2, 5, 7, 15]) 해당 요소들 중 가장 우선순위가 큰 (공급 수량이 많은) 공급일자를 택한다.

3. 공급받은 수량을 `stock`에 더해준 후 `stock >= k`가 될 때 까지 1, 2번을 수행한다.


나같은 경우 `replay` 문제임에도 불구하고 오히려 첫 번째에 풀었던 문제를 두 번째에 문제 풀이에서 난관에 부딪혔다. 하지만 그 덕에 다른 사람의 코드가 어떤지 한번 확인해보는 계기도 되었고 내가 일전에 작성했던 코드를 복기하는 기회를 가졌다.

그래서 이번에는 내가 실패한 풀이까지 포함하여 총 3개의 문제 풀이법을 제시할 수 있겠다. 코드를 보면서 확인하자.

---

### Code

**_첫 번째 풀이 (fail)_**

<script src="https://gist.github.com/BongHoLee/9cb3c579e9c697d15b40fe9b57e52b7f.js"></script>

각 `date`와 `supply`를 상태로 갖는 `SupplyInfo` 객체로 추상화하여 `supply`를 우선순위로 `PriorityQueue`에 삽입하여 구현했다.

위 방법은 실제로 작동을 하는데에는 큰 이상이 없다. 하지만 오버헤드가 너무 크기 때문에 비효율적인 코드인데다가 제출 시 시간 초과 문제로 실패를 한다.

접근법은 코드에서 확인할 수 있듯 `supply`를 우선순위로 `prQueue`에 삽입을 하고 `prQueue`에서 하나씩 폴링하며 `date`와 `stock`을 비교한다. 만일 `stock`보다 `date`가 크다면 공급받을 수 없기 때문에 `tmpList`에 잠시 저장한다.

만일 `stock` 보다 작은 `date`를 가진 `supplyInfo`가 나온다면 해당 객체가 가장 우선순위가 높기 떄문에 `supply` 만큼 `stock`에 삽입한다.

그 이후 `tmpList`에 저장되었던 객체들을 다시 `prQueue`에 삽입한다.

위와 같은 과정을 `stock <= k`가 될 때까지 반복하는데, 앞에서 언급했듯이 `tmpList`에 넣고 다시 `prQueue`에 넣고 하는 과정들이 오버헤드가 크기 때문에 비효율적이다.

<br>
<br>

**_두 번째 풀이_**

<script src="https://gist.github.com/BongHoLee/cc140fb64918fe9993c2c69451b865b6.js"></script>

두 번째 풀이는 다른 사람의 풀이를 참고한 코드로써, 내가 생각치 못한 풀이법이었다.

사실 문제가 원하는 `Heap`을 사용하는 가장 정석적이고 좋은 코드라고 생각한다.

먼저 첫 번째 풀이와 달리 `prQueue`를 초기화만 시키고 삽입은 하지 않는다.

그리고 주어진 `k`만큼 반복을 수행하는데, 루프가 한 번 실행할 때 `stock--`를 진행함으로써 하루가 지났음을 알 수 있다. 그리고 `stock <= 0`일 떄 까지 `prQueue`에 저장된 가장 공급량이 많은 `supply`를 취한다.

그렇다면 `prQueue`에는 어떤 `supply`를 언제 저장할까? 루프가 한 번 실행될 때가 하루가 지난 의미라고 했으니 `i`가 지난 일수를 의미한다. 따라서 `dates`에 저장된 요소와 `i`의 값이 같은 경우 해당 일자 공급량을 `supplies`에서 가져와 `prQueue`에 저장한다.

그리고 마지막으로 공급된 일자를 저장하기 위해 `lastDateIdx`를 활용한다.

**_세 번째 풀이_**

<script src="https://gist.github.com/BongHoLee/6c543c444731b477c23068d3b3a95542.js"></script>

세 번째 풀이는 내가 처음 이 문제를 접했을 때 풀었던 방법으로써, 시간 효율 측면에서는 가장 좋은 결과를 얻었다.

`stock < k`일 때 까지 루프를 반복한다.

그리고 한 번의 루프에서 `dates.length` 만큼의 루프를 진행하는데, `dates`의 요소들 중 현재의 밀가루 저장량인 `stock`보다 작은 날짜에 해당하는 요소들의 최대 `supply`를 구한다. `dates`는 오름차순으로 정렬되어있기 때문에 `stock`보다 크다면 이후 요소들은 우선순위에서 밀리기 때문에 `break`로 빠져나온다.

공급받을 수 있는 날짜들 중 가장 큰 `supply`만큼 `stock`에 더해준 다음 해당 `supply`는 `-1`로 처리를 해준다. (다음 루프에서 우선순위에 들지 못하도록)

사실 효율성 측면에서는 나쁘지 않은 방법이라고 생각되지만 코드를 하나하나 따져보지 않고서는 왜 이렇게 구현했는지 파악하기 쉽지 않기 때문에 좋은 코드라고는 생각하지 않는다.

---

### 몇줄 평

> 아쉽게도 처음 풀었을 때와 달리 풀지 못한 문제라 조금 속상한 마음이 들었다.

> 문제 유형이 주어지는 것이 좋은 방향이 될 수 있지만 유형의 특징에만 집착한 나머지 파라미터 사이의 특징이나 패턴과 같은 큰 그림을 보지 못한 것이 가장 큰 문제였던 것 같다. 반성하자.


---

### 2020-04-16 일자로 코드 일부 수정 (로직 다름)



### 참고 및 출처