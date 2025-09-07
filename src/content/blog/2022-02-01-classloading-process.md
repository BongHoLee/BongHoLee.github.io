---
title: "클래스 로딩 과정"
description: "자바 클래스 로딩 과정에 대해 알아보자."
pubDate: 2022-02-01
author: "Bong5"
tags: ["Java"]
---
**클래스 로딩은 `인스턴스 로딩`, `인스턴스 생성`이 아님을 반드시 기억하자**

**클래스 로딩은 말 그대로 인스턴스 생성 전 클래스에 대한 메타 정보와 바이트 코드들을 `JVM(Method Area)`에 로딩하는 것을 말한다.**

<img src="/assets/img/java/img2.GIF" width="70%" height="auto" >

`JVM`이 동작하고 각 클래스들을 로딩하기 위하여 **각 클래스 로더들은 `자신이 호출할 수 있는 클래스들을 호출`하여 로딩한다.**

- **부트스트랩 로더** : `JAVAHOME/jre/lib/rt.jar`에 있는 `핵심 클래스`들을 로딩
- **확장 클래스 로더** : `JAVAHOME/jre/lib/ext` 경로의 `자바 확장 클래스`들을 로딩
- **시스템 클래스 로더** : `ClassPath`에 설정된 경로를 탐색하여 그곳의 클래스들을 로딩. `개발자가 만든 .class 파일을 로딩`

<br>

그림과 같이 **클래스 로더는 계층 구조**를 갖는다.

`부모 클래스 로더`에서 `자식 클래스 로더`를 갖는 형태

따라서 `로딩 Delegation`이 가능하다.

<img src="/assets/img/java/img3.GIF" width="70%" height="auto" >

먼저 `System Class Loader`가 `A`라는 클래스를 로딩할 때, 이 요청을 먼저 `부모 클래스 로더`에게 위임하고, `부트스트랩 로더`에 다다르면 실제 로딩을 수행한다.

만일 실제 로딩 수행 시 본인의 책임(`특정 경로의 클래스 로딩`)을 다할 수 없는 경우 **자식 로더에게 요청을 넘긴다.**

<br>

만일 **로딩하기위한 클래스를 찾았을 때**는 실제 로딩을 위해서 `Link` 과정을 진행한다.

<br>

### Link

<img src="/assets/img/java/img4.GIF" width="70%" height="auto" >

읽은 바이트 코드가 자바 규칙을 따르는지 검증하고 **클래스에 정의된 `필드`, `메소드`, `인터페이스` 등을 나타내는 `데이터 구조`를 준비하며, `해당 클래스가 참조하는 다른 클래스를 로딩`한다.**

링크 과정에서는 `Verification`, `prepare`, `resolve` 하는 과정을 진행한다.

<br>

- **Verification(확인)** : 로드하기위한 클래스의 `바이트 구조가 올바른지 검증`한다.
- **Prepare(준비)** : 로딩하려는 클래스 또는 인터페이스의 `static 필드`를 생성하고 초기화한다.
- **Resolve(해석)** : 로딩하려는 클래스의 인스턴스의 **실제 주소값에 대한 `심볼릭 링크`를 설정한다.**

<br>

### Initialization

`Link` 단계에서 **기본값으로 초기화된 `static 필드`에 대해 초기 값을 정의된 값으로 지정해준다.**

<br>

### 인스턴스 생성 시

<img src="/assets/img/java/img5.GIF" width="70%" height="auto" >

클래스 로더가 최초 클래스를 로딩 할 때 해당 클래스에 대한 메타 정보를 가진 `Class 객체`를 생성하는데, 이 `Class 객체`를 로딩 타임에 `Heap`에 저장한다. 그리고 `Method Area`는 이 `Heap`에 생성된 `Class 객체`에 대한 참조값을 갖고 마찬가지로 `Heap`에 생성된 `Class 객체`도 `Method Area`에 대한 참조값을 갖기 때문에 `메타 정보`를 활용할 수 있다.

그리고 `Class 객체`는 내부적으로 `Method Area`에 저장된 데이터를 사용한다.(메타 정보)

`new`를 만나거나 `instance` 생성 시 일어나는 과정

- `Heap`에 해당 `Class 객체`가 있는지 확인한다.
    - 없다면
        - `Class 객체`를 `Heap`에 생성하고 `메타 정보(Class Data)`를 `Method Area`에 저장한다.
        - 그 다음에 `JVM`은 해당 클래스의 `새로운 Instance`를 `Heap`에 생성하고 이 `새로운 Instance`는 직전에 생성된 `Method Area의 Class Data`를 참조한다.
    - 있다면
        - `Heap`에는 이미 `Class 객체`가 존재하고 `Method Area`에는 이미 `Class Data`가 존재하므로 그냥 `Heap`에 `새로운 Instance`를 생성하기만 하면 된다.