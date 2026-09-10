// 채팅 메시지 1건. TALK 는 말풍선(내 것은 우측 강조색, 상대는 좌측 흰색),
// ENTER/LEAVE 는 가운데 알약 칩으로 표시한다.
//
// showNickname / showTime 은 MessageList 가 앞뒤 메시지를 보고 정해준다.
// 같은 사람이 같은 분에 연달아 보낸 메시지는 이름과 시간을 한 번만 보여준다.

// "오후 7:10" 형태. createdAt 이 없거나 이상하면 시간을 아예 그리지 않는다.
function formatTime(createdAt) {
  if (!createdAt) return null

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null

  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const meridiem = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12

  return `${meridiem} ${hour12}:${minutes}`
}

function MessageItem({ message, isMine, showNickname, showTime }) {
  if (message.msgType !== 'TALK') {
    return (
      <li className="my-2 flex justify-center">
        <span className="rounded-full bg-fill px-3 py-1.5 text-xs font-bold text-ink-soft">
          {message.content}
        </span>
      </li>
    )
  }

  const time = showTime ? formatTime(message.createdAt) : null

  return (
    <li className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {showNickname && (
        <span className="mb-1 px-1 text-xs font-bold text-ink-soft">{message.nickname}</span>
      )}

      <div
        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-card px-4 py-2.5 text-[15px] leading-snug ${
          isMine
            ? `bg-point-orange text-white ${showTime ? 'rounded-br-md' : ''}`
            : `border border-edge bg-surface text-app-text ${showTime ? 'rounded-bl-md' : ''}`
        }`}
      >
        {message.content}
      </div>

      {time && (
        <time className="mt-1 px-1 text-[11px] text-ink-faint" dateTime={message.createdAt}>
          {time}
        </time>
      )}
    </li>
  )
}

export default MessageItem
