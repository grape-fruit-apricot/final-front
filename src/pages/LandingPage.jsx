import { useNavigate } from 'react-router-dom'
import useCreateRoom from '../hooks/useCreateRoom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function LandingPage() {
  const navigate = useNavigate()
  const { create, isLoading, error } = useCreateRoom()

  const handleCreateRoom = async () => {
    const room = await create().catch(() => null)
    if (room) {
      navigate(`/rooms/${room.roomUuid}`)
    }
  }

  const handleJoinRoom = () => {
    navigate('/join')
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-center text-2xl font-bold text-app-text">
        딱 중간에서
        <br />
        밥먹어요
      </h1>
      {error && <ErrorMessage message="방 생성에 실패했습니다. 다시 시도해주세요." />}
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={handleCreateRoom}
          className="min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
        >
          방 생성하기
        </button>
        <button
          type="button"
          onClick={handleJoinRoom}
          className="min-h-11 w-full rounded-lg border border-main-navy font-semibold text-main-navy"
        >
          방 입장하기
        </button>
      </div>
    </div>
  )
}

export default LandingPage
