import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaFileInvoice } from 'react-icons/fa'
import { PrimaryButton } from '../../components/customer/FormControls'
import { contractorQuotes, contractorScreens } from '../../data/contractorData'
import { fetchContractorQuote, fetchContractorQuotes, submitContractorQuote } from '../../services/contractorService'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

const quoteFilters = ['전체', '전송완료', '선택대기']

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

function normalizeDateTime(value) {
  if (!value) return null
  const normalized = value.includes('.') ? value.replaceAll('.', '-') : value
  return normalized.includes('T') ? normalized : `${normalized}T00:00:00`
}

function mapQuote(item) {
  return {
    id: String(item.quote_id),
    requestTitle: item.matching_request_title,
    amount: formatWon(item.total_amount),
    status: item.quote_status === 'SENT' ? '전송완료' : item.quote_status === 'SELECTED' ? '선택대기' : item.quote_status,
    validUntil: formatDate(item.valid_until),
  }
}

export function ContractorQuoteFormPage({ go, routeState = {} }) {
  const [form, setForm] = useState({ amount: '', scope: '', duration: '1시간', visits: '1회', availableDate: '', arrivalTime: '09:00', memo: '' })
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [quoteDetail, setQuoteDetail] = useState(null)
  const [loadStatus, setLoadStatus] = useState(routeState.quoteId ? 'loading' : 'idle')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const matchingRequestId = routeState.matchingRequestId || routeState.request?.matchingRequestId
  const quoteId = routeState.quoteId || routeState.request?.quoteId

  useEffect(() => {
    if (!quoteId) return
    let ignore = false

    setLoadStatus('loading')
    fetchContractorQuote(quoteId)
      .then((quote) => {
        if (ignore) return
        setQuoteDetail(quote)
        setLoadStatus('loaded')
      })
      .catch(() => {
        if (!ignore) setLoadStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [quoteId])

  const sendQuote = async () => {
    const amount = Number(String(form.amount).replace(/[^0-9]/g, ''))

    if (!amount) {
      setSubmitStatus('validation-error')
      setSubmitMessage('시공 비용을 입력해주세요.')
      return
    }

    if (!form.scope.trim()) {
      setSubmitStatus('validation-error')
      setSubmitMessage('작업 범위를 입력해주세요.')
      return
    }

    if (!matchingRequestId) {
      setSubmitStatus('missing-request')
      setSubmitMessage('매칭 요청 ID가 없어 견적서를 보낼 수 없습니다.')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('견적서를 전송하는 중입니다.')

    try {
      await submitContractorQuote(matchingRequestId, {
        total_amount: amount,
        work_scope: form.scope.trim(),
        estimated_minutes: minutesFromDuration(form.duration),
        visit_count: visitsFromLabel(form.visits),
        available_date: normalizeDateTime(form.availableDate),
        arrival_time: form.arrivalTime,
        additional_note: form.memo || null,
      })
      setSubmitStatus('success')
      setSubmitMessage('')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Quote submit failed:', error)
      setSubmitStatus('error')
      setSubmitMessage(error?.message || '견적서 전송에 실패했습니다. 서버 연결과 로그인 상태를 확인해주세요.')
    }
  }

  if (quoteId) {
    return (
      <ContractorPage title="내 견적 보기" go={go} back={() => go(contractorScreens.requestDetail, { request: routeState.request, matchingRequestId })}>
        {loadStatus === 'loading' ? <p className="muted center">견적서를 불러오는 중입니다.</p> : null}
        {loadStatus === 'error' ? <p className="muted center">견적서를 불러오지 못했습니다.</p> : null}
        {quoteDetail ? (
          <article className="contractor-detail-card">
            <StatusBadge>{quoteDetail.quote_status === 'SENT' ? '전송완료' : quoteDetail.quote_status}</StatusBadge>
            <h1>{quoteDetail.matching_request_title}</h1>
            <dl>
              <div><dt>시공 비용</dt><dd>{formatWon(quoteDetail.total_amount)}</dd></div>
              <div><dt>작업 범위</dt><dd>{quoteDetail.work_scope || '상세 협의'}</dd></div>
              <div><dt>예상 소요시간</dt><dd>{quoteDetail.estimated_minutes ? `${quoteDetail.estimated_minutes}분` : '상세 협의'}</dd></div>
              <div><dt>방문 횟수</dt><dd>{quoteDetail.visit_count ? `${quoteDetail.visit_count}회` : '상세 협의'}</dd></div>
              <div><dt>가능 날짜</dt><dd>{formatDate(quoteDetail.available_date)}</dd></div>
              <div><dt>도착 시간</dt><dd>{quoteDetail.arrival_time || '협의'}</dd></div>
            </dl>
            {quoteDetail.additional_note ? (
              <div className="contractor-ai-summary">
                <FaFileInvoice />
                <div>
                  <strong>추가 메모</strong>
                  <p>{quoteDetail.additional_note}</p>
                </div>
              </div>
            ) : null}
          </article>
        ) : null}
        <div className="contractor-bottom-actions">
          <button type="button" onClick={() => go(contractorScreens.requests)}>목록으로</button>
          <button type="button" onClick={() => go(contractorScreens.quotes)}>견적 관리</button>
        </div>
      </ContractorPage>
    )
  }

  return (
    <ContractorPage title="견적서 작성" go={go} back={() => go(contractorScreens.requestDetail, { request: routeState.request, matchingRequestId })}>
      {routeState.request ? <p className="muted center">{routeState.request.title} 요청에 견적서를 작성합니다.</p> : null}
      <div className="contractor-form">
        <label><span>시공 비용</span><input value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="100,000" /></label>
        <label><span>작업 범위</span><input value={form.scope} onChange={(event) => update('scope', event.target.value)} placeholder="도어락 점검 및 부품 교체" /></label>
        <label><span>소요 시간</span><select value={form.duration} onChange={(event) => update('duration', event.target.value)}><option>1시간</option><option>2시간</option><option>3시간</option></select></label>
        <label><span>방문 횟수</span><select value={form.visits} onChange={(event) => update('visits', event.target.value)}><option>1회</option><option>2회</option><option>3회</option></select></label>
        <label><span>가능 날짜</span><input type="date" value={form.availableDate} onChange={(event) => update('availableDate', event.target.value)} /></label>
        <label><span>도착 시간</span><select value={form.arrivalTime} onChange={(event) => update('arrivalTime', event.target.value)}><option>09:00</option><option>12:00</option><option>15:00</option></select></label>
        <label><span>추가 메모</span><textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="고객에게 전달할 내용을 입력해주세요." /></label>
      </div>
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => go(contractorScreens.requestDetail, { request: routeState.request, matchingRequestId })}>취소</button>
        <button type="button" disabled={submitStatus === 'submitting'} onClick={sendQuote}>
          {submitStatus === 'submitting' ? '전송중...' : '전송'}
        </button>
      </div>
      {submitMessage ? <p className="muted center">{submitMessage}</p> : null}

      {showSuccessModal ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>견적서 전송 완료</h2>
            <p>견적서가 요청자에게 보내졌습니다.</p>
            <div className="contractor-bottom-actions">
              <button type="button" onClick={() => go(contractorScreens.requests)}>목록으로 이동</button>
              <button type="button" onClick={() => go(contractorScreens.quotes)}>견적 관리 보기</button>
            </div>
          </div>
        </div>
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
        <PrimaryButton onClick={() => go(contractorScreens.requests)}>시공 요청 목록으로 이동</PrimaryButton>
      </article>
    </ContractorPage>
  )
}

export function ContractorQuotesPage({ go }) {
  const [filter, setFilter] = useState('전체')
  const [quotes, setQuotes] = useState(contractorQuotes)
  const [status, setStatus] = useState('loading')
  const filtered = useMemo(() => quotes.filter((item) => filter === '전체' || item.status === filter), [filter, quotes])

  useEffect(() => {
    let ignore = false

    fetchContractorQuotes({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        setQuotes(data.items?.map(mapQuote) ?? [])
        setStatus('loaded')
      })
      .catch(() => {
        if (!ignore) {
          setQuotes(contractorQuotes)
          setStatus('fallback')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <ContractorPage title="견적 관리" go={go}>
      {status === 'loading' ? <p className="muted center">견적 목록을 불러오는 중입니다.</p> : null}
      {status === 'fallback' ? <p className="muted center">서버 연결 전이라 예시 견적을 표시합니다.</p> : null}
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
