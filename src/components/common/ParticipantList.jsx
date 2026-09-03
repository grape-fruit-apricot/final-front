import ParticipantItem from './ParticipantItem'
import EmptyState from './EmptyState'

// 참가자 목록을 나열하는 공통 컴포넌트. 여러 화면에서 재사용한다.
function ParticipantList({ participants }) {
  if (participants.length === 0) {
    return <EmptyState message="아직 참가자가 없습니다." />
  }

  return (
    <ul className="flex flex-col gap-2">
      {participants.map((participant) => (
        <ParticipantItem key={participant.participantId} participant={participant} />
      ))}
    </ul>
  )
}

export default ParticipantList
