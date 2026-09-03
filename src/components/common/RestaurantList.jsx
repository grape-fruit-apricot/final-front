import RestaurantItem from './RestaurantItem'
import EmptyState from './EmptyState'

// 방의 식당 목록을 나열하는 공통 컴포넌트.
// selections(방 전체 선택 현황)를 받으면 식당별 선택 인원과 내 선택을 함께 표시한다.
function RestaurantList({ restaurants, selections = [], myParticipantId, onSelect, isSelecting }) {
  if (restaurants.length === 0) {
    return <EmptyState message="주변 식당을 찾지 못했습니다." />
  }

  const mySelection = selections.find(
    (selection) => String(selection.participantId) === String(myParticipantId)
  )

  return (
    <ul className="flex flex-col gap-2">
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.restaurantId}
          restaurant={restaurant}
          selectedCount={
            selections.filter((selection) => selection.restaurantId === restaurant.restaurantId).length
          }
          isSelectedByMe={mySelection?.restaurantId === restaurant.restaurantId}
          onSelect={onSelect}
          isSelecting={isSelecting}
        />
      ))}
    </ul>
  )
}

export default RestaurantList
