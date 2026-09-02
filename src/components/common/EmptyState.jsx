// 데이터 없음(빈) 상태 공통 컴포넌트
function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 w-full items-center justify-center px-4 text-center text-sm text-gray-400">
      {message}
    </div>
  )
}

export default EmptyState
