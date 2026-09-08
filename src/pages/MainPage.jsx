import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import useFetchRoom from '../hooks/useFetchRoom'
import useFetchRestaurantList from '../hooks/useFetchRestaurantList'
import useCreateRestaurant from '../hooks/useCreateRestaurant'
import useFetchSelectionList from '../hooks/useFetchSelectionList'
import useCreateSelection from '../hooks/useCreateSelection'
import useUpdateReady from '../hooks/useUpdateReady'
import useFetchRouteResult from '../hooks/useFetchRouteResult'
import useFetchModeVote from '../hooks/useFetchModeVote'
import useFetchGameStatus from '../hooks/useFetchGameStatus'
import useRoomSocket from '../hooks/useRoomSocket'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import RestaurantList from '../components/common/RestaurantList'
import RestaurantSearchForm from '../components/common/RestaurantSearchForm'
import ParticipantSelectionList from '../components/common/ParticipantSelectionList'
import RoomCodeCard from '../components/common/RoomCodeCard'
import GameResult from '../components/common/GameResult'
import RouteDetail from '../components/common/RouteDetail'
import ModeVote from '../components/common/ModeVote'
import GameLobby from '../components/common/GameLobby'
import FloatingConfirmBar from '../components/common/FloatingConfirmBar'
import TreasureBagGame from '../components/common/TreasureBagGame'
import MidpointMap from '../components/map/MidpointMap'

