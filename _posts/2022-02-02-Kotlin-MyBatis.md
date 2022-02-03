---
layout: post
title: Kotlin - MyBatis
author: Bong5
categories: [Keywords, ProgramingLanguage/Kotlin]
--- 

## Kotlin - MyBatis

---

<img src="/assets/img/kotlin/img3.GIF" width="70%" height="auto" >

<br>

### 코틀린 코드

<script src="https://gist.github.com/BongHoLee/802f468d0777891a5de094ef2e169462.js"></script>

<br>

### MyBatis - SqlSession 관련 구성 요소

- `SqlSessionFactoryBuilder` : **Configuration**의 정보를 읽어서 **SqlSessionFactory**를 생성한다. 최초 한 번만 사용하길 권장되며, `메서드 스코프`로 사용되고 바로 해제되는게 가장 좋다.
- `SqlSessionFactory` : 매 요청 또는 SQL 구문 별 `SqlSession`을 생성하도록 하기 위해 `싱글턴`으로 `어플리케이션 스코프`로 사용되는 것이 가장 좋다.
- `SqlSession` : **SQL의 실행과 트랜잭션 제어를 위한 API를 제공하는 핵심 객체**로써, **각 쓰레드는 독립적인 `SqlSession`을 가져야 한다.** 즉, **SqlSession은 스레드 세이프하지 않기 때문에 공유되어서는 안된다.**
- `Mapper Interface` : `Mapper Interface`는 **SQL 구문을 바인딩**하기 위한 인터페이스다. 구현체는 `SqlSession`이 `this 참조`를 전달하여 생성해준다. 따라서 구현체가 `SQL`을 실행할 때 내부적으로는 `SqlSession API`를 활용한다.