---
layout: post
title: Spring Security 공식 문서 톺아보기(1)
author: Bong5
categories: [Keywords, WEB/Spring_Framework, WEB/Spring_Boot]
--- 

## Spring Security 공식 문서 톺아보기(1)

---

### 스프링 부트 Auto Configuration

스프링 부트 `Auto Configuration`이 아래와 같은 작업을 진행

- 스프링 시큐리티 기본 설정
    - `springSecurityFilterChain`이라는 서블릿 `filter`를 **bean으로 생성**
    - 이 `springSecurityFilterChain`은 어플리케이션의 모든 security와 관련된 책임을 수행
- username, 랜덤하게 생성된 password 갖는 `UserDtailsService`라는 이름의 bean을 생성

### 아키텍처

### **Filter Chain 구성 - 서블릿 컨테이너**

<img src="/assets/img/springsecurity/img1.png" width="70%" height="auto" >

스프링 시큐리티의 **서블릿 지원은 `Servlet Filter`를 기반**으로 함

클라이언트가 요청을 어플리케이션에 전달하면 **컨테이너는 `FilterChain`을 생성**하는데, 이 체인은 `HttpServeltRequest`를 처리하기 위한 `Filter`와 `Servlet`들을 담고 있음

<script src="https://gist.github.com/BongHoLee/0947e5480ad15de562befb7cbc417413.js"></script>

하나의 `Filter`는 **다음 호출되는 `Filter` 또는 `Servlet`에게만 영향**을 미치기 때문에 **Filter의 호출 순서가 매우 중요**

<br>

### **DelegatingFilterProxy(중요. `스프링`과 관련(스프링 시큐리티 아님))**

<img src="/assets/img/springsecurity/img2.png" width="70%" height="auto" >

스프링은 `DelegatingFilterProxy`라는 `Filter`를 제공하는데 **(중요) 서블릿 컨테이너의 lifecycle과 스프링의 `ApplicationContext`의 브릿지** 역할을 한다.

> `서블릿 컨테이너`는 자체 표준 메커니즘에 따라 `Filter`들을 등록할 수 있는데 `Spring Bean`에 대한 정보가 없기 때문에 `Filter`로 등록하기 위한 `Spring Bean`을 알 수 없다.
>

하지만 `DelegatingFilterProxy`는 **서블릿 컨테이너의 표준 메커니즘**에 따라 `Filter`로 등록될 수 있다.

그런데 **Servlet Container와 Spring ApplicationContext의 `Bridge` 역할**을 한다는 점에 주목하자.
서블릿 컨테이너의 `Filter`에 등록되었지만 `Spring Bean`이고 **주 역할은 `Filter`를 구현하는 `다른 Spring Bean`에게 작업을 위임함으로써 `Bridge` 역할**을 하는 것

`Bean Filter`인 `DelegatingFilterProxy`는 **ApplicationContext에서 관리되는 다른 `Bean Filter`들을 `look up`하고 `실행`(위임)한다.**

**대략적인 `DelegatingFilterProxy`의 역할을 나타내는 ‘슈도 코드’**

<script src="https://gist.github.com/BongHoLee/98bc5891d14df212b8d5b6aca2bcdb66.js"></script>

<br>

### **FilterChainProxy (중요, 스프링 시큐리티와 관련)**

<img src="/assets/img/springsecurity/img3.png" width="70%" height="auto" >

스프링 시큐리티의 `서블릿 지원`은 `FilterChainProxy`에 포함된다.

> **(중요)** `FilterChainProxy`는 스프링 시큐리티가 제공하는 특별한 `Bean Filter`인데,
`SecurityFilterChain`을 통해 **다양한 Filter 인스턴스들에게 위임**을 한다.
>

`FilterChainProxy`는 `Bean`이기 때문에 **DelegateFilterProxy에 래핑**된다.

<br>

### SecurityFilterChain (가장 중요, 스프링 시큐리티의 시작이자 근간)

<img src="/assets/img/springsecurity/img4.png" width="70%" height="auto" >

`SecurityFilterChain`은 위에서 설명한 `FilterChainProxy`에 의해 사용된다.

즉, **현재 클라이언트의 요청에 대해서 어떤 `Spring Security Filter`가 호출될지**가 `FilterChainProxy`에 의해 결정된다.

`SecurityFilterChain` 내의 `Security Filter`들은 `Spring Bean`이지만 **DelegatingFilterProxy가 아니라 `FilterChainProxy`에 등록**된다.

`FilterChainProxy`가 등록하는 것이 `Servlet Container`나 `DelegateingFilterProxy`가 등록하는 것 보다 더 좋은 점이 있다.

