import { useNavigate } from 'react-router-dom'

// 여러 화면에서 공통으로 쓰는 뒤로가기 버튼.
// 자리는 감싸는 쪽(PageHeader)이 정하므로 여기서 위치를 잡지 않는다.
function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="뒤로가기"
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-app-text active:bg-app-text/10 transition-transform duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

export default BackButton
