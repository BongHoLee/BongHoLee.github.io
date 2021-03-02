---
layout: post
title: Logstash to Logstash (TCP) 트러블슈팅
author: Bong5
categories: [Others/PoC]
---

## 들어가며

업무에서 `Logstash`를 활용할 일이 생겨 개략적으로 학습했던 내용을 기록하려고 한다.

컨셉과 기본 개념은 좋은 자료들이 많아서 굳이 다루지 않고, 개인적으로 기억해야 할 내용들에 대해서만 개괄적으로 기록한다.

보다 자세한 내용과 자료는 페이지 최하단의 `참고 및 출처`를 확인하면 된다.

## Logstash

- `데이터 수집 및 처리`를 위한 `파이프라인`을 갖는 `Data Flow` 처리기

- `Input` ~ `Filter` ~ `Output`으로 이뤄지는 프로세스 처리

- 각 단계에서는 다양한 `Plugin`이 적용 가능하다.

- 하나의 Logstash Instance에 여러 pipeline 구축 가능 (`Multi Pipelines`)

- `Multiple Input, Multiple Output` 가능

- `Persistant Queue`로 설정 가능
  - 기본적으로는 `in-memory queue`로 설정되어 활용되기 때문에 장애에 취약한 부분이 있음
  - `Persistant Queue`로 활용함으로써 Input Data가 `Disk`에 저장되고 프로세서 처리 및 출력이 완료되고 난 뒤 `Persistant Queue`에 통지하는 방식이 가능
    - 만일 중간에 서버가 Shutdown 되는 등의 상황이 발생하게 되면 logstash 재시작 시 `Disk`에서 **아직 통지되지 않은 데이터를 재활용 가능(데이터 유실 X)**


## Logstash 설정 파일들

`Logstash`는 두 가지 타입의 `Configuration file`이 있다.

- **Pipeline Configuration Files(파이프라인 처리에 대해 정의)**
- **Settings Files(시작과 실행에 대한 옵션을 정의)**

여기서 `Pipeline Configuration Files`는 사용자 정의 파일로써, 일반적으로 `xxx.conf` 와 같은 이름을 갖는다.

그리고 `Settings Files`는 두 개의 파일로써 `logstash.yml`과 `pipeline.yml`파일이다.

1. **Pipeline Configuration Files**
  - `.conf` 파일로써 유저가 직접 생성한다. 파이프라인 프로세스 처리, 즉 `Input` ~ `Filter` ~ `Output`에 대하여 기술한 파일이다.
2. **Settings Files**
  - **config/logstash.yml**
    - `logstash`의 실행 제어를 위한 `옵션 설정 파일`이다.
    - pipeline 설정, configuration file 위치, 로깅 옵션 등과 같이 다양한 기본 설정이 가능하다.
    - `logstash` 실행 시 별도의 옵션을 주는 것과 같이 해당 파일에 기술하면 적용된다.
  - **config/pipeline.yml**
    - 기본적으로 `One instance, Multiple pipelines`를 위해 사용하는 설정 파일이다.
    - 파이프라인의 개수, 각 파이프라인의 ID, 각 파이프 라인의 conf 파일 등을 설정한다.
    - 명시적으로 설정되지 않은 설정 값들은 `logstash.yml` 파일에 지정된 기본 값으로 재설정된다.
    - `logstash`를 시작할 때 아무런 옵션 인자 없이 실행하면 자동으로 `pipeline.yml` 파일을 읽는다. 만일 읽지 않게끔 하려면 `-f`, `-e`와 같은 옵션을 주어 실행한다.


## JDBC Plugin의 한계

- DB 별 드라이버 설치가 필요하다.
- **Polling을 1초 단위로밖에 하지 못한다. Cron 스케쥴러 표현식 사용**


### 참고 및 출처

- [공식 홈페이지 한글 영상](https://www.elastic.co/kr/webinars/getting-started-logstash)
