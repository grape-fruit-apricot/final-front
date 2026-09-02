import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useJoinRoom from '../hooks/useJoinRoom'
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
      navigate(`/rooms/${roomUuid}`)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-main-navy p-6">
      <BackButton />
      <h1 className="text-center text-xl font-bold text-white">닉네임을 입력해주세요</h1>
      {error && <ErrorMessage message="참가에 실패했습니다. 닉네임을 확인해주세요." />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <LocationPicker value={location} onChange={setLocation} />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          required
          className="min-h-11 w-full rounded-lg border border-main-navy bg-white px-4 text-app-text"
        />
        <button
          type="submit"
          disabled={!nickname.trim() || !location}
          className="min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:opacity-60"
        >
          입장하기
        </button>
      </form>
    </div>
  )
}

export default JoinRoomFormPage
