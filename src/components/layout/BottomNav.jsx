import { NavLink, useParams } from 'react-router-dom'

// 링크와 버튼이 같은 크기·색을 갖도록 클래스를 한 곳에서 만든다.
// 선택된 탭은 테두리가 아니라 채워진 알약으로 표시한다. 밝은 유리 위에서는
// 위쪽 테두리 2px 이 거의 보이지 않는다.
function navItemClass(isActive) {
  return `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-bold transition-colors duration-150 ${
    isActive ? 'bg-point-orange text-white' : 'text-ink-soft active:bg-fill'
  }`
}

// 방 진행 중 모든 화면에서 공통으로 쓰는 하단 탭 네비게이션.
// 나가기는 화면 이동이 아니라 동작이라 링크가 아닌 버튼이고, 실제로 무엇을 할지는 RoomLayout 이 정한다.
function BottomNav({ onLeave, isLeaving }) {
  const { roomUuid } = useParams()

  const handleLeaveClick = () => {
    // 되돌릴 수 없으므로 한 번 확인한다. 취소하면 보던 탭에 그대로 머문다.
    if (window.confirm('방에서 나가시겠습니까?')) {
      onLeave()
    }
  }

  const navItems = [
    {
      to: `/rooms/${roomUuid}/main`,
      label: '딱!',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
          <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
    {
      to: `/rooms/${roomUuid}/members`,
      label: '멤버',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
          <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
          <circle cx="10" cy="8" r="3.2" />
          <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
          <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
        </svg>
      ),
    },
    {
      to: `/rooms/${roomUuid}/chat`,
      label: '채팅',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 20l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
      ),
    },
  ]

  return (
    // 화면 가장자리에서 띄운 유리 알약. 지도가 그 아래로 이어져 보인다.
    // 홈 인디케이터와 겹치지 않도록 safe-area 만큼 더 띄운다.
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3.5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-[430px] items-center gap-1 rounded-full border border-white/70 bg-glass-strong p-1.5 shadow-nav backdrop-blur-2xl backdrop-saturate-150">
        {/* 나가기는 어느 탭에 있든 눌러야 하므로 맨 앞에 둔다. 선택되는 탭이 아니라 항상 같은 색이다. */}
        <button
          type="button"
          onClick={handleLeaveClick}
          disabled={isLeaving}
          className={`${navItemClass(false)} text-danger disabled:pointer-events-none disabled:opacity-40`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
            <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
            <path d="M10 16l-4-4 4-4" />
            <path d="M6 12h9" />
          </svg>
          나가기
        </button>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => navItemClass(isActive)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
