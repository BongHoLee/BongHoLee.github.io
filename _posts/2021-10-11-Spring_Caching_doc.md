---
layout: post
title: Spring Cache 기본
author: Bong5
categories: [Keywords, WEB/Spring_Framework]
---

## Spring Cache

---

### Cache abstraction에 대한 이해

기본적으로 `캐싱`은 **반복적으로 접근하는 데이터에 대한 성능 향상**을 위해 사용된다.

`cache abstraction`은 **자바 method에 캐싱을 적용**하여 **데이터 소스에 대한 access 횟수를 줄인다.**

이 말의 의미는, **캐싱된 메서드가 호출될 때 마다 `cache abstraction`은 이전에 동일한 인자와 함께 메서드가 호출되었는지 여부를 확인한다.**

- 만일 **이미 동일 인자에 대한 메서드 호출이 캐싱**되었다면, `**실제 메서드 호출은 하지 않고!` 이미 캐싱된 결과를 반환한다.**
- 만일 **동일 인자에 대한 메서드 호출이 캐싱되어있지 않다면**, `**실제 메서드 호출 후 결과를 캐싱`하고 `이후 동일 인자에 대해` 실제 메서드 호출은 하지 않고 `캐싱 결과를 반환`한다.**

위와 같은 과정을 통해 **실제 메서드 호출 로직이 비용이 비싼 경우 이 비용을 절감할 수 있다.**

> **중요** : 위와 같은 **메서드 + 인자 캐싱**은 **동일 인자에 대해 동일한 결과를 보장**하는 경우에 유효하다.
>

이것 말고도 캐시와 관련된 여러 연산들(`캐싱된 요소를 업데이트`, `캐싱 요소들 삭제`)에 대해서 **Cache abstraction이 제공을 해준다.**

만일 **어플리케이션 런타임에 데이터가 바뀔 가능성이 있는 경우 위와 같은 연산들을 유용하게 쓸 수 있다.**

`Spring Framework`의 다른 서비스들처럼, `Caching service`는 일종의 `추상화`이다.

따라서 `cache-data`를 저장할 스토리지가 필요하다.

다시말해, 캐시 추상화은 개발자를 **캐시 로직 구현**으로부터 자유롭게 해주지만, **캐시 데이터 저장소를 제공해주지는 않는다.**

이 **캐시 추상화**는 `org.springframework.cache.Cache`와 `org.springframework.cache.CacheManager` 인터페이스들로 **구현 가능**하다.

기본적으로 `ConcurrentMap`, `Ehcache`, `Caffeine` 등과 같이 **추상화를 구현하는 구현체**들이 존재한다.

> **중요**: `Caching abstraction`은 멀티 프로세스, 멀티 스레드를 다루기 위한 별도의 환경을 제공하지 않기 때문에 `구현체`에서 해결해야 한다.
>

<br>

### 유의

`캐시 추상화`을 사용하기 위해서 개발자는 다음의 두 가지를 유의해야 한다.

- **Caching declaration** : 캐싱을 하기 위한 `메서드`를 식별
- **Cache configuration** : 캐시를 `읽고 저장`할 `데이터 스토리지` 마련

<br>

### 어노테이션 기반의 Cache Declaration

캐시 선언을 위해서 `abstraction`은 몇 가지의 자바 어노테이션을 제공한다.

- `@Cacheable` : 캐싱 채우기?
    - `캐싱` 대상이 되는 메서드를 지정한다. 그러면 해당 `메서드` 실행 시 결과를 `캐시`에 저장하고 이후 **동일한 `arguments`**로 재호출 시 **실제 메서드를 실행하지 않고 캐싱된 결과가 반환된다.**
    - 이 어노테이션에는 캐싱 데이터 구분을 위한 `이름`이 필요하다.

<script src="https://gist.github.com/BongHoLee/bcdeecddf1d4d8cbdbae84acb40c2be5.js"></script>

`findBook` 메서드는 `books`라는 **캐시 이름**과 연동된다. 메서드 호출 시 마다 캐시는 **이미 호출이 되어서 반복 호출할 필요가 없는지**를 확인한다.

대부분의 경우에 `하나의 캐시(books)`만 선언되는데, 가끔 가다 여러개의 캐시가 필요할 때가 있다.

그런 경우 `findBook` 호출 시 마다 **해당 캐시들(books, isbns)을 모두 확인**하는 과정을 거친다. 이 중 **만일 하나라도 캐싱된 데이터가 존재한다면(`hit`) 해당 데이터가 반환된다.**

<br>

### Default Key 생성

`cache`는 기본적으로 `key-value` 저장소이기 때문에, 캐싱된 메서드 호출 시 **캐시에 접근하기 위한 `key`**가 필요하다.

