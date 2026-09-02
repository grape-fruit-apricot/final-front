// 모바일 우선(360~430px) 콘텐츠 폭을 기준으로 하고, 데스크톱에서는 최대 너비로 제한해 중앙 정렬하는 공통 레이아웃
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        {children}
      </div>
    </div>
  )
}

export default AppLayout
