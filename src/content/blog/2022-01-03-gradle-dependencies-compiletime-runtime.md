---
title: "Gradle dependencies(compileTimeClasspath, runtimeClasspath)"
description: "이번 학습을 통해 몇 가지 의미있는 것들을 배웠다."
pubDate: 2022-01-03
author: "Bong5"
tags: ["DevOps", "Gradle", "Java"]
---
## Gradle dependencies(compile-time, runtime)

---

### 들어가며.

이번 학습을 통해 몇 가지 의미있는 것들을 배웠다.

1. **gradle에서 `dependencies`를 설정할 때 단순히 `.jar`만 가져오는게 아니다.**
  1. `pom` 정보 등을 통해 `third-party 의존성`도 함께 가져온다.
2. `implementation`, `compile`에 상관 없이 일단 `third-party` 라이브러리를 `mavenRepository`로부터 땡겨온다. 물론 **compile classpath**에 추가하냐 마냐는 옵션에 따라 다르다.
3. **compile classpath**에 `third-party 라이브러리`가 추가되는 것은 **현재 모듈에서 `implement`, `compile(api)`로 설정하는 것과 상관 없다.**
   다시말해 **현재 모듈이 아닌 `dependency`가 어떻게 설정했느냐에 따라 달렸다.**
  1. **main-module** - **submoduleA** - **submoduleB**
  2. **main-module(implement: submoduleA), submoduleA(compile:submoduleB)**
  3. 위와 같이 의존성 설정이 되어있다면 **main-module**에서 **submoduleB**에 **컴파일 타임에 접근 가능**하다. 즉 `compileClasspath`에 추가된다.

<br>

### gradle build, jar

`.jar`만 있다고 하여 **원하는대로 depnedencies들을 얻을 수 없다.**

`jar`는 `sourceSet`에 대한 class들만 모으기 때문에 `third-party 의존성`을 얻을 수 없다.

일반적으로 `mavenRepository`에서 `dependencies`들을 가져올 때 **단순히 `.jar`만 가져오는게 아니다.!**

`publish` 또는 `uploadArchives`를 통해서 `build` 결과물을 특정 repository에 배포해보면

- **배포 모듈에 대한 메타데이터(.meta)**
- **배포 모듈 아카이브(.jar)**
- **배포 모듈의 `third-party 의존성`에 대한 정보(.pom)**

와 같은 파일들이 생성된것을 알 수 있다.

따라서 배포된 모듈을 `dependency`로 가져오기 위해서는 해당 모듈의 `third-party` 정보를 참조해서 관련 의존성까지 모두 `mavenRepository`로부터 가져온다.

<br>

### implementation, compile(api) - 주체는 “모듈”

현재 모듈을 의존성으로 가질(의존할) 외부 모듈에게 **thrid-party 라이브러리에 대한 접근(컴파일 타임)**을 설정한다.

즉, **의존하는 `client`가 `server`들이 의존한 대상들에 대한 접근을 설정하는게 아니라 `server`가 `client`에게 보여줄지 말지를 설정**하는 것이다.

> 이게 바로 `spring-starter-logging`을 `implementation`으로 걸었는데 `slf4j`까지 접근 가능한 이유다. `spring-starter-logging`이 `slf4j`를 `compile`로 걸었기 때문에 **클라이언트인 우리의 모듈에게도 `slf4j`가 노출되어 컴파일타임에 접근이 가능한 것**
>

<br>

### implementation, compile(api) - 의존성 접근 가능에 대한 관점

의존성 옵션이 `implementation`이냐 `compile(api)`냐에 따라서 `client`가 **third-party 의존성에  접근할 수 있는 시점**이 다르다.

- **main-module** → **submoduleA** → **submoduleB**

위와 같이 의존성을 가진다고 해보자.

<script src="https://gist.github.com/BongHoLee/90702dd2507d9bc8ebfaca7cd91bbd15.js"></script>

위처럼 `submoduleA`가 **자신에게 의존하는 클라이언트 모듈(`main-module`)에게 `trhid-party 모듈(submoduleB)`에 대한 정보를 (컴파일 타임에) 감추고 싶다면** `implementation`으로 설정한다.

이렇게 되면 `main-module`의 **compileClasspath**에서는 `submoduleB`가 감춰지기 때문에 **컴파일 타임에 `submoduleB`에 대한 접근이 불가능**하다.

물론 `submoduleA`를 **mavenRepository**로부터 가져올 때 **submoduleA의 의존 정보인 `pom`을 확인하여 `submoduleB`도 함께 가져오지만, `compileClasspath`에는 추가하지 않고 `runtimeClasspath`에만 추가한다.**

- **만일 classpath에 `submoduleB`가 없다 하더라도 `main-module`을 빌드 하는데에는 아무런 문제가 없다.**
- **(중요)**물론 **최종 build 후**에는 `ext-libs`든 `fat-jar` 형태든 간에 `submoduleB`가 반드시 포함되어 있어야 한다.
- **(중요)**이는 당연히 **runtime classpath**에 `submoduleB`가 포함이 되어있어야만 런타임에 정상 작동을 할 수 있기 때문.

<br>

<script src="https://gist.github.com/BongHoLee/d0e62a49b9bd95ef03beff29ed3ec6c8.js"></script>

위처럼 `submoduleA`가 **자신에게 의존하는 클라이언트 모듈(`main-module`)에게 `trhid-party 모듈(submoduleB)`에 대한 정보를 (컴파일 타임에) 접근 가능하게 하려면** `compile(api)`으로 설정한다.

**submoduleA**를 `compile(api)`로 의존성을 설정하게 되면 여기에 의존하는 `main-module`의  **compileClasspath**에 `submoduleA`가 의존하는 `third-party 모듈(submoduleB)`를 추가하기 때문에
**main-module**에서 **submoduleB**로의 접근이 **컴파일 타임에도 가능하다.**

즉, `submoduleA`가 의존하는 `submoduleB`에 대한 정보가 **컴파일 타임에 main-module에게 노출**된다.

<br>

### 참고
- [https://bepoz-study-diary.tistory.com/372](https://bepoz-study-diary.tistory.com/372)
- [https://medium.com/swlh/how-gradle-dependency-configurations-work-underhood-e934906752e5](https://medium.com/swlh/how-gradle-dependency-configurations-work-underhood-e934906752e5)
- [https://docs.gradle.org/current/userguide/working_with_files.html#sec:creating_uber_jar_example](https://docs.gradle.org/current/userguide/working_with_files.html#sec:creating_uber_jar_example)
- [https://blog.leocat.kr/notes/2018/11/01/nexus-publish-jar-artifact-with-gradle](https://blog.leocat.kr/notes/2018/11/01/nexus-publish-jar-artifact-with-gradle)
- [https://twinparadox.tistory.com/630](https://twinparadox.tistory.com/630)
- [https://stackoverflow.com/questions/44413952/gradle-implementation-vs-api-configuration](https://stackoverflow.com/questions/44413952/gradle-implementation-vs-api-configuration)