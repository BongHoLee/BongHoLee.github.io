---
layout: post
title: JDBC vs DBCP - DataSource vs DriverManager
author: Bong5
categories: [Keywords, ProgramingLanguage/Java, WEB/Spring_Framework, WEB/Spring_Boot]
---

JDBC vs DBCP - DataSource vs DriverManager

---

### JDBC & DBCP

`JDBC`, `DBCP` 모두 `Java` 진영에서 `DB Connection`을 위해 사용하는 방법

<br>

### Connection & Connection Pool

`Connection`은 `DB 연결` 개념을 표현하는 객체다.

**보통 하나의 `Connection` 당 하나의 `트랜잭션`을 관리한다.**

하나의 `Connection`에서 여러 `SQL`을 사용하는 경우, 문제가 생겼을 때 `Connection` 단위로 **트랜잭션 롤백**이 일어나기 때문에 정상 쿼리도 함께 롤백되는 상황이 생길 수 있다. 이에 따라 **하나의 Connection 하나의 트랜잭션**을 준수하는게 안전한데, `Connection Pool`은 이러한 관점에서도 유용하다.

`Connection Pool`은 이러한 `Connection`을 담아놓는 바구니에 비유할 수 있다. 요청 마다 `Connection`을 새로 생성하고 닫는 방식이 비효율적이기 때문에 미리 `Connection`을 담는 `Pool`을 만들어 두고 필요할 때 꺼내 사용한 뒤 반납하는 방식.

<br>

### JDBC

`JDBC`는 인터페이스 기반으로 구축되어 있다. `DB Connection Interface`라고 이해할 수 있다.

일반적으로 `JDBC`는 `Pool` 방식이 아니기 때문에 `DB` 접근이 필요할 때 마다 매번 `Connection`을 생성하고 닫는다.

이러한 문제 때문에 상용 어플리케이션에서는 `JDBC` 방식을 사용하는 경우가 거의 없다.(매번 `Connection`을 생성하고 닫는 과정이 비효율적)

<br>

### JDBC 구성

- `드라이버 로드` : **Class.forName("full Name")**
    - JDBC 사용을 위한 드라이버를 로딩
    - 각 `Driver`는 메모리 로딩 타임에 `DriverManager.registerDriver(new SomeDriver())`를 통해 `Driver`를 등록한다.
    - `static` 영역에 정의했기 때문에 `로딩 타임에 static 구문 실행하면서 등록`이 가능함.
- `DriverManager` : **로드된 드라이버**를 통해서 `Connection`을 생성해주는 객체
- `Connection` : 데이터베이스와의 연결 객체
- `Statement`: `SQL`을 실행하는 객체로써, `Connection`이 반환해준다.

<br>

### DriverManager

`JDBC`에서 드라이버를 로딩하고 `Connection` 생성을 담당하는 객체다. 기본적으로 `JDBC`는 `Connection Pool`을 제공하지 않기 때문에 `DriverManager`를 사용해서 `Connection Pool`을 활용하려 하는 경우 **개발자가 직접 구현**해야 한다.

<br>

### DBCP

`DBCP(Database Connection Pool)` 방식은 위의 `JDBC` 방식의 단점을 보완해준다.

어플리케이션 구동 시 **필요한 만큼 `Connection`을 미리 생성한 뒤, `pool`에 넣어두고 필요할 때 마다 가져와서 사용 후 반납하는 방식이다.**

<br>

### DataSource

`DataSource`는 `DriverManager`를 통해 `Connection`을 얻는 것 보다 더 좋은 기법을 제공한다.

즉, `Connection`, `Statement` 객체를 `Pooling` 가능하고, **분산 트랜잭션을 다룰 수 있다.**

**Connection 하나당 트랜잭션 하나**를 관리하는게 보통인데 `Connection Pool`을 이용하면 다중 `Connection`을 활용하기 용이하기 때문에 분산 트랜잭션을 다룰 수 있다는 의미인 것 같다.

보통 `DataSource.getConnection` 오퍼레이션은 `DriverManager`가 생성한 `Connection`을 그대로 반환하는게 아니라 `Connection 대행 객체(Proxy Object)`를 반환한다.

프레임워크에서 제공하는 `DataSource`를 사용할 경우, 서버에서 관리가 되기 때문에 `DB 정보`가 바뀌거나 `JDBC 드라이버`가 교체되더라도 어플리케이션 코드는 변경하지 않아도 된다.