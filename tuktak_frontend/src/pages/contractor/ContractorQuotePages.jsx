import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaFileInvoice } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorScreens } from '../../data/contractorData'
import { deleteContractorQuote, fetchContractorQuotes, submitContractorQuote } from '../../services/contractorService'
import { ContractorPage, InfoModal, StatusBadge } from './ContractorPageShared'

const quoteFilters = ['전체', '선택 대기', '선택 완료', '미선택']

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '협의'
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function minutesFromDuration(value) {
  const hour = Number(String(value).replace(/[^0-9]/g, '')) || 1
  return hour * 60
}

function visitsFromLabel(value) {
  return Number(String(value).replace(/[^0-9]/g, '')) || 1
}

function daysFromAsPeriod(value) {
  const month = Number(String(value).replace(/[^0-9]/g, '')) || 0
  return month * 30
}

function normalizeDateTime(value) {
  if (!value) return null
  const normalized = value.includes('.') ? value.replaceAll('.', '-') : value
  return normalized.includes('T') ? normalized : `${normalized}T00:00:00`
}

function createInitialQuoteForm() {
  return { amount: '', scope: '', duration: '1시간', visits: '1회', availableDate: '', arrivalTime: '09:00', asPeriod: '3개월', validUntil: '', memo: '' }
}

function mapQuote(item) {
  return {
    id: String(item.quote_id),
    requestTitle: item.matching_request_title,
    amount: formatWon(item.total_amount),
    rawStatus: item.quote_status,
    status: item.quote_status === 'SENT' ? '선택 대기' : item.quote_status === 'SELECTED' ? '선택 완료' : item.quote_status === 'NOT_SELECTED' ? '미선택' : item.quote_status,
    validUntil: formatDate(item.valid_until),
    canDelete: item.quote_status === 'SENT',
  }
}

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

export function ContractorQuoteFormPage({ go, routeState = {} }) {
  const matchingRequestId = routeState.matchingRequestId || routeState.request?.matchingRequestId
  const [form, setForm] = useState(createInitialQuoteForm)
  const [modalType, setModalType] = useState(null)
  const [submitStatus, setSubmitStatus] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const sendQuote = async () => {
    if (!matchingRequestId) {
      setSubmitStatus('missing-request')
      setModalType(null)
      return
    }

    setSubmitStatus('submitting')

    try {
      await submitContractorQuote(matchingRequestId, {
        total_amount: Number(String(form.amount).replace(/[^0-9]/g, '')),
        work_scope: form.scope.trim(),
        estimated_minutes: minutesFromDuration(form.duration),
        visit_count: visitsFromLabel(form.visits),
        available_date: normalizeDateTime(form.availableDate),
        arrival_time: form.arrivalTime,
        as_period_days: daysFromAsPeriod(form.asPeriod),
        valid_until: normalizeDateTime(form.validUntil),
        additional_note: form.memo || null,
      })
      go(contractorScreens.quoteDone)
    } catch {
      setSubmitStatus('error')
      setModalType(null)
    }
  }

  return (
    <ContractorPage title="견적서 작성" go={go} back={() => go(contractorScreens.requestDetail)}>
      {routeState.request ? <p className="muted center">{routeState.request.title} 요청에 견적서를 작성합니다.</p> : null}
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
        <button type="button" disabled={!form.amount || !form.scope.trim() || submitStatus === 'submitting'} onClick={() => setModalType('send')}>
          {submitStatus === 'submitting' ? '전송중...' : '전송'}
        </button>
      </div>
      {submitStatus === 'missing-request' ? <p className="muted center">매칭 요청 ID가 없어 견적서를 보낼 수 없습니다.</p> : null}
      {submitStatus === 'error' ? <p className="muted center">견적서 전송에 실패했습니다. 서버 연결과 로그인 상태를 확인해주세요.</p> : null}

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
          onConfirm={sendQuote}
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

export function ContractorQuotesPanel({ onEmptyConfirm }) {
  const [filter, setFilter] = useState('전체')
  const [quotes, setQuotes] = useState([])
  const [status, setStatus] = useState('loading')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteStatus, setDeleteStatus] = useState('')
  const filtered = useMemo(() => quotes.filter((item) => filter === '전체' || item.status === filter), [filter, quotes])

  useEffect(() => {
    let ignore = false

    fetchContractorQuotes({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const nextQuotes = data.items?.map(mapQuote) ?? []
        setQuotes(nextQuotes)
        setStatus(nextQuotes.length ? 'loaded' : 'empty')
      })
      .catch(() => {
        if (!ignore) {
          setQuotes([])
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const deleteQuote = async () => {
    if (!deleteTarget) return
    setDeleteStatus('submitting')

    try {
      await deleteContractorQuote(deleteTarget.id)
      setQuotes((items) => items.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleteStatus('')
    } catch {
      setDeleteStatus('error')
    }
  }

  return (
    <>
      {status === 'loading' ? <p className="muted center">견적 목록을 불러오는 중입니다.</p> : null}
      {deleteStatus === 'error' ? <p className="muted center">삭제할 수 없는 견적입니다. 선택 대기 상태와 매칭 상태를 확인해주세요.</p> : null}
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
            <div className="contractor-quote-actions">
              <StatusBadge tone={quote.canDelete ? 'blue' : 'gray'}>{quote.status}</StatusBadge>
              {quote.canDelete ? (
                <button type="button" onClick={() => setDeleteTarget(quote)}>삭제</button>
              ) : null}
            </div>
          </article>
        ))}
        {filtered.length === 0 ? <p className="contractor-empty-message">표시할 견적이 없습니다.</p> : null}
      </div>

      {deleteTarget ? (
        <ConfirmModal
          title="견적서를 삭제할까요?"
          message="고객이 아직 선택하지 않은 선택 대기 견적만 삭제할 수 있습니다."
          cancelText="닫기"
          confirmText={deleteStatus === 'submitting' ? '삭제중...' : '삭제하기'}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteStatus('')
          }}
          onConfirm={deleteQuote}
        />
      ) : null}

      {status === 'empty' ? (
        <InfoModal
          title="보낸 견적이 없습니다"
          message="아직 고객에게 보낸 견적이 없습니다. 받은 요청에서 견적서를 작성해보세요."
          onConfirm={onEmptyConfirm}
        />
      ) : null}

      {status === 'error' ? (
        <InfoModal
          title="견적 목록을 불러오지 못했습니다"
          message="서버 연결 또는 로그인 상태를 확인한 뒤 다시 시도해주세요."
          onConfirm={onEmptyConfirm}
        />
      ) : null}
    </>
  )
}

export function ContractorQuotesPage({ go }) {
  return (
    <ContractorPage title="견적 관리" go={go} back={() => go(contractorScreens.requests)}>
      <ContractorQuotesPanel onEmptyConfirm={() => go(contractorScreens.requests)} />
    </ContractorPage>
  )
}
