---
title: "HttpSession & Spring Session"
description: "`HttpSession`은 `Spring`이 아니라 `Tomcate`과 같은 `Servlet Container`가 생성하여 Spring에 주입한다. **Tomcat은 기본적으로 HttpSession의 구현체로 StandardSession을 사용한다.**"
pubDate: 2022-01-02
author: "Bong5"
categories: ["Programming"]
tags: ["Keywords", "Spring_Framework", "Spring_Boot"]
---


## HttpSession & Spring Session

---

### HttpSession

`HttpSession`은 `Spring`이 아니라 `Tomcate`과 같은 `Servlet Container`가 생성하여 Spring에 주입한다. **Tomcat은 기본적으로 HttpSession의 구현체로 StandardSession을 사용한다.**

<br>

### SpringSession

`SpringSession`은 어플리케이션 컨테이너(Tomcat 등) 내에서 `HttpSession`을 대체할 수 있다. 또한 `Session Clustering`과 RestAPI를 지원한다.

또한 `Spring Session`은 filter 기반 작동 방식이기 때문에 **서블릿 컨테이너에서 filter가 어떻게 작동하는지를 먼저 파악해야 한다.**

<br>

### HttpSession Integeration

`Spring Session`은 `HttpSession`과의 투명한 통합을 제공한다. (개발자는 `HttpSession` 구현체를 `Spring Session` 구현체로 바꿔 사용 가능하다.)

<br>

### Why Spring Session and HttpSession

그렇다면 `HttpSession` 대신 `Spring Session`을 사용했을 떄의 이점은 무엇일까?

- **Session Clustring 지원**
  - 어플리케이션에 종속적이지 않은 `Session Clustring`을 지원한다.
    - 특정 컨테이너(톰캣, 제우스 등)에 종속적이지 않다는 의미.
- **RESTful APIs**
  - `Spring Session`은 `RESTful API`의 헤더에 제공된 `세션`을 이용할 수 있다.

<br>

### HttpSession with Redis

`HttpSession`을 사용하는 모든 작업에 대하여 `Servlet Filter`를 추가함으로써 `Spring Session`과 `HttpSession`을 함께 사용할 수 있다.

- **Java-based Configuration**을 통해 설정이 가능하다.
- **XML-based Configuration**을 통해 설정이 가능하다.

<img src="/assets/img/spring/img3.GIF" width="70%" height="auto" >

위와 같이 `Java-Configuration`으로 설정할 경우, `HttpSession`의 구현체를 `Spring Session`이 지원하는 구현체로 대체하는 `Servlet Filter`를 생성할 수 있다.

`@EnableRedisHttpSession` 어노테이션은 `springSessionRepositoryFilter`라는 이름을 가진 `Bean`을 생성하는데, 이 `Filter`가 바로 `HttpSession`의 구현체를 `Spring Session`이 지원하는 구현체로 교체하는 역할을 수행한다. 위의 경우 `Spring Session`은 `Redis`에 지원을 받는다.

`LettuceConnectionFactory()`를 반환함으로써 `RedisConnectionFactory`를 가질 수 있는데, `RedisConnectionFactory`는 `Redis Server`와 `Spring Session` 사이의 연결 객체를 갖는다.

<br>

### 서블릿 컨테이너에서의 Filter 동작

`Spring-Session`은 `Filter`로 동작한다고 하였다. 따라서 **서블릿 컨테이너(Tomcate, Jeus etc.)**에서 필터가 어떤 방식으로 동작하는지 먼저 알아야 한다.

**톰캣**의 경우를 살펴보면, 서블릿 컨테이너는 지정된 포트(8080)에서 `TCP Socket`을 리스닝 하고 있다가 네트워크로부터 데이터가 들어오면 작업을 시작한다. 즉, 클라이언트로부터 `HTTP Request` 수신 시 일을 시작한다.

`소켓`으로 들어온 데이터를 `Request` 객체로 캡슐화하여 **서블릿을 호출할 때 넘겨준다.** 여기서 **서블릿을 호출하기 전에 미리 정의해놓은 `Filter`들을 먼저 실행시킨다.** 톰캣은 `FilterChain`에게 `Filter`를 순서대로 호출하고 **마지막에 서블릿 호출**하도록 위임한다.

<br>

### HttpSession

`Session` 구현을 위해 존재하는 `HttpSession` 인터페이스는 세션의 속성을 `CRUD` 하거나 타임아웃 시간을 설정하는 퍼블릭 인터페이스를 제공한다. `Tomcat`은 **클라이언트별로 Session 객체를 할당**하여 내부에 보관하고 있다가(`Memory`) 다음 요청이 있을 때 참조한다. 여기서 `Session Tracking` 개념이 등장한다.

<br>

### Session Tracking

