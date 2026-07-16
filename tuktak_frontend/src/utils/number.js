// 숫자만 남기고 천 단위 콤마를 넣어 포매팅 (ex: 100000 -> 100,000)
export function formatNumberWithCommas(rawValue) {
  const digits = String(rawValue ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('ko-KR')
}
