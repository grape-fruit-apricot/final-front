import { useEffect, useState } from 'react'
import useFetchRoom from './useFetchRoom'
import useFetchRouteResult from './useFetchRouteResult'
import useFetchModeVote from './useFetchModeVote'
import useFetchGameStatus from './useFetchGameStatus'
import useFetchTracking from './useFetchTracking'

// 최초 조회의 로딩·오류만 소유하고, 복원 데이터는 각 기능의 이벤트로 전달한다.
function useRoomState(roomUuid, { onMidpoint, onResult, onMode, onGame, onTracking }) {
  const { fetch: fetchRoomInfo } = useFetchRoom();
  const { fetch: fetchRouteResult } = useFetchRouteResult();
  const { fetch: fetchModeVote } = useFetchModeVote();
  const { fetch: fetchGameStatus } = useFetchGameStatus();
  const { fetch: fetchTracking } = useFetchTracking();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 방을 옮기면 이전 방의 응답이 늦게 도착해 새 방의 상태를 덮어쓸 수 있다.
    let isCancelled = false;

    setIsLoading(true);
    setError(null);
    // 방 정보는 RoomLayout 도 갖고 있지만 그쪽은 입장 시점에서 멈춘 값이다. 탭을 옮겨도
    // 리마운트되지 않기 때문이다. 이 화면은 진행 단계로 복원해야 하므로 직접 다시 부른다.
    fetchRoomInfo(roomUuid)
      .then((room) => {
        if (isCancelled) return;

        // stage 값을 열거하면 RESOLVING/RESOLVED 로 넘어간 방에서 지도가 복원되지 않는다.
        // 백엔드와 같은 기준인 좌표 유무로 판단한다.
        if (room.midpointLat != null && room.midpointLng != null) {
          onMidpoint({
            name: room.midpointSource === "FALLBACK" ? "중심점" : "중간지점",
            lat: room.midpointLat,
            lng: room.midpointLng,
          });
        }
        // 이미 결과가 확정된 방이면 새로고침해도 결과 화면이 유지되도록 복원한다.
        // 결과 조회까지 기다렸다가 로딩을 끝내야, 중간지점 화면이 한 프레임 떴다 사라지지 않는다.
        if (room.stage === "RESOLVED") {
          // 이동 추적도 같이 복원한다. 추적 중에 새로고침하면 그동안 지나간 방송은 다시 오지 않아
          // 궤적과 도착 상태가 통째로 빈 채로 남는다.
          // 아직 시작하지 않은 방도 200 이고 participants 가 빈 배열로 오므로 따로 구분하지 않는다.
          return Promise.all([
            fetchRouteResult(roomUuid)
              .then((routeResult) => {
                if (!isCancelled) onResult(routeResult);
              })
              .catch(() => {
                if (!isCancelled) onResult(null);
              }),
            fetchTracking(roomUuid)
              .then((trackingStatus) => {
                if (!isCancelled) onTracking(trackingStatus);
              })
              .catch(() => {
                if (!isCancelled) onTracking(null);
              }),
          ]);
        }
        // 게임이 도는 중이면 주머니 상태와 남은 시간까지 복원해야 한다.
        if (room.stage === "GAME_PLAYING") {
          return fetchGameStatus(roomUuid)
            .then((status) => {
              if (!isCancelled) onGame(status);
            })
            .catch(() => {
              if (!isCancelled) onGame(null);
            });
        }
        // MODE_SELECTED 는 투표 중, RESOLVING 은 게임을 시작하기 전 대기 상태다.
        // 둘 다 투표 현황을 불러와야 화면이 복원된다.
        if (room.stage === "MODE_SELECTED" || room.stage === "RESOLVING") {
          return fetchModeVote(roomUuid)
            .then((status) => {
              if (!isCancelled) onMode(status);
            })
            .catch(() => {
              if (!isCancelled) onMode(null);
            });
        }
      })
      .catch((err) => {
        if (!isCancelled) setError(err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid]);

  return { isLoading, error }
}

export default useRoomState
