// 로딩 상태 공통 컴포넌트
function LoadingSpinner() {
  return (
    <div className="flex min-h-40 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
    </div>
  )
}

export default LoadingSpinner
