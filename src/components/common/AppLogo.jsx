// A안: 지도 핀과 포크를 결합한 공통 로고.
function AppLogo({ className = '' }) {
  return (
    <svg viewBox="0 0 80 96" role="img" aria-label="딱!" className={className}>
      <path
        d="M40 4C20.1 4 4 20.1 4 40c0 22 29 45 33 49a4 4 0 0 0 6 0c4-4 33-27 33-49C76 20.1 59.9 4 40 4Z"
        className="fill-point-orange"
      />
      <circle cx="40" cy="39" r="24" className="fill-background" />
      <path
        d="M32 32v14a8 8 0 0 0 16 0V32M40 32v45"
        fill="none"
        className="stroke-app-text"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AppLogo
