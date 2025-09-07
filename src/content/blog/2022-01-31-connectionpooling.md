---
title: "JDBC Connection Pooling"
description: "이 포스트에 대한 설명"
pubDate: 2022-01-31
author: "Bong5"
tags: ["Java"]
---
### 개요

`JDBC Connection`을 얻기 위한 키워드로 `DBCP`, `DataSource`에 대해 알아본다.

<br>

### Connection Pool

`DB Connection`을 얻고 쿼리를 실행하는 절차는 아래와 같다.

1. **database driver**를 이용하여 `connection` 획득
2. `data 송/수신`을 위해 `TCP Socket` 연결 획득
3. 획득한 `socket` 연결을 이용해서 데이터 송/수신
4. `connection` 해제(close)
5. `socket` 해제(close)

이와 같이 **하나의 트랜잭션 수행을 위한 비용이 상당히 비싸다.**

이러한 비용 문제를 해결하기 위해 등장한 것이 `Connection Pool`인데 말 그대로 **connection을 풀장에 적당한 수 만큼 저장**하는 개념이다.

**트랜잭션 수행 마다 connection 획득, 해제 등의 절차 없이** 단순히 `Connection Pool`에 미리 획득해둔 연결을 **가져다 사용하고 사용 후 반납**하기 때문에 연결/해제의 리소스가 상당히 절감된다.

이러한 `Connection Pool`을 제공받기 위해서 보통 `DBCP`, `DataSource`를 사용하는데 `DataSource`의 경우 **구현체 별로 `Connection Pool`를 제공하는 경우도 있고 제공하지 않는 경우도 있다.**

보통 **Spring과 같은 Container**에서 제공하는 `DataSource`의 경우는 대부분 제공한다.

<br>

### DataSource

보통 `DataSource`는 `JNDI naming service`에 등록되어 사용되는데, 한 번 등록이 완료가 되면 **어플리케이션은 `JNDI`로 부터 `lookup`하여 `DataSource`를 가져와 사용**한다.

<script src="https://gist.github.com/BongHoLee/2468b061625d195b245bc04acb73a4ab.js"></script>

만일 `DataSource`가 `connection pool`을 제공한다면 `pool`에서 `connection`을 반환하고 `connection pool`을 제공하지 않는다면 **새로 Connection 객체를 생성 및 획득**해서 제공한다.

<br>

<script src="https://gist.github.com/BongHoLee/4ef1cc9d37f4e9cc967940f8de32660b.js"></script>

`DataSource`로 부터 얻은 `connection`은 일반 `Connection` 객체와 동일한 타입인 것 처럼 보이지만 **실제로는 Connection의 프록시 객체**로써, `close()` 호출 시 실제로 **연결 해제**를 하는 것이 아니라 **connection pool**에 반환하는 것이 일반적이다.

<br>

### 참고

- [https://www.progress.com/tutorials/jdbc/jdbc-jdbc-connection-pooling](https://www.progress.com/tutorials/jdbc/jdbc-jdbc-connection-pooling)