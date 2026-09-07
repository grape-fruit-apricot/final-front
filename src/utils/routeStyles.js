// 첨부 프로젝트의 노선색 및 버스 색상 구분 규칙을 현재 구간 DTO에 맞게 옮겼다.
// 도보는 지하철 노선색과 관계없이 회색 점선으로 유지한다.
const ROUTE_COLORS = { walk: '#6B7280', bus: '#0ea5e9', subway: '#4338ca' }

export const SEGMENT_STYLES = {
  WALKING: { label: '도보', color: ROUTE_COLORS.walk, weight: 4, style: 'shortdot' },
  BUS: { label: '버스', color: ROUTE_COLORS.bus, weight: 6, style: 'solid' },
  SUBWAY: { label: '지하철', color: ROUTE_COLORS.subway, weight: 8, style: 'solid' },
  UNKNOWN: { label: '경로', color: '#6B7280', weight: 6, style: 'dash' },
}

export function normalizeSegmentType(segmentType) {
  const normalizedType = String(segmentType || '').toUpperCase()
  if (normalizedType === 'WALK') return 'WALKING'
  return SEGMENT_STYLES[normalizedType] ? normalizedType : 'UNKNOWN'
}

// 원본과 동일하게 첫 좌표의 권역과 guidance/vehicles의 노선명으로 색을 고른다.
const SEOUL_LINE_COLORS = {
  '1호선': '#0052A4',
  '2호선': '#00A84D',
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747D0F',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  경의중앙선: '#77C4A3',
  수인분당선: '#FABE00',
  신분당선: '#D4003B',
  공항철도: '#0090D2',
  경춘선: '#0C8E72',
  서해선: '#8FC31F',
  경강선: '#003DA5',
  우이신설선: '#B0CE18',
  신림선: '#6789CA',
  김포골드라인: '#A17800',
}

const BUSAN_LINE_COLORS = {
  '1호선': '#F06A00',
  '2호선': '#8FC31F',
  '3호선': '#B7882B',
  '4호선': '#009DC6',
  부산김해경전철: '#8B5FA3',
  동해선: '#006F62',
}

const DAEGU_LINE_COLORS = {
  '1호선': '#D93A49',
  '2호선': '#39A935',
  '3호선': '#F5A200',
}

function lineColorsFor(points) {
  const first = points && points[0]
  if (!first) return SEOUL_LINE_COLORS
  const { lat, lng } = first
  if (lat >= 35.0 && lat < 35.5 && lng >= 128.8 && lng < 129.3)
    return BUSAN_LINE_COLORS
  if (lat >= 35.6 && lat < 36.1 && lng >= 128.4 && lng < 128.9)
    return DAEGU_LINE_COLORS
  return SEOUL_LINE_COLORS
}

function subwayLineColor(leg) {
  const colors = lineColorsFor(leg.points)
  const label = [leg.guidance, ...(leg.vehicles || [])].join(' ')
  const matched = Object.entries(colors)
    .sort(([a], [b]) => b.length - a.length)
    .find(([line]) => label.includes(line))
  return matched ? matched[1] : ROUTE_COLORS.subway
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: h * 60, s, l }
}

function hueDistance(h1, h2) {
  const diff = Math.abs(h1 - h2) % 360
  return diff > 180 ? 360 - diff : diff
}

const HUE_CLASH_THRESHOLD = 30

function sameColorFamily(hexA, hexB) {
  const a = hexToHsl(hexA)
  const b = hexToHsl(hexB)
  if (a.s < 0.15 || b.s < 0.15) return false
  return hueDistance(a.h, b.h) <= HUE_CLASH_THRESHOLD
}

const BUS_FALLBACK_COLOR = '#7C3AED'

export function resolveRouteColors(legs) {
  const subwayColors = [
    ...new Set(
      (legs || [])
        .filter((leg) => normalizeSegmentType(leg.segmentType) === 'SUBWAY')
        .map(subwayLineColor),
    ),
  ]

  const walk = ROUTE_COLORS.walk
  const bus = subwayColors.some((c) => sameColorFamily(c, ROUTE_COLORS.bus))
    ? BUS_FALLBACK_COLOR
    : ROUTE_COLORS.bus

  function colorForLeg(leg) {
    const kind = normalizeSegmentType(leg.segmentType)
    if (kind === 'WALKING') return walk
    if (kind === 'BUS') return bus
    if (kind === 'SUBWAY') return subwayLineColor(leg)
    return SEGMENT_STYLES.UNKNOWN.color
  }

  return { walk, bus, subwayColors, colorForLeg }
}



