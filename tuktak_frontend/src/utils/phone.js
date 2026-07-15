// 숫자만 남기고 010-1234-5678 형식으로 포매팅 (최대 11자리)
export function formatPhoneNumber(rawValue) {
  const digits = String(rawValue ?? '').replace(/\D/g, '').slice(0, 11)

  if (digits.length > 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }
  if (digits.length > 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  return digits
}
