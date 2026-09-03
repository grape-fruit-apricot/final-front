import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
import useFetchRoom from '../hooks/useFetchRoom'
import useFetchRestaurantList from '../hooks/useFetchRestaurantList'
import useCreateRestaurant from '../hooks/useCreateRestaurant'
import useRoomSocket from '../hooks/useRoomSocket'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import RestaurantList from '../components/common/RestaurantList'
import RestaurantSearchForm from '../components/common/RestaurantSearchForm'
import MidpointMap from '../components/map/MidpointMap'

function MainPage() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)

  const { fetch: fetchParticipants } = useFetchParticipantList()
  const { fetch: fetchRoomInfo } = useFetchRoom()
  const { fetch: fetchRestaurants } = useFetchRestaurantList()
  const { create: createRestaurant, isLoading: isAdding } = useCreateRestaurant()

  const [participants, setParticipants] = useState([])
  const [midpoint, setMidpoint] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isFinding, setIsFinding] = useState(false)
  const [findError, setFindError] = useState(null)
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    Promise.all([fetchParticipants(roomUuid), fetchRoomInfo(roomUuid)])
      .then(([participantList, room]) => {
        setParticipants(participantList)
        // stage 값을 열거하면 RESOLVING/RESOLVED 로 넘어간 방에서 지도가 복원되지 않는다.
        // 백엔드와 같은 기준인 좌표 유무로 판단한다.
        if (room.midpointLat != null && room.midpointLng != null) {
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

  // 중간지점이 생기면(새로고침 복원이든 소켓 브로드캐스트든) 그 주변 식당 목록을 불러온다.
  // midpoint 객체는 매번 새로 만들어지므로 존재 여부만 의존성으로 둔다.
  const hasMidpoint = midpoint != null
  useEffect(() => {
    if (!hasMidpoint) return

    fetchRestaurants(roomUuid)
      .then(setRestaurants)
      .catch(() => setRestaurants([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMidpoint, roomUuid])

  const { publish } = useRoomSocket(roomUuid, myParticipantId, {
    participants: (newParticipant) => {
      setParticipants((prev) => [...prev, newParticipant])
    },
    midpoint: (result) => {
      setMidpoint(result)
      setIsFinding(false)
    },
    // 서버가 보낸 사유를 그대로 보여준다. "도보 경로를 찾지 못했습니다" 처럼
    // 다시 시도해도 소용없는 경우가 있어 일괄 문구로 덮으면 안내가 틀어진다.
    'midpoint/error': (payload) => {
      setFindError(payload?.message ?? '중간지점을 찾지 못했습니다. 잠시 후 다시 시도해주세요.')
      setIsFinding(false)
    },
    // 누군가 식당을 추가하면 서버가 갱신된 목록 전체를 보내준다.
    restaurants: (list) => {
      setRestaurants(list)
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

  // 추가에 성공하면 갱신된 목록이 소켓으로 돌아오므로 여기서 목록을 다시 조회하지 않는다.
  const handleAddRestaurant = async (payload) => {
    setAddError(null)
    await createRestaurant(roomUuid, {
      ...payload,
      participantId: Number(myParticipantId),
    }).catch((err) => {
      setAddError(err?.response?.data?.message ?? '식당을 추가하지 못했습니다.')
    })
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
          <h2 className="mt-2 font-semibold text-white">주변 식당</h2>
          <RestaurantSearchForm
            lat={midpoint.lat}
            lng={midpoint.lng}
            onAdd={handleAddRestaurant}
            isAdding={isAdding}
          />
          {addError && <ErrorMessage message={addError} />}
          <RestaurantList restaurants={restaurants} />
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
