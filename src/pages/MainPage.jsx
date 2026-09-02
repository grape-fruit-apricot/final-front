import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
import useParticipantSocket from '../hooks/useParticipantSocket'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'

function MainPage() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)
  const { fetch, isLoading, error } = useFetchParticipantList()
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    fetch(roomUuid)
      .then(setParticipants)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  useParticipantSocket(roomUuid, myParticipantId, (newParticipant) => {
    setParticipants((prev) => [...prev, newParticipant])
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message="참가자 목록을 불러오지 못했습니다." />
  }

  return (
    <div className="min-h-screen bg-main-navy p-4">
      <h1 className="text-lg font-semibold text-white">진행</h1>
      <p className="mt-1 text-sm text-white/70">{participants.length}명 참여 중</p>
      {participants.length === 0 ? (
        <EmptyState message="아직 참가자가 없습니다." />
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {participants.map((participant) => (
            <li
              key={participant.participantId}
              className="rounded-lg bg-white px-4 py-3 text-app-text"
            >
              {participant.nickname}
              {participant.isHost === 'Y' && ' (방장)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MainPage
