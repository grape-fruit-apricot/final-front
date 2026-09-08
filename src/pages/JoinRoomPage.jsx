import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetchRoom from '../hooks/useFetchRoom'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function JoinRoomPage() {
  const navigate = useNavigate()
  const { fetch, isLoading, error } = useFetchRoom()
  const [roomUuid, setRoomUuid] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const room = await fetch(roomUuid).catch(() => null)
    if (room) {
      navigate(`/join/${roomUuid}`)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader title="방 입장하기" />
      <PageSheet className="pb-6">
        <p className="text-[15px] text-ink-soft">방 코드를 입력해주세요.</p>
        {error && <ErrorMessage message="방을 찾을 수 없습니다. 코드를 다시 확인해주세요." />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={roomUuid}
            onChange={(e) => setRoomUuid(e.target.value)}
            placeholder="방 코드"
            className="min-h-12 w-full rounded-tile border border-edge bg-surface px-4 text-[15px] text-app-text shadow-surface placeholder:text-ink-faint focus:border-point-orange focus:outline-none"
          />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            확인
          </Button>
        </form>
      </PageSheet>
    </div>
  )
}

export default JoinRoomPage
