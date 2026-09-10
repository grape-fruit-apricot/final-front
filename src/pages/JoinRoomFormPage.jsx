import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useJoinRoom from '../hooks/useJoinRoom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
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
  const { fetch: fetchParticipants } = useFetchParticipantList()
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState(null)
  // 저장된 신원을 확인하기 전에는 폼을 그리지 않는다. 확인 중에 입장 버튼이 눌리면
  // 아래 검사가 끝나기 전에 참가자가 하나 더 생긴다.
  const [isCheckingSaved, setIsCheckingSaved] = useState(true)

  // 이미 이 방에 들어와 있는 기기가 초대 링크를 다시 열면, 새로 입장시키지 않고 원래 신원으로 돌려보낸다.
  //
  // 이게 없으면 링크를 누를 때마다 같은 사람의 참가자 행이 하나씩 늘고, 그때마다
  // localStorage 의 ID 가 새 행으로 덮어써진다. 새 행은 방장이 아니므로(방장은 첫 입장자)
  // 방장이 링크를 다시 열면 그 순간 방장 자리를 잃고 시작 버튼이 사라진다.
  //
  // 저장된 ID 가 목록에 없으면(나갔거나 방이 만료) 낡은 값이므로 지우고 평소대로 입장 폼을 띄운다.
  useEffect(() => {
    const savedId = localStorage.getItem(`room:${roomUuid}:participantId`)
    if (!savedId) {
      setIsCheckingSaved(false)
      return
    }

    let isCancelled = false
    fetchParticipants(roomUuid)
      .then((participants) => {
        if (isCancelled) return
        const isStillIn = participants.some(
          (participant) => String(participant.participantId) === String(savedId)
        )
        if (isStillIn) {
          navigate(`/rooms/${roomUuid}`, { replace: true })
          return
        }
        localStorage.removeItem(`room:${roomUuid}:participantId`)
        setIsCheckingSaved(false)
      })
      // 조회에 실패해도 입장 자체를 막지는 않는다. 폼을 띄우고 평소 경로로 보낸다.
      .catch(() => {
        if (!isCancelled) setIsCheckingSaved(false)
      })

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

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

  if (isLoading || isCheckingSaved) {
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
