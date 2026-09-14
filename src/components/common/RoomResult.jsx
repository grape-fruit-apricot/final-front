import GameResult from './GameResult'
import RouteDetail from './RouteDetail'
import TrackingPanel from './TrackingPanel'

// 방의 최종 결과와 경로·이동 추적 화면의 표시 분기를 담당한다.
function RoomResult({ result: resultState, participants, myParticipantId, selections, winnerParticipantId, isHost }) {
  const {
    data: result, resultView, travelMode, tracking,
    isTrackingStarting: isLoading, trackingError: error,
    onViewChange, onTravelModeChange, onStartTracking,
  } = resultState

  const handleBack = () => onViewChange('result')
  const handleShowRoute = () => onViewChange('route')
  const handleShowTracking = () => onViewChange('tracking')

  return (
    <div>
      {resultView === 'route' ? (
        <RouteDetail
          result={result}
          participants={participants}
          myParticipantId={myParticipantId}
          travelMode={travelMode}
          onBack={handleBack}
          onTravelModeChange={onTravelModeChange}
        />
      ) : resultView === 'tracking' ? (
        <TrackingPanel
          tracking={tracking}
          myParticipantId={myParticipantId}
          isHost={isHost}
          isStarting={isLoading}
          errorMessage={error}
          onStart={onStartTracking}
          onBack={handleBack}
        />
      ) : (
        <GameResult
          result={result}
          participants={participants}
          selections={selections}
          winnerParticipantId={winnerParticipantId}
          onShowRoute={handleShowRoute}
          onShowTracking={handleShowTracking}
        />
      )}
    </div>
  )
}

export default RoomResult
