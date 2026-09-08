import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCreateRoom from '../hooks/useCreateRoom'
import useJoinRoom from '../hooks/useJoinRoom'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'
import LocationPicker from '../components/map/LocationPicker'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

// 방 정원. DB 제약(CK_ROOM_MAX_PART)과 서버 검증(@Min(2) @Max(10))이 2~10 이라 그대로 맞춘다.
const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 10

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

  // 범위를 벗어난 값이 만들어지지 않도록 여기서 자른다.
  const stepParticipants = (delta) =>
    setMaxParticipants((prev) =>
      Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, prev + delta))
    )

  if (isSubmitting) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader title="방 생성하기" />
      <PageSheet className="pb-6">
        {error && (
          <ErrorMessage
            message={
              createdRoomUuid
                ? '참가에 실패했습니다. 닉네임을 바꿔 다시 시도해주세요.'
                : '방 생성에 실패했습니다. 다시 시도해주세요.'
            }
          />
        )}

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

          {/* 2~10 사이의 값 하나를 고르는 일이라 목록을 펼치는 select 보다 단추 두 개가 빠르다.
              화면을 덮는 목록도 뜨지 않고, 값이 항상 보인다. */}
          <div className="flex min-h-14 w-full items-center justify-between gap-3 rounded-tile border border-edge bg-surface px-4 shadow-surface">
            <span className="shrink-0 text-[15px] text-ink-soft">최대 인원</span>
            <div className="flex items-center gap-1" role="group" aria-label="최대 인원">
              <button
                type="button"
                onClick={() => stepParticipants(-1)}
                disabled={maxParticipants <= MIN_PARTICIPANTS}
                aria-label="한 명 줄이기"
                className="flex size-11 items-center justify-center rounded-full text-app-text transition-[background-color,transform] duration-150 active:scale-90 active:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:pointer-events-none disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-5" aria-hidden="true">
                  <path d="M5 12h14" />
                </svg>
              </button>

              <output
                className="w-14 text-center text-[17px] font-extrabold tracking-tight text-app-text"
                data-numeric
                aria-live="polite"
              >
                {maxParticipants}명
              </output>

              <button
                type="button"
                onClick={() => stepParticipants(1)}
                disabled={maxParticipants >= MAX_PARTICIPANTS}
                aria-label="한 명 늘리기"
                className="flex size-11 items-center justify-center rounded-full text-app-text transition-[background-color,transform] duration-150 active:scale-90 active:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:pointer-events-none disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-5" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={!nickname.trim() || !location}>
            방 생성하기
          </Button>
        </form>
      </PageSheet>
    </div>
  )
}

export default CreateRoomPage
