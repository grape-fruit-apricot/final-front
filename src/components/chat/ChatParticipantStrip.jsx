import { useState } from 'react'

// 채팅 맨 위에 붙는 "지금 이 방에 누가 있는지" 띠.
// 말풍선에는 말한 사람 이름만 남으므로, 조용한 사람은 방에 있는지조차 알 수 없다.
//
// 동그라미만 왼쪽에 늘어놓으면 무엇을 말하는 줄인지 알 수 없어서, 카카오톡 공지처럼
// 폭을 다 쓰는 한 칸으로 만든다. 접힌 상태에서는 얼굴을 겹쳐 쌓고 이름은 줄여 쓰고,
// 누르면 전원 이름을 펼친다(사람이 많을수록 접힌 줄만으로는 부족하다).
function ChatParticipantStrip({ participants, myParticipantId }) {
  const [isOpen, setIsOpen] = useState(false)

  if (participants.length === 0) return null

  const nameOf = (participant) =>
    String(participant.participantId) === String(myParticipantId) ? '나' : participant.nickname

  // 접힌 줄은 세 명까지만 이름을 쓰고 나머지는 "외 n명"으로 접는다.
  const shown = participants.slice(0, 3).map(nameOf).join(', ')
  const rest = participants.length - 3
  const summary = rest > 0 ? `${shown} 외 ${rest}명` : shown

  return (
    <div className="shrink-0 rounded-card border border-edge bg-surface shadow-surface">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
      >
        {/* 겹쳐 쌓은 얼굴. 다섯 개를 넘기면 줄이 밀리므로 거기서 끊는다. */}
        <span className="flex shrink-0 items-center" aria-hidden="true">
          {participants.slice(0, 5).map((participant, index) => (
            <span
              key={participant.participantId}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-fill text-[11px] font-bold text-app-text ${
                index > 0 ? '-ml-2.5' : ''
              }`}
            >
              {participant.nickname?.slice(0, 1) ?? '?'}
            </span>
          ))}
        </span>

        <span className="min-w-0 flex-1">
          <span data-numeric className="block text-xs font-bold text-accent-ink">
            {participants.length}명 참여 중
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink-soft">{summary}</span>
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul className="flex flex-wrap gap-1.5 border-t border-hairline px-3.5 py-3">
          {participants.map((participant) => (
            <li
              key={participant.participantId}
              className="rounded-full bg-fill px-2.5 py-1 text-xs font-medium text-app-text"
            >
              {nameOf(participant)}
              {participant.isHost === 'Y' && (
                <span className="ml-1 font-bold text-accent-ink">방장</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ChatParticipantStrip
