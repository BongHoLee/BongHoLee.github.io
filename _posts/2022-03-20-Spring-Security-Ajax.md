---
layout: post
title: Spring Security - Ajax 기반 인증
author: Bong5
categories: [Keywords, WEB/Spring_Framework, WEB/Spring_Boot]
--- 

## Spring Security - Ajax 기반 인증

---

## 생각할 거리

Ajax가 비동기 호출이면서 주로 `REST API`호출인 점을 감안하면 CSR(vue) 와 유사하게 `Content-type: application-json` 형태일 것 같다.

그리고 이걸 통해서 현재 `safe-web`에 적용할 수 있는 방안을 찾을 수 있을 것 같다.

일단은 기존의 `Form` 인증은 스프링 시큐리티가 기본적으로 제공해주는 Security Filter(AuthenticationFilter)인 `UsernamePasswordAuthenticationFilter`를 사용했었는데 form, get 방식의 request 특성을 고려하여 `request.getParameter`를 이용한 데이터 추출 방식이었다.

그런데 위 방식은 `application-json` 타입에서는 사용이 불가능하고, `RequestBody`를 직접 파싱해줘야 하기 때문에 **별도의 AuthenticationFilter를 구현**하는 방식을 채택하지 않을까 싶다.

<br>

### 흐름 및 개요

<img src="/assets/img/springsecurity/img16.png" width="70%" height="auto" >

스프링 시큐리티 기반에서는 인증이 **필터로 시작해서 필터로 끝**난다.

<br>

### 인증 필터 구현

### AjaxAuthenticationFilter

- `AbstractAuthenticationProcessingFilter` 상속
- 필터 작동 조건
  - `AntPathRequestMatcher(”/api/login”)`로 요청 정보와 매칭하고 요청 방식이 Ajax이면 필터 작동
  - Form 방식의 필터와 Ajax 방식과 함께 구성이 가능
- `AjaxAuthenticationToken`을 생성하고 `AuthenticationManager`에게 전달하여 인증 처리
- Filter 추가
  - `http.addFilterBefore(AjaxAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)`
  - Form 기반의 필터 작동 이전에 먼저 작동하게끔 필터의 순서를 조정하여 추가할 수 있다.

**AjaxLoginProcessingFilter(인증 처리 위임 필터)**

<script src="https://gist.github.com/BongHoLee/545c95b8a56a23c114bf3a98af5f4fd4.js"></script>

`ajax` 인증 요청을 담당할 `AuthenticationFilter`의 구현체 `AjaxLoginProcessingFilter`의 코드.

요청 `url`과 `Content-Type`을 확인하여 `request body`에 담겨서 전달된 json 형태의 메시지를 객체로 파싱한다.

그 외에는 다른 `AuthenticationFilter` 처럼

- 클라이언트가 전달한 ID/PASSWORD 기반으로 Authentication(Token) 생성
- AuthenticationManager에게 Authentication을 넘기며 인증 처리 위임

**AjaxAuthenticationProvider(인증 처리)**

<script src="https://gist.github.com/BongHoLee/1ba3daf49161c973c0dac57ffa3b69c4.js"></script>

`AuthenticationManager(ProviderManager)`로 부터 전달받은 `Authentication`을 이용하여 실제 검증 및 인증 처리를 진행한다.

물론 사전에 `AuthenticationManager`는 `supports` 메서드를 이용하여 해당 `AuthenticationProvider`가 `Authentication`을 지원하는지 여부를 확인한다.

DispatcherServlet이 RequestHandlerMapper, RequestHandlerAdapter와 협력하는 구조와 유사

- `UserDetailsService`로부터 `UserDetails`를 반환받는다.
  - `UserDetailsService`가 비즈니스 유즈케이스 이하 계층으로부터 유저의 인증 및 인가와 관련된 정보인 `UserDetails`를 만들어 반환하는 일종의 `어댑터` 역할을 한다고 생각하면 될 듯 하다.

