import EmptyState from './EmptyState'

// 참가자별로 어떤 식당을 골랐는지 보여주는 목록.
// 준비를 마친 참가자는 강조색으로 구분한다.
function ParticipantSelectionList({ participants, selections, restaurants }) {
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

  return (
    <ul className="flex flex-col gap-3">
      {participants.map((participant) => {
        const restaurantName = findRestaurantName(participant.participantId)
        const isReady = participant.isReady === 'Y'

        return (
          <li key={participant.participantId} className="flex items-center justify-between gap-4">
            <span className={`truncate ${isReady ? 'text-point-orange' : 'text-white'}`}>
              {participant.nickname}
            </span>
            <span className={`truncate ${restaurantName ? 'text-white' : 'text-white/40'}`}>
              {restaurantName ?? '고르는 중...'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default ParticipantSelectionList
