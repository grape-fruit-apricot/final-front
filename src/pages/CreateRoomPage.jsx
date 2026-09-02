import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCreateRoom from '../hooks/useCreateRoom'
import useJoinRoom from '../hooks/useJoinRoom'
import BackButton from '../components/common/BackButton'
import LocationPicker from '../components/map/LocationPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function CreateRoomPage() {
  const navigate = useNavigate()
  const { create } = useCreateRoom()
  const { join } = useJoinRoom()
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const room = await create()
      const participant = await join(room.roomUuid, {
        nickname,
        lat: location.lat,
        lng: location.lng,
      })
      localStorage.setItem(`room:${room.roomUuid}:participantId`, participant.participantId)
      navigate(`/rooms/${room.roomUuid}`)
    } catch (err) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-main-navy p-6">
      <BackButton />
      <h1 className="text-center text-xl font-bold text-white">방 생성하기</h1>
      {error && <ErrorMessage message="방 생성에 실패했습니다. 다시 시도해주세요." />}
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
          방 생성하기
        </button>
      </form>
    </div>
  )
}

export default CreateRoomPage
