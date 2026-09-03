import { useCallback, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 방 하나에 대한 실시간 이벤트를 구독하고, 서버로 메시지를 보내는 훅. 채팅과 동일하게
// roomUuid/participantId를 CONNECT 헤더에 실어 인증하고, /topic/room/{roomUuid}/{key} 형태의
// 토픽을 한 커넥션에서 모두 구독한다(토픽마다 별도 훅/커넥션을 쓰면 소켓이 여러 개 열려 자원 낭비가 된다).
//
// subscriptions 예: { participants: onParticipantJoined, midpoint: onMidpointFound }
// key가 빈 문자열('')이면 접미사 없이 방 루트 토픽 /topic/room/{roomUuid} 를 구독한다(채팅 메시지가 여기로 온다).
//
// onConnect: 소켓이 (재)연결될 때마다 호출된다. 재연결 후 놓친 데이터를 따라잡는 용도.
//
// 주의: roomUuid/participantId만 바뀔 때 재연결하고 subscriptions/onConnect 콜백은 연결 시점의
// 클로저로 캡처해두기 때문에(불필요한 재연결 방지), 콜백 안에서는 항상
// setState(prev => ...) 형태의 함수형 업데이트나 ref만 써야 안전하다. 콜백이 바깥 상태를
// 직접 참조하면 오래된 값을 참조하는 stale closure 버그가 생길 수 있다.
export function useRoomSocket(roomUuid, participantId, subscriptions, onConnect) {
  const clientRef = useRef(null)

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
          const topic = key ? `/topic/room/${roomUuid}/${key}` : `/topic/room/${roomUuid}`
          client.subscribe(topic, (message) => {
            handler(JSON.parse(message.body))
          })
        })
        if (onConnect) {
          onConnect()
        }
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      clientRef.current = null
      client.deactivate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid, participantId])

  // 서버로 메시지를 보낸다. destination은 백엔드 @MessageMapping 경로에 /app 접두사를 붙인 값이다.
  // 아직 연결 전이거나 끊긴 상태면 false를 돌려주므로, 호출한 쪽에서 사용자에게 알릴 수 있다.
  const publish = useCallback((destination, body = {}) => {
    const client = clientRef.current
    if (!client || !client.connected) {
      return false
    }

    client.publish({ destination, body: JSON.stringify(body) })
    return true
  }, [])

  return { publish }
}

export default useRoomSocket
