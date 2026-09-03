import RestaurantItem from './RestaurantItem'
import EmptyState from './EmptyState'

// 방의 식당 목록을 나열하는 공통 컴포넌트
function RestaurantList({ restaurants }) {
  if (restaurants.length === 0) {
    return <EmptyState message="주변 식당을 찾지 못했습니다." />
  }

  return (
    <ul className="flex flex-col gap-2">
      {restaurants.map((restaurant) => (
        <RestaurantItem key={restaurant.restaurantId} restaurant={restaurant} />
      ))}
    </ul>
  )
}

export default RestaurantList
