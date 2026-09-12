import ErrorMessage from '../common/ErrorMessage'

// 지도 SDK가 관리하는 영역 밖에서 공통 상태를 안내한다.
function MapStatus({ isLoading, error }) {
  if (error) return <ErrorMessage message="지도를 불러오지 못했습니다." />
  if (!isLoading) return null

  return (
    <p role="status" className="px-3 py-2 text-sm text-ink-soft">
      지도를 불러오는 중입니다.
    </p>
  )
}

export default MapStatus
