import { useState } from 'react'

// 메시지 입력 줄. onSend 가 false 를 돌려주면(소켓 끊김 등) 입력을 비우지 않는다.
function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const isEmpty = text.trim().length === 0

  const handleSend = () => {
    const content = text.trim()
    if (!content) return
    if (onSend(content)) {
      setText('')
    }
  }

  return (
    // 입력줄 자체가 하나의 유리 알약이다. 아래 목록이 이 뒤로 스크롤되어 지나간다.
    <div className="mb-2 flex items-center gap-2 rounded-full border border-white/70 bg-glass-strong p-1.5 pl-2 shadow-surface backdrop-blur-2xl backdrop-saturate-150">
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
        className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-app-text placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={isEmpty}
        aria-label="전송"
        className="flex size-11 flex-none items-center justify-center rounded-full bg-point-orange text-white transition-[background-color,opacity,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:pointer-events-none disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}

export default MessageInput
