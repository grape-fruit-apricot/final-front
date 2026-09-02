import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 방 하나에 대한 실시간 이벤트를 구독하는 훅. 채팅과 동일하게 roomUuid/participantId를
// CONNECT 헤더에 실어 인증하고, /topic/room/{roomUuid}/{key} 형태의 토픽을 한 커넥션에서
// 모두 구독한다(토픽마다 별도 훅/커넥션을 쓰면 소켓이 여러 개 열려 자원 낭비가 된다).
//
// subscriptions 예: { participants: onParticipantJoined, midpoint: onMidpointFound }
//
// 주의: roomUuid/participantId만 바뀔 때 재연결하고 subscriptions 콜백은 연결 시점의
// 클로저로 캡처해두기 때문에(불필요한 재연결 방지), 콜백 안에서는 항상
// setState(prev => ...) 형태의 함수형 업데이트만 써야 안전하다. 콜백이 바깥 상태를
// 직접 참조하면 오래된 값을 참조하는 stale closure 버그가 생길 수 있다.
export function useRoomSocket(roomUuid, participantId, subscriptions) {
  useEffect(() => {
    if (!roomUuid || !participantId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        roomUuid,
        participantId: String(participantId),
      },
      onConnect: () => {
        Object.entries(subscriptions).forEach(([key, handler]) => {
          client.subscribe(`/topic/room/${roomUuid}/${key}`, (message) => {
            handler(JSON.parse(message.body))
          })
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid, participantId])
}

export default useRoomSocket
