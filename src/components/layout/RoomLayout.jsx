import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

// 방 진행 화면들의 공통 레이아웃: 탭 콘텐츠(Outlet) + 하단 네브
function RoomLayout() {
  return (
    <>
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}

export default RoomLayout
