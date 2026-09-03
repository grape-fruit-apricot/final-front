// 식당 1건(이름 + 카테고리 + 도로명주소)을 그리는 표시용 컴포넌트
function RestaurantItem({ restaurant }) {
  return (
    <li className="rounded-lg bg-white px-4 py-3 text-app-text">
      <p className="font-semibold">{restaurant.name}</p>
      {restaurant.category && <p className="mt-0.5 text-xs text-app-text/60">{restaurant.category}</p>}
      <p className="mt-1 text-sm text-app-text/80">{restaurant.roadAddress || restaurant.address}</p>
    </li>
  )
}

export default RestaurantItem
