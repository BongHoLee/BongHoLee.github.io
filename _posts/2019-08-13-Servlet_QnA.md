---
layout: post
title: 서블릿의 인스턴스화, session, 멀티스레딩에 관련된 질문과 답변
author: Bong5
categories: [Insight]
---

## Servlet Q&A

---

가끔씩 읽으면서 상기하자.

---

<img src="/assets/img/posts/2019-08-11-nextStep.png" width="100%" height="auto">


### **질문**
다수의 서블릿이 있는 웹서버가 있습니다. 해당 서블릿들 간에 전달되는 값들은 __session__ 변수와 인스턴스 변수에 할당해서 사용하고 있습니다.
<br>

이 상황에서 만약 2명 이상의 사용자가 이 웹서버에 request를 보내면 session 변수는 어떻게 되는 것인가요?

<br>

- 모든 사용자가 동일한 session 변수를 사용하는 것인가요?
- 각 사용자마다 session 변수가 다른가요?

그리고 특정 서블릿에 접근하는 n명의 사용자가 있는 경우 이 서블릿은 첫 번째 사용자가 엑세스 했을 때만 인스턴스화 되는 것인가요? 아니면 모든 사용자에게 개별적으로 인스턴스화 되는 건가요?

즉, 인스턴스 변수는 어떻게 되는건가요?


---

### **답변**
__ServletContect__
서블릿 컨테이너(톰캣과 같은)가 시작되면, 해당 서블릿 컨테이너는 모든 웹 어플리케이션들을 배포하고 load합니다.
웹 어플리케이션이 로드되면 서블릿 컨테이너는 __ServletContext__ 를 __한 번 생성__ 하여 서버의 메모리에 보관합니다.

이후 web.xml(DD)를 파싱하여 __servlet, filter, listener 엘리먼트__ 가 발견되면 해당 클래스들을 한 번 인스턴스 생성하여 서버의 메모리에 보관합니다.
각각의 인스턴스화 된 필터는 본인이 init() 메소드를 즉시 실행합니다(invoked).

서블릿 컨테이너가 종료되면 모든 웹 어플리케이션들을 unload 하고 모든 초기화된 서블릿 및 필터의 destroy() 메소드를 실행 후 ServletContext, Servlet, Filter 및 Listener 인스턴스들은 모두 삭제됩니다.

서블릿에 0보다 큰 __load-on-startup__ 값이 있을 경우 init()메소드도 서블릿 컨테이너 구동시 즉시 실행됩니다.
만약 load-on-startup 값이 없을 경우엔 해당 서블릿에 처음으로 HTTP request 가 올 때 init()메소드가 실행됩니다. (이런 이유로 첫 요청을 보낸 사용자는 응답 속도가 늦다는 단점이 발생합니다.)

---

### __HttpServletRequest & HttpServletResponse__
서블릿 컨테이는 특정 포트 번호(디폴트 8080)에서 HTTP request를 받는(Listen) 웹 서버에 연결됩니다.

클라이언트(웹 브라우저를 가진 사용자)가 HTTP request를 보낼 때, 서블릿 컨테이너는 __새로운 HttpServletRequest와 HttpServletResponse__ 인스턴스를 생성하고 해당 인스턴스를 미리 정의된 필터체인과 서블릿 인스턴스를 통과하도록 합니다.

필터의 경우 __doFilter()__ 메소드가 호출됩니다. __chain.doFilter(request, response)__ 를 호출하면 request와 response 객체가 다음 필터로 넘어가거나 다음 필터가 없는 경우 서블릿에 도달합니다. 서블릿의 경우 __service()__ 메소드가 호출됩니다.

기본적으로 이 메소드는 __request.getMethod()__ 메소드를 기반으로 doXXX() : doGet, doPost 등의 메소드 중 하나를 호출합니다. 해당되는 메소드가 서블릿에 없으면 응답에 HTTP 405 에러가 리턴됩니다.

__request 객체는 header와 body와 같은 HTTP request에 대한 모든 정보를 갖고 있습니다.__

__response 객체는 예를들어 header와 body(일반적으로 JSP 파일에서 생성된 HTML 내용)을 설정하는 것 처럼 당신이 원하는 방식으로 HTTP 응답을 보낼 수 있습니다.__

HTTP 응답이 완료되면 request 객체와 response 객체는 모두 재활용되어 __재사용 할 수 있습니다.__

