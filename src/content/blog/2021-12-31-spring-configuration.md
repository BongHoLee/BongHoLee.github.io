---
title: "Spring @Configuration에 관하여 (feat. CGLIB Proxy)"
description: "`스프링 컨테이너`에 `Bean`을 등록하는 방법은 다양하다."
pubDate: 2021-12-31
author: "Bong5"
categories: ["Programming"]
tags: ["Keywords", "Spring_Framework", "Spring_Boot"]
---


## Spring @Configuration에 관하여 (feat. CGLIB Proxy)

---

## 개요

`스프링 컨테이너`에 `Bean`을 등록하는 방법은 다양하다.

그 중 하나가 `@Configuration` 설정 정보를 이용하여 `@Bean` 정의된 메서드를 호출하여 등록하는 방법이 있다.

<script src="https://gist.github.com/BongHoLee/f9b81adac9c88f333a50a202ca54f38e.js"></script>

위 코드를 살펴보자.

`Spring`은 `@Bean` 정의가 되어있는 메서드들을 호출함으로써

- **빈 생성 및 등록**
    - **빈 타입** : 반환 타입(`Book`, `Magazine`, `Title`, `Author`)
    - **빈 이름** : 메서드 명(`myBook`, `myMagazine`, `title`, `author`)

와 같이 **빈을 생성하여 컨테이너에 등록함으로써 `싱글톤`으로 관리한다.**

<br>

근데 의아한 점이 있다.

- `myBook()` 메서드를 호출하면 `Book` 인스턴스를 생성하면서 `title()`, `author()`를 호출한다.
- `myMagazine()` 메서드를 호출하면 `Magazine` 인스턴스를 생성하면서 `title()`, `author()` 를 호출한다.

그렇다면 `myBook 빈`이 갖고있는 `Title`, `Author` 인스턴스와 `myMagazine 빈`이 갖고있는 `Title`, `Author` 인스턴스는 다른 인스턴스인가? 같은 인스턴스인가?

결론부터 이야기 하자면 **동일한 인스턴스**이다. 즉, **스프링 컨테이너에서 싱글톤으로 관리하고 있는 `title 빈`, `author 빈`**이 주입된다.

어떻게 이게 가능한 것일까? 우리가 알고있는 자바 코드라면 `title()`, `author()` 호출 시 마다 새로운 인스턴스를 반환해야 하기 때문에 **서로 다른 인스턴스**가 주입되어야 하는데?

<br>

**비밀은 `@Configuration`에 있다.**

> **인용** : Method invocations in a Spring @Configuration class don't follow the regular Java semantics.
>

<br>

### @Configuration과 CGLIB

인용 문구 그대로 `@Configuration`이 정의된 클래스의 메서드 호출은 **일반 자바 시맨틱을 따르지 않는다.**

스프링은 `@Configuration`이 정의된 클래스를 먼저 `스프링 빈`으로 등록하고 `@Bean` 메서드를 호출함으로써 나머지 스프링 빈을 등록한다.

근데 `@Configuration` 클래스를 그대로 사용하는것이 아니라 `CGLIB`이라는 **바이트 코드 조작 라이브러리**를 사용하여 `**@Configuration` 클래스의 `proxy`를 스프링 빈으로 등록한다.**

이렇게 `CGLIB proxy`가 된 스프링 빈은 `title()`, `author()`와 같이 메서드가 호출될 때 **이미 컨테이너에 해당 이름을 가진 스프링 빈이 존재하는지 확인**을 한다.

- 만일 존재한다면 **메서드 실행을 하지 않고 존재하는 빈을 그대로 주입한다.**
- 만일 존재하지 않는다면 **메서드 실행을 통해 스프링 빈으로 등록 및 주입해준다.**

<br>

위와 같이 `CGLIB proxy`의 바이트 코드 조작을 이용하기 때문에 실제 `title()`, `author()`의 호출 횟수는 `1 번`씩 이뤄지게 되는 것이다.

<br>

### 만일 @Configuration이 없다면?

<script src="https://gist.github.com/BongHoLee/b39265d918b90c194cb102e2a992f28b.js"></script>

위와 같이 `@Configuration`을 주석 처리한다면 어떻게 될까?

이렇게 되면 `CGLIB proxy`가 아닌 `BookConfiguration` 타입의 인스턴스가 **스프링 빈**으로 등록되고 각 `@Bean`을 호출한다.

`CGLIB proxy`가 아니기 때문에 **자바 코드 그대로** 실행하게 된다. 즉, `title()`, `author()` 메서드는 각각 **3 번 씩(1번은 Bean 생성 및 등록 시, 2 번은 myBook(), myMagazine() 호출 시)** 호출된다.

따라서 `myBook 빈`의 `Author`, `Title`의 인스턴스와 `myMagazine 빈`의 `Author`, `Title`의 인스턴스는 **스프링 빈이 아닌 서로 다른 일반 인스턴스**이다.

### 참고 자료
- [http://www.javabyexamples.com/cglib-proxying-in-spring-configuration](http://www.javabyexamples.com/cglib-proxying-in-spring-configuration)