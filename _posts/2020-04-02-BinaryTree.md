---
layout: post
title: 트리와 이진트리(인프런 강좌)
author: Bong5
categories: [Algorithms/Theory]
---

## 트리와 이진트리

---

**_계층적인 구조를 표현한다._**
  - 조직도
  - 디렉토리와 서브디렉토리 구조
  - 가계도

<img src="/assets/img/tree1.png" width="100%" height="auto">

---

## 트리의 기본적인 성질

- 노드가 `N`개인 트리는 항상 `N-1`개의 `링크`를 갖는다.

- 트리의 루트에서 어떤 노드로 가는 `경로는 유일하다.`

- 임의의 두 노드간 `경로는 유일하다.` (단 같은 노드를 두 번 이상 방문하지 않는다는 가정)

---

## 이진 트리 Binary tree

- `이진 트리`에서 각 노드는 `최대 2개의 자식`을 갖는다.

- 각각의 자식노드는 부모의 `왼쪽 자식`인지 `오른쪽 자식`인지가 지정된다.

### 이진 트리의 응용

**_1. Expression Tree_**
<img src="/assets/img/tree2.png" width="100%" height="auto">

**_2. Huffman code_**
<img src="/assets/img/tree3.png" width="100%" height="auto">

---

## Full and Complete Binary trees

<img src="/assets/img/tree4.png" width="100%" height="auto">

`Full Binary Tree`는 모든 노드가 `0개 또는 2개`의 자식 노드를 갖는 트리를 말한다.

`Complete Binary Tree`는 `마지막 레벨을 제외하고 모든 레벨이 완전히 채워져 있으며(2개의 자식 노드를 가지며) 마지막 레벨의 모든 노드들은 왼쪽부터 채워진다.`

---

## 이진 트리의 구조 - 연결 리스트 생각

**_이진 트리의 연결 구조 표현_**

<img src="/assets/img/tree5.png" width="100%" height="auto">

일반적인 이진트리를 표현할 때 연결구조(Linked Structure)로 표현한다. 단 `규칙성이 존재`하는 `Full Binary Tree`, `Complete Binary Tree`, `Binary Heap` 등은 `일차원 배열로 표현 가능`하다. 여기서 말하는 `규칙성`이란 왼쪽 자식, 오른쪽 자식 모두 존재하거나 자식이 아예 존재하지 않기 때문에 배열의 인덱스로 충분히 표현이 가능하다.

<img src="/assets/img/tree5.png" width="100%" height="auto">

위 그림은 규칙성이 존재하는 `Binary Heap`을 트리 구조와 배열로 표현한 그림이다. `인덱스`만 보면 누구의 부모/자식인지 판별 가능하므로 불필요하게 트리 노드를 구현할 필요가 없다.

- 루트 노드 = arr[1]
- arr[i]의 부모 = arr[i/2]
- arr[i]의 왼쪽 자식 = arr[2i]
- arr[i]의 오른쪽 자식 = arr[2i+1]
- 노드의 개수 = n


이와 같이 특수한 이진 트리를 제외한 일반적인 이진 트리의 경우 `규칙성`이 존재하지 않기 때문에 `객체`들의 연결 리스트로 표현하는 경우가 일반적인데 위의 그림과 같이 각 노드에 `data`, `left children 주소`, `right children 주소`, `parent 주소`를 저장하며, 부모 노드의 주소는 반드시 필요한 경우가 아니면 보통 생략한다.

---

## 이진 트리의 순회

여기서 말하는 `순회`란 이진 트리의 `모든 노드를 방문`하는 작업을 의미한다.

일반적인 이진 트리의 순회 알고리즘은 `4 가지`가 있다

- 중순위 순회 (In-order)
- 선순위 순회 (Pre-order)
- 후순위 순회 (Post-order)
- 레벨오더 순회(Level-order)

`레벨 오더 순회`를 제외한 나머지 순회는 주로 `Recursive`를 이용하고 레벨 오더 순회의 경우 `Queue`를 이용하는 것이 일반적이다.

<script src="https://gist.github.com/BongHoLee/b1f839fa67ff2705c408f405af1d1e5c.js"></script>


### 참고 및 출처
인프런 권오흠 교수님 강좌
