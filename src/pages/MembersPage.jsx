import { useOutletContext } from 'react-router-dom'
import ParticipantList from '../components/common/ParticipantList'

// 방에 있는 멤버를 언제든 확인하는 화면.
// 참가자 목록은 RoomLayout 이 소켓으로 최신 상태를 유지하므로 여기서는 조회하지 않는다.
// 준비 상태는 보여주지 않는다. 준비/대기는 게임 준비 단계 화면에서만 의미가 있다.
function MembersPage() {
  const { myParticipantId, room, participants } = useOutletContext()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-app-text">멤버</h1>
        <p className="text-sm text-app-text/70">
          {participants.length}/{room.maxParticipants}
        </p>
      </div>

      <div className="mt-4">
        <ParticipantList participants={participants} myParticipantId={myParticipantId} />
      </div>
    </div>
  )
}

export default MembersPage
