import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import useFetchMessageList from '../hooks/useFetchMessageList'
import useMyParticipantId from '../hooks/useMyParticipantId'
import useRoomSocket from '../hooks/useRoomSocket'
import PageHeader from '../components/layout/PageHeader'
import ChatParticipantStrip from '../components/chat/ChatParticipantStrip'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function ChatPage() {
  const { roomUuid } = useParams()
  const myParticipantId = useMyParticipantId(roomUuid)

  // 참가자 목록은 RoomLayout 이 소켓으로 최신 상태를 들고 있다. 여기서 따로 조회하지 않는다.
  const { participants } = useOutletContext()

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
    // 떠 있는 탭바(64px + 아래 여백 + safe-area)만큼 빼야 입력줄이 탭바에 가리지 않는다.
    <div className="flex h-[calc(100dvh-5.75rem-env(safe-area-inset-bottom))] flex-col bg-header">
      <PageHeader title="채팅" showBack={false} />
      {/* 대화는 시트가 스크롤을 직접 맡아야 해서 PageSheet 대신 같은 모양을 여기서 만든다.
          PageSheet 의 세로 여백·gap 이 목록 스크롤 계산을 흐린다. */}
      <div className="flex min-h-0 flex-1 flex-col rounded-t-[28px] border-t border-app-text/12 bg-background px-4 pb-3 pt-2 shadow-glass">
        {/* 누가 이 방에 있는지 먼저 보여준다. 말풍선만 있으면 조용한 사람은 없는 것처럼 보인다. */}
        <ChatParticipantStrip participants={participants} myParticipantId={myParticipantId} />

        <MessageList messages={messages} myParticipantId={myParticipantId} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}

export default ChatPage
