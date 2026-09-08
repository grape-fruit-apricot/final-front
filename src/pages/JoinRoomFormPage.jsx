import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useJoinRoom from '../hooks/useJoinRoom'
import Button from '../components/common/Button'
import BackButton from '../components/common/BackButton'
import LocationPicker from '../components/map/LocationPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function JoinRoomFormPage() {
  const { roomUuid } = useParams()
  const navigate = useNavigate()
  const { join, isLoading, error } = useJoinRoom()
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const participant = await join(roomUuid, {
      nickname,
      lat: location.lat,
      lng: location.lng,
    }).catch(() => null)
    if (participant) {
      localStorage.setItem(`room:${roomUuid}:participantId`, participant.participantId)
      navigate(`/rooms/${roomUuid}`)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-background p-6">
      <BackButton />
      <h1 className="text-center text-title font-extrabold text-app-text">닉네임을 입력해주세요</h1>
      {error && <ErrorMessage message="참가에 실패했습니다. 닉네임을 확인해주세요." />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <LocationPicker value={location} onChange={setLocation} />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          required
          className="min-h-12 w-full rounded-tile border border-edge bg-surface px-4 text-[15px] text-app-text shadow-surface placeholder:text-ink-faint focus:border-point-orange focus:outline-none"
        />
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={!nickname.trim() || !location}>
          입장하기
        </Button>
      </form>
    </div>
  )
}

export default JoinRoomFormPage
