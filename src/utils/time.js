// "언제 들어왔는지"를 시계 시각이 아니라 지난 시간으로 읽는다.
// 방은 몇 시간 안에 끝나는 자리라 "14:32" 보다 "3분 전"이 바로 와닿는다.
export function formatRelativeTime(value) {
  if (!value) return null

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null

  const minutes = Math.floor((Date.now() - time) / 60000)

  // 시계 오차로 미래가 나오는 경우가 있어 음수는 방금으로 본다.
  if (minutes < 1) return '방금 입장'
  if (minutes < 60) return `${minutes}분 전 입장`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전 입장`

  return `${Math.floor(hours / 24)}일 전 입장`
}
