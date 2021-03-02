---
layout: post
title: Logstash to Logstash (TCP) 트러블슈팅
author: Bong5
categories: [/Others/PoC]
---

## 들어가며

업무에서 `Logstash`를 활용한 `데이터 전달자(SBDS)`, `데이터 사용자(User)` 구축 설계에 대한 테스트를 진행하였다.

진행 중 발생했던 이슈와 해결 방법을 위주로 기록한다.

## SBDS ~ USER 설계

<img src="/assets/img/poc/logstash.PNG" width="100%" height="auto">

전체적인 구조는 위 그림과 같다.

- **Data SBDS** : DB 또는 File로부터 Data를 읽어들이고 `User`에게 `TCP`로 데이터를 전달하는 역할을 수행한다.
- **Data User** : `SBDS`로부터 데이터를 `TCP`로 읽어들이고 읽어들인 데이터를 지정한 경로에 `File` 형태로 저장한다.

여러 방안을 모색한 결과 `SBDS`와 `User`를 모두 `Logstash`로 구축하는 방향으로 결정하였다.


## SBDS ~ USER 설정

`Logstash`를 활용하여 진행하기 때문에 중요한 것은 `SBDS`, `USER` 모두 파이프라인 설정 파일(`.conf`)와 Setting 파일(`logstash.yml` or `pipeline.yml`)만 신경써주면 된다.

- **Data SBDS**
  - `input` : JDBC 플러그인 사용
  - `filter` : 아직 해당 없음
  - `output` : TCP, json codec으로 `USER`에게 전송
- **Data User**
  - `input` : TCP 플러그인 사용
  - `filter` : 아직 해당 없음
  - `output` : stdout, file write로 결과 테스트

한 사이클이 제대로 수행되는지에 대한 개념증명 정도의 테스트였기 때문에 디테일한 설정은 아직 필요 없다고 판단하고 진행하였다.

## Issue

원인을 알 수 없는 이슈가 발생하였다. 분명 `SBDS`는 `JDBC Plugin`으로 정상적으로 데이터를 읽어오는데 `SBDS의 Output`이 문제인건지 `User의 Input`이 문제인건지 데이터 전달이 안되는 이슈가발생했다.

몇 가지의 가능성을 두고 테스트를 해봤다.

1. **SBDS가 OUTPUT 하는 데이터의 크기가 워낙 커서 제대로 전송이 안된다?**
  - 1개 데이터에 대해서 테스트해 보았지만 똑같은 현상이다.
2. **Data SBDS, Data User의 .conf 설정에서 TCP 플러그인 설정이 제대로 안되었다?**
  - 공식 홈페이지와 구글의 사례를 그대로 적용해서 진행하였다.

계속 트러블 슈팅을 진행하던 중 특이한 현상이 발생했다. **SBDS를 Shutdown 하면 버퍼에 있던 Data를 한번에 User에게 Flush 하는 현상을 보였다.**

그러니까 `SBDS`가 `Data Source`로부터 데이터를 읽고 `Buffer`에 데이터를 남겨두었다가 종료 시에 `Flush`하는 것 처럼 보였다.

로그를 봐도 `Exception`이나 `Error`처럼 보이는 로그가 없어서 `Logstash`가 처음부터 이렇게 만들어진게 아닐까 하는 의심이 들었다.

그러던 와중 `Logstash To Logstatsh TCP` 키워드로 검색한 결과 공식 홈페이지의 `Discuss` 내용 중 똑같은 현상에 대한 게시글이 있었다.

내용인 즉 **Output TCP** 인 경우에 `new line(\n)`이 식별되어야 `flush`를 한다는 것 같다.

**codec => json** 인 경우, 별도의 `new line(\n)` 없이 쭉 이어진 json string 데이터를 내보내려 하기 때문에 `new line`이 올 때 까지 `Buffer`에 계속해서 쌓아두고, 결국 `SBDS`가 종료할 때에 `buffer flush`를 한 번 해주는 것 같다.

이에 따라 **codec => json_lines** 로 수정한 이후엔 정상 수행이 된다. `json_lines`의 경우에는 기본적으로 json string 마지막에 `\n`을 포함한다는 것 같다.




### 참고 및 출처

- [공식 홈페이지 TCP issue discuss](https://discuss.elastic.co/t/logstash-to-logstash-via-tcp-is-slow-delayed-waiting-for-something/173299)
