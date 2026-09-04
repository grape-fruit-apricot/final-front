import { Outlet, useParams } from 'react-router-dom'
import BottomNav from './BottomNav'
import useRoomSocket from '../../hooks/useRoomSocket'

// 방 진행 화면들의 공통 레이아웃: 탭 콘텐츠(Outlet) + 하단 네브
function RoomLayout() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)

  // 방 안에 있는 동안 연결을 붙잡아 두기만 한다(구독은 각 화면이 알아서 한다).
  // 방 코드 화면은 소켓을 쓰지 않아서, 이게 없으면 딱! -> 방 으로 옮길 때 연결이 끊기고
  // 서버가 이탈로 보고 게임 차례를 넘겨버린다. 이 레이아웃은 세 탭의 부모라 탭을 옮겨도 유지된다.
  useRoomSocket(roomUuid, myParticipantId, {})

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
