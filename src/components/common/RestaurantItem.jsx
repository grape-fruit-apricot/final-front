// 식당 1건(이름 + 카테고리 + 도로명주소)을 그리는 컴포넌트.
// 선택 기능이 켜진 화면에서는 선택 인원과 내 선택 여부를 함께 보여준다.
// isAdded: 참가자가 직접 추가한 식당. 자동 수집분과 구분해 표시한다.
function RestaurantItem({
  restaurant,
  isAdded = false,
  selectedCount = 0,
  isSelectedByMe = false,
  onSelect,
  isSelecting,
}) {
  return (
    <li
      className={`rounded-lg px-4 py-3 text-app-text ${
        isSelectedByMe ? 'bg-white ring-2 ring-point-orange' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {/* 선택 인원 배지(남색)와 헷갈리지 않도록 색을 달리한다. */}
            {isAdded && (
              <span className="shrink-0 rounded-full bg-point-orange/15 px-2 py-0.5 text-xs font-semibold text-point-orange">
                추가됨
              </span>
            )}
            <p className="truncate font-semibold">{restaurant.name}</p>
          </div>
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
