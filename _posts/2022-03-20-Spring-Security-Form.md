---
layout: post
title: Spring Security - Form 기반 인증
author: Bong5
categories: [Keywords, WEB/Spring_Framework, WEB/Spring_Boot]
--- 

## Spring Security - Form 기반 인증

---


### 생각할 거리

Spring-Session과 Spring Security는 특별한 바인딩이 필요 없이 개별 Config만 설정해주면 되는 것 같다.

아무래도 Spring Session이 HttpSession 관련 구현체(?)를 구성하고 Spring Security는 구성된 HttpSession을 사용하는 듯 하다.

즉, Spring Security에서는 딱히 Spring Session에 대한 정보가 필요 없이 추상화에 의존하기 때문에 협력이 가능한 듯 보인다.

다만 인증 및 인가 관련되서 Session 처리는 Spring Security의 구성으로 진행해야 하는 듯 보인다. 아직까지는.

[https://www.baeldung.com/spring-session](https://www.baeldung.com/spring-session)

생각해보니 Spring Session도 Filter Chain 영역에서 프로세스가 진행되고 Spring Security 역시 Filter Chain에 물려서 프로세스가 진행된다.

그리고 이를 가능하게 해주는게 `DelegatingFilterProxy` 인데 `Bean Filter`에 위임을 해준다.

그럼 `springSecurityFilterProxy`와 Spring Session 관련 `Bean Filter`도 여기서 동작을?!

Spring Session 관련해서 정리해놨던 글을 좀 찾아봐야 겠다.

<br>

### UserDetailsService, UserDetails 객체

각 객체들의 역할과 책임이 뭘까.

시큐리티 설정 파일(SecurityConfig)에서 인증 관련 설정(AuthenticationManager)하는 부분은

UserDetailsService다.

이 UserDetailsService가 사용하는 정보가 UserDetails

그리고 이 UserDetails를 기본 구현한 것이 User 

이를 상속하여 구현한 것이 AccountContext

그리고 이 객체의 협력 중 가장 상위 개념인 UserDetailsService가 AutenticationManager에 설정이 된다.

AuthenticationManager는 Security Filter에서 사용이 된다.

이 흐름을 기억하자.

그런데 이 녀석들은 **Form Login 방식에서만 유효하지 않을까?**

그러니까 Form Login 방식에서 사용하는 Filter의 문맥에서만 유효하지 않을까 싶다.

그건 차차 알아가보도록 하자.

유저의 인증에 필요한 세부 ‘정보'는 UserDetailsService고 이는 AuthenticationManager에 담긴다.

이 세부 ‘정보'에는 username(id), password, GrantedAuthority가 있겠다.

이 정보는 UserDetails에 담긴다.(일종의 컨텍스트)

UserDetailsServices는 일종의 퍼사드 역할이라고 보면 될 듯 하다.

<br>

### 키워드

- UserDetailsService <<interface>>
    - CustomUserDetailsService<<implement>>

⇒ 유저의 정보를 로드

프레임워크 전반에 걸쳐서 DAO로써 활용되거나 DaoAuthenticationProvider가 사용한다.

- UserDetails <<interface>>
    - User <<implement>>
        - AccountContext<<implement>>

<img src="/assets/img/springsecurity/img11.png" width="70%" height="auto" >

---

<br>

### AuthenticationProvider 객체 활용 및 구현

위에서 구현 및 활용한 `UserDetailsService`가 반환하는 `UserDetails`에 대해서 검증을 진행해야 함

이러한 검증은 `AuthenticationProvider`중 하나가 사용되는데, 우리는 이를 구현한 `CustomAuthenticationProvider`를 활용할 예정

<br>

### CustomAuthenticationProvider

`AuthenticationManager(ProviderManager)`가 호출할 `CustomAuthenticationProvider`를 구현하여 인증 유저에 대한 검증 로직을 수행

<img src="/assets/img/springsecurity/img12.png" width="70%" height="auto" >

<script src="https://gist.github.com/BongHoLee/97a92ee649c610e7ac4dbf3b1701ecbc.js"></script>

<br>

### Logout 및 보안처리

- SecurityContextLogoutHandler를 사용할 수 있다.

<script src="https://gist.github.com/BongHoLee/ae253db98eb666efb474243bcb886770.js"></script>

<br>

### 이쯤에서 Spring Session과 함께 해보자.

[https://www.baeldung.com/spring-session-jdbc](https://www.baeldung.com/spring-session-jdbc)

[https://www.javadevjournal.com/spring/spring-session-with-jdbc/](https://www.javadevjournal.com/spring/spring-session-with-jdbc/)

- spring-session-jdbc

디펜던시를 확인해보면 자동으로 session 관련 sql을 실행할 수 있게끔 sql 파일을 갖고 있음.

Configuration에서 `@EnableJdbcHttpSession`을 해주면 안된다. → Spring Autoconfiguration이 작동하지 않음(직접 작성하는것으로 인식)

따라서 `@SpringBootApplication`과 함께 위 어노테이션을 붙여주자.

뭔가 postgresql은 sqlsession table을 직접 생성해줘야 하나보다..

그리고  Account 객체를 Serializable 구현을 해줘야한다. → 세션에 이 객체가 직렬화 되어 저장되나 보다.

---

<br>

### 인증 추가 정보 전달 및 설정

### WebAuthenticationDetails, AuthenticationDetailsSource

<img src="/assets/img/springsecurity/img13.png" width="70%" height="auto" >

- AuthenticationFilter(UsernamePasswordAuthenticationFilter)
    - Security Filter 중 인증에 대한 책임을 담당하는 필터
- WebAuthenticationDetails
    - 인증 과정 중 전달된 데이터를 저장
    - Authentication의 details 속성에 저장
- AuthenticationDetailsSource
    - WebAuthenticationDetails 객체를 생성

클라이언트가 인증 정보(username, password) 외의 데이터를 전달하는 경우가 있다.

그리고 이 데이터들은 인증 과정, 인증 이후 등에서 필요할 때 사용이 되어야 할 수 있다.

이 때 이 정보들을 `Authentication` 객체의 `details` 속성에 담아서 저장을 하여 사용하는데, 이 `details` 객체의 타입은 `object`로써 어떤 타입도 저장이 가능하다.

그리고 그 `details` 중 하나가 바로 `WebAuthenticationDetails`이다. 

`WebAuthenticationDetails` 객체를 생성하는 객체가 `AuthenticationDetailsSource`

즉, `WebAuthenticationDetails` 객체는 클라이언트가 추가적으로 전달하는 데이터를 저장한다.

스프링 시큐리티는 기본적으로 `remoteAddress, SessionId`는 제공한다.

간단하게 AuthenticationFilter의 구현체 중 하나인 `UsernamePasswordAuthenticationFilter`의 코드를 살펴보면

<script src="https://gist.github.com/BongHoLee/1affab1538cd6d10622c6ba9d9d6f820.js"></script>

추가 설명이 필요 없이 위 코드의 주석을 확인해보면 

- 클라이언트의 요청
- AuthenticationFilter(UsernamePasswordAuthenticationFilter)가 호출됨
    - 클라이언트가 전달한 request로부터 username, password를 얻어옴
    - 인증을 위한(아직 인증은 안된) Authentication(UsernamePasswordAuthenticationToken) 생성
    - 생성한 Authentication에 details 속성 설정(setDetails)
- AuthenticationDetailsSource가 WebAuthenticationDetails를 세팅

이 `details`는 `Authentication` 객체가 활용될 수 있는 곳이라면 어디든 전역적으로 사용 할 수 있다.

<br>

### 인증 성공 핸들러

<img src="/assets/img/springsecurity/img14.png" width="70%" height="auto" >

인증 성공 핸들러에서 세션에 필요한 요소들을 추가하는 등 처리할 수 있을듯.

<br>

### CustomAuthenticationSuccessHandler

인증 성공 이후 `AuthenticationSuccessHanlder`를 호출하여 후속 작업을 할 수 있다.

`AuthenticationSuccessHadnler`는 인터페이스라서 아래 두 개 작업이 가능하다.

- 직접 구현체를 만들어서 등록한다.
- 스프링 시큐리티가 기본적으로 제공하는 클래스를 상속하여 추가 구현한다.

강좌에서는 상속을 이용해서 진행

<br>

<script src="https://gist.github.com/BongHoLee/6a6873cda225a8284e68d583e2f734b1.js"></script>

<br>

### 인증 실패 핸들러 구현

<img src="/assets/img/springsecurity/img15.png" width="70%" height="auto" >

인증 실패 시 AuthenticationFilter는 AuthenticationFailureHandler를 호출한다.

그리고 `AuthenticationFailureHandler`는 인터페이스로, 사용하는 방법에는 두 가지가 있다.

- 직접 구현체 구현 및 등록
- 스프링 시큐리티가 기본적으로 제공하는 구현체 상속

이번 강좌에서는 기본적으로 제공하는 구현체를 상속하는 방법으로 진행한다.

<br>

### CustomAuthenticationFailureHandler

<script src="https://gist.github.com/BongHoLee/ecba144a71d4f89c61eda0cc96817cbc.js"></script>

인증 프로세스 중 발생한 예외에 대해서 각각 에러 메시지를 설정했다.

그리고 인증 실패에 따른 이동 경로는 `/login?error=true&exception = errorMessage` 처럼 처리를 하고 이후 작업에 대해서 부모 클래스에 위임을 해준다.

이렇게 이동 경로로 redirect하게 되면 login Controller가 위 요청을 받아 처리한다.

<br>

### 인증 거부(인가 안됨) 처리

인증은 성공했지만 성공 이후 클라이언트가 접근하려는 자원에 대한 권한이 없을 경우 `인가 예외`(AcessDeniedException)가 발생하게 된다.

`인가 예외`는 **인증 필터가 처리하는게 아니라 `ExceptionTranslationFilter`가 처리**한다.

즉, 유저에 대한 인증은 처리되었지만 인증과 동시에 접근하려는 자원에 대한 `인가 예외`(AccessDeniedException)가 발생한 경우 
`ExceptionTranslationFilter`에서 `AccessDeniedHandler`를 호출하여 처리한다.

우리는 여기서 `AccessDeniedHandler`를 구현해보자.

<br>

### CustomAccessDeniedHandler

<script src="https://gist.github.com/BongHoLee/70452748172a996a215e7ab0195f3667.js"></script>