import { useOutletContext } from 'react-router-dom'
import ParticipantList from '../components/common/ParticipantList'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'

// 방에 있는 멤버를 언제든 확인하는 화면.
// 참가자 목록은 RoomLayout 이 소켓으로 최신 상태를 유지하므로 여기서는 조회하지 않는다.
// 준비 상태는 보여주지 않는다. 준비/대기는 게임 준비 단계 화면에서만 의미가 있다.
function MembersPage() {
  const { myParticipantId, room, participants } = useOutletContext()

  return (
    // 탭 화면이라 되돌아갈 곳이 없다(showBack={false}).
    // pb-28 은 떠 있는 하단 네브 자리다. 시트 배경 안쪽에 둬야 색이 끊기지 않는다.
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader
        title="멤버"
        showBack={false}
        right={`${participants.length}/${room.maxParticipants}`}
      />
      <PageSheet className="pb-[calc(env(safe-area-inset-bottom)+7rem)]">
        <ParticipantList participants={participants} myParticipantId={myParticipantId} />
      </PageSheet>
    </div>
  )
}

export default MembersPage
