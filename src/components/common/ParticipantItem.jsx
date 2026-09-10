import Avatar from './Avatar'

// 참가자 1명(아바타 + 닉네임 + 방장·나 표시)을 그리는 표시용 컴포넌트.
// myParticipantId 는 없을 수도 있다(입장하지 않고 방을 연 경우). 그때는 나 표시만 빠진다.
//
// detail: 닉네임 아래 한 줄로 붙는 보조 정보(고른 식당, 중간지점까지 거리, 입장 시각 등).
//         무엇을 보여줄지는 화면마다 다르므로 부르는 쪽이 정한다. 없으면 한 줄만 그린다.
function ParticipantItem({ participant, myParticipantId, detail = null }) {
  const isMe = String(participant.participantId) === String(myParticipantId)

  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
      <Avatar nickname={participant.nickname} isMe={isMe} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-bold tracking-tight text-app-text">
          {participant.nickname}
        </p>
        {detail && <p className="mt-0.5 truncate text-xs text-ink-soft">{detail}</p>}
      </div>

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
