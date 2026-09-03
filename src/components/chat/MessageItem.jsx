// 채팅 메시지 1건. TALK 는 말풍선(내 것은 우측 오렌지, 상대는 좌측 흰색),
// ENTER/LEAVE 는 가운데 회색 시스템 줄로 표시한다.
function MessageItem({ message, isMine }) {
  if (message.msgType !== 'TALK') {
    return <li className="my-1 text-center text-xs text-app-text/50">{message.content}</li>
  }

  return (
    <li className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {!isMine && <span className="mb-0.5 text-xs text-app-text/60">{message.nickname}</span>}
      <div
        className={`max-w-[75%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${
          isMine ? 'bg-point-orange text-white' : 'border border-black/5 bg-white text-app-text'
        }`}
      >
        {message.content}
      </div>
    </li>
  )
}

export default MessageItem
