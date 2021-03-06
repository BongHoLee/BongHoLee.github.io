---
layout: post
title: Programmers(KAKAO) 2018_파일명_정렬
author: Bong5
categories: [Algorithms/Programmers]
---

### 문제 설명

[문제 출처](https://programmers.co.kr/learn/courses/30/lessons/17686)

세 차례의 코딩 테스트와 두 차례의 면접이라는 기나긴 블라인드 공채를 무사히 통과해 카카오에 입사한 무지는 파일 저장소 서버 관리를 맡게 되었다.

저장소 서버에는 프로그램의 과거 버전을 모두 담고 있어, 이름 순으로 정렬된 파일 목록은 보기가 불편했다. 파일을 이름 순으로 정렬하면 나중에 만들어진 `ver-10.zip`이 `ver-9.zip`보다 먼저 표시되기 때문이다.

버전 번호 외에도 숫자가 포함된 파일 목록은 여러 면에서 관리하기 불편했다. 예컨대 파일 목록이  **_[img12.png, img10.png, img2.png, img1.png]_** 일 경우, 일반적인 정렬은 **_[img1.png, img10.png, img12.png, img2.png]_** 순이 되지만, 숫자 순으로 정렬된 **_[img1.png, img2.png, img10.png, img12.png"]_** 순이 훨씬 자연스럽다.

무지는 단순한 문자 코드 순이 아닌, 파일 명에 포함된 숫자를 반영한 정렬 기능을 저장소 관리 프로그램에 구현하기로 했다.

소스 파일 저장소에 저장된 파일 명은 100 글자 이내로, 영문 대소문자, 숫자, 공백(" "), 마침표(.), 빼기부호(-)만으로 이루어져 있다.

파일 명은 영문자로 시작하며, 숫자를 하나 이상 포함하고 있다.

파일 명은 크게 `HEAD`, `NUMBER`, `TAIL` 세 부분으로 구성된다.

- `HEAD`는 숫자가 아닌 문자로 이루어져 있으며, 최소한 한 글자 이상이다.
- `NUMBER`는 한 글자에서 최대 다섯 글자 사이의 연속된 숫자로 이루어져 있으며, 앞쪽에 0이 올 수 있다. `0` 부터 `99999` 사이의 숫자로 `00000` 이나 `0101` 등도 가능하다.
- `TAIL`은 그 나머지 부분으로, 여기에는 수자가 다시 나타날 수도 있으며, 아무 글자도 없을 수 있다.

| 파일명 | HEAD | NUMBER | TAIL |
|---|---|---|---|
| foo9.txt | foo | 9 | .txt |
| foo010bar020.zip	 | foo | 010 | bar020.zip |
| F-15 | F- | 15 | (빈 문자열) |

- 파일 명은 우선 `HEAD` 부분을 기준으로 사전 순으로 정렬한다. 이 때, 문자열 비교 시 대소문자 구분을 하지 않는다. `MUZI`와 `muzi`, `MuZi`는 정렬 시에 같은 순서로 취급된다.

- 파일 명의 `HEAD` 부분이 대소문자 차이 외에는 같을 경우, `NUMBER`의 숫자 순으로 정렬한다. 9 < 10 < 0011 < 012 < 13 < 014 순으로 정렬된다. 숫자 앞의 0은 무시되며, 012와 12는 정렬 시에 같은 값으로 처리된다.

- 두 파일의 `HEAD` 부분과 `NUMBER`의 숫자도 같을 경우, 원래 입력에 주어진 순서를 유지한다. `MUZI01.zip`과 `muzi1.png`가 입력으로 들어오면, 정렬 후에도 입력 시 주어진 두 파일의 순서가 바뀌어서는 안된다.

**_입력 형식_**

입력으로 배열 `files`가 주어진다.

- `files`는 100개 이하의 파일 명을 포함하는 문자열 배열이다.

- 각 파일 명은 100 글자 이하 길이로, 영문 대소문자, 숫자 공백(" "), 마침표(.), 빼기 부호(-)만으로 이루어져 있다. 파일 명은 문자로 시작하며, 숫자를 하나 이상 포함하고 있다.

- 중복된 파일 명은 없으나, 대소문자나 숫자 앞부분의 0 차이가 있는 경우에는 함께 주어질 수 있다. (`muzi1.txt`, `MUZI1.txt`, `muzi001.txt`, `muzi1.TXT`는 함께 입력으로 주어질 수 있다.)


---

### Solution

문제를 잘 읽고 그대로 코드로 옮기기만 하면 되는, 즉 `구현`만 잘 하면 되는 간단한 문제이다.

한 가지 필요한 것은 `정렬`의 조건을 만족하기 위한 구현인데, 나 같은 경우 `JAVA` 사용자 이기 때문에 `List.sort(new Compartor<E>)`를 구현하여 사용하였다.

각 파일 명을 `HEAD`, `NUMBER`로 구분 하고 먼저 `HEAD`를 비교 후 동일하다면 `NUMBER`를 비교, 모두 같다면 들어온 순서대로 정렬을 마친다. `TAIL`의 경우 정렬의 조건에서 제외되기 때문에 신경 쓸 필요가 없다.

---


### Code

<script src="https://gist.github.com/BongHoLee/cf80286a46b0fd4cc253dc642c9fb8b1.js"></script>


---

### 몇줄 평

정렬에 대한 구현력이 필요한 문제였다.

---



### 참고 및 출처
