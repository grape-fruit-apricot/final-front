// 식당 1건(이름 + 카테고리 + 도로명주소)을 그리는 컴포넌트.
// 선택 기능이 켜진 화면에서는 선택 인원과 내 선택 여부를 함께 보여준다.
function RestaurantItem({ restaurant, selectedCount = 0, isSelectedByMe = false, onSelect, isSelecting }) {
  return (
    <li
      className={`rounded-lg px-4 py-3 text-app-text ${
        isSelectedByMe ? 'bg-white ring-2 ring-point-orange' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{restaurant.name}</p>
          {restaurant.category && (
            <p className="mt-0.5 truncate text-xs text-app-text/60">{restaurant.category}</p>
          )}
          <p className="mt-1 truncate text-sm text-app-text/80">
            {restaurant.roadAddress || restaurant.address}
          </p>
        </div>

        {selectedCount > 0 && (
          <span className="shrink-0 rounded-full bg-main-navy px-2 py-1 text-xs font-semibold text-white">
            {selectedCount}명
          </span>
        )}

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(restaurant.restaurantId)}
            disabled={isSelecting || isSelectedByMe}
            className="min-h-11 shrink-0 rounded-lg bg-point-orange px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSelectedByMe ? '선택함' : '선택'}
          </button>
        )}
      </div>
    </li>
  )
}

export default RestaurantItem
