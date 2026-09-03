// 참가자 1명(닉네임 + 방장 배지)을 그리는 표시용 컴포넌트
function ParticipantItem({ participant }) {
  return (
    <li className="rounded-lg bg-white px-4 py-3 text-app-text">
      {participant.nickname}
      {participant.isHost === 'Y' && ' (방장)'}
    </li>
  )
}

export default ParticipantItem
