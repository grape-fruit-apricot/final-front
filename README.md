<div align="center">

# 딱 중간 · Frontend

**출발지가 다른 사람들이 만남 장소와 식당을 함께 정하는 모바일 웹**

방을 만들고 링크로 모여, 중간 지점을 찾고 식당을 고르고 게임으로 정한 뒤
각자의 경로까지 한 화면 안에서 이어집니다.

<br>

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7.18-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.19-5A29E4?style=flat-square&logo=axios&logoColor=white)
![STOMP](https://img.shields.io/badge/STOMP.js-7.3-010101?style=flat-square&logo=socketdotio&logoColor=white)
![SockJS](https://img.shields.io/badge/SockJS-1.6-E34F26?style=flat-square)
![Kakao Maps](https://img.shields.io/badge/Kakao%20Maps%20SDK-FFCD00?style=flat-square&logo=kakao&logoColor=black)
![Pretendard](https://img.shields.io/badge/Pretendard-2D2D2D?style=flat-square)
![oxlint](https://img.shields.io/badge/oxlint-1.79-6B7280?style=flat-square)
![Node](https://img.shields.io/badge/Node-24-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=flat-square&logo=amazonec2&logoColor=white)
![AWS ALB](https://img.shields.io/badge/Application%20Load%20Balancer-8C4FFF?style=flat-square&logo=awselasticloadbalancing&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)

<br>

**2026.08 - 2026.09 · 4인 팀 프로젝트**

[프로젝트 개요](#1-프로젝트-개요) · [화면 흐름](#2-화면-구성) · [구현 포인트](#구현-포인트) · [배포 환경](#6-운영--배포-환경)

</div>

---

## 1. 프로젝트 개요

### 1.1 기획 배경

여러 명이 모일 때 장소를 정하는 과정은 대화로 조율되고, 그만큼 시간이 걸립니다.
출발지가 다르면 누군가는 항상 더 멀리 이동하게 되는데도, 그 사실이 드러나지 않은 채 결정되는 경우가 많습니다.

**딱 중간**은 이 결정을 계산으로 대신하고, 남은 선택은 게임으로 끝냅니다.
이 저장소는 그 흐름을 **모바일 웹 화면**으로 만든 프론트엔드입니다.

### 1.2 화면이 풀어야 했던 문제

<table>
  <thead>
    <tr><th>상황</th><th>화면에서 한 일</th></tr>
  </thead>
  <tbody>
    <tr><td>가입 없이 링크만으로 들어온다</td><td>참가자 식별값을 <code>localStorage</code> 에 두고, 방 안의 모든 화면이 같은 키를 읽는다</td></tr>
    <tr><td>여러 명의 행동이 동시에 일어난다</td><td>방 · 멤버 · 채팅 세 탭이 소켓 연결 하나를 나눠 쓰며 같은 상태를 본다</td></tr>
    <tr><td>새로고침으로 화면이 날아간다</td><td>방의 진행 단계를 읽어 지도 · 투표 · 게임 · 결과를 그 자리부터 되살린다</td></tr>
    <tr><td>휴대폰으로 지도를 보며 쓴다</td><td>430px 기준 모바일 우선, 지도 위로 올라오는 시트와 떠 있는 탭바</td></tr>
  </tbody>
</table>

### 1.3 서비스 소개

다음 단계가 앞 단계의 결과 위에서만 열리도록 만들었습니다.

> **방 생성 · 링크 입장 → 중간 지점 → 식당 선택 → 진행 방식 투표 → 게임 → 결과 확정 → 경로 안내 → 이동 추적**

화면 8종, 라우트 12개, 훅 25개, 컴포넌트 49개로 구성되어 있고,
서버와는 **REST 조회 + STOMP 실시간**이라는 두 가지로만 동작합니다.

---

## 2. 화면 구성

<p align="center">
  <img width="3040" height="2002" alt="image" src="https://github.com/user-attachments/assets/67dcc261-a3ca-4e78-a2dc-e1da5d66cf79" />
</p>

딱! · 멤버 · 채팅은 **같은 공간 안에서 내용만 바뀌는 구조**입니다.
탭을 눌러도 공간(`RoomLayout`)은 그대로 있고 가운데 내용만 갈아 끼워집니다.

그래서 세 화면이 같이 써야 하는 것 — **서버와의 연결, 참가자 목록** — 을 공간이 가지고 있습니다.
화면마다 따로 들고 있으면 탭을 옮길 때마다 새로 만들어야 하고, 값도 서로 어긋납니다.

---

## 3. 주요 기능

<table>
  <thead>
    <tr><th>화면</th><th>주요 기능</th></tr>
  </thead>
  <tbody>
    <tr><td>랜딩 · 방 생성</td><td>정원 선택(2~10명), 지도에서 출발지 지정, 방 코드 · 초대 링크 복사</td></tr>
    <tr><td>입장</td><td>방 코드 입력, 닉네임 중복 · 정원 초과 · 이미 시작된 방을 사유별로 안내</td></tr>
    <tr><td>딱! (메인)</td><td>중간 지점 지도, 주변 식당 목록 · 검색 · 추가, 1인 1표 선택, 진행 방식 투표, 보물 주머니 게임, 결과와 경로</td></tr>
    <tr><td>멤버</td><td>참가자 목록, 각자 고른 식당과 중간지점까지의 거리, 남은 자리와 초대 링크</td></tr>
    <tr><td>채팅</td><td>실시간 메시지, 재연결 시 놓친 구간 보충, 참가자 스트립</td></tr>
    <tr><td>결과 · 경로</td><td>확정 식당 카드, 참가자별 경로, 도보 · 대중교통 전환, 구간별 색 구분, 지도 링크 공유</td></tr>
    <tr><td>이동 추적</td><td>라즈베리파이 좌표를 받아 궤적과 남은 거리 · 도착 여부 표시</td></tr>
  </tbody>
</table>

---

## 4. 핵심 구현 상세

### 4.1 탭을 옮겨도 끊기지 않는 소켓

<p align="center">
<img width="3040" height="1570" alt="image" src="https://github.com/user-attachments/assets/3474c05f-f803-4e00-a430-48bec1600c07" />
</p>

탭을 누르면 보고 있던 화면은 없어지고 새 화면이 만들어집니다.
이때 **화면마다 서버와의 연결을 따로 열어두면, 화면이 없어질 때 그 연결도 같이 끊깁니다.**

서버 입장에서는 연결이 끊긴 것과 사람이 방을 나간 것이 구분되지 않습니다.
그래서 채팅 탭을 한 번 눌렀을 뿐인데 **게임에서 내 차례가 넘어가 버립니다.**

이걸 막으려고 연결을 화면 안에 두지 않고, **화면 바깥에 하나만 만들어 세 화면이 한 연결을 같이 씁니다.**

```js
// roomUuid + participantId 조합마다 연결을 하나만 열어 두고 화면들이 나눠 쓴다
const socketRegistry = new Map()

// 마지막 화면이 사라진 뒤 실제로 끊기까지 기다리는 유예(ms)
const TEARDOWN_DELAY = 300
```

- 마지막 화면이 없어져도 연결을 바로 끊지 않고 **0.3초 기다립니다.** 탭을 옮기는 중이라면 그 사이에 새 화면이 들어오고, 그러면 기다리던 것을 취소하고 쓰던 연결을 그대로 씁니다
- 0.3초보다 길게 기다리면 **정말로 방을 나간 사람의 차례가 그만큼 늦게 넘어갑니다.** 탭 전환을 넘기기에는 충분하면서 가장 짧은 값으로 잡았습니다
- 화면은 **자기가 듣고 있던 것만 끊습니다.** 연결 자체는 남아서 다음 화면이 그대로 이어받습니다
- 연결이 끊겼다 다시 붙으면 서버는 **누가 무엇을 듣고 있었는지 잊습니다.** 그래서 다시 붙는 순간 열려 있는 화면 전부를 다시 등록하고, 각 화면이 끊긴 동안 놓친 내용을 따로 받아옵니다

### 4.2 새로고침해도 그 자리부터

실시간 방송은 지나가면 다시 오지 않습니다. 새로고침한 사람은 그동안의 방송을 통째로 놓칩니다.
그래서 **방의 진행 단계를 읽어 필요한 것만 다시 조회**합니다.

| 단계 | 다시 읽는 것 |
| :--- | :--- |
| 중간 지점 좌표가 있으면 | 지도를 그 좌표로 복원 |
| `MODE_SELECTED` · `RESOLVING` | 투표 현황 |
| `GAME_PLAYING` | 주머니 상태 · 차례 · 남은 시간 |
| `RESOLVED` | 확정 결과 · 참가자별 경로 · 이동 추적 |

서버가 보내는 실시간 알림은 **그때 듣지 못하면 다시 오지 않습니다.**
새로고침한 사람은 그동안 오간 내용을 통째로 못 받습니다.

그래서 화면을 켤 때 **방이 지금 어느 단계인지 먼저 확인하고, 그 단계에 필요한 것만 다시 불러옵니다.**

### 4.3 상태를 소유한 곳을 나눈다

메인 화면 하나에 중간지점 · 식당 · 투표 · 게임 · 결과가 모두 들어갑니다.
이것을 한 컴포넌트에 두면 `useState` 가 스무 개 넘게 생기므로, **기능마다 분리**했습니다.

```
useMainRoomSocket          ← 연결 계층. 상태를 직접 갖지 않는다
 ├ useMidpointActions      중간지점
 ├ useRestaurantSelection  식당 목록 · 선택
 ├ useGameActions          투표 · 게임
 ├ useResultActions        결과 · 경로 · 추적
 └ useRoomState            최초 복원 조회 (로딩 · 오류만 소유)
```

연결 계층은 소켓 이벤트를 각 소유자에게 넘겨줄 뿐이고,
페이지에는 **표시 값과 사용자 동작만** 내보냅니다. 복원 함수와 내부 setter 는 밖으로 나가지 않습니다.

### 4.4 지도 SDK는 앱 전체에서 한 번만

지도를 쓰는 화면이 열릴 때마다 카카오맵 스크립트를 새로 불러오면, 같은 파일을 여러 번 내려받게 됩니다.
게다가 불러올 때마다 **지도 기능이 다시 설치되면서 앞서 만들어 둔 것을 덮어씁니다.**

그래서 스크립트는 앱에서 **딱 한 번만 받고**, 이후 화면들은 그 결과를 나눠 씁니다.

```js
// 로드가 끝난 프라미스를 모듈 수준에 들고 있다가 이후 호출자에게 그대로 넘겨준다
let loadPromise = null
```

- 한 번 실패해도 **"실패했다"는 사실을 기억해 두지 않습니다.** 기억해 두면 잠깐 네트워크가 끊겨 실패한 경우에도 새로고침하기 전까지 지도가 영영 뜨지 않습니다. 실패하면 흔적을 지워서 다음에 다시 시도할 수 있게 합니다
- 지도를 그릴 데이터가 없으면 로드를 시작하지 않습니다
- 지하철 구간은 **노선색을 그대로** 씁니다. 버스색이 같은 경로의 지하철색과 색상 계열이 겹치면 다른 색으로 대체해 구간이 섞여 보이지 않게 했습니다

### 4.5 색은 대비를 먼저 맞추고 정했다

카카오맵에는 어두운 지도가 없어서 **지도는 항상 밝습니다.**
앱 배경을 어둡게 하면 지도만 눈부신 사각형이 되기 때문에, 배경도 밝은 아이보리로 맞췄습니다.

그 위에 올라가는 글자는 배경과 충분히 차이가 나야 읽힙니다.
그래서 색을 고르기 전에 **대비부터 계산했습니다.** (4.5:1 은 웹 접근성 기준 AA 의 최소값입니다)

```css
--color-point-orange: #d2401c;   /* 채움 · 흰 글자 4.7:1 */
--color-accent-ink:   #b83a14;   /* 아이보리 위 글자 5.1:1 */
```

같은 주황이라도 **쓰는 자리에 따라 값이 다릅니다.**
`#d2401c` 를 버튼 배경으로 깔고 흰 글자를 얹으면 기준을 넘지만,
같은 색을 아이보리 배경 위 **글자색**으로 쓰면 4.15:1 로 기준에 못 미칩니다.
그래서 글자로 쓸 때는 한 단계 어두운 `#b83a14` 를 씁니다.

보통 글꼴은 숫자마다 폭이 달라서, `1` 이 `8` 로 바뀌면 글자가 미세하게 밀립니다.
남은 시간처럼 1초마다 바뀌는 숫자에서는 화면이 덜컹거려 보입니다.
그래서 시간과 인원수에는 **폭이 고정된 숫자 모양**을 씁니다.

---

## 기술 스택

| 구분 | 기술 스택 | 활용 내용 |
| :--- | :--- | :--- |
| **Core** | React **19.2**, Vite **8.2** | 함수형 컴포넌트와 훅 기반 구성, 개발 서버 및 번들 빌드 |
| **Routing** | React Router **7.18** | 중첩 라우트, 방 존재 확인 가드, `Outlet` 컨텍스트로 공통 상태 전달 |
| **Styling** | Tailwind CSS **4.3**, Pretendard | `@theme` 토큰으로 색 · 반경 · 그림자 · 타이포 관리, 커스텀 CSS 없이 구성 |
| **HTTP** | axios **1.19** | 공통 응답 `{ code, message, data }` 에서 `data` 만 꺼내는 인터셉터, 서버 오류 시 오류 화면 이동 |
| **실시간 통신** | @stomp/stompjs **7.3**, sockjs-client **1.6** | 방 단위 토픽 구독, CONNECT 헤더 인증, 커넥션 공유와 자동 재연결 |
| **지도** | 카카오맵 JS SDK | 출발지 선택, 중간 지점 · 경로 · 이동 추적 표시, 구간별 노선색 |
| **Lint · Test** | oxlint **1.79**, `node --test` | 훅 규칙 검사, 입장 오류 분류 로직 단위 테스트 |
| **Infra** | Nginx, Docker Compose, AWS EC2 · ALB | SPA fallback 과 캐시 정책, 운영 · 개발 컨테이너 분리 |
| **CI/CD** | GitHub Actions | PR 빌드 검증 · 시크릿 유출 검사, 빌드 후 원자적 교체 배포 |
| **Collaboration** | Git, GitHub, Figma, Notion, Postman, slack | 브랜치 기반 협업, 화면 설계, API 규격 합의 |

### 설계 원칙

### 설계 원칙

- **CSS 파일을 따로 만들지 않습니다.** 글꼴과 배경색만 한 곳에서 걸고, 나머지 스타일은 전부 클래스로 씁니다. 스타일 파일이 여러 개면 같은 색이 여기저기 다른 값으로 적히고, 나중에 한 곳만 고쳐서 화면마다 색이 달라집니다.
- **여러 화면이 같이 보는 값은 한 곳에서만 가져옵니다.** 참가자 목록은 딱! 탭과 멤버 탭이 같이 봅니다. 각자 가져오면 한쪽은 4명, 다른 쪽은 5명으로 보이는 순간이 생깁니다. 그래서 `RoomLayout` 이 한 벌만 들고 두 화면에 내려줍니다.
- **내 참가자 번호를 저장하는 이름은 한 곳에서만 정합니다.** 방 안의 여러 화면이 이 값을 읽는데, 이름 규칙을 각자 적으면 한 군데만 오타가 나도 그 화면에서만 "입장하지 않은 사람"이 됩니다.
- **방을 옮기면 이전 방의 응답은 버립니다.** 서버 응답은 보낸 순서대로 오지 않습니다. A방을 나와 B방에 들어갔는데 A방 응답이 뒤늦게 도착하면, B방 화면에 A방 내용이 찍힙니다. 그래서 화면을 떠날 때 표시를 남겨 두고 늦게 온 응답은 무시합니다.
- **고르는 것과 보내는 것을 나눕니다.** 식당이나 투표를 누르면 화면 표시만 바뀌고 서버로는 아직 가지 않습니다. 아래 확정 바를 눌러야 전송됩니다. 스치기만 해도 전송되면, 되돌리기 어려운 선택이 실수로 확정됩니다.

---

## 5. 시스템 아키텍처

<p>
<img width="3040" height="2166" alt="image" src="https://github.com/user-attachments/assets/a66aa274-11ca-4dfe-b51d-41f2ba97e718" />
<p>

**행위는 소켓으로만 보내고, 조회는 REST로 합니다.**
소켓만 쓰면 새로고침한 사람이 지나간 방송을 받을 수 없고, REST만 쓰면 다른 사람의 행동이 실시간으로 보이지 않기 때문입니다.

---

## 6. 운영 · 배포 환경

| 구분 | 적용 기술 | 적용 내용 |
| :--- | :--- | :--- |
| 정적 서빙 | Nginx (Docker) | `dist` 를 bind mount, TLS 는 앞단 ALB 가 처리하므로 평문 80만 수신 |
| 라우팅 | Nginx SPA fallback | `/join/:roomUuid` 같은 초대 링크로 바로 들어와도 라우터가 받도록 `index.html` 제공 |
| 캐시 | Nginx | 해시가 붙은 `/assets/` 는 1년 영구 캐시, `index.html` 은 캐시 금지 |
| 환경 분리 | GitHub Actions | `main` → 운영, `develop` → 개발. 브랜치에서 API 주소를 계산해 빌드 |
| 배포 | scp + 배포 스크립트 | 디렉터리째 바꾸지 않고 **마운트된 디렉터리 안쪽 내용만** 교체 |
| 롤백 | `dist.prev` | 직전 버전을 보관해 재빌드 없이 되돌릴 수 있음 |

### 배포에서 신경 쓴 것

- **`/assets/` 에 `try_files $uri =404` 를 둡니다.** 이게 없으면 SPA fallback 이 걸려서, 사라진 해시 파일 요청에 `index.html` 이 `.js` 로 내려갑니다. 배포 직후 이전 페이지를 열어둔 사용자가 정확히 이 경우에 걸리고, 증상은 브라우저 콘솔에만 보입니다.
- **디렉터리를 `mv` 로 갈아끼우지 않습니다.** Compose 의 bind mount 는 컨테이너를 띄울 때 정해진 디렉터리 자체를 가리키므로, 바깥에서 통째로 바꾸면 컨테이너는 계속 옛 디렉터리를 봅니다. `rsync` 를 두 번 돌려 **채운 뒤 지웁니다** — 새 `index.html` 이 보이는 시점에는 그것이 참조하는 파일이 이미 있습니다.
- **빈 환경변수를 배포 전에 잡습니다.** Vite 는 값이 비어도 빌드에 성공합니다. 그대로 나가면 API 호출이 자기 자신으로 가서 전부 404가 되고, 소켓 주소는 `undefined/ws` 가 됩니다. 둘 다 콘솔에만 보이는 증상이라 워크플로에서 먼저 막습니다.
- **배포 후 응답을 확인합니다.** 최대 60초 동안 200을 기다리고, 실패하면 컨테이너 로그를 남기며 배포를 실패로 처리합니다.

---

## 구현 포인트

<table>
  <tbody>
    <tr>
      <td width="180"><b>커넥션 공유</b></td>
      <td>방 · 멤버 · 채팅 탭이 <b>소켓 하나를 나눠 씁니다.</b> 탭을 옮겨도 연결이 끊기지 않아 게임 차례가 넘어가지 않습니다.</td>
    </tr>
    <tr>
      <td><b>진행 단계 복원</b></td>
      <td>새로고침하면 방의 <b>진행 단계를 읽어</b> 지도 · 투표 · 게임 · 결과 중 필요한 것만 다시 조회합니다.</td>
    </tr>
    <tr>
      <td><b>상태 소유 분리</b></td>
      <td>기능마다 훅이 <b>자기 상태를 소유</b>하고, 연결 계층은 이벤트를 넘겨주기만 합니다. 페이지에는 표시 값과 동작만 갑니다.</td>
    </tr>
    <tr>
      <td><b>실시간 채팅</b></td>
      <td>마지막 <code>messageId</code> 를 커서로 두고, 재연결할 때마다 <b>놓친 구간만</b> 받아 메웁니다.</td>
    </tr>
    <tr>
      <td><b>지도 · 경로 표시</b></td>
      <td>SDK 를 앱 전체에서 한 번만 받고, 경로는 <b>구간별 노선색</b>으로 그려 도보와 대중교통을 눈으로 구분합니다.</td>
    </tr>
    <tr>
      <td><b>오류 화면 분기</b></td>
      <td>서버 오류 · 없는 방 · 입장 불가를 <b>사유별로 다른 화면</b>에 보냅니다. "실패했습니다" 하나로 뭉뚱그리지 않습니다.</td>
    </tr>
  </tbody>
</table>

---

## 7. 개발 기간 및 팀 구성

- **기간:** 2026.08 - 2026.09 (6주)
- **인원:** 4명
- **방식:** 프론트엔드 · 백엔드 저장소 분리, 기능별 브랜치와 Pull Request 기반 협업

| 팀원 | 주요 담당 | GitHub |
| :---: | :--- | :---: |
| **신순주** | 프로젝트 총괄·일정 관리, 카카오·Tmap 지도, 중간지점·최종결과 안내 화면, 로고 제작, 코드 리팩토링 | [![GitHub](https://img.shields.io/badge/GitHub-grape--fruit--apricot-F59E0B?style=flat-square&logo=github&logoColor=white)](https://github.com/grape-fruit-apricot) |
| **박경환** | 초기화면 및 공통 모듈 설계, 식당 조회·추가·선택 화면, 게임 화면 구현, 실시간 이동 추적 화면 | [![GitHub](https://img.shields.io/badge/GitHub-ghksl0204--shapa-22C55E?style=flat-square&logo=github&logoColor=white)](https://github.com/ghksl0204-shapa) |
| **남지호** | 실시간 채팅 화면, 웹소캣 요청 구조 설계, 화면 UI 스타일링, 산출물 문서 작성 | [![GitHub](https://img.shields.io/badge/GitHub-jiho0828-FF6B6B?style=flat-square&logo=github&logoColor=white)](https://github.com/jiho0828) |
| **지세웅** | 미니게임 설계, 오류 케이스 작성, 테스트 검증 | [![GitHub](https://img.shields.io/badge/GitHub-CU0--0-3B82F6?style=flat-square&logo=github&logoColor=white)](https://github.com/CU0-0) |

### 협업 방식

- 기능 하나당 `feature` 브랜치 하나를 만들고, Pull Request와 코드 리뷰를 거쳐 `develop` 에 병합했습니다.
- API 요청 · 응답 규격과 DTO 구조를 먼저 합의한 뒤 화면을 연결했습니다.
- 화면은 Figma 로 먼저 그리고, 공통 컴포넌트(`Button` · `Card` · `PageSheet` 등)를 맞춘 뒤 각자 화면을 붙였습니다.
- 주간 회의와 KPT 회고로 진행 상황과 충돌 가능성을 공유했습니다.

---

## 8. 개발 산출물

| 산출물 | 결과 |
| :--- | ---: |
| 화면 | **8종** |
| 라우트 | **12개** |
| 커스텀 훅 | **25개** |
| 컴포넌트 | **49개** |
| 유틸 모듈 | **8개** |
| 구독 토픽 | **17개** |
| QA 테스트 케이스 | **188건** (백엔드 공통) |

### 설계 산출물

**유스케이스 다이어그램** — 방장 · 참가자 역할별로 가능한 동작 범위 정의

<p align="center">
  <img width="330" alt="유스케이스 다이어그램" src="https://github.com/user-attachments/assets/7a18b45c-082d-4807-a3e5-f9648925d601" />
</p>

**화면 설계 (Figma)** — 화면의 레이아웃과 화면 간 이동 흐름 설계

<p align="center">
  <img width="900" alt="화면 설계" src="https://github.com/user-attachments/assets/38c6861c-4bd5-41c4-a07b-3fcea0d34158" />
</p>
API 명세서(Notion)

---

## 9. 디렉터리 구조

```
src/
├── api/               axios 인스턴스와 엔드포인트 함수
├── pages/             화면 8종
├── components/
│   ├── layout/        AppLayout · RoomLayout · PageHeader · PageSheet · BottomNav
│   ├── common/        버튼 · 카드 · 목록 · 게임 · 결과 · 오류 (35개)
│   ├── chat/          메시지 목록 · 입력 · 참가자 스트립
│   └── map/           출발지 선택 · 중간지점 · 경로 · 이동 추적
├── hooks/             조회 훅 · 기능 훅 · 소켓 훅
├── utils/             거리 · 시간 · 경로색 · 공유 · 오류 분류
└── index.css          Tailwind 토큰 정의
```

| 갈래 | 예 | 역할 |
| :--- | :--- | :--- |
| 조회 | `useFetchRoom` · `useFetchGameStatus` | REST 한 건 호출과 로딩 · 오류 상태 |
| 기능 | `useGameActions` · `useRestaurantSelection` | 그 기능의 상태 소유와 사용자 동작 |
| 연결 | `useRoomSocket` · `useMainRoomSocket` | 소켓 연결 공유와 이벤트 배분 |

---

## 10. 실행 방법

```bash
npm install
cp .env.example .env     # 값을 채운 뒤
npm run dev
```

| 환경 변수 | 설명 |
| :--- | :--- |
| `VITE_API_BASE_URL` | 백엔드 주소. **끝에 `/` 를 붙이지 않습니다** — 소켓 주소를 `${BASE}/ws` 로 이어 붙이기 때문입니다 |
| `VITE_KAKAO_JS_KEY` | 카카오맵 JavaScript 키 |

| 명령 | 설명 |
| :--- | :--- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run lint` | oxlint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

Vite 는 환경 변수를 **빌드 시점에 번들에 박아 넣습니다.** 런타임 설정이 아니라서 운영용과 개발용 `dist` 는 서로 다른 파일이 됩니다.

---

## 11. 오류 처리

오류를 한 화면으로 뭉뚱그리지 않고, **사용자가 할 수 있는 일**에 따라 나눴습니다.

| 상황 | 가는 곳 | 사용자가 할 수 있는 일 |
| :--- | :--- | :--- |
| 서버 오류(5xx) · 응답 없음 | `/error` | 다시 시도 |
| 없는 방 · 삭제된 방(404 · 410) | `/error/room` | 방 코드 다시 확인 |
| 이미 시작된 방 · 정원 초과 | `/error/join` | 사유를 보고 방장에게 문의 |
| 닉네임 중복(409) | 입력 폼에 그대로 | 다른 닉네임 입력 |
| 아직 없는 게임 · 결과(400 · 404) | 각 화면에서 처리 | 정상 흐름이므로 오류로 보지 않음 |
| 소켓이 15초 안에 붙지 않음 | `/error` | 다시 시도 |
| 렌더링 중 예외 | 오류 화면 | 새로고침 — 라우트가 바뀌면 자동 복구 |

렌더링 예외는 `AppErrorBoundary` 가 받고, **라우트 키가 바뀌면 스스로 풀립니다.**
그렇지 않으면 한 화면에서 난 오류가 앱 전체를 오류 화면에 가둡니다.

---

## 12. 테스트 및 품질 검증

Pull Request 마다 GitHub Actions 가 다음을 순서대로 확인합니다.

| 단계 | 확인하는 것 |
| :--- | :--- |
| `.env` 추적 검사 | 실제 키가 든 `.env` 가 커밋되지 않았는지 — 공개 저장소라 한 번 올라가면 되돌릴 수 없음 |
| lint | oxlint 훅 규칙 |
| 유닛 테스트 | 입장 오류 분류 로직(`joinRoomError`) |
| 빌드 | 더미 환경변수로 컴파일 성공 여부 |
| 산출물 검증 | `dist/index.html` · `dist/assets` 존재, **더미 값이 번들에 인라인되었는지** |

마지막 검사가 핵심입니다. 더미 값이 번들에서 발견되지 않으면 Vite 가 환경변수를 읽지 않은 것이고,
그대로 두면 **배포 때도 조용히 빈 값으로 빌드되어** 앱만 망가집니다.

화면 동작은 백엔드와 공통으로 작성한 **QA 테스트 케이스 188건**으로 검증했습니다.
이 중 소켓 · 에러 화면 16건, 보안 · 비기능 16건이 프론트엔드 영역입니다.

---

## 13. 프로젝트 결과

- 탭 전환에도 끊기지 않는 **커넥션 공유 구조**를 만들어, 화면 이동이 게임 진행에 영향을 주지 않도록 했습니다.
- 새로고침 · 재접속에도 **진행 단계부터 화면이 복원**되게 하여, 실시간 방송을 놓친 참가자도 같은 상태를 봅니다.
- 기능별로 상태 소유를 나눠, 메인 화면 한 곳에 몰릴 상태를 **훅 5개로 분리**했습니다.
- 오류를 사유별로 나눠 **사용자가 다음에 무엇을 할지 알 수 있는** 화면으로 보냅니다.
- 색 토큰을 **대비 기준으로 계산**해, 밝은 배경 위에서도 본문 가독성을 유지했습니다.
- 캐시 정책과 원자적 교체로 **배포 직후에도 이전 페이지를 연 사용자가 깨지지 않도록** 했습니다.

<div align="center">

<br>

**딱 중간 — 모두의 중간에서 만나고, 게임으로 식당을 정한다**

<sub> Team.Legend 딱 중간 프로젝트 · 6주</sub>

</div>
