#!/usr/bin/env bash
#
# 서버에서 실행되는 프론트 배포 스크립트. 매 배포마다 dist.tar.gz 와 함께 새로 전송된다.
#
#   사용법: web-deploy.sh <main|develop> <git-sha>
#
# 하는 일: 새 dist 를 마운트된 디렉터리 "안쪽"에 밀어넣고, 응답을 확인한다.
set -euo pipefail

ENV_NAME="${1:?첫 번째 인자로 main 또는 develop 이 필요합니다}"
SHA="${2:-unknown}"

case "$ENV_NAME" in
  main)    PORT=8081 ;;
  develop) PORT=8083 ;;
  *) echo "알 수 없는 환경: $ENV_NAME" >&2; exit 1 ;;
esac

BASE="/opt/midpoint/${ENV_NAME}"
INCOMING="${BASE}/incoming"
STAGE="${INCOMING}/dist-stage"
TIMEOUT_SEC=60

command -v rsync >/dev/null || { echo "rsync 가 필요합니다: sudo apt install -y rsync" >&2; exit 1; }
test -f "${INCOMING}/dist.tar.gz" || { echo "받은 dist.tar.gz 가 없습니다" >&2; exit 1; }

echo "[1/4] 압축 해제 (${ENV_NAME}, ${SHA})"
rm -rf "$STAGE" && mkdir -p "$STAGE"
tar -xzf "${INCOMING}/dist.tar.gz" -C "$STAGE"
test -f "${STAGE}/index.html" || { echo "index.html 이 없습니다. 빌드 산출물이 아닙니다" >&2; exit 1; }

echo "[2/4] 직전 버전 보관"
rm -rf "${BASE}/dist.prev"
if [ -d "${BASE}/dist" ]; then cp -a "${BASE}/dist" "${BASE}/dist.prev"; fi
mkdir -p "${BASE}/dist"

echo "[3/4] 교체"
# 디렉터리를 mv 로 바꾸지 않는다.
# compose 가 ./dist 를 bind mount 하는데, 그 마운트는 컨테이너를 띄울 때 정해진
# 디렉터리 자체(inode)를 가리킨다. 바깥에서 디렉터리를 통째로 갈아끼우면
# 컨테이너는 계속 옛 디렉터리를 보고 있어서 배포해도 화면이 그대로다.
# 그래서 "마운트된 디렉터리 안쪽 내용"만 바꾼다.
#
# 두 번에 나눠 도는 이유: 1차는 지우지 않고 채우기만 한다(assets 가 index.html 보다
# 먼저 처리되므로, 새 index.html 이 보이는 시점에는 그것이 참조하는 파일이 이미 있다).
# 2차에서 남은 옛 파일을 지운다.
rsync -a "${STAGE}/" "${BASE}/dist/"
rsync -a --delete "${STAGE}/" "${BASE}/dist/"
rm -rf "$STAGE" "${INCOMING}/dist.tar.gz"

# nginx 재시작은 필요 없다. 요청마다 디스크를 읽고 open_file_cache 는 기본 off 다.
echo "[4/4] 확인 (최대 ${TIMEOUT_SEC}초)"
deadline=$(( $(date +%s) + TIMEOUT_SEC ))
ok=0
while [ "$(date +%s)" -lt "$deadline" ]; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:${PORT}/" || echo 000)
  if [ "$code" = "200" ]; then ok=1; break; fi
  echo "      대기 중... (HTTP ${code})"
  sleep 3
done

if [ "$ok" -ne 1 ]; then
  echo "[!] 확인 실패. 배포를 실패로 처리합니다."
  echo "----- ${ENV_NAME}-web 최근 로그 40줄 -----"
  (cd /opt/midpoint && docker compose logs --tail 40 --no-log-prefix "${ENV_NAME}-web") || true
  echo "------------------------------------------"
  echo "되돌리려면: rsync -a --delete ${BASE}/dist.prev/ ${BASE}/dist/"
  exit 1
fi

echo "배포 완료: ${ENV_NAME}-web (${SHA})"
