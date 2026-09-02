import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetchRoom from '../hooks/useFetchRoom'
import BackButton from '../components/common/BackButton'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function JoinRoomPage() {
  const navigate = useNavigate()
  const { fetch, isLoading, error } = useFetchRoom()
  const [roomUuid, setRoomUuid] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const room = await fetch(roomUuid).catch(() => null)
    if (room) {
      navigate(`/join/${roomUuid}`)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-main-navy p-6">
      <BackButton />
      <h1 className="text-center text-xl font-bold text-white">방 코드를 입력해주세요</h1>
      {error && <ErrorMessage message="방을 찾을 수 없습니다. 코드를 다시 확인해주세요." />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={roomUuid}
          onChange={(e) => setRoomUuid(e.target.value)}
          placeholder="방 코드"
          className="min-h-11 w-full rounded-lg border border-main-navy bg-white px-4 text-app-text"
        />
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
        >
          확인
        </button>
      </form>
    </div>
  )
}

export default JoinRoomPage
