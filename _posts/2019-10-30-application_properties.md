---
layout: post
title: 프로퍼티를 이용한 객체관리와 Reflaction
author: Bong5
categories: [Java, WEB/Servlet, WEB/Basic]
---

## 프로퍼티

---

오랜만에 돌아온 WEB/Servlet 포스팅이다.

계속해서 미니 MVC 구현을 위한 내용으로, 이전의 Reflaction을 활용하여 Page Controller가 필요로 하는 request parameter를 바인딩 함으로써 더이상 Page Controller에 따라 요청 파라미터를 확인하고 삽입해주는 과정이 필요 없게되었다.

간단하게 위 과정을 하나씩 복기해보자.

- 어플리케이션 구동시 __서블릿 컨테이너__ 가 __ContextLoaderListener__ 의 __contextInitialized()__ 메서드 호출

- __contextInitialized()__ 메서드는 __MemberDao__ / __DataSource__ / __Page Controller__ 를 미리 생성하여 의존성 주입 및 __ServletContext__ 저장소에 삽입.

- __Page Controller__ 는 View를 생성하는데 필요한 VO(MemberVO)와 같이 필요한 파라미터 존재시 __DataBinding__ 인터페이스를 구현.

- 클라이언트로부터 요청시 __DispatcherServlet__ 에서 요청 servlet url에 해당하는 __Page Controller__ 를 __ServletContext__ 로 부터 얻어옴.

- 얻어온 __Page Controller__ 가 __DataBinding__ 을 구현한 경우 필요로 하는 파라미터를 __Reflaction API__ 를 활용하여 동적으로 파라미터 객체 생성 후 __Model map__ 에 넣어서 __Page Controller__ 에게 전달.

위와 같은 구현으로 __DispatcherServlet__ 을 개선하였으니 더이상 __Page Controller__ 를 추가하더라도 __DispatcherServlet__ 을 손댈 일이 없어졌다.
하지만 __ContextLoaderListener__ 는 여전히 수정이 필요하다. __Page Controller__ 가 추가될 경우 매핑할 servlet uri와 매핑시켜 __ServletContext__ 저장소에 넣어줘야 하는 작업이 필요하기 때문이다.

이제 __ContextLoaderListener__ 에서 객체를 생성하고 의존성을 주입해주는 일을 __ApplicationConext__ 에 위임하자. 그리고 __ApplicationConext__ 가 생성하고 관리할 객체의 목록은 __프로퍼티 파일__ 을 이용하여 관리할 수 있게끔 구현해보자.

---

### 미니 MVC의 구조.

<img src="/assets/img/Reflaction.jpeg" width="100%" height="auto">

위의 사진 처럼 미니 MVC의 흐름은 다음과 같다.

1. 클라이언트로 부터의 요청은 __DispatcherServlet__ 이 받는다.

2. __DispatcherServlet__ 은 클라이언트의 요청을 처리할 __Page Controller__ 에게 __Request Parameter__ 가 필요한지 묻는다.

3. __Request Parameter__ 가 필요한 __Page Controller__ 는 __DataBinding__ 인터페이스를 구현하여 __getDataBinder()__ 를 통해 필요한 __데이터 명, 데이터 타입__ 을 응답한다.

4. __Page Controller__ 로 부터 필요한 데이터 항목을 __Object[]__ 형식으로 응답받은 __DispatcherServlet__ 은 해당 데이터를 준비하기 위해 __ServletDataBinder__ 와 메시지를 주고받는다.

5. __DispatcherServlet__ 으로부터 필요한 데이터를 준비해 달라는 메시지를 받은 __ServletDataBinder__ 는 __Reflaction__ 을 이용하여 클라이언트가 보낸 __request Parameter__ 를 적절히 __Binding__ 한다.
<br>

---

### 시나리오.

- 웹 어플리케이션이 시작되면 서블릿 컨테이너는 __ContextLoaderListener.contextInitialized()__ 를 호출한다.

- __contextInitialized()__ 메서드에서는 __ApplicationConext__ 를 생성한다. 이 때 생성자에 __프로퍼티 파일__ 의 경로를 매개변수로 넘겨준다.

- __ApplicationConext__ 는 전달받은 프로퍼티 파일의 내용을 읽는다.

- 프로퍼티 파일에 선언된 대로 객체를 생성하여 __객체 테이블__ 에 저장한다.

- __객체 테이블__ 에 저장된 각 객체에 대해 의존성을 찾아서 주입해준다.

위 시나리오대로 실행된다면 __Page Controller__ / __DAO__ 를 만들 때 마다 더 이상 __ContextLoaderListener__ 를 수정할 필요가 없어진다.













---

### 참고 및 출처
