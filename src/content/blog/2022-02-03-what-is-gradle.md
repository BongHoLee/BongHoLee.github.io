---
title: "What is Gradle?"
description: "이 포스트에 대한 설명"
pubDate: 2022-02-03
author: "Bong5"
tags: ["DevOps", "Gradle", "Spring", "Spring Boot"]
---
## 개요

`Gradle`은 **빌드 자동화 도구 오픈소스**로써, 다양한 타입의 소프트웨어를 빌드할 수 있게끔 설계되었다. 아래는 큰 그림에서 `Gradle`의 중요한 요소들에 대한 설명이다.

<br>

### 고성능

`Gradle`은 불필요한 작업들은 배제하고 **입/출력이 변경(결과물에 대한 변경으로 봐도 될듯)**된 `tasks`에 대해서만 실행한다. 또한 `build cache`를 사용함으로써 이전 `task` 실행의 결과물을 그대로 활용할 수 있다.

<br>

### JVM 기반

`Gradle`은 `JVM` 위에서 실행되기 때문에 `JDK`가 필수이다. 그리고 `JVM` 위에서 작동한다는 특징은 `Java` 플랫폼에 익숙한 개발자들에게 좋은 옵션인데, `Build Logic`에 있어 `custom task` 내에서 `표준 자바 API`를 활용할 수 있다.

<br>

### Conventions

`Gradle`은 `Build-By-Convention`이다. 즉, **컨벤션에 따른 빌드**를 수행한다.

이를테면 `java plugin`의 경우

- 소스코드는 `src/main/java`
- 테스트는 `src/main/test`
- 리소스는 `src/main/resources`
- 빌드결과는 `build/libs`

와 같은 `기본적인 규약`이 존재하고, 이는 사용자 요구에 따라 `변경이 가능하다.`

`Gradle`은 `Maven`으로 부터 **의존 라이브러리 관리** 기능을 차용했다. 따라서 컨벤션을 따라 `Java` 프로젝트와 같은 일반 유형의 프로젝트를 쉽게 빌드할 수 있다.

적절한 `Plugins`를 적용한다면 짧은 `build script`를 가지고도 프로젝트를 구성할 수 있다.

그리고 필요하다면 **컨벤션을 오버라이딩하거나 task를 추가**하면서 컨벤션 기반의 빌드를 커스터마이징 할 수 있다.

<br>

### 확장성

쉽게 `Gradle`을 확장하여 `task`를 제공하거나 어떤 모델을 `build`할 수 있다.

<br>

## Gradle 사용자를 위한 반드시 알아야 할 다섯가지

`Gradle`은 아주 강력하고 유연한 빌드 도구로써 입문자도 쉽게 시작할 수 있다. 하지만 아래 **5가지의 핵심 원칙**들을 숙지하면 더욱 접근하기 쉽고 강력하게 사용할 수 있다.

<br>

### Gradle is a general-purpose build tool

**Gradle은 범용 빌드 툴이다.** `Gradle`은 어떤 소프트웨어건 빌드할 수 있는데, **빌드하려는 대상이나 작업 수행 방법에 대해 가정을 하지 않기 때문(빌드 수행을 위한 별다른 제약 사항이 없다.)이다.**

단, 한 가지 주의해야할 제약사항이 있는데, **Dependency Management**가 `Maven` 또는 `Ivy` 호환 저장소 `(mavenCenteral, jcenter)`와 `파일 시스템(로컬 디렉토리가 가능)`만 지원한다는 것

이러한 **범용성**은 `build`를 위해 많은 작업이 필요 없다는 것을 의미한다.

다시말해, `Gradle`은 `plugin`을 통해 `사전에 빌드된 기능`과 `컨벤션 계층`을 추가함으로써 일반 타입의 프로젝트(Java 라이브러리 등)을 쉽게 `build`할 수 있다.

또한 `커스텀 플러그인`을 개발하고 배포함으로써 `컨벤션`과 `빌드 세부사항`을 캡슐화 할 수 있다.

<br>

### The core model is based on tasks

`core model`은 `tasks` 기반이다.

