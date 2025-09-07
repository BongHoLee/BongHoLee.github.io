---
title: "DB냐 Application이냐?"
description: "이 포스트에 대한 설명"
pubDate: 2022-02-04
author: "Bong5"
tags: ["Insight"]
---
### 들어가며

Back-end 개발을 하면서 어떤 데이터 처리를 위해서 **SQL**을 활용할 것이냐 아니면 **DB는 단순히 데이터 소스 역할만 하고 Application에서 처리할 것이냐**로 고민을 하는 경우가 있다.

이에 대해서 `정답`은 없지만 `Good Practice`는 존재한다.

어떤 경우에 `SQL`을 활용할 것인지, 어떤 경우에 `Application Code`를 구현할 것인지 살펴본다.

<br>

## DB

### Join or Aggregation

당연한 얘기지만 `JOIN(LEFT, RIGHT 포함)`을 한다면 `SQL`을 이용해서 DB로부터 `Join` 결과를 가져오는 것이 훨씬 간편하고 속도 측면에서도 손해가 아니다.

비슷한 이유로 **집계 함수(MIN, AMX, SUM, AVG)**를 사용하는 경우도 `Application code`를 구현하는 것 보다 `SQL`을 활용하는 것이 더 경제적이다.

<br>

### 데이터 볼륨

`연산`을 위한 `데이터 볼륨`이 큰 경우 **SQL**로 연산을 하는 것이 보다 효과적이겠다.

`Application`에 할당된 `메모리`와 프로세스 수행을 위한 `CPU` 자원은 한정적이기 때문에 **Application에서 다량의 데이터를 직접 핸들링 한다면 많은 리소스 낭비가 발생할 것이다.**

또한 **다량의 데이터를 `DB`로 부터 가져오기 위한 `네트워크` 이슈도 발생할 여지가 있다.**

<br>

## Application

### Complexity(복잡도)

데이터 처리를 위한 `연산`이 복잡하다면 `Application`에서 수행하는 것이 더 효율적일 수 있다.

이를테면 `비동기`, `병렬 처리`, `멀티 스레드`와 같은 방식이 필요한 연산의 경우 `DB`보다 `Application`을 활용하는 것이 더 효과적이다.(병렬 처리를 기본적으로 제공하는 경우)

또한 `연산`에 대한 `단위 테스트`를 진행해야 한다면 `DB`를 이용하는 것은 악수가 될것.

<br>

### Scalability(확장성)

기본적으로 `DB`는 `Scale up`은 별 문제 없지만 `Scale Out`에 대한 작업이 쉽지 않다. `DB`마다 지원 여부도 따져봐야 하고 만일 가능하다고 하더라도 고려해야 할 사항이 상당히 많다.(클러스터링 또는 데이터 복제를 통한 확장 시 정합성 문제 해결 등)

반면 `Application`의 경우 로드 밸런서를 이용하는 등 상대적으로 `Scale Out`이 훨씬 쉽기 때문에 확장에 대한 고려가 필요하다면 `Application`을 권고한다.

<br>

### 참고

- [https://www.baeldung.com/calculations-in-db-vs-app](https://www.baeldung.com/calculations-in-db-vs-app)