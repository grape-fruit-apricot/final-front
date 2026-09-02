import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCreateRoom from '../hooks/useCreateRoom'
import useJoinRoom from '../hooks/useJoinRoom'
import MapPlaceholder from '../components/common/MapPlaceholder'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

// 지도에서 직접 위치를 선택하는 기능은 아직 준비 중이라 임시 고정 좌표를 사용한다
const TEMP_LAT = 37.5696
const TEMP_LNG = 126.9842

function CreateRoomPage() {
  const navigate = useNavigate()
  const { create } = useCreateRoom()
  const { join } = useJoinRoom()
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const room = await create()
      await join(room.roomUuid, {
        nickname,
        lat: TEMP_LAT,
        lng: TEMP_LNG,
      })
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
    <div className="flex min-h-screen flex-col justify-center gap-6 bg-main-navy p-6">
      <h1 className="text-center text-xl font-bold text-white">방 생성하기</h1>
      {error && <ErrorMessage message="방 생성에 실패했습니다. 다시 시도해주세요." />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <MapPlaceholder />
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
          className="min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
        >
          방 생성하기
        </button>
      </form>
    </div>
  )
}

export default CreateRoomPage
