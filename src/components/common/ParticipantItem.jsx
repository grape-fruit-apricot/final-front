// 참가자 1명(닉네임 + 방장·나 표시)을 그리는 표시용 컴포넌트.
// myParticipantId 는 없을 수도 있다(입장하지 않고 방을 연 경우). 그때는 나 표시만 빠진다.
function ParticipantItem({ participant, myParticipantId }) {
  const isMe = String(participant.participantId) === String(myParticipantId)

  return (
    <li className="rounded-lg bg-white px-4 py-3 text-app-text">
      {participant.nickname}
      {participant.isHost === 'Y' && ' (방장)'}
      {isMe && ' (나)'}
    </li>
  )
}

export default ParticipantItem
