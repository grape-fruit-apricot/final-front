// 지도 위 마커는 카카오 CustomOverlay 에 HTML 문자열로 들어간다.
// 화면마다 따로 만들면 모양이 갈라지므로 여기 한 곳에서 그린다.

// 이름에 <, & 같은 글자가 있으면 마크업이 깨지므로 막아둔다.
// (식당 이름은 카카오 API 에서 오는 값이라 무엇이 들어올지 알 수 없다.)
export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 흰 라벨 + 물방울 핀. 구글 지도의 장소 표시와 같은 짜임이다.
// label 을 비우면 핀만 그린다(위치만 짚는 경우).
// 이 내용을 쓰는 오버레이는 yAnchor: 1 로 둬야 핀 끝이 좌표에 놓인다.
export function createPinContent({ label, color = 'var(--color-point-orange)' } = {}) {
  const labelHtml = label
    ? `<div style="
        background:#fff;
        color:var(--color-app-text);
        padding:5px 10px;
        border-radius:9px;
        font-size:12px;
        font-weight:700;
        line-height:1.2;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(60,50,40,.28);
      ">${escapeHtml(label)}</div>`
    : ''

  return `
    <div style="display:flex;flex-direction:column;align-items:center;">
      ${labelHtml}
      <svg width="26" height="33" viewBox="0 0 26 33" style="margin-top:${label ? 3 : 0}px;display:block;filter:drop-shadow(0 2px 3px rgba(60,50,40,.35));">
        <path d="M13 32.5S24.5 18.6 24.5 11.5A11.5 11.5 0 1 0 1.5 11.5C1.5 18.6 13 32.5 13 32.5Z" fill="${color}"/>
        <circle cx="13" cy="11.5" r="4.4" fill="#fff"/>
      </svg>
    </div>
  `
}

// 이동 추적은 참가자 여럿의 궤적을 한 지도에 겹쳐 그린다. 전원이 같은 색이면 선이 섞였을 때
// 어느 것이 누구인지 알 수 없으므로 사람 수만큼 색을 돌려 쓴다.
//
// 첫 색은 --color-route 와 같다. 그쪽도 "이동한 선"이라는 같은 뜻이고, 경로 안내 화면과
// 추적 화면은 한 번에 하나만 보이므로 뜻이 부딪히지 않는다.
// 목적지 핀은 앱 강조색(point-orange)이 맡으므로 여기에 주황 계열은 넣지 않는다.
// 색상만으로 구분하지 않도록 참가자 이름을 핀 라벨로 함께 표시한다(TrackingMap).
const TRACKING_TRAIL_COLORS = ['#1d6fe0', '#0f8a6a', '#7c3aed', '#8a6a0f']

// 참가자가 팔레트보다 많으면 색이 다시 돌아온다. 방 인원 상한이 없어서 막을 수 없고,
// 그때도 이름 라벨로는 구분되므로 색이 겹치는 것을 허용한다.
export function trackingColorAt(index) {
  return TRACKING_TRAIL_COLORS[index % TRACKING_TRAIL_COLORS.length]
}
