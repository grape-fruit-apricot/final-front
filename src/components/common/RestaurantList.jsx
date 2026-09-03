import RestaurantItem from './RestaurantItem'
import EmptyState from './EmptyState'

// 방의 식당 목록을 나열하는 공통 컴포넌트.
// selections(방 전체 선택 현황)를 받으면 식당별 선택 인원과 내 선택을 함께 표시한다.
// 참가자가 직접 추가한 식당(source='MANUAL')은 눈에 띄도록 위쪽에 따로 묶어 보여준다.
function RestaurantList({ restaurants, selections = [], myParticipantId, onSelect, isSelecting }) {
  if (restaurants.length === 0) {
    return <EmptyState message="주변 식당을 찾지 못했습니다." />
  }

  const mySelection = selections.find(
    (selection) => String(selection.participantId) === String(myParticipantId)
  )

  const addedList = restaurants.filter((restaurant) => restaurant.source === 'MANUAL')
  const nearbyList = restaurants.filter((restaurant) => restaurant.source !== 'MANUAL')

  const renderItem = (restaurant) => (
    <RestaurantItem
      key={restaurant.restaurantId}
      restaurant={restaurant}
      isAdded={restaurant.source === 'MANUAL'}
      selectedCount={
        selections.filter((selection) => selection.restaurantId === restaurant.restaurantId).length
      }
      isSelectedByMe={mySelection?.restaurantId === restaurant.restaurantId}
      onSelect={onSelect}
      isSelecting={isSelecting}
    />
  )

  return (
    <div className="flex flex-col gap-3">
      {/* 추가된 식당이 없으면 제목만 덩그러니 남지 않도록 묶음 자체를 그리지 않는다. */}
      {addedList.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-white/80">참가자가 추가한 식당</h3>
          <ul className="flex flex-col gap-2">{addedList.map(renderItem)}</ul>
        </div>
      )}

      {nearbyList.length > 0 && (
        <div className="flex flex-col gap-2">
          {addedList.length > 0 && (
            <h3 className="text-sm font-semibold text-white/80">중간지점 주변 식당</h3>
          )}
          <ul className="flex flex-col gap-2">{nearbyList.map(renderItem)}</ul>
        </div>
      )}
    </div>
  )
}

export default RestaurantList
