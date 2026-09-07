import { NavLink, useParams } from 'react-router-dom'

// 링크와 버튼이 같은 크기·색을 갖도록 클래스를 한 곳에서 만든다.
function navItemClass(isActive) {
  return `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 border-t-2 py-2 text-xs font-medium ${
    isActive ? 'border-point-orange text-point-orange' : 'border-transparent text-white/70'
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
    {
      to: `/rooms/${roomUuid}/members`,
      label: '멤버',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 20l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-main-navy">
      <div className="mx-auto flex max-w-[430px]">
        {/* 나가기는 어느 탭에 있든 눌러야 하므로 맨 앞에 둔다. 선택되는 탭이 아니라 항상 같은 색이다. */}
        <button
          type="button"
          onClick={handleLeaveClick}
          disabled={isLeaving}
          className={`${navItemClass(false)} disabled:opacity-60`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
