import ListGroup from './ListGroup'
import EmptyState from './EmptyState'
import ParticipantBadge from './ParticipantBadge'

// 참가자별로 어떤 식당을 골랐는지 보여주는 목록.
// 준비를 마친 참가자는 강조색으로 구분한다.
//
// 나·방장 배지를 함께 그린다. 시작 버튼은 방장에게만 보이므로, 배지가 없으면
// "왜 나한테는 시작 버튼이 없지"의 답을 이 화면에서 알 수 없다.
function ParticipantSelectionList({ participants, selections, restaurants, myParticipantId }) {
  if (participants.length === 0) {
    return <EmptyState message="참가자가 없습니다." />
  }

  const findRestaurantName = (participantId) => {
    const selection = selections.find(
      (item) => String(item.participantId) === String(participantId)
    )
    if (!selection) {
      return null
    }

    const restaurant = restaurants.find((item) => item.restaurantId === selection.restaurantId)
    return restaurant?.name ?? null
  }

  // 흰 카드를 사람 수만큼 띄우지 않고 컨테이너 하나에 담는다.
  return (
    <ListGroup>
      {participants.map((participant) => {
        const restaurantName = findRestaurantName(participant.participantId)
        const isReady = participant.isReady === 'Y'
        const isMe = String(participant.participantId) === String(myParticipantId)

        return (
          <div
            key={participant.participantId}
            className="flex min-h-14 items-center justify-between gap-4 px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              {/* 준비 완료는 색이 아니라 점으로 알린다. 색만으로 구분하면 못 보는 사람이 생긴다. */}
              <span
                className={`size-2 flex-none rounded-full ${isReady ? 'bg-point-orange' : 'bg-hairline'}`}
                aria-hidden="true"
              />
              <span className="truncate text-[17px] font-bold tracking-tight text-app-text">
                {participant.nickname}
              </span>
              {isMe && <ParticipantBadge tone="me">나</ParticipantBadge>}
              {participant.isHost === 'Y' && <ParticipantBadge tone="host">방장</ParticipantBadge>}
            </span>
            <span
              className={`truncate text-[15px] ${restaurantName ? 'font-bold text-app-text' : 'text-ink-faint'}`}
            >
              {restaurantName ?? '고르는 중...'}
            </span>
          </div>
        )
      })}
    </ListGroup>
  )
}

export default ParticipantSelectionList
