---
layout: post
title: Framework/Library
author: Bong5
categories: [Keywords, ProgramingLanguage/Java, WEB/Basic]
---

## Framework/Library

---

면접에서도 단골질문이기도하고 피상적으로만 이해하고 있던 라이브러리와 프레임워크에 대해 이해하는 기회를 갖는다.

---

### **Framework**
프레임워크에서 가장 중요한 키워드는 **제어의 역전**이다.
즉 제어의 역전이 적용되어야 비로소 프레임워크의 자격을 갖추었다고 할 수 있겠다.

- 특징
  - 특정 개념들의 추상화를 제공하는 여러 **클래스**나 **컴포넌트**로 구성되어 있다.
  - 컴포넌트들은 재사용이 가능하다.
  - 추상적인 개념들이 문제를 해결하기 위해 같이 작업하는 방법을 정의한다.
  - 높은 수준에서 패턴들을 조작화 할 수 있다.

---

### **Library**
라이브러리는 단순 **활용가능한 도구**를 의미한다.
즉, 개발자가 만든 클래스에서 **호출하여 사용**, 클래스들의 나열로 필요한 클래스를 불러서 사용하는 방식을 취한다.

---

### 프레임워크와 라이브러리의 차이점.
앞서 말했듯 라이브러리와 프레임워크의 차이는 **제어의 흐름이 누구에게 있는가** 이다.
즉, 어플리케이션의 제어권을 누가 쥐고있느냐에 달려있다고 할 수 있겠다.

프레임워크는 전체적인 흐름을 스스로 쥐고있으며(제어의 역전) 사용자(개발자)는 그 안에서 필요한 코드를 짜 넣는다.

반면 라이브러리는 사용자가 직접 전체적인 흐름을 만들며 가져다 사용한다.

**라이브러리는 라이브러리를 가져다가 호출하고 사용하는 측에 전적으로 주도성이 있으며 프레임워크는 그 틀 안에 이미 제어의 흐름에 대한 주도성이 내포**


---

**라이브러리**를 사용하는 애플리케이션 코드는 애플리케이션 흐름을 **직접 제어**한다.
단지 동작하는 중에 필요한 기능이 있을때 **개발자가 능동적으로 라이브러리를 사용**할 뿐이다.
반면에 프레임워크는 거꾸로 애플리케이션 코드가 **프레임워크에 의해 사용**되는 것이다.
보통 프레임워크 위에 개발한 클래스를 등록해두고, 프레임워크가 흐름을 주도하는 중에 개발자가 만든 어플리케이션 코드를 사용하도록 만드는 방식이다.(컨테이너가 객체의 생명주기를 직접 관리하고 의존성을 주입하는 것도 같은 맥락이라고 볼 수 있을듯)

프레임워크는 분명한 **제어의 역전**개념이 적용되어 있어야 한다.
애플리케이션 코드는 프레임워크가 짜놓은 틀에서 **수동적으로 동작**해야 한다.

---
### INFO
**제어의 역전**이란 어떠한 일을 하도록 만들어진 프레임워크에 제어의 권한을 넘김으로써 클라이언트 코드가 신경써야 할 것을 줄이는 전략이다.

이것을 제어가 역전되었다 라고 한다. 일반적으로 라이브러리는 프로그래머가 작성하는 클라이언트 코드가 라이브러리의 메소드를 호출해서 사용하는 것을 의미한다.

**프레임워크를 규정하는 특성은 프레임워크의 메소드가 사용자의 코드를 호출한다는 것**

여기까지는 이해하기가 쉽지만 의문이 생긴다.

대체 **어떻게 프레임워크가 나의 메소드를, 클래스를 호출하는가?** 에대한 의문이다.

어떻게 하면 프레임워크가 나의 코드르 호출하는가? 프레임워크는 내가 작성한 코드를 알 리가 없는데?

제어를 역전시키는 (프레임워크가 나의 코드를 호출할 수 있게 하는) 가장 쉽게 생각할 수 있는 접근 방법은 **프레임워크의 Event, Deligate에 나의 메소드를 등록**시키는 것이다.

전달되는 인자와 반환 형식만 일치한다면 프레임워크 코드는 내가 작성한 객체와 타입을 고려하지 않는다. 등록된 메소드만 감지하여 실행 invoke 하는것.

다른 방법은 프레임워크에 정의되어있는 interface, abstract을 나의 코드에서 구현, 상속한 후 프레임워크에 넘겨주는 것이다.

프레임워크는 인터페이스와 추상을 알고 있으므로 내가 하고자 하는 일련의 작업을 처리할 수 있다.

이는 객체를 프레임워크에 주입하는 것이고 이를 의존성 주입이라고 한다.

---

위의 내용을 간단히 정리해 보면 **라이브러리는 그냥 함수들이나 기능 모음을 가져다가 쓰는것** 이고 **프레임워크는 특정 디자인 패턴이나 전처리/후처리에 필요한 동작과 기능들을 수행하기 위해서 프레임워크가 실행하다가 중간 중간에 특정 비지니스나 특정 구현 단에서만 사용자의 코드를 lookup(검색) 하여 사용하는 형태 라고 할 수 있다.

---

### 예시
일단 모든 소스든 라이브러리든 간에 메모리에 들어가는 정보는 컴파일러나 인터프리터에게는 호출가능한 **모듈**일 뿐이다.
이런 물리적인 계층이 아닌 그 위의 논리적인 계층을 봐야 한다.

**라이브러리는 톱, 망치, 삽같은 연장**이다.
**프레임워크는 차, 비행기, 배 같은 탈 것**이다.
사람이 타서 엔진을 켜고 기어를 넣고 핸들을 돌리고 조종을 해야한다.
도구를 쓸 때 급하면 썰어야 할 곳에 망치를 쳐도 되고 땅 파야 할 때 톱으로 땅을 긁어내도 된다. **사람은 도구를 선택하는 입장**이기 때문에 어떤 도구를 사용하든 원하는 것을 만들어 낼 수만 있으면 된다.

반면에 탈것은 정해진 곳으로만 다녀야 한다.
목적에 맞게 만들어져있고 규칙이 있기 때문에 그에 잘 따르기만 하면 된다.

라이브러리와 달리 프레임워크는 이미 **프로그래밍할 규칙이 정해져있다.**
예를 들어, 설정 파일로 XML에 어떤 태그를 써야하며, 어떤 함수를 추가적으로 작성해야 하고, 소스파일을 어느 위치에 넣어야 하며, DB와 연동하기 위해 무엇을 써넣어야 하는지 정해져 있다.

만약 프레임워크가 담당하는 부분이 내가 하고자 하는 목적과 다를 경우에는 어떻게 해아할까?
그렇다면 단순히 프레임워크를 잘못 가져다 쓴 것이다.
더 목적에 가까운 프레임워크를 찾아보면 대부분 있을 것이고 없거나 찾기 힘들다면 비슷한 프레임워크를 라이브러리 단계에서 변경해서 다른 프레임워크로 만들면 될 것이다.
차를 튜닝한 다음에 차를 다시 운전하면 된다는 것이라고 할 수 있겠다.
기능이 마음에 안드는 부분이 있다면 프레임워크를 고쳐서 사용 할 수도 있겠지.

###참고 및 출처
  - 자바 프로젝트 필수 유틸리티
