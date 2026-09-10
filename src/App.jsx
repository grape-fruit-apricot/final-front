import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ErrorPage from './pages/ErrorPage'
import AppErrorBoundary from './components/common/AppErrorBoundary'
import ApiErrorNavigation from './components/common/ApiErrorNavigation'
import RoomGuard from './components/common/RoomGuard'
import AppLayout from './components/layout/AppLayout'
import RoomLayout from './components/layout/RoomLayout'
import LandingPage from './pages/LandingPage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import JoinRoomFormPage from './pages/JoinRoomFormPage'
import MainPage from './pages/MainPage'
import MembersPage from './pages/MembersPage'
import ChatPage from './pages/ChatPage'

function App() {
  const location = useLocation()
  return (
    <AppLayout>
      <ApiErrorNavigation />
      <AppErrorBoundary resetKey={location.key}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route element={<RoomGuard />}>
        <Route path="/join/:roomUuid" element={<JoinRoomFormPage />} />
        <Route path="/rooms/:roomUuid" element={<RoomLayout />}>
          {/* 방 코드는 딱! 의 첫 단계로 들어가 index 로 보여줄 화면이 없다.
              방 생성·입장이 /rooms/{uuid} 로 보내므로 여기서 딱! 로 넘긴다. */}
          <Route index element={<Navigate to="main" replace />} />
          <Route path="main" element={<MainPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        </Route>
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/error/room" element={<ErrorPage variant="room" />} />
        <Route path="/error/join" element={<ErrorPage variant="join-unavailable" />} />
        <Route path="*" element={<ErrorPage variant="not-found" />} />
      </Routes>
      </AppErrorBoundary>
    </AppLayout>
  )
}

export default App
