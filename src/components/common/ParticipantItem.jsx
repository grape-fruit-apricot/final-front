// 참가자 1명(아바타 + 닉네임 + 방장·나 표시)을 그리는 표시용 컴포넌트.
// myParticipantId 는 없을 수도 있다(입장하지 않고 방을 연 경우). 그때는 나 표시만 빠진다.
//
// 채워진 주황 아바타는 앱 전체에서 "나" 한 가지 뜻으로만 쓴다.
// 방장은 색이 아니라 배지로 구분한다.
function ParticipantItem({ participant, myParticipantId }) {
  const isMe = String(participant.participantId) === String(myParticipantId)
  const initial = participant.nickname?.trim().charAt(0) || '?'

  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
      <span
        className={`flex size-10 flex-none items-center justify-center rounded-full text-base font-extrabold ${
          isMe ? 'bg-point-orange text-white' : 'bg-fill text-app-text'
        }`}
        aria-hidden="true"
      >
        {initial}
      </span>

      <span className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight text-app-text">
        {participant.nickname}
      </span>

      {isMe && (
        <span className="flex-none rounded-full bg-accent-tint px-2.5 py-1 text-xs font-bold text-accent-ink">
          나
        </span>
      )}
      {participant.isHost === 'Y' && (
        <span className="flex-none rounded-full bg-fill px-2.5 py-1 text-xs font-bold text-ink-soft">
          방장
        </span>
      )}
    </div>
  )
}

export default ParticipantItem
