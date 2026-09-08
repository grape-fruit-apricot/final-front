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
