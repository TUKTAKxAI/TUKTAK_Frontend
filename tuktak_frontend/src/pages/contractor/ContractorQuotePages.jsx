import { useMemo, useState } from 'react'
import { FaCheckCircle, FaFileInvoice } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorQuotes, contractorScreens } from '../../data/contractorData'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

export function ContractorQuoteFormPage({ go }) {
  const [form, setForm] = useState({ amount: '', duration: '1시간', arrivalTime: '09:00', memo: '' })
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <ContractorPage title="견적서 정보 입력" back={() => go(contractorScreens.requests)}>
      <div className="contractor-form">
        <label><span>시공 비용</span><input value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="100,000" /></label>
        <label><span>소요 시간</span><select value={form.duration} onChange={(event) => update('duration', event.target.value)}><option>1시간</option><option>2시간</option><option>3시간</option></select></label>
        <label><span>도착 시간</span><select value={form.arrivalTime} onChange={(event) => update('arrivalTime', event.target.value)}><option>09:00</option><option>12:00</option><option>15:00</option></select></label>
        <label><span>추가 메모</span><textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="고객에게 전달할 내용을 입력해주세요." /></label>
      </div>
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => go(contractorScreens.requests)}>취소</button>
        <button type="button" onClick={() => go(contractorScreens.quoteDone)}>전송</button>
      </div>
    </ContractorPage>
  )
}

export function ContractorQuoteDonePage({ go }) {
  return (
    <ContractorPage title="견적서 전송 완료">
      <article className="contractor-done-card">
        <FaCheckCircle />
        <h1>견적서가 전송되었습니다</h1>
        <p>고객이 견적서를 확인하면 알림으로 알려드릴게요.</p>
        <PrimaryButton onClick={() => go(contractorScreens.quotes)}>견적 관리로 이동</PrimaryButton>
      </article>
    </ContractorPage>
  )
}

export function ContractorQuotesPage() {
  const [filter, setFilter] = useState('전체')
  const filtered = useMemo(() => contractorQuotes.filter((item) => filter === '전체' || item.status === filter), [filter])

  return (
    <ContractorPage title="견적 관리">
      <div className="contractor-filter">
        {['전체', '전송완료', '선택대기'].map((item) => <button key={item} className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="contractor-list">
        {filtered.map((quote) => (
          <article className="contractor-line-card" key={quote.id}>
            <FaFileInvoice />
            <div><strong>{quote.requestTitle}</strong><p>{quote.amount}</p><small>유효기간 {quote.validUntil}</small></div>
            <StatusBadge>{quote.status}</StatusBadge>
          </article>
        ))}
      </div>
    </ContractorPage>
  )
}