- 모든 `Spring Security의 서블릿 지원`의 시작점을 제공한다.
    - 따라서 만일 `스프링 시큐리티 서블릿 지원`과 관련한 트러블 슈팅을 할 때 `FilterChainProxy`에서 디버깅을 시작하면 된다.
- 언제 `SecurityFilterChain`이 실행될지와 관련해서 **더 많은 유연성**을 제공한다.
    - Servlet Container 내에서 Filter는 요청 URL과 관련해서만 호출된다. 하지만 `FilterChainProxy`는 `HttpServletRequest`와 관련된 어떤 정보로든 호출 여부를 결정할 수 있다.

실제로 `FilterChainProxy`는 **어떤 `SecurityFIlterChain`이 사용되어야 하는지**를 결정하기 위해 사용된다. 이는 **어플리케이션의 다른 설정들과 독립된 설정을 제공**한다.

<br>

### Multiple SecurityFilterChain

만일 `SecurityFilterChain`이 여러 개 있다면, `FilterChainProxy`는 **어떤 SecurityFilterChain을 사용할지 결정**한다.

<img src="/assets/img/springsecurity/img5.png" width="70%" height="auto" >

조건에 맞는 chain들이 여러개 있다면 첫 번째로 만족한 chain을 사용한다.

<br>

### Security Filters

`Sercurity Filter`들은 `SecurityFilterChain API`를 사용하여 `FilterChainProxy`에 주입된다.

`Filter의 순서`가 중요하다.

굳이 다 외울 필요는 없지만 스프링 시큐리티의 `Filter`들은 아래의 순서를 갖는다.

- ChannelProcessingFilter
- WebAsyncManagerIntegrationFilter
- SecurityContextPersistenceFilter
- HeaderWriterFilter
- CorsFilter
- CsrfFilter
- LogoutFilter
- OAuth2AuthorizationRequestRedirectFilter
- Saml2WebSsoAuthenticationRequestFilter
- X509AuthenticationFilter
- AbstractPreAuthenticatedProcessingFilter
- CasAuthenticationFilter
- OAuth2LoginAuthenticationFilter
- Saml2WebSsoAuthenticationFilter
- `[UsernamePasswordAuthenticationFilter](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html#servlet-authentication-usernamepasswordauthenticationfilter)`
- OpenIDAuthenticationFilter
- DefaultLoginPageGeneratingFilter
- DefaultLogoutPageGeneratingFilter
- ConcurrentSessionFilter
- `[DigestAuthenticationFilter](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/digest.html#servlet-authentication-digest)`
- BearerTokenAuthenticationFilter
- `[BasicAuthenticationFilter](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/basic.html#servlet-authentication-basic)`
- RequestCacheAwareFilter
- SecurityContextHolderAwareRequestFilter
- JaasApiIntegrationFilter
- RememberMeAuthenticationFilter
- AnonymousAuthenticationFilter
- OAuth2AuthorizationCodeGrantFilter
- SessionManagementFilter
- `[ExceptionTranslationFilter](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-exceptiontranslationfilter)`
- `[FilterSecurityInterceptor](https://docs.spring.io/spring-security}/reference/servlet/authorization/authorize-requests.html#servlet-authorization-filtersecurityinterceptor)`
- SwitchUserFilter

<br>

### Handling Security Exceptions

`ExceptionTranslationFilter`는 `AccessDeniedException`과 `AuthenticationException`을 `HttpResponse`의 결과로 변환해주는 역할을 수행한다.

물론 `ExceptionTranslationFilter`는 `Security Filter`들 중 하나로 `FilterChainProxy`에 내부에 삽입되어 사용된다.

<img src="/assets/img/springsecurity/img6.png" width="70%" height="auto" >

1. `ExceptionTransaltionFilter`는 어플리케이션 프로세스 수행을 위해 `FilterChain.doFilter(request, response)` 호출
2. 만일 **유저가 아직 인증되지 않았거나 `AuthenticationException` 발생 시, 인증 프로세스 시작**
    1. `SecurityContextHolder`가 clear됨
    2. `HttpServletRequest`가 `RequestCache`에 저장
        1. 만일 유저가 정상적으로 인증되었다면 `RequestCache`에서 원래 `HttpServletRequest`를 꺼내서 프로세스 진행
    3. `AuthenticationEntryPoint`가 **클라이언트의 요청 자격 증명**을 위해 사용됨 (로그인 페이지로 redirect를 하거나 등
3. 만일 `AccessDeniedException` 발생 시 **접근 거부**로 간주하여 `AccessDeniedHandler`가 호출됨

**ExceptionTranslationFilter의 슈도 코드**

<script src="https://gist.github.com/BongHoLee/9770e9102bf4894404f4ffaa6ad278b1.js"></script>