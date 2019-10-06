---
layout: post
title: Reflaction 응용
author: Bong5
categories: [JAVA, WEB/Servlet, WEB/Basic]
---

## Reflaction Application

---

지난 포스팅에서 __리플렉션__ 에 대한 기본적인 개념을 다루었다.

짧게 요약하자면 __클래스 로더의 동적 로딩__ 을 통해서 런타임에 __classpath__ 로 부터 __.class__ 파일을 읽고 해당 Class의 메타 정보를 갖는 __Class class__ 를 활용하여 로딩된 클래스의 __Class 인스턴스__ 를 생성한다고 하였다.

또한 Class 인스턴스는 __Class.forName("path")__ or __Path.class__ or __instance.getClass()__ 를 이용하여 얻을 수 있는 것도 알았다.

그렇다면 이렇게 Class의 메타 정보를 갖는 __Class 인스턴스__ 를 사용해서 어떤 작업을 할 수 있을까?

물론 여러 작업을 할 수 있겠지만 기존에 만들던 __미니 MVC__ 실습 코드에 적용된 Reflaction을 보자.

---

<img src="/assets/img/posts/2019-08-11-nextStep.png" width="100%" height="auto">


### 미니 MVC의 구조.

<img src="/assets/img/posts/Reflaction.jpeg" width="100%" height="auto">

위의 사진 처럼 미니 MVC의 흐름은 다음과 같다.

1. 클라이언트로 부터의 요청은 __DispatcherServlet__ 이 받는다.

2. __DispatcherServlet__ 은 클라이언트의 요청을 처리할 __Page Controller__ 에게 __Request Parameter__ 가 필요한지 묻는다.

3. __Request Parameter__ 가 필요한 __Page Controller__ 는 __DataBinding__ 인터페이스를 구현하여 __getDataBinder()__ 를 통해 필요한 __데이터 명, 데이터 타입__ 을 응답한다.

4. __Page Controller__ 로 부터 필요한 데이터 항목을 __Object[]__ 형식으로 응답받은 __DispatcherServlet__ 은 해당 데이터를 준비하기 위해 __ServletDataBinder__ 와 메시지를 주고받는다.

5. __DispatcherServlet__ 으로부터 필요한 데이터를 준비해 달라는 메시지를 받은 __ServletDataBinder__ 는 __Reflaction__ 을 이용하여 클라이언트가 보낸 __request Parameter__ 를 적절히 __Binding__ 한다.
<br>

---

### 미니 MVC의 소스코드

- ContextLoaderListener
<script src="https://gist.github.com/BongHoLee/572ee8fef0d6dbed1f698918274d3004.js"></script>

- DispatcherServlet
<script src="https://gist.github.com/BongHoLee/fb9e6d1f403c773f87afb0ae4feb5efb.js"></script>

- Page Controller
<script src="https://gist.github.com/BongHoLee/67aa81fdc701a7a4016481a79446bacf.js"></script>

- ServletRequestDataBinder
<script src="https://gist.github.com/BongHoLee/1e40f2b554fba5293257904888c14199.js"></script>

- MemberVO
<script src="https://gist.github.com/BongHoLee/d848cfb45529338387b52dcd11fc99ff.js"></script>


---

### 어플리케이션 구동부터 클라이언트 요청까지

흐름을 좀 더 이해하기 쉽게 어플리케이션 구동시 초기화 과정부터 클라이언트의 요청을 받아 응답에 이르기 까지 간단하게 살펴보기 위해 __ContextLoaderListener__ 소스코드 까지 준비해 봤다.

__ContextLoaderListener__ 는 보시다시피 __ServletContextListener__ 를 구현한 이벤트 핸들러 이다. 어플리케이션 구동시 __contextInitialized()__ 메서드가 실행됨으로써 __MemberDao__ 와 같이 필요한 공유 객체를 미리 준비하고 각 __Page Controller__ 들을 생성하여 준비한 __MemberDao__ 를 주입한다.

그리고 준비된 __Page Controller__ 들을 __ServletContext__ 보관소에 저장함으로써 서블릿 사이에서 공유된다.

클라이언트의 모든 요청을 수신하는 __DispatcherServlet__ 도 마찬가지로 __HttpServlet__ 을 상속받은 __서블릿__ 이기 때문에 __ServletContext__ 에 접근이 가능하다.

이제 __DispatcherServlet__ 은 클라이언트의 요청 URL을 받아 이와 일치하는 Page Controller를 __ServletContext__ 보관소로 부터 꺼내어 해당 Page Controller에 실행을 위임할 것이다.

