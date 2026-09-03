import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import EmptyState from '../common/EmptyState'

// 스크롤되는 메시지 목록. 새 메시지가 들어오면 맨 아래로 붙는다.
function MessageList({ messages, myParticipantId }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState message="아직 대화가 없습니다." />
      </div>
    )
  }

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-y-auto py-3">
      {messages.map((message) => (
        <MessageItem
          key={message.messageId}
          message={message}
          isMine={String(message.participantId) === String(myParticipantId)}
        />
      ))}
      <li ref={bottomRef} />
    </ul>
  )
}

export default MessageList
