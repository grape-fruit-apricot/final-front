import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'

const content = {
  'not-found': { label: '404 · PAGE NOT FOUND', title: '앗, 길을 벗어났어요', description: '찾으시는 페이지가 없어요.\n주소를 확인하거나 처음으로 돌아가 주세요.', hint: '우리, 다시 중간에서 만나요.', primary: '홈으로 가기', secondary: '이전 페이지로' },
  room: { label: 'ROOM NOT FOUND', title: '방을 찾을 수 없어요', description: '방 코드가 올바르지 않거나\n이미 종료된 방일 수 있어요.', hint: '초대받은 방 코드를 다시 확인해 주세요.', primary: '방 코드 다시 입력', secondary: '홈으로 가기' },
  unexpected: { label: 'SOMETHING WENT WRONG', title: '잠시 연결이 엇갈렸어요', description: '화면을 불러오거나 서버에 연결하지 못했어요.\n잠시 후 다시 시도해 주세요.', hint: '인터넷 연결 상태도 확인해 주세요.', primary: '다시 시도하기', secondary: '홈으로 가기' },
  'join-unavailable': { label: 'UNABLE TO JOIN', title: '지금은 참가할 수 없어요', description: '방이 이미 시작되었거나 인원이 가득 찼어요.\n참가 권한이 제한된 경우에도 입장할 수 없어요.', hint: '방장에게 확인하거나 다른 방에 참가해 주세요.', primary: '다른 방 참가하기', secondary: '홈으로 가기' },
}

function ErrorIllustration({ variant }) {
  return (
    <svg viewBox="0 0 280 220" className="h-auto w-full max-w-[280px]" fill="none" aria-hidden="true">
      <circle cx="140" cy="110" r="94" fill="var(--color-header)" />
      <g stroke="var(--color-surface)" strokeWidth="12" strokeLinecap="round">
        <path d="M47 84h186M47 140h186M99 29v163M184 36v159" />
      </g>
      <path d="M65 163h47v-51h78" stroke="var(--color-point-orange)" strokeWidth="3" strokeDasharray="5 8" strokeLinecap="round" />
      <circle cx="65" cy="163" r="10" fill="var(--color-soft-orange)" />
      <circle cx="65" cy="163" r="5" fill="var(--color-point-orange)" />
      {variant === 'join-unavailable' ? <g stroke="var(--color-app-text)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="117" y="85" width="62" height="57" rx="14" fill="var(--color-surface)" />
        <path d="M130 85V70a18 18 0 0 1 36 0v15" />
        <circle cx="148" cy="108" r="4" fill="var(--color-point-orange)" stroke="none" />
        <path d="M148 112v10" stroke="var(--color-point-orange)" />
      </g> : variant === 'unexpected' ? <g stroke="var(--color-app-text)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m114 71 12 12m-23 5 12 12m-21 12 21-21 29 29-21 21a20 20 0 0 1-29-29Zm56-11 21-21a20 20 0 0 1 29 29l-21 21Z" fill="var(--color-surface)" />
        <path d="m84 152 10-10m107-64 12-12m-68 5 5-14m-1 96 5-14" stroke="var(--color-point-orange)" />
      </g> : <>
        <path d="M149 151s-37-39-37-66a37 37 0 0 1 74 0c0 27-37 66-37 66Z" fill="var(--color-surface)" stroke="var(--color-app-text)" strokeWidth="4" />
        {variant === 'room' ? <circle cx="149" cy="85" r="13" stroke="var(--color-point-orange)" strokeWidth="4" strokeDasharray="3 6" /> : <g stroke="var(--color-point-orange)" strokeWidth="4" strokeLinecap="round">
          <path d="M140 77c0-12 20-12 20 0 0 7-11 8-11 16" />
          <path d="M149 104v1" />
        </g>}
      </>}
      <circle cx="222" cy="151" r="18" fill="var(--color-point-orange)" />
      <path d="M222 142v10m0 7v1" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function ErrorPage({ variant = 'unexpected', onRetry }) {
  const navigate = useNavigate()
  const location = useLocation()
  const heading = useRef(null)
  const copy = content[variant] ?? content.unexpected
  useEffect(() => { heading.current?.focus() }, [variant])

  const handlePrimary = () => {
    if (variant === 'room' || variant === 'join-unavailable') return navigate('/join', { replace: true })
    if (variant === 'not-found') return navigate('/', { replace: true })
    if (onRetry) return onRetry()
    const from = location.state?.from
    navigate(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/error') ? from : '/', { replace: true })
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] flex-col bg-background px-6 pb-8 pt-8 text-app-text">
      <p className="flex items-center justify-center gap-2 text-sm font-bold"><span className="size-2 rounded-full bg-point-orange" />딱 중간에서 밥먹어요</p>
      <section className="flex flex-1 flex-col items-center justify-center py-10 text-center" aria-labelledby="error-title">
        <ErrorIllustration variant={variant} />
        <p className="mt-5 rounded-full bg-accent-tint px-3 py-1.5 text-[11px] font-bold tracking-widest text-accent-ink">{copy.label}</p>
        <h1 id="error-title" ref={heading} tabIndex={-1} className="mt-5 text-[26px] font-extrabold tracking-tight outline-none">{copy.title}</h1>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-ink-soft">{variant === 'join-unavailable' && typeof location.state?.reason === 'string' ? location.state.reason : copy.description}</p>
        <p className="mt-6 w-full rounded-card border border-edge bg-glass px-4 py-4 text-sm leading-6 text-ink-soft shadow-surface">{copy.hint}</p>
      </section>
      <div className="flex flex-col gap-3">
        <Button onClick={handlePrimary} size="lg" fullWidth>{copy.primary}</Button>
        <Button onClick={() => variant === 'not-found' && window.history.state?.idx > 0 ? navigate(-1) : navigate('/', { replace: true })} variant="secondary" size="lg" fullWidth>{copy.secondary}</Button>
      </div>
    </main>
  )
}
