// 로딩 상태 공통 컴포넌트.
// 쓰이는 6곳이 모두 화면 전체를 대신하는 자리라 세로로 넉넉히 잡는다.
function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status" aria-label="불러오는 중">
      <div className="size-8 animate-spin rounded-full border-[3px] border-hairline border-t-point-orange" />
    </div>
  )
}

export default LoadingSpinner