`caching abstraction`은 기본적으로 간단한 **KeyGenerator** 기반의 알고리즘을 사용한다.

- 파라미터가 없는 경우, `SimpleKey.EMPTY`를 사용
- 파라미터가 한 개 존재한는 경우, 해당 파라미터를 `Key`로 사용
- 파라미터가 한 개 이상 존재하는 경우, `모든 파라미터가 포함된 SimpleKey`를 사용

만일 각 파라미터들이 `hashCode()`, `eqauls()`를 구현한다면 이상 없이 잘 동작하지만, 그렇지 않은 경우 별도의 알고리즘을 사용해야한다.

별도의 알고리즘 구현을 위해 `org.springframework.cache.interceptor.KeyGenerator` interface를 제공한다.

<br>

### Caching key 지정

메서드의 인자로 간단히 캐싱하기가 애매한 경우가 존재한다.

이를테면 **메서드에 여러 인자가 존재하지만 이 중 일부 인자만 캐싱에 사용되는 경우**를 들 수 있다.

<script src="https://gist.github.com/BongHoLee/72954428f5a798cf66b9263e41fd8a3a.js"></script>

위 메서드 인자를 보면, **두 개의 `boolean` 변수가 존재**하지만 `캐싱`에 사용되지는 않는다. (`equals()`, `hashCode()`를 구현하지 않는 인자이기 때문에)

만일 둘 중 하나는 `중요`한 변수고 다른 하나는 `중요하지 않은`변수라면 어떻게 캐싱을 해야할까?

이를 위해 `@Cacheable` 어노테이션은 `key` 속성을 이용해서 `key` 생성을 위한 방법을 지정할 수 있다.

`SpEL`을 사용해서 `캐싱을 위해 사용될 파라미터`를 선택하거나 어떤 연산을 사용하거나, 임의의 메서드 실행 결과를 `key`의 구성으로 사용할 수 있다.

<script src="https://gist.github.com/BongHoLee/f947604524f8a5017dda3f208b3fb6ff.js"></script>

<br>

### 캐싱 조건 설정

캐시 어노테이션은 `SpEL` 기반의 파라미터를 이용하여 조건을 설정할 수 있다. 만일 설정된 조건이 `true`면 **캐싱**이 되고 `false`면 캐싱되지 않는다.

<script src="https://gist.github.com/BongHoLee/386af96d2390c9623e5dd8cb5283e6ab.js"></script>

또한 `unless` 키워드를 활용해서 조건을 추가할 수 있다. 단, `unless`는 **메서드 실행 이후**에 조건 검사를 실행하여 **캐싱 여부**를 결정한다.

<script src="https://gist.github.com/BongHoLee/334e70b7e88f26acbddea79adc224b69.js"></script>

위 예제에서 인자로 전달된 `name`의 길이가 `32` 미만인 경우, 결과 `Book 인스턴스`의 `hardback`의 상태가 `true`라면 캐싱을 하고 아니라면 캐싱을 하지 않는다.

<br>

## @CachePut 어노테이션

어떤 메서드 실행 시 `cache 업데이트`가 필요할 때 `@CachePut` 어노테이션을 사용할 수 있다.

`@CachePut` 어노테이션이 선언된 메서드는 항상 실행되고, 그 결과는 `캐시`에 반영이 된다.

<script src="https://gist.github.com/BongHoLee/47c2877af3e976feecaf876c3b12bea1.js"></script>

<br>

## @CacheEvict 어노테이션

`cache abstraction`은 `캐시 저장`뿐 아니라 `캐시 제거`도 지원한다. 이 기능은 **캐시 내 오래되어 필요 없어진 데이터** 제거에 유용하다.

<script src="https://gist.github.com/BongHoLee/3ca00d67ed52179e9f526793fae47180.js"></script>

`allEntries` 키워드는 **캐시 내 모든 데이터 제거**에 유용하다.

<br>

### @CacheConfig 어노테이션

메서드 단위가 아닌 **클래스 단위**로 캐싱 설정을 하고 싶다면 `@CacheConfig`가 유용하다.

이 어노테이션이 선언된 클래스의 내부 요소들은 **캐시 설정(캐시 이름 등)**을 공유한다.

<script src="https://gist.github.com/BongHoLee/b8d108f42dbbdbcb16b781c74d4c5734.js"></script>

<br>

### 참고

- [https://docs.spring.io/spring-framework/docs/4.3.15.RELEASE/spring-framework-reference/html/cache.html](https://docs.spring.io/spring-framework/docs/4.3.15.RELEASE/spring-framework-reference/html/cache.html)
- [https://www.baeldung.com/spring-cache-tutorial](https://www.baeldung.com/spring-cache-tutorial)