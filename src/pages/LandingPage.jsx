import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'

// 처음 오는 사람에게 "무엇을 어떤 순서로 하는지" 세 걸음으로 보여준다.
// 버튼만 둘 놓으면 화면이 비어 보이고, 무슨 서비스인지도 알기 어렵다.
const STEPS = [
  {
    label: '출발지 모으기',
    // 여러 사람 — "모두의" 출발지를 받는 단계
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: '중간 지점 찾기',
    // 지도 핀 — 한 지점이 정해지는 단계
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    label: '식당 정하기',
    // 포크와 나이프
    icon: (
      <>
        <path d="M4 3v6a3 3 0 0 0 6 0V3" />
        <path d="M7 12v9" />
        <path d="M18 3c-1.8 1.8-2.5 4-2.5 6.2 0 1.5 1.1 2.6 2.5 2.6h2V3" />
        <path d="M20 12v9" />
      </>
    ),
  },
]

// 화면 전체에 아주 옅게 깔리는 지도 무늬.
// "블록 위에 밝은 도로가 얹힌" 구조로 그린다. 밝은 아이보리 바탕이므로
// 블록은 잉크색을 옅게, 도로는 바탕색으로 파내어 도로가 도로로 읽히게 한다.
function MapBackdrop() {
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full text-app-text/[0.055]"
      aria-hidden="true"
    >
      {/* · 도시 블록 — 가장 옅게 깔리는 바닥 */}
      <g fill="currentColor">
        <rect x="-22" y="-22" width="72" height="102" rx="5" />
        <rect x="-22" y="96" width="72" height="110" rx="5" />
        <rect x="-22" y="222" width="72" height="58" rx="5" />
        <rect x="-22" y="290" width="72" height="54" rx="5" />
        <rect x="-22" y="360" width="72" height="102" rx="5" />
        <rect x="-22" y="608" width="72" height="106" rx="5" />
        <rect x="-22" y="724" width="72" height="98" rx="5" />
        <rect x="66" y="-22" width="78" height="102" rx="5" />
        <rect x="66" y="96" width="78" height="110" rx="5" />
        <rect x="66" y="222" width="78" height="58" rx="5" />
        <rect x="66" y="290" width="78" height="54" rx="5" />
        <rect x="66" y="360" width="78" height="102" rx="5" />
        <rect x="66" y="608" width="78" height="106" rx="5" />
        <rect x="66" y="724" width="78" height="98" rx="5" />
        <rect x="160" y="-22" width="78" height="102" rx="5" />
        <rect x="160" y="96" width="78" height="110" rx="5" />
        <rect x="160" y="222" width="78" height="58" rx="5" />
        <rect x="160" y="290" width="78" height="54" rx="5" />
        <rect x="160" y="360" width="78" height="102" rx="5" />
        <rect x="160" y="478" width="78" height="114" rx="5" />
        <rect x="160" y="608" width="78" height="106" rx="5" />
        <rect x="160" y="724" width="78" height="98" rx="5" />
        <rect x="254" y="-22" width="74" height="102" rx="5" />
        <rect x="254" y="96" width="74" height="110" rx="5" />
        <rect x="254" y="222" width="74" height="58" rx="5" />
        <rect x="254" y="290" width="74" height="54" rx="5" />
        <rect x="254" y="360" width="74" height="102" rx="5" />
        <rect x="254" y="478" width="74" height="114" rx="5" />
        <rect x="254" y="608" width="74" height="106" rx="5" />
        <rect x="254" y="724" width="74" height="98" rx="5" />
        <rect x="344" y="-22" width="78" height="102" rx="5" />
        <rect x="344" y="96" width="78" height="110" rx="5" />
        <rect x="344" y="222" width="78" height="58" rx="5" />
        <rect x="344" y="290" width="78" height="54" rx="5" />
        <rect x="344" y="360" width="78" height="102" rx="5" />
        <rect x="344" y="478" width="78" height="114" rx="5" />
        <rect x="344" y="608" width="78" height="106" rx="5" />
        <rect x="344" y="724" width="78" height="98" rx="5" />
      </g>

      {/* · 공원 */}
      <rect x="-30" y="486" width="80" height="98" rx="20" fill="currentColor" />

      {/* · 하천 */}
      <path
        d="M-30 664c90 4 108 44 196 40s136-52 264-40"
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
      />

      {/* · 도로 — 바탕색으로 파내어 블록 사이를 가른다. 굵기로 큰길과 골목을 구분한다. */}
      <g stroke="var(--color-background)" fill="none" strokeLinecap="round">
        <path d="M-30 352H430M246 -30V830" strokeWidth="15" />
        <path d="M-30 214H430M-30 600H430" strokeWidth="11" />
        <path d="M152 -30V830" strokeWidth="11" />
        <path d="M-30 88H430M-30 470H430" strokeWidth="8" />
        <path d="M58 -30V830M336 -30V830" strokeWidth="8" />
      </g>

      {/* · 출발지 -> 목적지 경로. 배경보다 또렷해야 하므로 강조색을 옅게 쓴다. */}
      <g stroke="var(--color-point-orange)" fill="var(--color-point-orange)" opacity="0.22">
        <path
          d="M58 470L58 352 246 352 246 130"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* 현재 위치 — GPS 점 */}
        <circle cx="58" cy="470" r="18" opacity="0.45" stroke="none" />
        <circle cx="58" cy="470" r="8" stroke="none" />
        {/* 목적지 — 핀 */}
        <path
          d="M246 106c-9.9 0-18 8.1-18 18 0 13.5 18 32 18 32s18-18.5 18-32c0-9.9-8.1-18-18-18Z"
          stroke="none"
        />
        <circle cx="246" cy="124" r="6.5" fill="var(--color-background)" stroke="none" />
      </g>
    </svg>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  const handleCreateRoom = () => {
    navigate('/create')
  }

  const handleJoinRoom = () => {
    navigate('/join')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background px-6 pb-10 pt-8">
      <MapBackdrop />

      {/* 로고와 제목이 남은 공간을 다 쓰고 가운데 놓인다. */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6">
        <svg viewBox="0 0 80 96" className="relative h-28 w-28" aria-hidden="true">
          <path
            d="M12 8h56a4 4 0 0 1 4 4v48l-32 28-32-28V12a4 4 0 0 1 4-4Z"
            fill="var(--color-app-text)"
          />
          <path
            d="M40 26c-7.2 0-13 5.8-13 13 0 9.7 13 25 13 25s13-15.3 13-25c0-7.2-5.8-13-13-13Z"
            fill="var(--color-background)"
          />
          <circle cx="40" cy="39" r="5" fill="var(--color-app-text)" />
          <circle cx="62" cy="18" r="11" fill="var(--color-point-orange)" />
          <path
            d="M62 12c-2.8 0-5 2.2-5 5 0 3.7 5 9 5 9s5-5.3 5-9c0-2.8-2.2-5-5-5Z"
            fill="#fff"
          />
          <circle cx="62" cy="17" r="1.8" fill="var(--color-point-orange)" />
        </svg>

        <div className="relative flex flex-col items-center gap-3">
          <h1 className="text-center text-display font-extrabold text-app-text">
            딱 중간에서
            <br />
            밥먹어요
          </h1>
          <p className="text-center text-[15px] leading-relaxed text-ink-soft">
            모두의 출발지를 모아 중간 지점을 찾고,
            <br />
            함께 갈 식당까지 정해드려요.
          </p>
        </div>
      </div>

      {/* 진행 순서 — 아래 버튼과 위 제목 사이의 빈 공간을 설명으로 채운다. */}
      <ol className="relative mb-8 flex items-start justify-center gap-2">
        {STEPS.map((step, index) => (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="relative flex size-12 items-center justify-center rounded-full border border-edge bg-surface shadow-surface">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 text-accent-ink"
                aria-hidden="true"
              >
                {step.icon}
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-point-orange text-[11px] font-bold text-white">
                {index + 1}
              </span>
            </span>
            <span className="text-center text-xs leading-tight text-ink-soft">{step.label}</span>
          </li>
        ))}
      </ol>

      <div className="relative flex w-full flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={handleCreateRoom}>
          방 생성하기
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={handleJoinRoom}>
          방 입장하기
        </Button>
      </div>
    </div>
  )
}

export default LandingPage
