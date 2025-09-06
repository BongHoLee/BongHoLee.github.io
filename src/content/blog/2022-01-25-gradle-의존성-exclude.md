---
title: "TroubleShooting - gradle 의존성 exclude(spring-starter-logging)"
description: "이 포스트에 대한 설명"
pubDate: 2022-01-25
author: "Bong5"
categories: ["Programming"]
tags: ["TroubleShooting"]
---


### 이슈 내용

`log4j`, `logback` 로깅 라이브러리들의 보안 이슈 관련 버전 업데이트 및 제외가 필요함.

기본적으로 `rhea`, `safe`가 **spring-boot-starter-web**을 비롯한 `starter` 의존성을 갖고 있고 해당 `starter` 의존성들이 **spring-boot-stareter-logging** 디펜던시를 갖고 있어 `의존성 전이` 효과로 `slf4j`, `logback`, `log4j` 관련 라이브러리들이 함께 `classpath`에 포함됨.

<br>

## 해결

### 1. 기존 의존성 제외 스크립트

각 `rhea`, `safe` root 모듈에 아래와 같이 **spring-boot-starter-logging 모듈 제외** 스크립트 삽입

<script src="https://gist.github.com/BongHoLee/29fc55c8e641392ec6b5ed57e96f40e2.js"></script>

확인해보니 `root module`에서는 정상적으로 해당 라이브러리가 제외되었지만 `submodule`들에서는 그대로 사용중.

각 `submodule`들이 `spring-boot-starter-web` 등의 디펜던시를 독립적으로 사용하기 때문.

이에 따라 **모든 프로젝트에 적용**을 위해 아래 위치에 스크립트 추가 적용

<script src="https://gist.github.com/BongHoLee/6bf84efec6d5202509de90266aa1c9be.js"></script>

확인해보니 **정상적으로 `spring-boot-starter-logging` 관련 전이 의존성들이 제거됨을 확인**

<br>

### 2. 필요 의존성 명시 스크립트

**spring-boot-starter-logging** 모듈에서 제공하는 `전이 의존성`들을 사용하지 않기 때문에 **명시적으로 의존성을 선언**해야함. 아래 스크립트를 적용

<script src="https://gist.github.com/BongHoLee/eadc02218565ea2a99e621e0c01c4911.js"></script>

<br>

### 결과

정상적으로 `classpath`에 **명시한 버전들이 삽입됨을 확인. 최신 버전을 따라 의존성 관리를 하는 `gradle` 성격 상 다른 의존성에서 `slf4j, logback`을 사용했다 하더라도 그 중 최신 버전으로 적용됨**

<br>

### 참고

- [https://stackoverflow.com/questions/28734647/gradle-spring-boot-dependencies-are-not-excluding](https://stackoverflow.com/questions/28734647/gradle-spring-boot-dependencies-are-not-excluding)
- [https://stackoverflow.com/questions/58648500/is-it-possible-to-prevent-gradle-from-adding-excluded-transitive-dependency](https://stackoverflow.com/questions/58648500/is-it-possible-to-prevent-gradle-from-adding-excluded-transitive-dependency)