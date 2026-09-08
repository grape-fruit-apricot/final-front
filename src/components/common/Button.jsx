// 앱 전체 버튼. 지금은 같은 버튼이 파일마다 인라인 className 으로 흩어져 있어
// 반경·높이·비활성 처리가 조금씩 다르다. 위계는 네 단계로만 쓴다.
//
//   primary   화면에서 제일 중요한 동작 하나. 한 화면에 두 개를 쌓지 않는다.
//   secondary 같은 무게의 선택지가 여럿일 때(식당 선택 등)
//   plain     취소·공유처럼 눌러도 되고 안 눌러도 되는 것
//   danger    되돌릴 수 없는 것(나가기)
const VARIANTS = {
  primary: 'bg-point-orange text-white shadow-accent active:bg-accent-ink',
  // 불투명 채움 + 테두리. 밝은 바탕 위 밝은 틴트는 명도차가 1.3:1 을 넘기 어려워서,
  // 색만으로는 버튼 경계가 서지 않는다. 테두리가 그 몫을 맡는다.
  secondary:
    'border border-point-orange/30 bg-secondary-fill text-secondary-ink active:bg-secondary-press',
  neutral: 'bg-fill text-app-text active:bg-hairline',
  plain: 'bg-transparent text-accent-ink active:opacity-60',
  danger: 'bg-danger text-white active:opacity-90',
}

// 어떤 크기든 44px 이상이라 터치 영역이 모자라지 않는다.
const SIZES = {
  lg: 'min-h-14 px-6 text-[17px]',
  md: 'min-h-11 px-5 text-[15px]',
  sm: 'min-h-11 px-4 text-sm',
}

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-tight ' +
    'transition-[background-color,opacity,transform] duration-150 active:scale-[0.97] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange ' +
    // 비활성 처리는 한 가지로 통일한다. 예전에는 opacity-60 과 bg-white/30 과 무처리가 섞여 있었다.
    'disabled:pointer-events-none disabled:opacity-40'

  return (
    <button
      type={type}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
