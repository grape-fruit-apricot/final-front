import Button from './Button'
import ErrorMessage from './ErrorMessage'
import RestaurantList from './RestaurantList'
import RestaurantSearchForm from './RestaurantSearchForm'
import ParticipantSelectionList from './ParticipantSelectionList'
import MidpointMap from '../map/MidpointMap'

// 중간지점 확정 후 식당 선택과 준비 화면의 마크업 및 스타일을 담당한다.
function RestaurantSelection({ participants, myParticipantId, midpoint: midpointState, selection, preparation }) {
  const { data: midpoint, isResetting, resetError, onReset: onResetMidpoint } = midpointState
  const {
    restaurants, selections, hasSelected, isReselecting, pendingRestaurantId,
    isAdding, isSelecting, isReadying, addError, selectError, readyError,
    onAdd: onAddRestaurant, onPick: onPickRestaurant, onReady, onReselect, onCancelReselect,
  } = selection
  const { isHost, isReady, canStart, isStarting, startError, onStart } = preparation

  return (
    <div className="flex flex-col gap-3">
      <MidpointMap name={midpoint.name} lat={midpoint.lat} lng={midpoint.lng} />

      {isHost && (
        <button
          type="button"
          onClick={onResetMidpoint}
          disabled={isResetting || isStarting || isAdding || isSelecting}
          className="min-h-11 w-full rounded-lg border-2 border-point-orange bg-white font-semibold text-point-orange disabled:opacity-60"
        >
          {isResetting ? "중간 위치 재설정 중..." : "중간 위치 재설정"}
        </button>
      )}
      {isHost && resetError && <ErrorMessage message={resetError} />}

      {hasSelected && !isReselecting ? (
        <>
          <h2 className="mt-2 text-center text-subhead font-extrabold text-app-text">
            참가자들이 고른 식당
          </h2>
          <ParticipantSelectionList
            participants={participants}
            selections={selections}
            restaurants={restaurants}
            myParticipantId={myParticipantId}
          />
          {readyError && <ErrorMessage message={readyError} />}

          {startError && <ErrorMessage message={startError} />}

          {isHost ? (
            <>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onStart}
                disabled={!canStart || isStarting || isResetting}
                className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white disabled:bg-white/30 disabled:text-white/60"
              >
                {isStarting ? "결과 뽑는 중..." : "시작하기"}
              </Button>
              {/* 버튼이 왜 눌리지 않는지 적어둔다. 이유 없이 비활성화된 버튼은
                  기다려야 하는지 고장인지 알 수 없다. */}
              {!canStart && (
                <p className="mt-2 text-center text-xs text-ink-soft">
                  준비를 마친 참가자가 1명 이상이어야 시작할 수 있어요.
                </p>
              )}
            </>
          ) : (
            <>
              {/* 준비는 되돌릴 수 있다. 준비를 마치면 방장의 시작을 기다리는 일만
                  남으므로, 이 버튼은 더 이상 화면에서 제일 중요한 동작이 아니다. */}
              <Button
                variant={isReady ? "secondary" : "primary"}
                size="lg"
                fullWidth
                className="mt-4"
                onClick={onReady}
                disabled={isReadying}
              >
                {isReadying
                  ? "바꾸는 중..."
                  : isReady
                    ? "준비 취소"
                    : "준비하기"}
              </Button>
              {isReady && (
                <p className="mt-2 text-center text-xs text-ink-soft">
                  준비를 마쳤어요. 방장이 시작하기를 누르면 진행돼요.
                </p>
              )}
            </>
          )}

          {/* 서버가 선택을 덮어쓰므로 몇 번이든 바꿀 수 있다.
            단 중간지점 단계에서만 허용되어, 게임·결과로 넘어가면 이 화면 자체가 사라진다. */}
          <Button
            variant="secondary"
            fullWidth
            onClick={onReselect}
          >
            식당 변경하기
          </Button>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-title font-extrabold text-app-text">
            {isReselecting ? "식당 다시 고르기" : "주변 식당"}
          </h2>
          <RestaurantSearchForm
            lat={midpoint.lat}
            lng={midpoint.lng}
            onAdd={onAddRestaurant}
            isAdding={isAdding || isResetting}
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
            onSelect={onPickRestaurant}
            isSelecting={isSelecting || isResetting}
          />

          {/* 마음이 바뀌면 고른 것을 그대로 두고 돌아갈 수 있어야 한다. */}
          {isReselecting && (
            <Button
              variant="plain"
              fullWidth
              onClick={onCancelReselect}
            >
              변경 취소
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default RestaurantSelection
