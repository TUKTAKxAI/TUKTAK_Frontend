import { useMemo, useState } from 'react'
import { FaCheckCircle, FaFileInvoice } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorQuotes, contractorScreens } from '../../data/contractorData'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

const quoteFilters = ['전체', '전송완료', '선택대기']

function ConfirmModal({ title, message, cancelText = '닫기', confirmText = '확인', onCancel, onConfirm }) {
  return (
    <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
      <div className="contractor-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="contractor-bottom-actions">
          <button type="button" onClick={onCancel}>{cancelText}</button>
          <button type="button" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export function ContractorQuoteFormPage({ go }) {
  const [form, setForm] = useState({ amount: '', scope: '', duration: '1시간', visits: '1회', availableDate: '', arrivalTime: '09:00', asPeriod: '3개월', validUntil: '', memo: '' })
  const [modalType, setModalType] = useState(null)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <ContractorPage title="견적서 작성" go={go} back={() => go(contractorScreens.requestDetail)}>
      <div className="contractor-form">
        <label><span>시공 비용</span><input value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="100,000" /></label>
        <label><span>작업 범위</span><input value={form.scope} onChange={(event) => update('scope', event.target.value)} placeholder="도어락 점검 및 부품 교체" /></label>
        <label><span>소요 시간</span><select value={form.duration} onChange={(event) => update('duration', event.target.value)}><option>1시간</option><option>2시간</option><option>3시간</option></select></label>
        <label><span>방문 횟수</span><select value={form.visits} onChange={(event) => update('visits', event.target.value)}><option>1회</option><option>2회</option><option>3회</option></select></label>
        <label><span>가능 날짜</span><input value={form.availableDate} onChange={(event) => update('availableDate', event.target.value)} placeholder="2026.07.12" /></label>
        <label><span>도착 시간</span><select value={form.arrivalTime} onChange={(event) => update('arrivalTime', event.target.value)}><option>09:00</option><option>12:00</option><option>15:00</option></select></label>
        <label><span>AS 기간</span><select value={form.asPeriod} onChange={(event) => update('asPeriod', event.target.value)}><option>1개월</option><option>3개월</option><option>6개월</option></select></label>
        <label><span>유효기간</span><input value={form.validUntil} onChange={(event) => update('validUntil', event.target.value)} placeholder="2026.07.20" /></label>
        <label><span>추가 메모</span><textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="고객에게 전달할 내용을 입력해주세요." /></label>
      </div>
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => setModalType('cancel')}>취소</button>
        <button type="button" onClick={() => setModalType('send')}>전송</button>
      </div>

      {modalType === 'cancel' ? (
        <ConfirmModal
          title="작성을 취소할까요?"
          message="현재 작성중인 내용은 저장되지 않습니다."
          cancelText="계속 작성"
          confirmText="취소하기"
          onCancel={() => setModalType(null)}
          onConfirm={() => go(contractorScreens.requestDetail)}
        />
      ) : null}

      {modalType === 'send' ? (
        <ConfirmModal
          title="견적서를 전송할까요?"
          message="해당 견적서를 고객에게 전송하시겠습니까?"
          cancelText="닫기"
          confirmText="전송하기"
          onCancel={() => setModalType(null)}
          onConfirm={() => go(contractorScreens.quoteDone)}
        />
      ) : null}
    </ContractorPage>
  )
}

export function ContractorQuoteDonePage({ go }) {
  return (
    <ContractorPage title="견적서 전송 완료" go={go}>
      <article className="contractor-done-card">
        <FaCheckCircle />
        <h1>견적서가 전송되었습니다</h1>
        <p>고객이 견적서를 확인하면 알림으로 알려드릴게요.</p>
        <PrimaryButton onClick={() => go(contractorScreens.quotes)}>견적 관리로 이동</PrimaryButton>
      </article>
    </ContractorPage>
  )
}

export function ContractorQuotesPage({ go }) {
  const [filter, setFilter] = useState('전체')
  const filtered = useMemo(() => contractorQuotes.filter((item) => filter === '전체' || item.status === filter), [filter])

  return (
    <ContractorPage title="견적 관리" go={go}>
      <div className="contractor-filter">
        {quoteFilters.map((item) => (
          <button key={item} className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)}>{item}</button>
        ))}
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
