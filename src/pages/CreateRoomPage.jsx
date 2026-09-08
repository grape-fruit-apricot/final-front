import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCreateRoom from '../hooks/useCreateRoom'
import useJoinRoom from '../hooks/useJoinRoom'
import Button from '../components/common/Button'
import BackButton from '../components/common/BackButton'
import LocationPicker from '../components/map/LocationPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

// 방 정원. DB 제약(CK_ROOM_MAX_PART)과 서버 검증(@Min(2) @Max(10))이 2~10 이라 그대로 맞춘다.
const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 10
const PARTICIPANT_OPTIONS = Array.from(
  { length: MAX_PARTICIPANTS - MIN_PARTICIPANTS + 1 },
  (_, index) => MIN_PARTICIPANTS + index
)

function CreateRoomPage() {
  const navigate = useNavigate()
  const { create } = useCreateRoom()
  const { join } = useJoinRoom()
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState(null)
  const [maxParticipants, setMaxParticipants] = useState(MAX_PARTICIPANTS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdRoomUuid, setCreatedRoomUuid] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      // 방은 만들어졌는데 참가에서 실패한 경우(닉네임 중복 등), 다시 시도할 때
      // 방을 또 만들지 않고 이미 만든 방을 재사용한다.
      const roomUuid = createdRoomUuid ?? (await create({ maxParticipants })).roomUuid
      setCreatedRoomUuid(roomUuid)

      const participant = await join(roomUuid, {
        nickname,
        lat: location.lat,
        lng: location.lng,
      })
      localStorage.setItem(`room:${roomUuid}:participantId`, participant.participantId)
      navigate(`/rooms/${roomUuid}`)
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
    <div className="relative flex min-h-screen flex-col justify-center gap-6 bg-background p-6">
      <BackButton />
      <h1 className="text-center text-title font-extrabold text-app-text">방 생성하기</h1>
      {error && (
        <ErrorMessage
          message={
            createdRoomUuid
              ? '참가에 실패했습니다. 닉네임을 바꿔 다시 시도해주세요.'
              : '방 생성에 실패했습니다. 다시 시도해주세요.'
          }
        />
      )}
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
        {/* 값이 범위 밖일 수 없도록 자유 입력 대신 선택으로 받는다. */}
        <label className="flex min-h-12 w-full items-center justify-between gap-3 rounded-tile border border-edge bg-surface px-4 text-app-text shadow-surface">
          <span className="shrink-0 text-[15px] text-ink-soft">최대 인원</span>
          <select
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="min-h-11 bg-transparent text-right text-[15px] font-bold text-app-text focus:outline-none"
          >
            {PARTICIPANT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}명
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={!nickname.trim() || !location}>
          방 생성하기
        </Button>
      </form>
    </div>
  )
}

export default CreateRoomPage