`Gradle`은 작업 단위의 `tasks`들로 `DAGs`를 모델링한다. 이 말은 `build`를 위해서는 여러 `task`들로 연결된 하나의 집합(종속성 기반)을 설정함으로써 `DAG`를 생성한다는 것을 의미한다.

`task graph`가 만들어지면, `Gradle`은  `task`들이 일련의 순서와 과정에 따라 실행되도록 한다.

<img src="/assets/img/gradle3.GIF" width="70%" height="auto" >

위 그림처럼 `build process`는 `tasks graph`로 모델링 된다. 그리고 이는 `Gradle`이 유연성을 갖게 한다.

또한 `task graph`는 `plugins`와 사용자의 `build script` 내 `tasks`들을 `task dependency mechanism`을 통해 연결 가능하다.

`task dependency mechanism`이란

[https://docs.gradle.org/current/userguide/tutorial_using_tasks.html#sec:task_dependencies](https://docs.gradle.org/current/userguide/tutorial_using_tasks.html#sec:task_dependencies)

`Task`는 아래 3 가지 요소로 구성된다.

- **Actions** : 파일을 복사하거나 소스를 컴파일 하는 등의 행동들
- **Inputs** : `Actions`에서 사용하는 변수 또는 값, 파일, 디렉토리 등
- **Outputs** : `Actions`가 생성하거나 변경하는 파일 또는 디렉토리들

<br>

### Gradle has several fixed build phases

`Gradle`은 `build`를 위해 고정된 몇 단계의 작업이 필요하다.

`Gradle`이 `build script` 실행을 위해 총 3 단계의 `phases`를 이해하는 것이 중요하다.

1. **Initialization**(초기화)
    - `build`를 위한 환경을 설정하고 어떤 프로젝트들이 `build`에 포함될 것인지 결정
2. **Configuration**(설정)
    - `build`에 대한 `task graph`를 구성 및 설정하고 사용자가 실행하려는 `task`들을 어떤 순서로 실행하고 또 필요한 다른 `task`들은 어떤 것이 있는지 결정
3. **Excecution**(실행)
    - `Configuration` 단계에서 선택된 `tasks`들을 실행한다.

<br>

### Gradle is extensible in more ways than one

`Gradle`은 여러가지 방법으로 확장 가능하다.

`Gradle`은 확장을 위한 다양한 메커니즘을 제공한다.

- **Custom task types**
    - 기본적으로 제공되는 `task`에 원하는 기능이 없을 시 `커스텀 task type`을 사용할 수 있다. 가장 좋은 방법은 `custom task`를 위한 `source file`을 `buildSrc` 디렉토리(자바 프로젝트)에 넣거나 `패키징된 플러그인`에 넣는 것이다.
- **Custom task actions**
    - `custom build logic`을 어떤 `task` 실행 전/후로 삽입할 수 있다.
        - 전 : `Task.doFirst()`
        - 후 : `Task.doLast()`
- **Extra properties on projects and tasks**
    - `custom actions`나 다른 `build logic`에서 사용할 수 있도록 `task` 또는 `project`에 대한 별도의 `properties`를 추가할 수 있다.
    - `Extra Properties`는 단순히 사용자가 생성한 `custom tasks` 뿐만 아니라 `Gradle core plugins`에도 적용할 수 있다.
- **Custom convestions**
    - `Conventions`는 `build`를 단순화 함으로써 사용자들이 좀 더 쉽게 사용할 수 있도록 하는 강력한 방법이다. 사용자는 `Custom Plugin`을 작성하고 해당 플러그인에 `Conventions`를 정의할 수 있다. 단, `convention`에 따른 실행을 위한 `default value`를 구성해야 한다.

<br>

### Build scripts operate against an API

`API` 기반의 `build scripts` 작동

`API` 기반으로 작동하기 때문에 `build script` 기술 시, `how` 가 아니라 `what`을 표현하는게 좋다.

<br>

### 참고

- [https://docs.gradle.org/current/userguide/what_is_gradle.html#what_is_gradle](https://docs.gradle.org/current/userguide/what_is_gradle.html#what_is_gradle)