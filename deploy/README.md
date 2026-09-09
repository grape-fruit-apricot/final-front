# 프론트 배포 구성

EC2 1대에 컨테이너 4개(web 2 + api 2)를 띄우고, 앞단은 ALB 가 Host 헤더로 갈라준다.
이 문서는 그중 web 두 개에 대한 것이다. 서버 전체 세팅(도커, 계정, ALB, compose)은
**`final-back/deploy/README.md` 가 원본**이다. 여기서는 프론트 쪽만 적는다.

```
midpoint.my      → main-web     :8081   nginx + dist 마운트
dev.midpoint.my  → develop-web  :8083
```

커스텀 이미지를 만들지 않는다. stock `nginx` 이미지에 `dist/` 와 `nginx.conf` 를
볼륨으로 넣는다. 배포는 **dist 를 갈아끼우는 것**이 전부이고, nginx 재시작도 필요 없다
(요청마다 디스크를 읽고 `open_file_cache` 는 기본 off 다).

---

## 환경변수

Vite 는 `VITE_*` 를 **빌드 시점에 번들에 인라인**한다. 런타임 설정이 아니다.
그래서 develop 용 dist 와 main 용 dist 는 서로 다른 파일이고,
**각 브랜치의 push 가 자기 환경 값으로 빌드해 자기 디렉터리에만 넣는다.**

| 키 | develop | production |
|---|---|---|
| `VITE_API_BASE_URL` (Variable) | `https://dev-api.midpoint.my` | `https://api.midpoint.my` |
| `VITE_KAKAO_JS_KEY` (Secret) | 카카오 JS 키 | 카카오 JS 키 |

`VITE_API_BASE_URL` 은 **끝에 `/` 를 붙이지 않는다.** `useRoomSocket` 이
`${BASE}/ws` 로 이어붙여서 `//ws` 가 된다. 배포 워크플로가 이걸 먼저 막는다.

`VITE_KAKAO_JS_KEY` 는 어차피 번들에 실려 브라우저로 나가므로 진짜 시크릿이 아니다.
**실제 보호는 카카오 개발자 콘솔에서 플랫폼 도메인을 제한하는 것이다.**
`midpoint.my` 와 `dev.midpoint.my` 를 등록해 둘 것.

로컬 개발은 `.env.example` 을 `.env` 로 복사해 채운다. `.env` 는 gitignore 대상이다.

```bash
cp .env.example .env
```

---

## 서버 세팅 (프론트 몫, 1회)

```bash
# rsync 가 없으면 배포 스크립트가 첫 줄에서 멈춘다
sudo apt install -y rsync

# nginx 설정 배치 (두 환경 모두 같은 파일이다)
sudo -u deploy cp nginx.conf /opt/midpoint/main/nginx.conf
sudo -u deploy cp nginx.conf /opt/midpoint/develop/nginx.conf
```

디렉터리(`/opt/midpoint/{main,develop}/{incoming,dist}`)는 백엔드 README 의
4번 단계에서 이미 만들어진다.

첫 `docker compose up -d` 전에 `dist/` 가 비어 있으면 nginx 는 뜨지만 403 을 준다.
**첫 배포를 먼저 돌리고 나서 `up -d` 하는 편이 간단하다.**

---

## 배포 흐름

```
feature 브랜치 → PR → develop → (자동) develop-web 배포 → dev 환경에서 확인
                          ↓
                        main → (승인 후) main-web 배포
```

`production` 환경에 Required reviewers 를 걸어두면 main 머지 후 배포가 대기 상태로 멈춘다.

`web-deploy.sh` 가 하는 일:

1. `dist.tar.gz` 를 스테이지 디렉터리에 풀고 `index.html` 이 있는지 확인
2. 현재 `dist/` 를 `dist.prev/` 로 복사
3. **마운트된 `dist/` 디렉터리 "안쪽"만** rsync 로 교체
   - 디렉터리를 `mv` 로 갈아끼우면 안 된다. compose 의 bind mount 는 컨테이너를
     띄울 때 정해진 디렉터리 자체를 가리켜서, 바깥에서 통째로 바꾸면 컨테이너는
     계속 옛 디렉터리를 본다. 배포해도 화면이 그대로가 된다
   - 2번에 나눠 돈다. 1차는 채우기만(assets 가 index.html 보다 먼저 처리된다),
     2차에서 옛 파일을 지운다
4. `http://127.0.0.1:<포트>/` 가 200 이 될 때까지 최대 60초 확인. 실패하면 exit 1

되돌리기:

```bash
rsync -a --delete /opt/midpoint/main/dist.prev/ /opt/midpoint/main/dist/
```

---

## nginx.conf 에서 가장 중요한 한 줄

```nginx
location ^~ /assets/ { try_files $uri =404; ... }
```

`=404` 가 없으면 아래 SPA fallback 이 걸려서, 사라진 해시 파일 요청에
`index.html` 이 `.js` MIME 으로 내려간다. 브라우저는 `Unexpected token '<'` 로 죽고
원인이 네트워크 탭에만 보인다. **배포 직후 이전 페이지를 열어둔 사용자가 정확히 여기 걸린다.**

`location / { try_files $uri $uri/ /index.html; }` 는 `/join/:roomUuid` 초대 링크로
바로 들어오는 경우를 위한 것이다. 이게 없으면 초대 링크가 전부 404 다.

---

## 확인 명령

```bash
# 서버에서
curl -sI localhost:8081/                 # main-web    200
curl -sI localhost:8083/                 # develop-web 200
curl -sI localhost:8083/join/아무-uuid    # 200 (SPA fallback)
curl -sI localhost:8083/assets/없는파일.js # 404 (index.html 이 내려오면 안 된다)

# ALB 를 통해서
curl -sI https://dev.midpoint.my/join/아무-uuid

# 번들에 어떤 API 주소가 박혔는지 (환경이 섞이지 않았는지)
grep -o 'https://[a-z.-]*midpoint.my' /opt/midpoint/develop/dist/assets/*.js | sort -u
```

브라우저에서는 방 생성 → 초대 링크로 2번째 참가 → 중간지점 → 투표 → 게임 → 경로까지
한 번 훑는다. **채팅이 실시간으로 오가는지가 ALB WebSocket 통과의 진짜 검증이다.**
