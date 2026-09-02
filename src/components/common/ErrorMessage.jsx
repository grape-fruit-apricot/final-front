// 에러 상태 공통 컴포넌트
function ErrorMessage({ message }) {
  return (
    <div className="flex min-h-40 w-full items-center justify-center px-4 text-center text-sm text-red-500">
      {message}
    </div>
  )
}

export default ErrorMessage
