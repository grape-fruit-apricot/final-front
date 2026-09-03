import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
import useFetchRoom from '../hooks/useFetchRoom'
import useFetchRestaurantList from '../hooks/useFetchRestaurantList'
import useCreateRestaurant from '../hooks/useCreateRestaurant'
import useFetchSelectionList from '../hooks/useFetchSelectionList'
import useCreateSelection from '../hooks/useCreateSelection'
import useUpdateReady from '../hooks/useUpdateReady'
import useRoomSocket from '../hooks/useRoomSocket'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import RestaurantList from '../components/common/RestaurantList'
import RestaurantSearchForm from '../components/common/RestaurantSearchForm'
import ParticipantSelectionList from '../components/common/ParticipantSelectionList'
import MidpointMap from '../components/map/MidpointMap'

function MainPage() {
  const { roomUuid } = useParams()
  const myParticipantId = localStorage.getItem(`room:${roomUuid}:participantId`)

  const { fetch: fetchParticipants } = useFetchParticipantList()
  const { fetch: fetchRoomInfo } = useFetchRoom()
  const { fetch: fetchRestaurants } = useFetchRestaurantList()
  const { create: createRestaurant, isLoading: isAdding } = useCreateRestaurant()
  const { fetch: fetchSelections } = useFetchSelectionList()
  const { create: createSelection, isLoading: isSelecting } = useCreateSelection()
  const { update: updateReady, isLoading: isReadying } = useUpdateReady()

  const [participants, setParticipants] = useState([])
  const [midpoint, setMidpoint] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [selections, setSelections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isFinding, setIsFinding] = useState(false)
  const [findError, setFindError] = useState(null)
  const [addError, setAddError] = useState(null)
  const [selectError, setSelectError] = useState(null)
  const [readyError, setReadyError] = useState(null)

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

    fetchSelections(roomUuid)
      .then(setSelections)
      .catch(() => setSelections([]))
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
    // 누군가 식당을 선택하면 갱신된 선택 현황 전체가 온다.
    selections: (list) => {
      setSelections(list)
    },
    // 누군가 준비를 마치면 갱신된 참가자 목록 전체가 온다(입장 토픽은 새 참가자 1명만 보낸다).
    'participants/ready': (list) => {
      setParticipants(list)
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

  // 선택 결과도 소켓으로 갱신된 현황이 돌아오므로 여기서 다시 조회하지 않는다.
  const handleSelectRestaurant = async (restaurantId) => {
    setSelectError(null)
    await createSelection(roomUuid, myParticipantId, restaurantId).catch((err) => {
      setSelectError(err?.response?.data?.message ?? '식당을 선택하지 못했습니다.')
    })
  }

  const handleReady = async () => {
    setReadyError(null)
    await updateReady(roomUuid, myParticipantId).catch((err) => {
      setReadyError(err?.response?.data?.message ?? '준비 상태를 바꾸지 못했습니다.')
    })
  }

  const me = participants.find(
    (participant) => String(participant.participantId) === String(myParticipantId)
  )
  const isHost = me?.isHost === 'Y'
  const isReady = me?.isReady === 'Y'

  // 내가 식당을 고르면 다른 참가자들의 선택을 지켜보는 화면으로 넘어간다.
  const hasSelected = selections.some(
    (selection) => String(selection.participantId) === String(myParticipantId)
  )
  const isEveryoneReady =
    participants.length > 0 && participants.every((participant) => participant.isReady === 'Y')

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
          <MidpointMap name={midpoint.name} lat={midpoint.lat} lng={midpoint.lng} />

          {hasSelected ? (
            <>
              <h2 className="mt-2 text-center font-semibold text-white">참가자들이 고른 식당</h2>
              <ParticipantSelectionList
                participants={participants}
                selections={selections}
                restaurants={restaurants}
              />
              {readyError && <ErrorMessage message={readyError} />}

              {isHost ? (
                <button
                  type="button"
                  disabled={!isEveryoneReady}
                  className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:bg-white/30 disabled:text-white/60"
                >
                  시작하기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReady}
                  disabled={isReady || isReadying}
                  className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:bg-white/30 disabled:text-white/60"
                >
                  {isReady ? '준비중' : '준비하기'}
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-2 font-semibold text-white">주변 식당</h2>
              <RestaurantSearchForm
                lat={midpoint.lat}
                lng={midpoint.lng}
                onAdd={handleAddRestaurant}
                isAdding={isAdding}
              />
              {addError && <ErrorMessage message={addError} />}
              <p className="text-sm text-white/70">
                {selections.length}/{participants.length}명 선택 완료
              </p>
              {selectError && <ErrorMessage message={selectError} />}
              <RestaurantList
                restaurants={restaurants}
                selections={selections}
                myParticipantId={myParticipantId}
                onSelect={handleSelectRestaurant}
                isSelecting={isSelecting}
              />
            </>
          )}
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
