import TrackingMap from '../map/TrackingMap'
import ListGroup from './ListGroup'
import EmptyState from './EmptyState'
import ErrorMessage from './ErrorMessage'
import Button from './Button'
import { formatApproachDistance, formatDistance } from '../../utils/geo'
import { trackingColorAt } from '../../utils/mapMarker'

// 확정된 식당으로 이동하는 참가자들의 현황 화면. 결과 발표(GameResult)에서 "이동 추적"으로 열린다.
// 좌표는 외부 디바이스(라즈베리파이)가 보내고, 거리 계산과 도착 판정은 서버가 한다.
// 이 화면은 서버가 보낸 값을 그대로 보여주기만 한다 — 여기서 다시 계산하면 두 값이 갈린다.
//
// tracking 은 소켓 방송과 REST 조회가 같은 모양이라 어느 쪽에서 왔는지 구분하지 않는다.
// participants 가 빈 배열이면 아직 시작하지 않은 방이다(서버가 404 대신 빈 목록을 준다).
function TrackingPanel({
  tracking,
  myParticipantId,
  isHost,
  isStarting,
  errorMessage,
  onStart,
  onBack,
}) {
  const destination = tracking?.destination
  const participants = tracking?.participants ?? []
  const hasStarted = participants.length > 0
  const arrivedCount = participants.filter((participant) => participant.status === 'ARRIVED').length

  return (
    <div className="flex flex-col gap-4">
      {/* 탭을 옮기는 게 아니라 결과 발표로 되돌아가는 것이라 라우터를 쓰지 않는다(RouteDetail 과 같다). */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="결과로 돌아가기"
          className="-ml-1.5 flex size-11 shrink-0 items-center justify-center rounded-full text-app-text transition-transform duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-xs font-extrabold tracking-[0.16em] text-ink-soft">이동 추적</span>
      </div>

      <div>
        <h2 className="text-title font-extrabold text-app-text">{destination?.name ?? '이동 추적'}</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          {hasStarted ? (
            <>
              <span data-numeric>{arrivedCount}</span>
              {' / '}
              <span data-numeric>{participants.length}</span>
              명 도착
            </>
          ) : (
            '외부 디바이스가 보내는 위치로 이동 현황을 보여줍니다.'
          )}
        </p>
      </div>

      {errorMessage && <ErrorMessage message={errorMessage} />}

      {hasStarted && destination ? (
        <TrackingMap destination={destination} participants={participants} />
      ) : (
        <EmptyState
          message={
            isHost
              ? '아직 시작하지 않았어요. 아래 버튼을 누르면 디바이스가 위치를 보내기 시작합니다.'
              : '아직 시작하지 않았어요. 방장이 이동 추적을 시작하면 여기에 표시됩니다.'
          }
        />
      )}

      {/* 시작은 방장만. 서버도 소켓 세션의 participantId 로 방장 여부를 다시 확인한다.
          이미 시작된 방에서 다시 눌러도 서버가 새 세션을 만들지 않고 현재 상태만 방송한다. */}
      {isHost && !hasStarted && (
        <Button variant="primary" size="lg" fullWidth onClick={onStart} disabled={isStarting}>
          {isStarting ? '시작하는 중...' : '이동 추적 시작'}
        </Button>
      )}

      {hasStarted && (
        <ListGroup title="참가자별 이동 현황">
          {participants.map((participant, index) => {
            const isMe = String(participant.participantId) === String(myParticipantId)
            const isArrived = participant.status === 'ARRIVED'

            return (
              <div
                key={participant.participantId}
                className="flex min-h-14 items-center justify-between gap-4 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {/* 지도의 궤적 색과 같은 점. 어느 선이 누구인지 이 점으로 잇는다. */}
                  <span
                    className="size-3 flex-none rounded-full"
                    style={{ backgroundColor: trackingColorAt(index) }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[17px] font-bold tracking-tight text-app-text">
                        {participant.nickname}
                      </span>
                      {/* 배지 모양이 멤버 목록과 같아야 같은 뜻으로 읽힌다.
                          공용 배지 컴포넌트는 아직 다른 브랜치에 있어 여기서는 같은 토큰으로 맞춘다. */}
                      {isMe && (
                        <span className="flex-none rounded-full bg-accent-tint px-2 py-0.5 text-xs font-bold text-accent-ink">
                          나
                        </span>
                      )}
                    </span>
                    {/* 요약은 도착한 뒤에만 온다. 직선거리가 아니라 실제로 지나온 궤적의 길이라,
                        좌표를 남겨두지 않았다면 나올 수 없는 값이다. */}
                    {participant.summary && (
                      <span className="mt-0.5 block truncate text-xs text-ink-soft" data-numeric>
                        {formatDistance(participant.summary.totalDistanceM)} 이동 ·{' '}
                        {formatDuration(participant.summary.durationSeconds)} · 평균{' '}
                        {formatSpeed(participant.summary.averageSpeedKmh)}
                      </span>
                    )}
                  </span>
                </span>

                <span className="flex-none text-right">
                  {isArrived ? (
                    <>
                      <span className="block text-[15px] font-extrabold text-accent-ink">도착</span>
                      {formatClockTime(participant.arrivedAt) && (
                        <span className="block text-xs text-ink-soft" data-numeric>
                          {formatClockTime(participant.arrivedAt)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="block text-[17px] font-extrabold text-app-text" data-numeric>
                        {formatApproachDistance(participant.distanceM) ?? '-'}
                      </span>
                      <span className="block text-xs text-ink-soft">남음</span>
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </ListGroup>
      )}
    </div>
  )
}

// 소요시간. 서버가 초로 주고, 시연은 1분 안쪽이지만 방을 열어 두고 늦게 시작하면 시간 단위까지 나온다.
function formatDuration(seconds) {
  if (seconds == null) return '-'
  if (seconds < 60) return `${seconds}초`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}분 ${remainingSeconds}초` : `${minutes}분`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`
}

function formatSpeed(kilometersPerHour) {
  if (kilometersPerHour == null) return '-'
  return `${kilometersPerHour.toFixed(1)}km/h`
}

// 도착 시각. 서버는 타임존 없는 값(2026-09-10T17:31:38)을 주므로 기기의 시간대로 읽힌다.
// 방을 함께 쓰는 사람들과 서버가 모두 한국이라 이 해석이 맞다.
function formatClockTime(value) {
  if (!value) return null

  const time = new Date(value)
  if (Number.isNaN(time.getTime())) return null

  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
}

export default TrackingPanel
