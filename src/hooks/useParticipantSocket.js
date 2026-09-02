import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 방의 참가자 입장을 실시간으로 받는 훅. 채팅과 동일하게 roomUuid/participantId를
// CONNECT 헤더에 실어 인증하고, /topic/room/{roomUuid}/participants를 구독한다.
export function useParticipantSocket(roomUuid, participantId, onParticipantJoined) {
  useEffect(() => {
    if (!roomUuid || !participantId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        roomUuid,
        participantId: String(participantId),
      },
      onConnect: () => {
        client.subscribe(`/topic/room/${roomUuid}/participants`, (message) => {
          onParticipantJoined(JSON.parse(message.body))
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

export default useParticipantSocket
