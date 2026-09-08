import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import EmptyState from '../common/EmptyState'

// 같은 사람이 같은 분에 연달아 보낸 메시지인지. 묶어서 이름·시간을 한 번만 보여주려고 쓴다.
function isSameGroup(a, b) {
  if (!a || !b) return false
  if (a.msgType !== 'TALK' || b.msgType !== 'TALK') return false
  if (String(a.participantId) !== String(b.participantId)) return false

  return String(a.createdAt ?? '').slice(0, 16) === String(b.createdAt ?? '').slice(0, 16)
}

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
    <ul className="flex flex-1 flex-col gap-1 overflow-y-auto py-3">
      {/* 대화는 아래에서 쌓인다. 메시지가 적을 때 위에 붙어 있으면 화면이 비어 보인다. */}
      <li className="mt-auto" aria-hidden="true" />

      {messages.map((message, index) => {
        const isMine = String(message.participantId) === String(myParticipantId)

        return (
          <MessageItem
            key={message.messageId}
            message={message}
            isMine={isMine}
            showNickname={!isMine && !isSameGroup(messages[index - 1], message)}
            showTime={!isSameGroup(message, messages[index + 1])}
          />
        )
      })}

      <li ref={bottomRef} />
    </ul>
  )
}

export default MessageList
