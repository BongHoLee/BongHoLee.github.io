---
layout: post
title: GenericServlet
author: Bong5
categories: [Keywords, Java, WEB/Servlet]
---

## GenericServlet

---

이전에 서블릿 클래스는 서블릿 인터페이스를 구현하고 서블릿 컨테이너에 의해 init(), service(), destory() 등의 메소드를 호출함으로써 메모리 로딩, 서비스 수행, 메모리 해제 등의 과정을 거치는 것을 알았다.

이제 __GenecricServlet__ 이라는 추상 클래스를 사용하여 서블릿을 구현하는 방법을 살펴본다.

---

### GenericServlet이 없었던때
직전에 만든 HeloWorld 서블릿 클래스는 Servlet 인터페이스를 구현함으로써 생성하였다. 인터페이스를 구현하기 위해서는 선언된 모든 메서드를 구현해야 하기 때문에 번거롭기 그지 없는데 이와 같은 초기화 메서드들 중 반드시 구현해야 하는 부분은 service() 메서드 이다.(service() 메서드는 클라이언트가 요청시 마다 호출되기 때문)

init() 메서드의 경우 최초 서블릿이 요청되었을 때 메모리에 로딩되며 한 번 호출이 되는데, 서블릿을 위해 특별히 준비해야 하는 작업이 없다면 굳이 구현할 필요가 없다. destroy() 메서드 역시 마찬가지 이유를 갖는다.

위와 같은 이유로 나타난 클래스가 GenericServlet 추상클래스 이다.

#### GenericServlet은 추상클래스
말 그대로 GenericServlet은 servlet 인터페이스를 구현하는 추상클래스 이다. 특징적으로 service()를 제외한 나머지 메서드들이 구현되어 있다.

위와 같은 특징 때문에 GenericServlet을 상속받는 서블릿 클래스들은 service() 메서드만 강제적으로 구현하면 된다.










###참고 및 출처
  - 자바 웹개발 워크북
