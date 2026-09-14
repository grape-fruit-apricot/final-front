import { useState } from 'react'
import { DEFAULT_TRAVEL_MODE } from '../api/room'
import useFetchRouteResult from './useFetchRouteResult'
import useFetchTracking from './useFetchTracking'

// 최종 결과와 경로·추적 데이터 및 화면 전환 상태를 함께 관리한다.
function useResultActions(roomUuid, publish) {
  const { fetch: fetchRouteResult } = useFetchRouteResult()
  const { fetch: fetchTracking } = useFetchTracking()
  const [result, setResult] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [isTrackingStarting, setIsTrackingStarting] = useState(false)
  const [trackingError, setTrackingError] = useState(null)

  // 결과 발표 · 경로 안내 · 이동 추적을 한 탭 안에서 번갈아 보여준다(주소는 그대로 두고 화면만 바꾼다).
  // 불리언을 화면마다 하나씩 두면 둘 다 true 인 상태를 만들 수 있어, 어느 화면인지 한 값으로 정한다.
  const [resultView, setResultView] = useState('result')
  // 화면에 그려지고 있는 경로의 이동수단. result 와 짝이라 여기서 함께 들고 있어야 한다.
  // RouteDetail 안에 두면 이동수단이 먼저 바뀌고 result 가 나중에 도착해서,
  // 그 사이 한 프레임 동안 "경로를 찾지 못했습니다"가 뜨고 지도가 통째로 다시 만들어진다.
  const [travelMode, setTravelMode] = useState(DEFAULT_TRAVEL_MODE)

  const handleTravelModeChange = async (nextMode) => {
    const routeResult = await fetchRouteResult(roomUuid, nextMode)
    // 두 상태를 붙여서 바꾼다. 같은 이어짐(continuation) 안이라 React 가 한 번에 반영하므로
    // 이동수단만 먼저 바뀐 중간 상태가 화면에 그려지지 않는다.
    setResult(routeResult)
    setTravelMode(nextMode)
  }

  // 이동 추적 시작. 방장 여부는 서버가 소켓 세션의 participantId 로 다시 확인한다.
  // 이미 시작된 방에서 다시 눌러도 서버가 세션을 새로 만들지 않고 현재 상태만 방송한다.
  const handleStartTracking = () => {
    setTrackingError(null);
    setIsTrackingStarting(true);

    if (!publish("/app/tracking/start")) {
      setIsTrackingStarting(false);
      setTrackingError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleTracking = (status) => {
    setTracking(status)
    setIsTrackingStarting(false)
    setTrackingError(null)
  }
  const handleTrackingError = (payload) => {
    setTrackingError(payload?.message ?? '이동 추적을 시작하지 못했습니다.')
    setIsTrackingStarting(false)
  }
  const handleReconnect = () => {
    // 끊긴 동안 놓친 추적 방송을 REST 조회로 보충한다.
    if (!tracking) return
    fetchTracking(roomUuid).then(setTracking).catch(() => {})
  }

  return {
    state: { data: result, tracking, resultView, travelMode, isTrackingStarting, trackingError },
    actions: {
      onViewChange: setResultView, onTravelModeChange: handleTravelModeChange,
      onStartTracking: handleStartTracking,
    },
    events: {
      restoreResult: setResult, restoreTracking: setTracking, result: setResult,
      tracking: handleTracking, trackingError: handleTrackingError, reconnect: handleReconnect,
    },
  }
}

export default useResultActions
