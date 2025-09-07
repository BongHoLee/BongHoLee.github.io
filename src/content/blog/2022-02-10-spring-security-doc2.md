---
title: "Spring Security 공식 문서 톺아보기(2)"
description: "Spring Security 공식 문서 톺아보기"
pubDate: 2022-02-10
author: "Bong5"
tags: ["Spring", "Spring Boot", "Spring Security"]
---
## Authentication(인증) 관련 Architecture

- [스프링 공식 문서](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Spring Security - 공식 문서 톺아보기 1](https://bongholee.github.io/keywords/web/spring_framework/web/spring_boot/2022/02/10/Spring-Security-Doc.html)
- [Spring Security - 공식 문서 톺아보기 2](https://bongholee.github.io/keywords/web/spring_framework/web/spring_boot/2022/02/10/Spring-Security-Doc2.html)
- [Spring Security - Form 기반 인증](https://bongholee.github.io/keywords/web/spring_framework/web/spring_boot/2022/03/20/Spring-Security-Form.html)

### Overview

- **SecurityContextHolder** - 스프링 시큐리티가 `인증된 주체`를 저장하는 객체
- **SecurityContext** - 현재 인증된 유저에 대한 `Authentication` 객체를 저장. `SecurityContextHolder`로부터 얻을 수 있다.
- **Authentication** - 유저가 인증을 위해 제공한 `자격`이나 `SecurityContext`에 저장된 **현재 인증 사용자**에 대한 객체로써 `AuthenticationManager`에 input이 될 수 있음.
- **GrantedAuthority** - `Authentication` 객체의 주체(principal)에게 부여된 `권한` 객체(role, scope 등)
- **AuthenticationManager** - `Spring Security Filter`들이 `인증`을 수행하는 방법을 정의한 `API`
- **ProviderManager** - 가장 범용적이고 일반적인 `AuthenticationManager`의 구현체
- **AuthenticationProvider** - 구체적인 인증을 수행. `ProviderManager`에 의해 호출됨
- **AuthenticationEntryPoint** - 클라이언트의 `요청 자격 증명`을 위해 사용됨(로그인 페이지로 redirect, WWW-Authenticate 응답 헤더 등)
- **AbstractAuthenticationProcessingFilter** - 인증을 위해 사용되는 `기본 Filter`

<br>

### SecurityContextHolder(스프링 시큐리티 인증 모델의 핵심)

<img src="/assets/img/springsecurity/img7.png" width="70%" height="auto" >

`SecurityContextHolder`는 **누가 인증되었는지에 대한 디테일** 정보를 저장한다.

스프링 시큐리티는 `SecurityContextHolder`의 정보가 어떻게 채워지는지는 관심이 없다.
단지 정보를 갖고있다면 **현재 인증된 유저**에 대한 정보로 간주하고 사용할 뿐이다.

즉, 사용자가 `인증`되었음을 나타내는 가장 간단한 방법은 아래와 같이 `SecurityContextHolder`를 직접 세팅하는 것이다.

<script src="https://gist.github.com/BongHoLee/bf7fac04b6adfe004158a2a93e7987f2.js"></script>

> `SecurityContextHolder.createEmptyContext()` 코드에 주의해야 한다.
새로운 `SecurityContext` 인스턴스를 생성하는것이 중요한데, 만일
`SecurityContextHolder.getContext().setAuthentication(authentication)` 의 경우 멀티 스레드 환경에서 예기치 않은 결과가 나올 수 있다.
>

만일 `인증된 주체`에 대한 정보가 필요하다면 `SecurityContextHolder`를 통해서 얻을 수 있게된다.

<script src="https://gist.github.com/BongHoLee/aa29f2fa7a1ec5e66aadf63368c2836c.js"></script>

**(중요)** 기본적으로 `SecurityContextHolder`는 **디테일 정보를 저장하기 위해 `ThreadLocal`을 사용**하는데

이는 `SecuritnContext`가 메서드 인수로 **명시적으로 전달되지 않더라도 `SecurityContext`는 항상 `동일한 스레드의 메서드에서 사용`할 수 있다. (ThreadLocal!!)**

이처럼 `ThreadLocal`을 이용한 방법은 보안 주체(security principal)의 요청이 처리된 후 `thread clear`만 신경써주면 아주 `안전`하다.

스프링 시큐리티의 `FilterChainProxy`는 `SecurityContext`가 **항상 Cleared 되는 것을 보장**한다.

<br>

### SecurityContext

`SecurityContextHolder`로부터 얻을 수 있는 `SecurityContext`는 **Authentication 객체**를 갖는다.

<br>

### Authentication

`Authentication` 객체는 두 가지의 주요한 목적을 갖는다.

- `AuthenticationManager`의 input으로 전달되는데, 유저가 인증을 위해 제공했던 자격 증명(credential)을 제공하기 위함
- **현재 인증된 유저**를 나타내기 위함. 현재의 `Authentication` 객체는 `SecurityContext`로부터 얻을 수 있다.

`Authentication`은 세 가지 정보를 갖는다.

- **principal** - `user`의 식별자. 만약 `username/password`로 인증을 했다면 `UserDetails`의 인스턴스
- **credentials** - 주로 `password`. 주로 유저가 인증을 거친 이후 삭제됨
- **authorities** - `GrantedAuthority` 객체들로써, 유저에게 부여된 상위 개념들(role, scope 등)

<br>

### GrantedAuthority

사용자에게 부여된 **상위 수준의 권한**으로써 `role`, `scope` 등이 그것들

`GrantedAuthority` 객체들은 `Authentication.getAuthorities()` 메서드를 이용해 얻을 수 있다. 이 메서드는 `GrantedAuthority` 객체들의 Collection을 제공한다.

각 `GrantedAuthority`는 `principal`에 부여된 권한이다.

이러한 권한들은 보통 `roles`로 표현되는데 `ROLE_ADMINISTRATOR`, `ROLE_HR_SUPERVISOR` 등이 예시다.

이러한 `role`들은 이후 **웹 권한 부여, 메서드 권한 부여, 도메인 객체 권한 부여**를 위해 사용된다.

일반적으로 `GrantedAuthority` 객체들은 **어플리케이션 전체에 대한 권한**이다. 다시말해 **특정 도메인 객체를 위한 권한**으로 부여되지 않는다.

예를들어, `54번 Employee 인스턴스`의 권한을 나타내기 위해서 `GrantedAuthority`를 사용할 수 없다.
만일 1천, 1만개 이상의 `Employee`가 있다고 하면 위와 같은 상황에서 **메모리 초과**에러가 날 것이다.

그러니 **개별 인스턴스에 대한 권한**이 아니라 **프로젝트의 도메인 객체**를 위한 권한을 사용하는 것이 좋다.

<br>

### AuthenticationManager

`AuthenticationManager`는 스프링 시큐리티의 `Filter`들이 `인증`을 수행하기 위한 `API`를 정의한다.

`AuthenticationManager`를 호출한 `Spring Security Filter`는 반환된 `Authentication`을 `SecurityContextHolder`에 설정한다.

**만일 `Spring Security Filter`와 통합하지 않는경우 `SecurityContextHolder`를 직접 설정할 수 있으며 `AuthenticationManager`를 사용할 필요가 없다.**

AuthenticationManager의 구현체 중 가장 많이 사용되는 것이 `ProviderManager`다.

<br>

### ProviderManager

`ProviderManager`는 가장 일반적으로 사용되는 `AuthenticationManager`의 구현체다.

이 객체의 주 역할은 `AuthenticationProvider`들에게 `위임`하는 것이다.

각 `AuthenticationProvider`는 **인증 성공, 실패**에 대한 결정을 할 수 있다.

만일 인증에대한 성공, 실패 여부를 결정할 수 없다면 **다른(다운스트림) AuthenticationProvider**가 결정하도록 전달할 수 있다.

그럼에도 **설정된 모든 `AuthenticationProvider`가 인증 여부를 결정할 수 없으면 `AuthenticationException`을 던진다.**

<img src="/assets/img/springsecurity/img8.png" width="70%" height="auto" >

각 `AuthenticationProvider`는 특정 타입의 인증을 수행한다.

예를들어 어떤 `AuthenticationProvider`는 username/password 검증을 수행할 수 있고 다른 하나는 `SAML assertion`에 대한 인증을 수행할 수 있다.

이는 하나의 `AuthenticationManager` 빈만을 노출하지만, 각각의 `AuthenticationProvider`가 **특정(개별적인) 타입의 인증**을 수행하는 것을 가능케한다. (퍼사드 패턴처럼 보이는군!)

`ProviderManager`는 또한 **선택적으로 `Parent AuthenticationManager`를 가질 수 있다.**

만일 어떤 `ProviderManager`가 가진 `AuthenticationProvider`들이 모두 인증을 수행하지 못한다면 **이 때 `Parent`가 지원**해준다.

일반적으로 어떤 타입의 `AuthenticationManager`든 parent가 될 수 있지만 일반적으로 `ProviderManager` 타입인 경우가 대부분이다.

<img src="/assets/img/springsecurity/img9.png" width="70%" height="auto" >

또한 **다수의  `ProviderManager` 인스턴스들이 하나의 `Parent Authentication`을 공유**할 수 있다.

이 경우는 `SecurityFilterChain`이 다수지만 **동일한 인증**이 필요한 경우 자주 사용되는 시나리오다.

기본적으로 `ProviderManager`는 요청에 따른 인증이 성공되어 반환된 `Authentication`에 존재하는 민감한 `credential` 정보를 지우는데, 이는 `HttpSession scope` 라이프사이클보다 오래 민감 정보가 유지되는 것을 방지한다.

<br>

### AuthenticationProvider

다수의 `AuthenticationProvider`들은 `ProviderManager` 내에 주입될 수 있다. 각 `AuthenticationProvider`는 **특정 타입의 인증을 수행**한다.

예를들어 `DaoAuthenticationProvider`는 username/password 기반의 인증을 지원하고 `JwtAuthenticationProvider`는 JWT 토큰 기반의 인증을 지원한다.

<br>

### AuthenticationEntryPoint를 이용하는 요청 자격 증명

`AuthenticationEntiryPoint`는 클라이언트의 자격 증명 요청에 대한 `HTTP Response`를 전송하기 위해 사용된다.

클라이언트가 서버의 어떤 리소스를 요청할 때 username/password와 같은 `자격 증명`을 포함할 때가 있다.
이러한 경우 스프링 시큐리티는 클라이언트에게 `자격 증명`을 요청하기 위한 `HTTP Response`를 전달하지 않아도 된다.

그러나 다른 경우 클라이언트는 접근 권한이 필요한 리소스에 대해서 인증되지 않은 요청을 보낼 때가 있다.
이러한 경우 `AuthenticationEntiryPoint`의 구현체가 클라이언트에게 (HTTP Response로)`자격 증명 요청`을 하기 위해 사용된다.

`AuthenticationEntryPoint`의 구현체는 주로 **로그인 페이지 redirect를 수행하고 `WWW-Authenticate` 헤더 등으로 응답한다.**

<br>

### AbstractAuthenticationProcessingFilter

이름도 긴 `AbstractAuthenticationProcessingFilter`는 **유저의 자격 증명에 대한 인증을 위한 기본 `Filter`로써 사용**된다.

> 자격 증명(credential)이 인증되기 전까지는 스프링 시큐리티는 `AuthenticationEntryPoint`를 이용하여 클라이언트에게 `자격 증명`을 요청한다.
>

그 다음, `AbstractAuthenticationProcessingFilter`는 전달된 인증 요청에 대해서 인증할 수 있다.

 <img src="/assets/img/springsecurity/img10.png" width="70%" height="auto" >

1. 유저가 `자격증명(credentials)`를 제출했을 때, `AbstractAuthenticationProcessingFilter`는 이후 인증 대상이 되는 `Authentication` 객체를 `HttpServletRequest`로부터 생성한다.
   생성된 `Authentication` 객체의 타입은 `AbstractAuthenticationProcessingFilter`의 구체 타입에 의해 결정된다.

   > 예를들어 `Authentication`의 구체 타입인 `UsernamePasswordAuthenticationToken`은 `UsernamePasswordAuthenticationFilter`가 `HttpServletRequest`에 제출된 username, password를 이용하여 생성한다.
>
2. 다음으로 `Authentication`은 인증 프로세스 처리에 사용되기 위해 `AuthenticationManager`에 전달된다.
3. 만일 인증이 실패한 경우
    - `SecurityContextHolder`가 clear된다.
    - `RememberMeServices.loginFail`이 호출된다.
    - `AuthenticationFailureHandler`가 호출된다.
4. 만일 인증이 성공한 경우
    - `SessionAthenticationStrategy`가 새 로그인에 대한 알림을 받는다.
    - 인증된 `Authentication`이 `SecurityContextHolder`에 설정이 되고, 이후 `SecurityContextPersistenceFilter`는 `SecurityContext`를 `HttpSession`에 저장한다.
    - `ApplicationEventPublisher`가 `InteractiveAuthenticationSuccessEvent`를 발행한다.
    - `AuthenticationSuccessHandler`가 호출된다.