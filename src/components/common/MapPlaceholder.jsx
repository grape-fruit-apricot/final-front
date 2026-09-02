// 지도 연동이 준비되기 전까지, 지도가 들어갈 위치를 표시만 해두는 공통 컴포넌트
function MapPlaceholder() {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-main-navy/30 bg-background">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-main-navy/50">
        <path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <p className="text-sm text-app-text/60">지도 영역 (준비 중)</p>
    </div>
  )
}

export default MapPlaceholder
