import ParticipantItem from './ParticipantItem'
import ListGroup from './ListGroup'
import EmptyState from './EmptyState'

// 참가자 목록을 나열하는 공통 컴포넌트. 여러 화면에서 재사용한다.
// myParticipantId 를 넘기면 내 항목에 표시가 붙는다.
// getDetail: 참가자 한 명을 받아 닉네임 아래에 붙일 한 줄을 돌려준다(없으면 한 줄만 그린다).
//
// 행마다 흰 카드를 띄우지 않는다. #f9f8fa 위에 흰 카드를 올리면 대비가 2% 라 카드가 보이지 않았다.
// 컨테이너 하나에 담고 사이만 헤어라인으로 나눈다.
function ParticipantList({ participants, myParticipantId, getDetail, title, className = '' }) {
  if (participants.length === 0) {
    return <EmptyState message="아직 참가자가 없습니다." />
  }

  // 아바타(40) + 왼쪽 여백(16) + 간격(12) 만큼 구분선을 밀어 이름 줄에 맞춘다.
  return (
    <ListGroup title={title} dividerInset={68} className={className}>
      {participants.map((participant) => (
        <ParticipantItem
          key={participant.participantId}
          participant={participant}
          myParticipantId={myParticipantId}
          detail={getDetail ? getDetail(participant) : null}
        />
      ))}
    </ListGroup>
  )
}

export default ParticipantList
