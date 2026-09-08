import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

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
      // 첫 대화 화면이라 한 줄짜리 빈 상태보다 무엇을 하면 되는지 알려주는 편이 낫다.
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span
          className="flex size-16 items-center justify-center rounded-full bg-fill text-ink-soft"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-7">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-bold text-ink-soft">아직 대화가 없어요</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">
            어디서 만날지, 뭘 먹을지
            <br />
            편하게 이야기해보세요.
          </p>
        </div>
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
