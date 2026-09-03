import { useState } from 'react'

// 메시지 입력 줄. onSend 가 false 를 돌려주면(소켓 끊김 등) 입력을 비우지 않는다.
function MessageInput({ onSend }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const content = text.trim()
    if (!content) return
    if (onSend(content)) {
      setText('')
    }
  }

  return (
    <div className="flex gap-2 border-t border-black/5 bg-background py-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder="메시지 입력"
        className="min-h-11 flex-1 rounded-lg border border-main-navy bg-white px-4 text-app-text"
      />
      <button
        type="button"
        onClick={handleSend}
        className="min-h-11 rounded-lg bg-point-orange px-4 font-semibold text-white disabled:opacity-60"
      >
        전송
      </button>
    </div>
  )
}

export default MessageInput
