---
layout: post
title: Dependency(의존성)
author: Bong5
categories: [Keywords, Java]
---

## Dependency(의존성)

개발을 하면서 프레임워크도 사용해보고 직접 라이브러리를 관리도 해보면서 자주 만나는(주로 에러창..) 키워드 중 하나가 바로 의존성이었다.

개발을 하면서 자주 마주치게 되는 이 의존성(Dependency)은 이름 그대로 컴포넌트 및 모듈 혹은 클래스가 자신의 자원(변수 및 메소드)가 아닌 다른 개체의 자원을 사용하기 위해 참조하는 것을 의미한다.

아주 간단한 예시를 보면

<script src="https://gist.github.com/BongHoLee/84e8b4b0687382b1b36ee5852c7dcab2.js"></script>

위와 같이 Tv 객체 내에서 Speaker 객체의 자원을 사용하기 위해 참조하는 경우 Tv와 Speaker는 의존관계에 있다.

이럴때에 우리는 Speaker 클래스의 경로를 import 해주는 것으로 해결이 된다.
하지만 만일 Speaker 클래스 내부에서도 다른 객체의 자원을 사용하는 등 복잡한 의존성 문제가 있다면? 하나의 클래스가 수정되면 의존관계에 있는 다른 클래스도 수정을 해주어야 하는 현상이 발생할 수 있다.

우리가 직접 개발한 코드 사이에 의존성에 대한 문제를 해결해주어야 하는 것 처럼 우리가 사용하는 라이브러리 사이에도 의존성이 존재한다. (이는 이후 별도로 의존성 관리 도구에 대해서 포스팅하면서 다시 이야기를 하겠다.)

결과적으로 의존성이란 서로 다른 모듈 간의 관계로써 둘 중 하나가 다른 하나를 어떤 용도를 위해 사용하는 것을 의미한다. (Has-a 관계가 대표적)