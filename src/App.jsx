import { Routes, Route } from 'react-router-dom'
import RoomLayout from './components/layout/RoomLayout'
import RoomCodePage from './pages/RoomCodePage'
import MainPage from './pages/MainPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoomLayout />}>
        <Route index element={<RoomCodePage />} />
        <Route path="main" element={<MainPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}

export default App