function MainPage() {
  // 참가자 목록은 RoomLayout 이 소켓으로 최신 상태를 유지한다(멤버 탭과 같은 값을 봐야 한다).
  const { roomUuid, myParticipantId, participants } = useOutletContext()

  const { fetch: fetchRoomInfo } = useFetchRoom()
  const { fetch: fetchRestaurants } = useFetchRestaurantList()
  const { create: createRestaurant, isLoading: isAdding } = useCreateRestaurant()
  const { fetch: fetchSelections } = useFetchSelectionList()
  const { create: createSelection, isLoading: isSelecting } = useCreateSelection()
  const { update: updateReady, isLoading: isReadying } = useUpdateReady()
  const { fetch: fetchRouteResult } = useFetchRouteResult()
  const { fetch: fetchModeVote } = useFetchModeVote()
  const { fetch: fetchGameStatus } = useFetchGameStatus()

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
  // 게임이 시작되기 전에는 null. 시작하면 서버가 보낸 현황 전체를 그대로 담는다.
  const [game, setGame] = useState(null)
  const [isPicking, setIsPicking] = useState(false)
  const [gameError, setGameError] = useState(null)
  // 결과 발표와 경로 안내를 한 탭 안에서 번갈아 보여준다(주소는 그대로 두고 화면만 바꾼다).
  const [isRouteOpen, setIsRouteOpen] = useState(false)
  // 이미 고른 사람이 다시 고르는 중인지. 서버는 선택을 덮어쓰므로(MERGE) 화면만 되돌려주면 된다.
  const [isReselecting, setIsReselecting] = useState(false)
  // 목록에서 눌러만 두고 아직 서버에 보내지 않은 식당.
  // 누르는 즉시 확정되면 잘못 눌렀을 때 되돌릴 방법이 없어서, 확정은 아래 버튼이 맡는다.
  const [pendingRestaurantId, setPendingRestaurantId] = useState(null)
  // 투표도 식당 고르기와 같은 두 단계다. 누르는 것은 표시만 바꾸고, 표는 확정 바가 보낸다.
  const [pendingMode, setPendingMode] = useState(null)

  useEffect(() => {
    // 방을 옮기면 이전 방의 응답이 늦게 도착해 새 방의 상태를 덮어쓸 수 있다.
    let isCancelled = false

    setIsLoading(true)
    setLoadError(null)
    // 방 정보는 RoomLayout 도 갖고 있지만 그쪽은 입장 시점에서 멈춘 값이다. 탭을 옮겨도
    // 리마운트되지 않기 때문이다. 이 화면은 진행 단계로 복원해야 하므로 직접 다시 부른다.
    fetchRoomInfo(roomUuid)
      .then((room) => {
        if (isCancelled) return

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
        // 게임이 도는 중이면 주머니 상태와 남은 시간까지 복원해야 한다.
        if (room.stage === 'GAME_PLAYING') {
          return fetchGameStatus(roomUuid)
            .then((status) => {
              if (!isCancelled) setGame(status)
            })
            .catch(() => {
              if (!isCancelled) setGame(null)
            })
        }
        // MODE_SELECTED 는 투표 중, RESOLVING 은 게임을 시작하기 전 대기 상태다.
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
    // 게임이 시작되거나 누군가 주머니를 열면 갱신된 현황 전체가 온다.
    game: (status) => {
      setGame(status)
      setIsPicking(false)
      setIsStarting(false)
    },
    'game/error': (payload) => {
      setGameError(payload?.message ?? '게임을 처리하지 못했습니다.')
      setIsPicking(false)
      setIsStarting(false)
    },
    // 무작위로 정해지거나 게임이 끝나면 서버가 이어서 경로까지 확정해 보내준다.
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

  const handleTravelModeChange = async (travelMode) => {
    const routeResult = await fetchRouteResult(roomUuid, travelMode)
    setResult(routeResult)
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

  // 목록에서 누르는 것은 표시만 바꾼다. 서버로는 보내지 않는다.
  const handlePickRestaurant = (restaurantId) => {
    setSelectError(null)
    setPendingRestaurantId(restaurantId)
  }

  // 선택 결과도 소켓으로 갱신된 현황이 돌아오므로 여기서 다시 조회하지 않는다.
  const handleConfirmSelection = async () => {
    if (pendingRestaurantId == null) return

    setSelectError(null)
    try {
      await createSelection(roomUuid, myParticipantId, pendingRestaurantId)
      // 고르고 나면 현황 화면으로 돌아간다. 실패하면 목록에 남아 다시 고를 수 있어야 한다.
      // pendingRestaurantId 는 비우지 않는다. 소켓으로 selections 가 도착하기 전에 비우면
      // 그 사이 목록에서 체크가 잠깐 풀렸다가 화면이 넘어간다.
      setIsReselecting(false)
    } catch (err) {
      setSelectError(err?.response?.data?.message ?? '식당을 선택하지 못했습니다.')
    }
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

  const handlePickMode = (voteMode) => {
    setStartError(null)
    setPendingMode(voteMode)
  }

  const handleConfirmVote = () => {
    if (pendingMode == null) return
    handleVote(pendingMode)
  }

  const handleStartGame = () => {
    setGameError(null)
    setIsStarting(true)

    if (!publish('/app/game/start')) {
      setIsStarting(false)
      setGameError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const handlePickBag = (bagIndex) => {
    setGameError(null)
    setIsPicking(true)

    if (!publish('/app/game/pick', { bagIndex })) {
      setIsPicking(false)
      setGameError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 서버에는 차례 타이머가 없다. 시간이 다 되면 화면이 알려준다.
  // 여러 명이 동시에 보내도 서버가 첫 번째만 반영하므로 실패해도 따로 처리하지 않는다.
  const handleExpireTurn = (turnSeq) => {
    publish('/app/game/expire', { turnSeq })
  }

  const handleLeaveGame = () => {
    setGameError(null)

    if (!publish('/app/game/leave')) {
      setGameError('연결이 끊겼습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 게임을 못 하거나 중단됐을 때 방을 막아두지 않도록 방장이 무작위로 넘길 수 있게 한다.
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
  const mySelection = selections.find(
    (selection) => String(selection.participantId) === String(myParticipantId)
  )
  const hasSelected = Boolean(mySelection)
  // 식당을 고르는 중인 화면인지. 아래 렌더 분기(result > game > modeVote > midpoint)와 조건이 같아야
  // 확정 바가 엉뚱한 화면에 떠 있지 않는다.
  const isChoosingRestaurant =
    !result && !game && !modeVote && Boolean(midpoint) && (!hasSelected || isReselecting)

  // 아직 방식이 정해지지 않은 투표 중일 때만 투표 확정 바를 띄운다.
  const isChoosingMode = Boolean(modeVote) && !modeVote.decidedMode

  // 방장은 전원이 준비되지 않아도 시작할 수 있다. 대신 게임에 들어갈 인원(방장 + 준비 완료)이
  // 최소 2명은 되어야 한다(서버도 game.min-participants 로 같은 기준을 다시 확인한다).
  const readyPlayerCount = participants.filter(
    (participant) => participant.isHost === 'Y' || participant.isReady === 'Y'
  ).length

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (loadError) {
    return <ErrorMessage message="정보를 불러오지 못했습니다." />
  }

  return (
    // 탭 화면이라 되돌아갈 곳이 없다(showBack={false}).
    // pb-28 은 떠 있는 하단 네브 자리다. 시트 배경 안쪽에 둬야 색이 끊기지 않는다.
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader title="딱!" showBack={false} />
      <PageSheet
        className={
          (isChoosingRestaurant && pendingRestaurantId != null) ||
          (isChoosingMode && pendingMode != null)
            ? 'pb-[calc(env(safe-area-inset-bottom)+11rem)]'
            : 'pb-[calc(env(safe-area-inset-bottom)+7rem)]'
        }
      >
      {result ? (
        <div>
          {isRouteOpen ? (
            <RouteDetail
              result={result}
              participants={participants}
              myParticipantId={myParticipantId}
              onBack={() => setIsRouteOpen(false)}
              onTravelModeChange={handleTravelModeChange}
            />
          ) : (
            <GameResult
              result={result}
              participants={participants}
              selections={selections}
              winnerParticipantId={game?.winnerParticipantId}
              onShowRoute={() => setIsRouteOpen(true)}
            />
          )}
        </div>
      ) : game ? (
        <div>
          <TreasureBagGame
            status={game}
            myParticipantId={myParticipantId}
            onPick={handlePickBag}
            onExpire={handleExpireTurn}
            onLeave={handleLeaveGame}
            isPicking={isPicking}
            errorMessage={gameError}
          />
          {game.status === 'ABORTED' && isHost && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
              onClick={handleFallbackToRandom}
              disabled={isStarting}
            >
              {isStarting ? '결과 뽑는 중...' : '무작위로 진행하기'}
            </Button>
          )}
        </div>
      ) : modeVote ? (
        // GameLobby / ModeVote 는 남은 높이를 채우도록 flex-1 을 쓴다.
        // 감싸는 쪽도 flex-1 이어야 그 높이가 실제로 전달된다.
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {modeVote.decidedMode === 'GAME' ? (
            <GameLobby
              participants={participants}
              readyPlayerCount={readyPlayerCount}
              isHost={isHost}
              isStarting={isStarting}
              onStart={handleStartGame}
              onFallback={handleFallbackToRandom}
              startError={startError}
              gameError={gameError}
            />
          ) : modeVote.decidedMode === 'RANDOM' ? (
            <>
              {startError && <ErrorMessage message={startError} />}
              {gameError && <ErrorMessage message={gameError} />}
              <p className="text-center text-[15px] text-ink-soft">무작위로 정하는 중입니다...</p>
            </>
          ) : (
            <>
              {startError && <ErrorMessage message={startError} />}
              {gameError && <ErrorMessage message={gameError} />}
              <ModeVote
                status={modeVote}
                participants={participants}
                myParticipantId={myParticipantId}
                pickedMode={pendingMode}
                onPick={handlePickMode}
                isVoting={isVoting}
              />
            </>
          )}
        </div>
      ) : midpoint ? (
        <div className="flex flex-col gap-3">
          <MidpointMap name={midpoint.name} lat={midpoint.lat} lng={midpoint.lng} />

          {hasSelected && !isReselecting ? (
            <>
              <h2 className="mt-2 text-center text-subhead font-extrabold text-app-text">참가자들이 고른 식당</h2>
              <ParticipantSelectionList
                participants={participants}
                selections={selections}
                restaurants={restaurants}
              />
              {readyError && <ErrorMessage message={readyError} />}

              {startError && <ErrorMessage message={startError} />}

              {isHost ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  onClick={handleStart}
                  disabled={isStarting}
                >
                  {isStarting ? '결과 뽑는 중...' : '시작하기'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  onClick={handleReady}
                  disabled={isReady || isReadying}
                >
                  {isReady ? '준비중' : '준비하기'}
                </Button>
              )}

              {/* 서버가 선택을 덮어쓰므로 몇 번이든 바꿀 수 있다.
                  단 중간지점 단계에서만 허용되어, 게임·결과로 넘어가면 이 화면 자체가 사라진다. */}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setSelectError(null)
                  // 지금 고른 것이 체크된 채로 시작해야 무엇을 바꾸는지 알 수 있다.
                  setPendingRestaurantId(mySelection?.restaurantId ?? null)
                  setIsReselecting(true)
                }}
              >
                식당 변경하기
              </Button>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-title font-extrabold text-app-text">
                {isReselecting ? '식당 다시 고르기' : '주변 식당'}
              </h2>
              <RestaurantSearchForm
                lat={midpoint.lat}
                lng={midpoint.lng}
                onAdd={handleAddRestaurant}
                isAdding={isAdding}
              />
              {addError && <ErrorMessage message={addError} />}
              <p className="text-sm text-ink-soft">
                {selections.length}/{participants.length}명 선택 완료
              </p>
              {selectError && <ErrorMessage message={selectError} />}
              <RestaurantList
                restaurants={restaurants}
                selections={selections}
                myParticipantId={myParticipantId}
                selectedRestaurantId={pendingRestaurantId}
                onSelect={handlePickRestaurant}
                isSelecting={isSelecting}
              />

              {/* 마음이 바뀌면 고른 것을 그대로 두고 돌아갈 수 있어야 한다. */}
              {isReselecting && (
                <Button
                  variant="plain"
                  fullWidth
                  onClick={() => {
                    setSelectError(null)
                    // 되돌아갈 때는 눌러둔 것을 버리고 서버에 저장된 선택으로 되돌린다.
                    setPendingRestaurantId(mySelection?.restaurantId ?? null)
                    setIsReselecting(false)
                  }}
                >
                  변경 취소
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        // 아직 중간지점이 없는 첫 단계다. 사람을 모으는 중이라 방 코드를 함께 보여준다.
        <div className="flex flex-col gap-3">
          <RoomCodeCard roomUuid={roomUuid} />

          <ParticipantList
            title={`참가자 ${participants.length}명`}
            participants={participants}
            myParticipantId={myParticipantId}
          />

          {isHost && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-1"
              onClick={handleFindMidpoint}
              disabled={isFinding}
            >
              {isFinding ? '중간지점 찾는 중...' : '중간지점 찾기'}
            </Button>
          )}
          {isHost && findError && <ErrorMessage message={findError} />}
        </div>
      )}
      </PageSheet>

      {/* 누르는 것과 확정하는 것을 나눈다. 잘못 눌러도 이 버튼을 누르기 전까지는 되돌릴 수 있다.
          두 바는 서로 다른 단계에서만 뜨므로 화면에 겹치지 않는다. */}
      {isChoosingRestaurant && (
        <FloatingConfirmBar
          isVisible={pendingRestaurantId != null}
          onConfirm={handleConfirmSelection}
          disabled={isSelecting}
        >
          {isSelecting ? '선택하는 중...' : '선택 완료'}
        </FloatingConfirmBar>
      )}

      {isChoosingMode && (
        <FloatingConfirmBar
          isVisible={pendingMode != null}
          onConfirm={handleConfirmVote}
          disabled={isVoting}
        >
          {isVoting ? '투표하는 중...' : '투표하기'}
        </FloatingConfirmBar>
      )}
    </div>
  )
}

export default MainPage
