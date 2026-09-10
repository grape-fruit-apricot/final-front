// 카카오 분류는 "음식점 > 한식 > 국수 > 칼국수" 처럼 길게 온다.
// 앞부분은 모든 식당이 같아서 정보가 없으므로 가장 구체적인 마지막 단계만 쓴다.
export function toShortCategory(category) {
  if (!category) return null

  const parts = category
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length > 0 ? parts[parts.length - 1] : null
}
