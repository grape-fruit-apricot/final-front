import { useNavigate } from 'react-router-dom'

// 여러 화면에서 공통으로 쓰는 좌측 상단 뒤로가기 버튼
function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="뒤로가기"
      className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

export default BackButton
