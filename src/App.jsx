import { Routes, Route, Navigate } from 'react-router-dom'
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
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/join/:roomUuid" element={<JoinRoomFormPage />} />
        <Route path="/rooms/:roomUuid" element={<RoomLayout />}>
          {/* 방 코드는 딱! 의 첫 단계로 들어가 index 로 보여줄 화면이 없다.
              방 생성·입장이 /rooms/{uuid} 로 보내므로 여기서 딱! 로 넘긴다. */}
          <Route index element={<Navigate to="main" replace />} />
          <Route path="main" element={<MainPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </AppLayout>
  )
}

export default App
