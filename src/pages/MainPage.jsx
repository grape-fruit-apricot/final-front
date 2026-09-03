import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetchParticipantList from '../hooks/useFetchParticipantList'
import useFetchRoom from '../hooks/useFetchRoom'
import useFetchRestaurantList from '../hooks/useFetchRestaurantList'
import useCreateRestaurant from '../hooks/useCreateRestaurant'
import useFetchSelectionList from '../hooks/useFetchSelectionList'
import useCreateSelection from '../hooks/useCreateSelection'
import useUpdateReady from '../hooks/useUpdateReady'
import useFetchRouteResult from '../hooks/useFetchRouteResult'
import useFetchModeVote from '../hooks/useFetchModeVote'
import useRoomSocket from '../hooks/useRoomSocket'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import RestaurantList from '../components/common/RestaurantList'
import RestaurantSearchForm from '../components/common/RestaurantSearchForm'
import ParticipantSelectionList from '../components/common/ParticipantSelectionList'
import GameResult from '../components/common/GameResult'
import ModeVote from '../components/common/ModeVote'
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
  const { fetch: fetchRouteResult } = useFetchRouteResult()
  const { fetch: fetchModeVote } = useFetchModeVote()

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
  const [result, setResult] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState(null)
  // 투표가 열리기 전에는 null. 열리면 서버가 보낸 현황 전체를 그대로 담는다.
  const [modeVote, setModeVote] = useState(null)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    // 방을 옮기면 이전 방의 응답이 늦게 도착해 새 방의 상태를 덮어쓸 수 있다.
    let isCancelled = false

    setIsLoading(true)
    setLoadError(null)
    Promise.all([fetchParticipants(roomUuid), fetchRoomInfo(roomUuid)])
      .then(([participantList, room]) => {
        if (isCancelled) return

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
        // 이미 결과가 확정된 방이면 새로고침해도 결과 화면이 유지되도록 복원한다.
        // 결과 조회까지 기다렸다가 로딩을 끝내야, 중간지점 화면이 한 프레임 떴다 사라지지 않는다.
        if (room.stage === 'RESOLVED') {
          return fetchRouteResult(roomUuid)
            .then((routeResult) => {
              if (!isCancelled) setResult(routeResult)
            })
            .catch(() => {
              if (!isCancelled) setResult(null)
            })
        }
        // MODE_SELECTED 는 투표 중, RESOLVING 은 게임이 뽑혔지만 아직 게임이 없는 상태다.
        // 둘 다 투표 현황을 불러와야 화면이 복원된다.
        if (room.stage === 'MODE_SELECTED' || room.stage === 'RESOLVING') {
          return fetchModeVote(roomUuid)
            .then((status) => {
              if (!isCancelled) setModeVote(status)
            })
            .catch(() => {
              if (!isCancelled) setModeVote(null)
            })
        }
      })
      .catch((err) => {
        if (!isCancelled) setLoadError(err)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  // 중간지점이 생기면(새로고침 복원이든 소켓 브로드캐스트든) 그 주변 식당 목록을 불러온다.
  // midpoint 객체는 매번 새로 만들어지므로 존재 여부만 의존성으로 둔다.
  const hasMidpoint = midpoint != null
  useEffect(() => {
    if (!hasMidpoint) return

    let isCancelled = false

    fetchRestaurants(roomUuid)
      .then((list) => {
        if (!isCancelled) setRestaurants(list)
      })
      .catch(() => {
        if (!isCancelled) setRestaurants([])
      })

    fetchSelections(roomUuid)
      .then((list) => {
        if (!isCancelled) setSelections(list)
      })
      .catch(() => {
        if (!isCancelled) setSelections([])
      })

    return () => {
      isCancelled = true
    }
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
    // 방장이 투표를 열거나 누군가 투표하면 갱신된 현황 전체가 온다.
    // decidedMode 가 채워져 오면 전원 투표가 끝났다는 뜻이다.
    mode: (status) => {
      setModeVote(status)
      setIsStarting(false)
      setIsVoting(false)
    },
    'mode/error': (payload) => {
      setStartError(payload?.message ?? '투표를 처리하지 못했습니다.')
      setIsStarting(false)
      setIsVoting(false)
    },
    // 무작위로 정해지면 서버가 이어서 경로까지 확정해 보내준다.
    result: (routeResult) => {
      setResult(routeResult)
      setIsStarting(false)
    },
    'result/error': (payload) => {
      setStartError(payload?.message ?? '결과를 확정하지 못했습니다.')
      setIsStarting(false)
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

  // 시작하기는 이제 결과를 바로 확정하지 않고 진행 방식 투표를 연다.
  const handleStart = () => {
    setStartError(null)
    setIsStarting(true)

    if (!publish('/app/mode/start')) {
      setIsStarting(false)
      setStartError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const handleVote = (voteMode) => {
    setStartError(null)
    setIsVoting(true)

    if (!publish('/app/mode/vote', { voteMode })) {
      setIsVoting(false)
      setStartError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 게임이 뽑혔지만 아직 게임이 없다. 방을 막아두지 않도록 방장이 무작위로 넘길 수 있게 한다.
  // 게임이 붙으면 이 버튼을 게임 시작으로 교체하면 된다.
  const handleFallbackToRandom = () => {
    setStartError(null)
    setIsStarting(true)

    if (!publish('/app/result/find')) {
      setIsStarting(false)
      setStartError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
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
  // 방장에게는 준비 버튼이 없으므로(피그마상 시작하기만 있다) 판정에서 제외한다.
  const isEveryoneReady = participants
    .filter((participant) => participant.isHost !== 'Y')
    .every((participant) => participant.isReady === 'Y')

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (loadError) {
    return <ErrorMessage message="정보를 불러오지 못했습니다." />
  }

  return (
    <div className="min-h-screen bg-main-navy p-4">
      <h1 className="text-lg font-semibold text-white">진행</h1>

      {result ? (
        <div className="mt-4">
          <GameResult
            result={result}
            participants={participants}
            selections={selections}
            myParticipantId={myParticipantId}
          />
        </div>
      ) : modeVote ? (
        <div className="mt-4 flex flex-col gap-3">
          {startError && <ErrorMessage message={startError} />}

          {modeVote.decidedMode === 'GAME' ? (
            <>
              <h2 className="text-center font-semibold text-white">게임으로 정해졌습니다</h2>
              <p className="text-center text-sm text-white/70">
                게임은 아직 준비 중입니다. 방장이 무작위로 진행할 수 있습니다.
              </p>
              {isHost && (
                <button
                  type="button"
                  onClick={handleFallbackToRandom}
                  disabled={isStarting}
                  className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:bg-white/30 disabled:text-white/60"
                >
                  {isStarting ? '결과 뽑는 중...' : '무작위로 진행하기'}
                </button>
              )}
            </>
          ) : modeVote.decidedMode === 'RANDOM' ? (
            <p className="text-center text-white">무작위로 정하는 중입니다...</p>
          ) : (
            <ModeVote
              status={modeVote}
              participants={participants}
              myParticipantId={myParticipantId}
              onVote={handleVote}
              isVoting={isVoting}
            />
          )}
        </div>
      ) : midpoint ? (
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

              {startError && <ErrorMessage message={startError} />}

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!isEveryoneReady || isStarting}
                  className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:bg-white/30 disabled:text-white/60"
                >
                  {isStarting ? '결과 뽑는 중...' : '시작하기'}
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
