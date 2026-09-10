// 에러 상태 공통 컴포넌트.
//
// 예전에는 min-h-40(160px) 이라 폼 아래 한 줄 안내로 쓰이는 14곳에서
// 화면에 커다란 구멍을 뚫었다. 지금은 내용만큼만 차지하는 한 줄 안내다.
function ErrorMessage({ message }) {
  return (
    <p
      role="alert"
      className="rounded-tile bg-danger/10 px-3.5 py-2.5 text-[13px] font-semibold text-danger"
    >
      {message}
    </p>
  )
}

export default ErrorMessage