---

### 멤버를 추가할래요

- 요청 URL : memberAdd.do
- 요청 파라미터 : name, email, password

클라이언트가 브라우저에서 멤버를 추가하기 위해 __memberAdd.do__ URL로 __name, email, password__ 파라미터와 함께 요청을 했다고 가정하자.

이제 __DispatcherServlet__ 은 요청 URL(memberAdd.do)를 수신하여 이와 매핑되는 PageController 인스턴스를 ServletContext로 부터 꺼낼 것이다 (sc.getAttribute())

그리고 Page Controller에게 __클라이언트의 요청 파라미터가 필요한지__ 묻는다.
만일 Page Controller가 __DataBinding__ 인터페이스를 구현했다면 요청 파라미터가 필요하다는 의미이다.

__MemberAddController__ 는 __DataBinding__ 을 구현하였으므로 __요청 파라미터가 필요__ 함을 알 수 있다.

요청 파라미터가 필요함을 응답받은 __DispatcherServlet__ 은 데이터를 준비하기 위해 __ServletDataBinder__ 와 협업을 시작한다.

---

### 데이터를 준비해주세요.

__DispatcherServlet__ 이 __MemberAddController__ 가 필요한 데이터를 준비하기 위해서 __MemberAddController__ 에게 __getDataBinder__ 메시지를 보낸다.

필요한 __데이터 명과 데이터 타입__ 을 Object[] 형태로 응답한 __MemberAddController__ 는 이제 __DispatcherServlet__ 이 데이터를 준비하여 자신이 멤버 추가 책임을 수행할 수 있게끔 __execute()__ 메시지와 함께 __Model Map__ 에 필요한 데이터를 넣어 보내주기를 기다린다.

__DispatcherServlet__ 은 이제 데이터를 준비하는 책임을 수행하는데 스스로 준비하기에는 본인의 역할이 너무 난잡한 것 같다.(응집력이 떨어지는 것 같다.) 그래서 __ServletRequestDataBinder__ 라는 친구와 협업을 한다.

__ServletRequestDataBinder__ 는 __DispatcherServlet__ 으로부터 __필요한 데이터 타입, 데이터 명, 데이터 값__ 을 받아서 데이터 타입으로 바인딩 하여 응답해줄 책임이 있다.

여기서부터 이제 __Reflaction__ 이 활용되기 시작한다.

__필요한 데이터 타입의 인스턴스__ 는 넘겨받은 __Class 인스턴스__ 로 부터 생성할 수 있다.

그리고 __필요한 데이터 타입의 인스턴스__ 가 VO라면 __데이터 명__ 과 매핑되는 __데이터 값__ 이 저장되어야 한다.
(MemberVO가 Email, name, password 상태를 지녀야 한다.)

그리고 위와 같이 VO에 상태값을 저장하기 위해서는 역시 __Reflaction__ 의 도움이 필요하다.

__Reflaction__ 을 통해 __Class 인스턴스__ 로 부터 __Method__ 정보를 가져와서 메시지를 보낼 수 있기 때문이다.

__ServletRequestDataBinder__ 의 __findSetter()__ 메서드를 살펴보면 __Class 인스턴스__ 로 부터 __setter Method__ 객체를 return해 준다.

물론 여기서 return 되는 __setter Method__ 는 클라이언트가 요청한 __요청 파라미터의 데이터 명__ 에 매핑되는 setter 이다.

이제 __setter Method__ 와 __필요한 데이터 타입의 인스턴스(MemberVO)__ 가 __Reflaction__ 을 활용하여 준비되었다.

남은건 __필요한 데이터 타입의 인스턴스__ 의 __setter Method__ 에 __필요한 데이터 값__ 을 저장함으로써 __상태 값__ 을 갱신하여 __DispatcherServlet__ 에게 넘겨주는 일 뿐이다.

여기서 조금 생소한 구문이 나온다.
보통 어떤 인스턴스의 메서드를 실행할 때는 __인스턴스.메서드()__ 와 같은 문법으로 동작한다.

하지만 우리는 __Reflaction__ 을 사용함에 유의하자 __Reflaction API__ 가 정의하는 __Method 인스턴스__ 실행은 __Method.(인스턴스, 인자)__ 이다.

위와 같은 구문을 실행하면 __인스턴스.메서드(인자)__ 와 동일하다.

위에서는 __Method__ 가 __Reflaction__ 으로 얻은 __객체__ 이기 때문에 당연히 기존 방식과는 다를 수 밖에 없다.











---

### 참고 및 출처
