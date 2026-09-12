import { useOutletContext } from 'react-router-dom'
import useMainRoomSocket from '../hooks/useMainRoomSocket'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ParticipantList from '../components/common/ParticipantList'
import RoomCodeCard from '../components/common/RoomCodeCard'
import RoomResult from '../components/common/RoomResult'
import ModeSelection from '../components/common/ModeSelection'
import FloatingConfirmBar from '../components/common/FloatingConfirmBar'
import TreasureBagGame from '../components/common/TreasureBagGame'
import RestaurantSelection from '../components/common/RestaurantSelection'
import ErrorRedirect from '../components/common/ErrorRedirect'

function MainPage() {
  const { roomUuid, myParticipantId, participants } = useOutletContext()
  const { midpoint, selection, game, result, isLoading, error } = useMainRoomSocket(roomUuid, myParticipantId)
  const me = participants.find((participant) => String(participant.participantId) === String(myParticipantId))
  const isHost = me?.isHost === 'Y'
  const isReady = me?.isReady === 'Y'
  const readyPlayerCount = participants.filter((participant) => participant.isHost === 'Y' || participant.isReady === 'Y').length
  const canStart = participants.filter((participant) => participant.isReady === 'Y').length >= 1

  // 표시 조건과 확정 바의 조건은 기존 진행 순서를 따른다.
  const isChoosingRestaurant = !result.data && !game.game && !game.modeVote && Boolean(midpoint.data) &&
    (!selection.hasSelected || selection.isReselecting)
  const isChoosingMode = Boolean(game.modeVote) && !game.modeVote.decidedMode
  const hasConfirmBar = (isChoosingRestaurant && selection.pendingRestaurantId != null) ||
    (isChoosingMode && game.pendingMode != null)
  const preparation = { isHost, isReady, canStart, isStarting: game.isStarting, startError: game.startError, onStart: game.onStart }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorRedirect />

  return (
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader title="딱!" showBack={false} />
      <PageSheet
        className={hasConfirmBar
          ? 'pb-[calc(env(safe-area-inset-bottom)+11rem)]'
          : 'pb-[calc(env(safe-area-inset-bottom)+7rem)]'}
      >
        {result.data ? (
          <RoomResult
            result={result}
            participants={participants}
            myParticipantId={myParticipantId}
            selections={selection.selections}
            winnerParticipantId={game.game?.winnerParticipantId}
            isHost={isHost}
          />
        ) : game.game ? (
          <div>
            <TreasureBagGame
              status={game.game}
              myParticipantId={myParticipantId}
              onPick={game.onPickBag}
              onExpire={game.onExpireTurn}
              onLeave={game.onLeaveGame}
              isPicking={game.isPicking}
              errorMessage={game.gameError}
            />
            {game.game.status === 'ABORTED' && isHost && (
              <Button variant="primary" size="lg" fullWidth className="mt-4" onClick={game.onFallback} disabled={game.isStarting}>
                {game.isStarting ? '결과 뽑는 중...' : '무작위로 진행하기'}
              </Button>
            )}
          </div>
        ) : game.modeVote ? (
          <ModeSelection
            participants={participants}
            myParticipantId={myParticipantId}
            readyPlayerCount={readyPlayerCount}
            isHost={isHost}
            game={game}
          />
        ) : midpoint.data ? (
          <RestaurantSelection
            participants={participants}
            myParticipantId={myParticipantId}
            midpoint={midpoint}
            selection={selection}
            preparation={preparation}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <RoomCodeCard roomUuid={roomUuid} />
            <ParticipantList
              title={'참가자 ' + participants.length + '명'}
              participants={participants}
              myParticipantId={myParticipantId}
            />
            {isHost && (
              <Button variant="primary" size="lg" fullWidth className="mt-1" onClick={midpoint.onFind} disabled={midpoint.isFinding}>
                {midpoint.isFinding ? '중간지점 찾는 중...' : '중간지점 찾기'}
              </Button>
            )}
            {isHost && midpoint.findError && <ErrorMessage message={midpoint.findError} />}
          </div>
        )}
      </PageSheet>
      {isChoosingRestaurant && (
        <FloatingConfirmBar isVisible={selection.pendingRestaurantId != null} onConfirm={selection.onConfirm} disabled={selection.isSelecting}>
          {selection.isSelecting ? '선택하는 중...' : '선택 완료'}
        </FloatingConfirmBar>
      )}
      {isChoosingMode && (
        <FloatingConfirmBar isVisible={game.pendingMode != null} onConfirm={game.onConfirmVote} disabled={game.isVoting}>
          {game.isVoting ? '투표하는 중...' : '투표하기'}
        </FloatingConfirmBar>
      )}
    </div>
  )
}

export default MainPage
