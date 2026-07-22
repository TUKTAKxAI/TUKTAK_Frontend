export function quoteStatusLabel(quoteStatus) {
  if (quoteStatus === 'SENT') return '대기중'
  if (quoteStatus === 'SELECTED') return '매칭됨'
  if (quoteStatus === 'NOT_SELECTED') return '매칭실패'
  return quoteStatus
}
