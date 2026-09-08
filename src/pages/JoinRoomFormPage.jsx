import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useJoinRoom from '../hooks/useJoinRoom'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'
import LocationPicker from '../components/map/LocationPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { classifyJoinRoomError } from '../utils/joinRoomError'

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
    }).catch((err) => {
      const failure = classifyJoinRoomError(err)
      if (failure.path) navigate(failure.path, { replace: true, state: { reason: failure.reason, from: `/join/${roomUuid}` } })
      return null
    })
    if (participant) {
      localStorage.setItem(`room:${roomUuid}:participantId`, participant.participantId)
      navigate(`/rooms/${roomUuid}`)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader title="방 입장하기" />
      <PageSheet className="pb-6">
        {error && !classifyJoinRoomError(error).path && <ErrorMessage message={classifyJoinRoomError(error).message} />}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-3">
          {/* 지도가 남은 세로 공간을 전부 쓴다. 위치를 고르는 화면에서 지도가 주인공이다. */}
          <LocationPicker value={location} onChange={setLocation} fill />
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
      </PageSheet>
    </div>
  )
}

export default JoinRoomFormPage
