---
layout: post
title: SpringMVC - 핸들러 어댑터, 핸들러 매핑
author: Bong5
categories: [Keywords, WEB/Spring_Framework, WEB/Spring_Boot]
---

## title: SpringMVC - 핸들러 어댑터, 핸들러 매핑

---

### 핸들러 매핑, 핸들러 어댑터

**DispatcherServlet**이 클라이언트로부터 요청을 받아서

- **요청을 처리할 적절한 핸들러를 찾는 `HandlerMapping`**
- 찾은 핸들러를 실행해서 추상화된 결과(`ModelAndView`)를 반환하는 `HandlerAdapter`

<br>

### 핸들러 매핑과 핸들러 어댑터는 1:1 관계가 아니다.

`핸들러 매핑`은 말 그대로 **클라이언트의 요청을 처리하기에 적절한 `핸들러`**를 찾는데, 찾을 때 `@RequestMapping` 또는 `빈 이름`과 매칭되거나 다른 여러가지 매핑 요소들을 확인한다.

`핸들러 어댑터`는 **핸들러 처리를 지원**하는지 여부를 확인하는데, **핸들러의 타입**으로 찾는 등의 프로세스를 진행한다.

**따라서 동일한 핸들러 매핑에 다른 핸들러 어댑터**를 사용할 수도, **다른 핸들러 매핑에 동일한 핸들러 어댑터**를 사용할 수도 있다.

**핸들러 매핑과 핸들러 어댑터는 `독립적`이다.**

이 때문에 **하나의 추상화**로 두지 않고 독립적인 추상화로 두는 것 같다.

<br>

### 왜 핸들러 매핑과 핸들러 어댑터가 필요한가?

만일 `핸들러 매핑`과 `핸들러 처리`를 `DispatcherServlet`에서 수행하게 된다면 **응집도가 낮아지고 결합도가 높아지게**된다.

조금 자세히 말하자면 `DispatcherServlet`이 `핸들러가 추가`되거나 `핸들러 매핑이 추가`될 때에도 함께 영향을 받는다.

따라서 **핸들러의 타입**과 **핸들러 매핑의 타입**, **핸들러 어댑터**의 타입 등을 `추상화`하고 **단순히 해당 객체들이 책임만을 수행하도록 메시지를 전송함으로써**

- `핸들러 매핑으로부터 핸들러 찾기`
- `핸들러 어댑터에게 핸들러 처리 요청`

과 같이 **각 객체들의 구체적인 타입은 알 필요 없이 메시지만 전송**함으로써 `동일한 추상화 수준(단계)`를 유지할 수 있다.

이에 따라 **핸들러 매핑, 핸들러, 핸들러 어댑터가 변경되거나 추가되더라도 `DispatcherServlet`은 영향을 전혀 받지 않는다.**

<br>

### HandlerMapping의 초기화 과정(RequestMappingHandlerMapping)

`DispatcherServlet`에게 적절한 `handler`를 반환시켜 주기 위해서 `HandlerMapping`은 **초기화 단계에서** **처리 가능한 `handler`들을 미리 등록(`registry`)**해놓는다.

이번에는 `RequestMappingHandlerMapping`의 코드를 기반으로 **초기화 단계에서 `handler`를 등록**시키는 과정을 살펴보자.

> 참고: 중요한 것은 코드 한줄한줄의 구현 내용이 아니라 **추상화된 상위 수준에서 어떤 흐름을 갖는지**를 이해하는 방향이다.
>

**RequestMappingHandlerMapping의 타입 계층**

<img src="/assets/img/spring/img1.GIF" width="70%" height="auto" >

<br>

타입 계층에서 확인할 수 있듯이 `RequestMappingHandlerMapping`은 **깊은 추상 클래스 상속**계층을 갖는다.

실제로 코드를 확인해보면 알겠지만 `RequestMappingHandlerMapping`의 구현 코드보다는 **상위 계층에서 수행하는 코드**들이 더 많다.

