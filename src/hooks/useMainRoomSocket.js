import { useCallback, useEffect, useRef } from 'react'
import useRoomState from './useRoomState'
import useRoomSocket from './useRoomSocket'
import useMidpointActions from './useMidpointActions'
import useRestaurantSelection from './useRestaurantSelection'
import useGameActions from './useGameActions'
import useResultActions from './useResultActions'

// 상태를 직접 소유하지 않고 초기 복원·소켓 이벤트를 기능별 소유자에게 연결한다.
function useMainRoomSocket(roomUuid, myParticipantId) {
  // 기능 훅에는 안정적인 전송 함수를 주고, 실제 소켓 전송 함수는 커밋 후 연결한다.
  const publishRef = useRef(null)
  const publishMessage = useCallback((destination, body) => {
    return publishRef.current?.(destination, body) ?? false
  }, [])

  const midpoint = useMidpointActions(publishMessage)
  const selection = useRestaurantSelection(roomUuid, myParticipantId, midpoint.state.data)
  const game = useGameActions(publishMessage)
  const result = useResultActions(roomUuid, publishMessage)
  const { isLoading, error } = useRoomState(roomUuid, {
    onMidpoint: midpoint.events.restore,
    onResult: result.events.restoreResult,
    onMode: game.events.restoreMode,
    onGame: game.events.restoreGame,
    onTracking: result.events.restoreTracking,
  })

  const { publish } = useRoomSocket(roomUuid, myParticipantId, {
    'midpoint/reset': (value) => {
      midpoint.events.reset(value)
      selection.events.reset()
      game.events.reset()
    },
    'midpoint/reset/error': midpoint.events.resetError,
    midpoint: midpoint.events.found,
    'midpoint/error': midpoint.events.findError,
    restaurants: selection.events.restaurants,
    selections: selection.events.selections,
    mode: game.events.mode,
    'mode/error': game.events.modeError,
    game: game.events.game,
    'game/error': game.events.gameError,
    result: (value) => {
      result.events.result(value)
      game.events.result()
    },
    'result/error': game.events.resultError,
    tracking: result.events.tracking,
    'tracking/error': result.events.trackingError,
  }, result.events.reconnect)

  useEffect(() => {
    publishRef.current = publish
    return () => {
      publishRef.current = null
    }
  }, [publish])

  // 페이지와 컴포넌트에는 표시 값과 사용자 동작만 제공한다.
  // 복원·소켓 이벤트와 내부 setter는 이 연결 계층 밖으로 내보내지 않는다.
  return {
    isLoading, error,
    midpoint: { ...midpoint.state, ...midpoint.actions },
    selection: { ...selection.state, ...selection.actions },
    game: { ...game.state, ...game.actions },
    result: { ...result.state, ...result.actions },
  }
}

export default useMainRoomSocket
