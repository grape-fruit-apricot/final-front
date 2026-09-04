import { useCallback, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 마지막 화면이 사라진 뒤 실제로 연결을 끊기까지 기다리는 시간(ms).
// 딱!·채팅·방은 형제 라우트라 탭을 옮기면 이전 화면이 언마운트되고 다음 화면이 마운트된다.
// 그때마다 소켓을 끊으면 서버는 그 DISCONNECT 를 "화면을 떠났다"로 보고
// 보물 주머니 게임에서 그 사람의 차례를 넘겨버린다(GameDisconnectListener).
// 라우터가 언마운트와 마운트를 한 커밋에서 처리하므로 짧은 유예만 있어도 연결이 그대로 유지된다.
// 반대로 이 값이 길면 진짜로 방을 떠난 사람의 차례가 그만큼 늦게 넘어가므로 짧게 잡는다.
const TEARDOWN_DELAY = 300

// roomUuid + participantId 조합마다 연결을 하나만 열어 두고 화면들이 나눠 쓴다.
// 서버는 CONNECT 헤더로 참가자를 확인해 세션에 박아두므로(ChatSession) 조합이 다르면 연결도 달라야 한다.
// 카카오맵 SDK 로더와 같은 방식으로, Context 를 새로 만들지 않고 모듈 수준에서 공유한다.
const socketRegistry = new Map()

// 화면 하나가 원하는 토픽을 모두 구독하고 그 화면의 onConnect 를 알린다.
// 재연결 때도 불린다. 이전 연결의 구독 핸들은 쓸 수 없으므로 통째로 새 핸들로 덮어쓴다.
function subscribeTopics(entry, subscriber) {
  subscriber.handles = Object.keys(subscriber.subscriptionsRef.current).map((key) => {
    const topic = key ? `/topic/room/${entry.roomUuid}/${key}` : `/topic/room/${entry.roomUuid}`

    // 핸들러는 구독하는 시점이 아니라 메시지가 도착한 시점에 ref 에서 꺼낸다.
    // 그래야 리렌더로 새로 만들어진 최신 핸들러가 불린다.
    return entry.client.subscribe(topic, (message) => {
      const handler = subscriber.subscriptionsRef.current[key]
      if (handler) {
        handler(JSON.parse(message.body))
      }
    })
  })

  if (subscriber.onConnectRef.current) {
    subscriber.onConnectRef.current()
  }
}

// 화면이 사라지면 그 화면의 구독만 끊는다. 연결은 다음 화면이 이어서 쓴다.
// 이미 끊긴 연결이면 서버가 세션과 함께 정리했으므로 UNSUBSCRIBE 를 보낼 필요가 없다.
function unsubscribeTopics(entry, subscriber) {
  if (entry.client.connected) {
    subscriber.handles.forEach((handle) => handle.unsubscribe())
  }
  subscriber.handles = []
}

function createSocketEntry(roomUuid, participantId) {
  const entry = {
    roomUuid,
    client: null,
    // 이 연결을 쓰고 있는 화면들. 비면 정리 대상이 된다.
    subscribers: new Set(),
    teardownTimerId: null,
  }

  entry.client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    connectHeaders: {
      roomUuid,
      participantId: String(participantId),
    },
    // 끊기면 stompjs 가 알아서 다시 붙고 그때 이 콜백이 다시 불린다.
    // 재연결하면 서버 쪽 구독은 모두 사라지므로 등록된 화면 전부를 다시 구독시키고,
    // 각자의 onConnect 로 놓친 데이터를 따라잡게 한다.
    onConnect: () => {
      entry.subscribers.forEach((subscriber) => subscribeTopics(entry, subscriber))
    },
  })

  return entry
}

function acquireSocket(key, roomUuid, participantId, subscriber) {
  let entry = socketRegistry.get(key)
  const isNew = entry === undefined

  if (isNew) {
    entry = createSocketEntry(roomUuid, participantId)
    socketRegistry.set(key, entry)
  } else if (entry.teardownTimerId !== null) {
    // 탭을 옮기는 중이라 정리 타이머만 걸려 있는 상태다. 취소하고 살아 있는 연결을 그대로 쓴다.
    // DISCONNECT 가 나가지 않으므로 서버는 화면을 떠났다고 보지 않는다.
    clearTimeout(entry.teardownTimerId)
    entry.teardownTimerId = null
  }

  // activate() 보다 먼저 등록해야 연결이 끝났을 때 이 화면도 함께 구독된다.
  entry.subscribers.add(subscriber)

  if (isNew) {
    entry.client.activate()
  } else if (entry.client.connected) {
    // 이미 연결이 끝난 뒤에 들어온 화면은 onConnect 를 다시 받지 못하므로 여기서 바로 붙인다.
    // 아직 연결 중이면 위의 onConnect 가 처리한다.
    // (stompjs 의 subscribe 는 연결 전에 부르면 예외를 던지므로 이 확인이 필요하다)
    subscribeTopics(entry, subscriber)
  }

  return entry
}

