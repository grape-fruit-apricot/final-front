import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import RoomLayout from './components/layout/RoomLayout'
import LandingPage from './pages/LandingPage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import JoinRoomFormPage from './pages/JoinRoomFormPage'
import RoomCodePage from './pages/RoomCodePage'
import MainPage from './pages/MainPage'
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
          <Route index element={<RoomCodePage />} />
          <Route path="main" element={<MainPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </AppLayout>
  )
}

export default App
