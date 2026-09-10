import Card from './Card'
import { toShortCategory } from '../../utils/category'

// 식당 1건(이름 + 분류 + 도로명주소)을 그리는 컴포넌트.
// 선택 기능이 켜진 화면에서는 카드 전체가 선택 버튼이 되고, 오른쪽 동그라미로 선택 여부를 표시한다.
// isAdded: 참가자가 직접 추가한 식당. 자동 수집분과 구분해 표시한다.
function RestaurantItem({
  restaurant,
  isAdded = false,
  selectedCount = 0,
  isSelectedByMe = false,
  onSelect,
  isSelecting,
}) {
  const address = restaurant.roadAddress || restaurant.address
  // 카카오 분류는 "음식점 > 한식 > 국수 > 칼국수" 처럼 길게 온다. 마지막 단계만 쓴다.
  const shortCategory = toShortCategory(restaurant.category)
  const isSelectable = Boolean(onSelect)

  const body = (
    <div className="flex w-full items-center gap-3">
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

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[17px] font-bold tracking-tight text-app-text">
            {restaurant.name}
          </p>
          {isAdded && (
            <span className="shrink-0 rounded-full bg-accent-tint px-2 py-0.5 text-xs font-bold text-accent-ink">
              추가됨
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-ink-soft">
          {shortCategory ? `${shortCategory} · ${address}` : address}
        </p>
      </div>

      {selectedCount > 0 && (
        <span className="shrink-0 text-[13px] font-bold text-ink-soft" data-numeric>
          {selectedCount}명
        </span>
      )}

      {/* 줄마다 주황 버튼이 반복되면 목록이 시끄럽다. 조용한 동그라미로 상태만 보여준다. */}
      {isSelectable && (
        <span
          className={`flex size-6 flex-none items-center justify-center rounded-full border-2 ${
            isSelectedByMe ? 'border-point-orange bg-point-orange' : 'border-hairline bg-surface'
          }`}
        >
          {isSelectedByMe && (
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>
      )}
    </div>
  )

  // 카드 전체를 누를 수 있게 해 손가락으로 짚기 쉽게 한다.
  // 이미 고른 항목도 눌러서 그대로 둘 수 있으므로 비활성으로 흐리게 만들지 않는다.
  return (
    <li>
      {isSelectable ? (
        <Card
          as="button"
          type="button"
          tone={isSelectedByMe ? 'tint' : 'surface'}
          onClick={() => onSelect(restaurant.restaurantId)}
          disabled={isSelecting}
          aria-pressed={isSelectedByMe}
          className="flex w-full items-center px-3.5 py-2.5 transition-transform duration-150 enabled:active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:opacity-100"
        >
          {body}
        </Card>
      ) : (
        <Card as="div" className="flex items-center px-3.5 py-2.5">
          {body}
        </Card>
      )}
    </li>
  )
}

export default RestaurantItem