function releaseSocket(key, subscriber) {
  const entry = socketRegistry.get(key)
  if (!entry) {
    return
  }

  unsubscribeTopics(entry, subscriber)
  entry.subscribers.delete(subscriber)
  if (entry.subscribers.size > 0) {
    return
  }

  // 쓰는 화면이 없어졌다. 바로 끊으면 탭 전환에도 DISCONNECT 가 나가므로 유예를 둔다.
  // 이 사이에 다른 화면이 들어오면 acquireSocket 이 이 타이머를 취소한다.
  entry.teardownTimerId = setTimeout(() => {
    // deactivate 는 비동기라 끊는 데 시간이 걸린다. 그 사이에 끊는 중인 연결을
    // 다시 꺼내 쓰지 않도록 레지스트리에서 먼저 지운다(다음 요청은 새 연결을 연다).
    socketRegistry.delete(key)
    entry.client.deactivate()
  }, TEARDOWN_DELAY)
}

// 방 하나에 대한 실시간 이벤트를 구독하고, 서버로 메시지를 보내는 훅.
// roomUuid/participantId를 CONNECT 헤더에 실어 인증하고, /topic/room/{roomUuid}/{key} 형태의
// 토픽을 한 커넥션에서 모두 구독한다(토픽마다 별도 훅/커넥션을 쓰면 소켓이 여러 개 열려 자원 낭비가 된다).
//
// 커넥션은 roomUuid+participantId 조합마다 하나만 열어 화면들이 공유한다.
// 딱! 탭과 채팅 탭이 각자 소켓을 열면 탭을 옮길 때마다 DISCONNECT 가 나가고,
// 서버가 그것을 이탈로 보고 게임 차례를 넘겨버리기 때문이다.
//
// subscriptions 예: { participants: onParticipantJoined, midpoint: onMidpointFound }
// key가 빈 문자열('')이면 접미사 없이 방 루트 토픽 /topic/room/{roomUuid} 를 구독한다(채팅 메시지가 여기로 온다).
// 구독만 하지 않고 연결만 붙잡아 두고 싶으면 빈 객체({})를 넘기면 된다.
//
// onConnect: 이 화면이 커넥션에 붙을 때마다 호출된다(첫 연결, 재연결, 이미 연결된 커넥션에 뒤늦게 합류).
// 놓친 데이터를 따라잡는 용도.
//
// 주의: 구독할 토픽 목록(subscriptions 의 key 집합)은 커넥션에 붙는 시점에 한 번만 읽으므로
// 렌더마다 같아야 한다. 핸들러 본문은 메시지가 도착할 때 ref 에서 꺼내 부르므로 최신 것이 쓰인다.
export function useRoomSocket(roomUuid, participantId, subscriptions, onConnect) {
  const clientRef = useRef(null)
  const subscriptionsRef = useRef(subscriptions)
  const onConnectRef = useRef(onConnect)

  // subscriptions 는 렌더마다 새 객체, onConnect 는 렌더마다 새 함수라 의존성에 넣으면
  // 매 렌더 재구독이 된다. 대신 커밋될 때마다 ref 만 최신으로 바꿔두고 호출은 ref 로 한다.
  // 렌더 중에 대입하지 않는 이유는 중간에 버려진 렌더의 클로저를 붙잡지 않기 위해서다.
  useEffect(() => {
    subscriptionsRef.current = subscriptions
    onConnectRef.current = onConnect
  })

  useEffect(() => {
    if (!roomUuid || !participantId) return

    // participantId 는 localStorage 에서 읽은 문자열이라 숫자로 넘어와도 같은 키가 되도록 묶는다.
    const key = `${roomUuid}|${participantId}`
    // 구독 핸들은 화면마다 따로 들고 있어야 자기 것만 끊을 수 있다.
    const subscriber = { subscriptionsRef, onConnectRef, handles: [] }

    const entry = acquireSocket(key, roomUuid, participantId, subscriber)
    clientRef.current = entry.client

    return () => {
      clientRef.current = null
      releaseSocket(key, subscriber)
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
