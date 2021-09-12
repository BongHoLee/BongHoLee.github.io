---
layout: post
title: 폰 노이만 아키텍쳐
author: Bong5
categories: [Keywords, Java]
---


## 폰 노이만 아키텍처
4개의 기본 하드웨어 구성요소
- 입력장치
- 출력장치
- 주기억장치(Main Memory)
 : 프로그램과 데이터를 모두 저장
- 중앙 처리 장치(CPU)
 : Control Unit + ALU

머신코드(Machine Code)
- 컴퓨터가 실제로 읽고, 해석하고, 실행하는 프로그램
CPU가 프로그램에 내재된 머신 인스트럭션을 실행
- ALU는 산술연산과 논리연산 처리
- Control Unit(CU)는 Main Memory에서 인스트럭션을 차례로 가져와서(FETCH) 해석(DECODE)하고 실행(EXECUTE)
- 다음에 가져올 인스트럭션의 주소는 CPU 내의 레지스터인 프로그램 카운터(Program Counter)에 저장되어 있음
