import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '방코드', end: true },
  { to: '/main', label: '진행' },
  { to: '/chat', label: '채팅' },
]

// 방 진행 중 모든 화면에서 공통으로 쓰는 하단 탭 네비게이션
function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[430px]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-11 flex-1 items-center justify-center gap-1 py-2 text-sm font-medium ${
                isActive ? 'text-point-orange' : 'text-app-text'
              }`
            }
          >
            {({ isActive }) => (
              <span
                className={`rounded-full px-3 py-1 ${isActive ? 'bg-soft-orange' : ''}`}
              >
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
