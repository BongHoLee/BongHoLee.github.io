---
title: "Spring AOP는 프록시 패턴일까? (TBU)"
description: "Spring이 AOP를 구현하기 위해 사용하는건 프록시 패턴일까요?"
pubDate: 2025-09-13
author: "Bong5"
tags: ["pattern", "spring"]
---
### TBU 문서

### Spring AOP

- Spring AOP는 프록시를 사용하여 횡단 관심사를 처리한다 ~ Advice
- 그런데 종종 '프록시 패턴을 사용'한다는 표현을 보곤 한다.
- '프록시'를 사용하는 패턴들은 프록시 패턴 말고도 여러가지가 있다
    - Decorator Pattern
    - Proxy Pattern
    - Adapter Pattern
    - Facade Pattern
    - Composite Pattern
    - Bridge Pattern
    ...
- 디자인 패턴을 구분할 때 가장 중요한것은 패턴의 '의도'이다.
    - 의도: 어떤 문제를 해결하기 위한 패턴인가?
- 이 중, 다른 패턴들은 의도가 명확한데, 프록시 패턴과 데코레이터 패턴은 그 모습이 거의 유사하여 혼동하기가 쉽다.


