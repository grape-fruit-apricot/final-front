import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
import useFetchRoom from '../hooks/useFetchRoom'
import useRoomSocket from '../hooks/useRoomSocket'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import MidpointMap from '../components/map/MidpointMap'

function MainPage() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)

  const { fetch: fetchParticipants } = useFetchParticipantList()
  const { fetch: fetchRoomInfo } = useFetchRoom()

  const [participants, setParticipants] = useState([])
  const [midpoint, setMidpoint] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isFinding, setIsFinding] = useState(false)
  const [findError, setFindError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    Promise.all([fetchParticipants(roomUuid), fetchRoomInfo(roomUuid)])
      .then(([participantList, room]) => {
        setParticipants(participantList)
        if (room.stage === 'MIDPOINT_FOUND') {
          setMidpoint({
            name: room.midpointSource === 'FALLBACK' ? '중심점' : '중간지점',
            lat: room.midpointLat,
            lng: room.midpointLng,
          })
        }
      })
      .catch((err) => setLoadError(err))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  const { publish } = useRoomSocket(roomUuid, myParticipantId, {
    participants: (newParticipant) => {
      setParticipants((prev) => [...prev, newParticipant])
    },
    midpoint: (result) => {
      setMidpoint(result)
      setIsFinding(false)
    },
    'midpoint/error': () => {
      setFindError('중간지점을 찾지 못했습니다. 잠시 후 다시 시도해주세요.')
      setIsFinding(false)
    },
  })

  // 방장 여부는 서버가 소켓 세션의 participantId로 다시 확인하므로, 여기서는 버튼 노출만 판단한다.
  const handleFindMidpoint = () => {
    setFindError(null)
    setIsFinding(true)

    if (!publish('/app/midpoint/find')) {
      setIsFinding(false)
      setFindError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const isHost = participants.some(
    (participant) =>
      String(participant.participantId) === String(myParticipantId) && participant.isHost === 'Y'
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (loadError) {
    return <ErrorMessage message="정보를 불러오지 못했습니다." />
  }

  return (
    <div className="min-h-screen bg-main-navy p-4">
      <h1 className="text-lg font-semibold text-white">진행</h1>

      {midpoint ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-center text-white">여기가 우리 만남의 중간 지점이에요!</p>
          <MidpointMap name={midpoint.name} lat={midpoint.lat} lng={midpoint.lng} />
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-white/70">{participants.length}명 참여 중</p>
          <div className="mt-4">
            <ParticipantList participants={participants} />
          </div>
          {isHost && (
            <button
              type="button"
              onClick={handleFindMidpoint}
              disabled={isFinding}
              className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:opacity-60"
            >
              {isFinding ? '중간지점 찾는 중...' : '중간지점 찾기'}
            </button>
          )}
          {isHost && findError && <ErrorMessage message={findError} />}
        </>
      )}
    </div>
  )
}

export default MainPage
