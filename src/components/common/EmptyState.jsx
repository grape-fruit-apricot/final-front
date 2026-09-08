// 데이터 없음(빈) 상태 공통 컴포넌트.
// 목록 안에 들어가는 자리라 목록 한 칸 정도만 차지한다.
function EmptyState({ message }) {
  return (
    <p className="rounded-card border border-dashed border-hairline px-4 py-8 text-center text-sm text-ink-faint">
      {message}
    </p>
  )
}

export default EmptyState
