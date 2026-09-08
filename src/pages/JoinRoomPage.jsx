import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetchRoom from '../hooks/useFetchRoom'
import Button from '../components/common/Button'
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
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-background p-6">
      <BackButton />
      <h1 className="text-center text-title font-extrabold text-app-text">방 코드를 입력해주세요</h1>
      {error && <ErrorMessage message="방을 찾을 수 없습니다. 코드를 다시 확인해주세요." />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={roomUuid}
          onChange={(e) => setRoomUuid(e.target.value)}
          placeholder="방 코드"
          className="min-h-12 w-full rounded-tile border border-edge bg-surface px-4 text-[15px] text-app-text shadow-surface placeholder:text-ink-faint focus:border-point-orange focus:outline-none"
        />
        <Button type="submit" variant="primary" size="lg" fullWidth>
          확인
        </Button>
      </form>
    </div>
  )
}

export default JoinRoomPage