또한 상위 타입 중 하나인 `AbstractHandlerMethodMapping`의 이름을 보면 알 수 있듯이 해당 타입은 **handler의 level이 `method level`이다.** 즉, **요청을 처리하는 `메서드`**가 `handler`가 된다.

(`handler == controller`가 아니다!)

**초기화 메서드 initHandlerMethods**

`RequestMappingHandelerMapping`은 `bean`이기 때문에 **빈 생성과 함께 초기화 단계를 진행**한다.

그 때 호출되는 **메서드가 `initHandlerMethods`이다.**

**오퍼레이션 명에서 명시적으로 드러나듯이 요청을 처리할 `HandlerMethod` 객체들을 등록**한다.

<script src="https://gist.github.com/BongHoLee/a75a52d903d28010f9d5804ed00c5bd3.js"></script>

위 코드는 **초기화 단계에서 수행되는 `initHandlerMethods`의 구현 내용이다.**

주의깊게 봐야할 오퍼레이션은 `isHandler`, `detectHandlerMethod`가 되겠다.

**isHandler**

<script src="https://gist.github.com/BongHoLee/18acc11c834061f716e97a92fabaed41.js"></script>

`RequestMappingHandlerMapping` 타입이 매핑 가능한 핸들러(핸들러로 등록 가능)는 `@Controller` 또는 `@RequestMapping` 어노테이션이 붙은 `bean`이다.

**detectHandlerMethods**

<script src="https://gist.github.com/BongHoLee/dbdd596a790d993496793666cbb33ffa.js"></script>

위 코드 중 `selectMethods` 메서드와 인자로 전달되는 `람다 함수`의 내부 구현을 보면 `handlerType(컨트롤러)`의 메서드들 중 `handlerMethod`로 기능(요청 처리할 hanlder)할 메서드와 메타 정보를 `methods` 맵에 담는다.

특히 `람다 함수` 내부 구현 중 `getMappingForMethod` 함수를 구현한 `RequestMappingHandlerMapping`의 코드는 아래와 같다.

**getMappingForMethod**

<script src="https://gist.github.com/BongHoLee/9cec9f0f63bf839059ec65421aaacdd8.js"></script>

구현에서 보면 알 수 있듯이 전달받은 `method`가 `@RequestMapping`이 정의되어있는지 여부를 확인 후 `null` 또는 `메타 정보(RequestMappingInfo)`를 전달한다.

결국, `RequestMappingHandlerMapping` 타입에서 `hanlderMethod`로써 기능할 수 있는 메서드란 `@RequestMapping` 어노테이션이 붙은 메서드를 의미한다.

다시 **`detectHandlerMethods` 메서드를 살펴보자.**

**detectHandlerMethods**

<script src="https://gist.github.com/BongHoLee/e1ecd6d8cd8accf470ee606591f59e0e.js"></script>

여기까지가 `ReuqestMappingHandlerMapping`의 초기화 단계에서 `handlerMethod`를 등록하는 과정을 나름대로 최대한 `상위 개념`의 흐름을 설명했다.

이제 `DispatcherServet`은 클라이언트로 요청을 받아 해당 요청을 처리할 `handler`를 찾을 때 `RequestMappingHandlerMapping`이 등록한 `handlerMethod` 중 처리 가능하다고 판단되면 **해당 `handlerMethod`를 `handler`로써 반환**한다.

<br>

### 참고 자료
- [https://pplenty.tistory.com/11?category=889300](https://pplenty.tistory.com/11?category=889300)
- [https://velog.io/@jihoson94/Spring-MVC-HandlerAdapter-%EB%B6%84%EC%84%9D%ED%95%98%EA%B8%B0](https://velog.io/@jihoson94/Spring-MVC-HandlerAdapter-%EB%B6%84%EC%84%9D%ED%95%98%EA%B8%B0)