---

### __HttpSession__
클라이언트(웹 브라우저의 사용자)가 처음으로 웹 어플리케이션을 방문하거나 __request.getSession()__ 을 통해 HttpSession을 처음으로 가져오면 서블릿 컨테이너는 새로운 HttpSession 객체를 생성하고 __UNIQUE한 ID를 생성 후 서버의 메모리에 저장__ 합니다.(session.getId()를 통해 가져올 수 있습니다.)

또한 서블릿 컨테이너는 __JSESSIONID__ 란 이름을 key로, 생성한 session ID를 value로 하여 HTTP 응답의 Set-Cookie header에 cookie로 설정합니다.

웹 브라우저와 웹 서버가 준수해야 할 HTTP Cookie 스펙에 따라 클라이언트(웹브라우저)는 cookie가 유효한 동안은 cookie header의 후속(subsquent) requestdㅔ cookie를 반환해야 합니다. (즉, UNIQUE ID는 만료되지 않도록 만료기간이 session 이어야 하며 도메인과 경로는 일치해야 합니다.)

서블릿 컨테이너는 들어오는 모든 HTTP request의 cookie header에서 JSESSIONID라는 이름의 cookie가 있는지 확인하고 해당 값(sessionID)을 사용하여 서버의 메모리에 저장된 HttpSession을 가져옵니다.

HttpSession은 web.xml의 설정 값 까지만 살아있습니다.(기본 30분). 따라서 클라이언트가 time out 보다 오래 웹 어플리케이션을 방문하지 않으면 서블릿 컨테이너가 session을 삭제합니다.

모든 request는 지정된 cookie가 있더라도 더 이상 동일한 session에 액세스 할 수 없으며, 서블릿 컨테이는 새로운 session을 생성 할 것입니다.

클라이언트 측에서는 웹브라우저 인스턴스가 실행되는 동안 session cookie가 활성화 됩니다. 따라서 클라이언트가 웹 브라우저 인스턴스(모든 탭/창)을 닫으면 클라이언트 session이 삭제됩니다.

새 브라우저에서 session과 연관된 cookie는 존재하지 않으므로 더 이상 cookie는 전송되지 않습니다. 이로 인해 새로운 HTTP session이 생성되고 새로운 session cookie가 사용됩니다.

### 간단히 말해서
ServletContext는 웹 어플리케이션이 살아있는 한 계속 살아있습니다. 그리고 그것은 모든 session에서 모든 request간에 공유됩니다.

클라이언트가 동일한 브라우저 인스턴스로 웹 어플리케이션과 상호작용 하고, session이 서버에서 timeout 되지 않는 한 HttpSession은 계속 유지됩니다.

__같은 session은 모든 request 간에 공유됩니다.__
HttpsServletRequest와 HttpServletResponse는 서블릿이 클라이언트로부터 HTTP request을 받을 때 부터 완성된 응답이 도착할 때 까지(웹페이지가 렌더링 되는 시점) 살아있습니다. 그 외 다른곳에서는 공유되지 않습니다.

또한 모든 Servlet, Filter 및 Listener 인스턴스는 웹 어플리케이션이 살아있는 한 계속 살아있습니다.

ServletContext, HttpServletRequest 및 HttpSession에 정의 된 모든 __attribute__ 는 해당 객체가 살아있는 동안 지속됩니다.

### 스레드 안정성
즉, 당신의 주요 관심사는 스레드 안정성이라고 할 수 있습니다.

서블릿과 필터는 모든 request에 공유된다는 사실을 이제 알았습니다. 그것은 Java의 멋진 점이며 멀티 스레드와 다른 스레드(HTTP request)는 동일한 인스턴스를 사용 할 수 있습니다.

그렇지 않으면 매 request 마다 init() 및 destroy() 하기에 너무 많은 비용이 듭니다.

또한 request나 session에서 사용하는 데이터를 서블릿이나 필터의 __인스턴스 변수로 할당해서는 안됩니다.__ 다른 session의 모든 request간에 공유되어 스레드로부터 안전하지 않습니다. 아래 예가 이를 설명합니다.

<script src="https://gist.github.com/BongHoLee/dd77804d7bfef62d437c0e9356693ede.js"></script>



### 참고 및 출처
- https://okky.kr/article/372195