- 클라이언트가 username, password와 함께 전달한 디테일 정보를 `authentication`으로부터 반환받아 검증한다.
  - 이 정보에는 기본적으로 `remoteAddr`, `SessionID`가 저장되어 있다.
  - 필요 시 디테일 정보를 추가가 가능하다.
  - 이 디테일 정보는 `Authentication`의 `details` 필드에 저장이 된다.

<br>

### 인증 핸들러

인증 성공 시, 인증 실패 시 이후 작업을 처리하는 핸들러가 필요하다.

**AjaxAuthenticationSuccessHandler**

<script src="https://gist.github.com/BongHoLee/aedd76581b568bc632fb6f6302101ebe.js"></script>

`AuthenticationProvider`를 거쳐 인증이 성공하게 되면 `AuthenticationFilter`는 `AuthenticationSuccessHandler`를 호출하게 된다.

기존의 `view-rendering` 방식이 아니라 ajax를 이용한 `Http body`에 데이터를 담아 Request를 받았기 때문에 마찬가지로 Http Response도 `application-json` 컨텐츠 타입으로 `Response Body` 에 응답 데이터를 담아 전달한다.

**AjaxAuthenticationFailureHandler**

<script src="https://gist.github.com/BongHoLee/2771437507653f3a028d9b5c4ffd87a8.js"></script>

인증 실패 핸들러 역시 마찬가지다.

<br>

### 인증 및 인가 예외 처리

로그인 단계에서 인증 및 인가 예외가 발생하는 경우는 두 가지가 있다.

- 인증 단계를 거치지 않고(익명의 사용자) 서버의 리소스에 접근하려 하는 경우
  - 인가 예외 발생
  - 인증을 받고 진행하도록 인증 페이지(로그인 페이지)로 이동
- 인증은 완료가 되었지만 접근하려는 리소스에 대한 권한이 없는 경우
  - 인가 예외 발생
  - 접근 불가 메시지 및 페이지

위의 처리는 `인가`와 관련된 처리로써 스프링 시큐리티는 이를 `FilterSecurityInterceptor`, `ExceptionTranslationFilter`를 이용하여 `인가 확인` 및 `인가 예외` 발생을 담당한다.

그리고 이 때 `인가 예외` 발생 시 처리할 클래스들을 우리가 구현하면 된다.

**FilterSecurityInterceptor**

FilterSecurityInterceptor라는 클래스는 `인가 확인`을 하고 만일 인가되지 않은 경우 `ExceptionTranslationFilter`를 호출하여 인가 예외 처리에 대한 위임을 한다.

**ExceptionTranslationFilter**

인가 예외에 대한 위임을 받아서 위 두 가지 상황에 따른 `인가 예외 처리`를 진행한다.

- 인증 단계를 거치지 않고(익명의 사용자) 서버의 리소스에 접근하려는 경우
  - `AuthenticationEntryPoint`를 호출하여 인가 예외 처리 진행
  - 우리가 구현
- 인증은 완료가 되었지만 접근하려는 리소스에 대한 권한이 없는 경우
  - `AccessDeniedHandler`를 호출하여 인가 예외 처리 진행
  - 우리가 구현

따라서 우리는 **인가 예외를 처리할 두 가지(`AuthenticationEntryPoint`, `AccessDeniedHandler`)** 클래스를 구현하여 등록하면 된다.

**AjaxLoginAuthenticationEntryPoint**

<script src="https://gist.github.com/BongHoLee/b407a5485d1bf766816a8832ddd6ca97.js"></script>

**AjaxAccessDeniedHandler**

<script src="https://gist.github.com/BongHoLee/4da7ad38fa36ee752b0926f82f88e579.js"></script>

<br>

### CustomDSL로 config 실행하기(스킵)

- **AbstractHttpConfigurer**
  - 스프링 시큐리티 초기화 설정 클래스
  - 필터, 핸들러, 메서드, 속성 등을 한 곳에 정의하여 처리할 수 있는 편리함 제공
  - `public void init(H http) throws Exception` - 초기화
  - `public void configure(H http)` - 설정
- **HttpSecurity**의 `apply(C Configurer)` 메서드 활용