import Button from './Button'
import Card from './Card'

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
    <Card
      as="li"
      tone={isSelectedByMe ? 'tint' : 'surface'}
      className="flex items-center gap-3 px-3.5 py-2.5"
    >
      {/* 왼쪽 타일이 있으면 행이 리스트가 아니라 카드로 읽힌다. */}
      <span
        className={`flex size-11 flex-none items-center justify-center rounded-tile ${
          isSelectedByMe ? 'bg-point-orange/15 text-accent-ink' : 'bg-fill text-ink-faint'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[21px] w-[21px]">
          <path d="M7 3v8a3 3 0 0 0 6 0V3" />
          <path d="M10 11v10" />
          <path d="M18 3c-1.5 2-2 4-2 6s.5 3 2 3v9" />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* 선택 인원 배지와 헷갈리지 않도록 색을 달리한다. */}
          {isAdded && (
            <span className="shrink-0 rounded-full bg-accent-tint px-2 py-0.5 text-xs font-bold text-accent-ink">
              추가됨
            </span>
          )}
          <p className="truncate text-[17px] font-bold tracking-tight text-app-text">
            {restaurant.name}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-ink-soft">
          {restaurant.category
            ? `${restaurant.category} · ${restaurant.roadAddress || restaurant.address}`
            : restaurant.roadAddress || restaurant.address}
        </p>
      </div>

      {selectedCount > 0 && (
        <span className="shrink-0 text-[13px] font-bold text-ink-soft" data-numeric>
          {selectedCount}명
        </span>
      )}

      {onSelect && (
        <Button
          variant={isSelectedByMe ? 'neutral' : 'secondary'}
          size="sm"
          className="shrink-0"
          onClick={() => onSelect(restaurant.restaurantId)}
          disabled={isSelecting || isSelectedByMe}
        >
          {isSelectedByMe ? '선택함' : '선택'}
        </Button>
      )}
    </Card>
  )
}

export default RestaurantItem
