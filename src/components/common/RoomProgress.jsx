const STEPS = ['중간지점', '식당 정하기', '결과 확인']

// 현재 화면 상태를 작은 진행 표시로 안내하며 단계 이동 기능은 제공하지 않는다.
function RoomProgress({ step }) {
  return (
    <div role="status" className="flex h-7 shrink-0 items-center gap-3 px-5 text-xs text-app-text">
      <span aria-hidden="true" className="flex shrink-0 items-center">
        {STEPS.map((label, index) => (
          <span key={label} className="flex items-center">
            {index > 0 && (
              <span className={'h-px w-[18px] ' + (index < step ? 'bg-point-orange' : 'bg-ink-faint/40')} />
            )}
            <span className={'flex size-3 items-center justify-center rounded-full border ' +
              (index + 1 <= step ? 'border-point-orange bg-point-orange' : 'border-ink-faint bg-white') +
              (index + 1 === step ? ' ring-2 ring-point-orange/30 ring-offset-1 ring-offset-header' : '')}>
              {index + 1 < step && (
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-2 text-white">
                  <path d="m2 6 2.5 2.5L10 3" />
                </svg>
              )}
            </span>
          </span>
        ))}
      </span>
      <span>{step}/3 · {STEPS[step - 1]}</span>
    </div>
  )
}

export default RoomProgress
