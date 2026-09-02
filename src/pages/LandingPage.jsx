import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  const handleCreateRoom = () => {
    navigate('/create')
  }

  const handleJoinRoom = () => {
    navigate('/join')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <svg viewBox="0 0 80 96" className="h-20 w-20" aria-hidden="true">
        <path
          d="M12 8h56a4 4 0 0 1 4 4v48l-32 28-32-28V12a4 4 0 0 1 4-4Z"
          fill="var(--color-main-navy)"
        />
        <path
          d="M40 26c-7.2 0-13 5.8-13 13 0 9.7 13 25 13 25s13-15.3 13-25c0-7.2-5.8-13-13-13Z"
          fill="white"
        />
        <circle cx="40" cy="39" r="5" fill="var(--color-main-navy)" />
        <circle cx="62" cy="18" r="11" fill="var(--color-point-orange)" />
        <path
          d="M62 12c-2.8 0-5 2.2-5 5 0 3.7 5 9 5 9s5-5.3 5-9c0-2.8-2.2-5-5-5Z"
          fill="white"
        />
        <circle cx="62" cy="17" r="1.8" fill="var(--color-point-orange)" />
      </svg>
      <h1 className="text-center text-2xl font-bold text-app-text">
        딱 중간에서
        <br />
        밥먹어요
      </h1>
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