일반적인 `Http Request`에는 유저에 대한 정보가 없다. 서블릿 컨테이너(`Tomcat`)는 수신한 요청이 **누가 보낸 요청인지, 즉 식별자가 있어야 내부에 저장하고 있는 `Session` 객체를 읽어서 참조**할 것이다. 다시 말하면, **서블릿 컨테이너가 누가 요청을 보냈는지 어떻게 식별하느냐**에 대한 이야기가 `Session Tracking Mechanism`이다.

보통 `Session`을 추적하기 위해서 `Cookie`를 사용하는것이 일반적이다. **컨테이너에서 요청에 대한 응답을 보낼 때 `Session`을 만들고 `SessionID`를 `Cookie`로 내려보내는 것이다.

**클라이언트가 받은 Cookie는 다음 요청에 덧붙여져서 오기 때문에 컨테이너가 요청을 받았을 때 `Cookie`에 있는 `Session` 정보를 이용해서 요청자를 식별할 수 있다.**

그래서 웹브라우저의 개발자 도구로 쿠키목록을 보면 `JSESSIONID`가 있는 것이다.

<br>

### 게으른 Session

컨테이너에서 `Session` 객체를 만들거나 `Reuqest`에 있는 `ID`로 `Session`을 가져오는 비용은 생각보다 크기 때문에 **요청이 있을 때 새로 만들거나 찾아온다.** 여기서 `요청이 있을 때`란, `Filter`, `Servlet` 등에서 `Reuqest` 객체에 `getSession()` 메시지를 최초로 전송할 때 이다.

**Session Tracking**을 위해 `Cookie`를 사용한다고 설정했을 경우, `Session`을 새로 만들 때 `Response` 객체의 헤더에 **나 이런 SessionID로 만들어놨어**라고 헤더를 하나 추가한다. 그 헤더가 `Set-Cookie`이다. 이 헤더는 애플리케이션에서 쿠키 생성이 필요할 때 호출하는 `response.addCookie()` 오퍼레이션으로 추가되는 것이다. 즉 `addCookie` 메서드는 응답 헤더에 `Set-Cookie` 하나를 추가하는 일을 한다.

이렇게 `Session`이 만들어지는 타이밍이 가장 먼저 `Session`을 요구했을 때(`getSession()`)이기 때문에 **누가 먼저 Session을 점령하는지가 중요하다.** 왜 그런지 `Spring-Session` 필터를 살펴보며 이해해보자.

<br>

### Spring-Session Filter

[https://velog.io/@yaho1024/spring-security-delegatingFilterProxy](https://velog.io/@yaho1024/spring-security-delegatingFilterProxy)

`Spring-Session`을 사용하려면 `Filter`를 추가해야 한다. 다시 이야기하지만 **`Spring-Session`은 Filter로 동작한다.** `애노테이션`을 이용한 설정을 하더라도 자동으로 필터를 추가하는 코드가 들어가 있다.

```xml
<filter>
	<filter-name>springSessionRepositoryFilter</filter-name>
	<filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
</filter>
<filter-mapping>
	<filter-name>springSessionRepositoryFilter</filter-name>
	<url-pattern>/*</url-pattern>
	<dispatcher>REQUEST</dispatcher>
	<dispatcher>ERROR</dispatcher>
</filter-mapping>
```

그런데 필터 클래스가 `DelegatingFilterProxy`다. 따라서 `DelegatingFilterProxy`는 `springSessionRepositoryFilter`라는 이름의 Bean을 찾아 `Filter`로 캐스팅을 한다. 따라서 **모든 `DelegatingFilterProxy` 호출에 대해 `springSessionRepositoryFilter`가 호출된다.

이 `springSessionRepositoryFilter`는 `Request` 객체의 `getSession()`을 호출했을 때 `Spring-Session`에서 관리하는 위치에서 `Session` 정보를 가져올 수 있도록 **Request 객체를 Wrapping하고 Session 객체를 SessionRepository를 이용하여 저장하는 일을 수행한다.**

`SessionRepository`는 객체로 만들어진 `Session`을 어딘가에 저장하는 기능을 제공하기 위한 인터페이스로써 **어떤 구현체(RDBMS or REDIS 등)**을 이용하느냐에 다르다.

`Request` 정보는 필터들을 거치고 `Servlet`에서 얼마든지 변경이 가능하기 때문에 **모든 서비스가 수행되고 난 뒤 최종적으로 그 결과를 저장소에 저장**해야 한다.

<img src="/assets/img/spring/img2.GIF" width="70%" height="auto" >

<br>

### 참고

- [https://docs.spring.io/spring-session/docs/2.2.x/reference/html/httpsession.html](https://docs.spring.io/spring-session/docs/2.2.x/reference/html/httpsession.html)
- [https://thecodinglog.github.io/spring-session/2020/08/07/filter-chain.html](https://thecodinglog.github.io/spring-session/2020/08/07/filter-chain.html)