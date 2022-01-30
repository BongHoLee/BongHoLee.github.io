---
layout: post
title: HashMap, TreeMap, LinkedHashMap
author: Bong5
categories: [Keywords, ProgramingLanguage/Java]
--- 

## HashMap, TreeMap, LinkedHashMap

---

`Map`은 `해시`라고도 하며 `Key-Value` 형태의 저장소다.

자바 `Collection API`의 일부지만 `List` 인터페이스와 달리 **Collections 인터페이스를 구현하지 않는다.**

물론 `INSERT, SEARCH, DELETE`를 위한 연산을 제공한다는 점은 유사하다.

<br>

### HashMap

`HashMap` 클래스는 **해시 테이블을 자바로 구현**한 것으로 `Entry`라는 내부 클래스가 존재한다.

그리고 내부적으로 `배열`과 `연결리스트`를 사용하여 충돌을 해결하는 `chaining` 기법을 사용한다.

이러한 이유 때문에 **최악의 경우 탐색 시간이 리스트의 길이 `O(N)`이 될 수 있다.**

<br>

### TreeMap

`TreeMap`은 내부적으로 `균형잡힌 이진 탐색 트리(Red-Black-Tree)`를 사용한다. 따라서 **트리의 각 노드가 KEY-VALUE 쌍이 된다.**

`TreeMap` 클래스는 정렬 가능한 순서에 따라 저장하기 때문에 `hashCode()` 메서드는 사용되지 않는다.

또한 `균형잡힌 이진 탐색 트리`이기 때문에 `삽입`, `삭제`, `검색` 모든 연산이 `O(logN)`의 성능을 갖는다.

TreeMap은 `KEY`를 기준으로 `정렬`한다. 물론 `Compartor`를 구현하여 정렬 방식을 바꿀 수 있다.

<br>

### LinkedHashmap

전체적인 구조는 `HashMap`과 동일하지만 `Entry` 객체가 `Before, After`에 대한 정보를 갖고 있어 **삽입 순서를 유지**한다.