import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchMessageList from '../hooks/useFetchMessageList'
import useRoomSocket from '../hooks/useRoomSocket'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function ChatPage() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)

  const { fetch: fetchMessages } = useFetchMessageList()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // 재연결 시 어디부터 따라잡을지 알아야 하는데, onConnect 콜백은 연결 시점 클로저로 고정되므로
  // 최신 커서는 state 가 아니라 ref 로 읽는다.
  const lastMessageIdRef = useRef(null)

  // history 재조회와 실시간 수신이 겹칠 수 있어 messageId 기준으로 합치고 정렬한다.
  const mergeMessages = (incoming) => {
    setMessages((prev) => {
      const byId = new Map(prev.map((message) => [message.messageId, message]))
      incoming.forEach((message) => byId.set(message.messageId, message))

      const merged = [...byId.values()].sort((a, b) => a.messageId - b.messageId)
      lastMessageIdRef.current = merged.length > 0 ? merged[merged.length - 1].messageId : null
      return merged
    })
  }

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    fetchMessages(roomUuid)
      .then(mergeMessages)
      .catch((err) => setLoadError(err))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  // 소켓이 (재)연결될 때마다 마지막으로 받은 메시지 이후 구간을 다시 받아 빈틈을 메운다.
  const handleSocketConnect = () => {
    fetchMessages(roomUuid, lastMessageIdRef.current ?? undefined)
      .then((list) => {
        if (list.length > 0) {
          mergeMessages(list)
        }
      })
      .catch(() => {})
  }

  const { publish } = useRoomSocket(
    roomUuid,
    myParticipantId,
    { '': (message) => mergeMessages([message]) },
    handleSocketConnect
  )

  // 내가 보낸 메시지도 서버가 토픽으로 되돌려주므로 여기서 따로 추가하지 않는다.
  const handleSend = (content) => publish('/app/chat/send', { content })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (loadError) {
    return <ErrorMessage message="대화 내역을 불러오지 못했습니다." />
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col bg-background px-4 pt-4">
      <h1 className="text-lg font-semibold text-app-text">채팅</h1>
      <MessageList messages={messages} myParticipantId={myParticipantId} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}

export default ChatPage
