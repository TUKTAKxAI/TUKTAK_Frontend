import { useEffect, useState } from 'react'
import { FaTools } from 'react-icons/fa'
import { contractorChats, contractorProfile, contractorScreens, contractorWorkOrders } from '../../data/contractorData'
import {
  fetchContractorWorkOrder,
  fetchContractorWorkOrders,
  startContractorWorkOrder,
} from '../../services/contractorService'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

const workProgressStorageKey = 'tuktak.contractor.workProgress.v2'

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '일정 협의'
}

function formatStartedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function statusLabel(status) {
  const labels = {
    REQUESTED: '매칭대기중',
    RECEIVING_QUOTES: '매칭대기중',
    NOTIFIED: '매칭대기중',
    VIEWED: '매칭대기중',
    QUOTED: '매칭대기중',
    SELECTED: '매칭완료',
    CREATED: '시공 시작 대기중',
    SCHEDULED: '시공 시작 대기중',
    IN_PROGRESS: '시공 진행중',
    PAYMENT_REQUESTED: '결제요청완료',
    COMPLETED: '완료됨',
    CANCELLED: '취소됨',
    진행중: '시공 시작 대기중',
    완료: '완료됨',
    완료됨: '완료됨',
  }
  return labels[status] || status
}

function mapWorkOrder(item) {
  const rawStatus = item.work_order_status || item.rawStatus || item.status
  const startedAt = item.started_at || item.startedAt || ''

  return {
    id: String(item.work_order_id || item.workOrderId || item.id),
    workOrderId: item.work_order_id || item.workOrderId,
    title: item.matching_request_title || item.title,
    region: item.region || (item.contractor_name ? `담당 ${item.contractor_name}` : '시공 주소 확인 필요'),
    date: formatDate(item.scheduled_date || item.date),
    time: item.scheduled_start_time || item.time || '',
    status: statusLabel(rawStatus),
    rawStatus,
    startedAt,
    amount: item.amount || formatWon(item.final_amount),
    customerName: item.customer_name,
  }
}

function readWorkProgress() {
  try {
    return JSON.parse(localStorage.getItem(workProgressStorageKey) || '{}')
  } catch {
    return {}
  }
}

function getWorkProgressKey(item) {
  return item?.workOrderId || item?.id
}

function applyStoredWorkProgress(item) {
  if (!item) return item
  const stored = readWorkProgress()[getWorkProgressKey(item)]
  if (!stored) return item

  return {
    ...item,
    ...stored,
  }
}

function saveWorkProgress(item, patch) {
  const key = getWorkProgressKey(item)
  if (!key) return

  const current = readWorkProgress()
  localStorage.setItem(workProgressStorageKey, JSON.stringify({
    ...current,
    [key]: {
      ...current[key],
      ...patch,
    },
  }))
}

function clearWorkProgress() {
  localStorage.removeItem(workProgressStorageKey)
}

function statusTone(status) {
  return status === '완료됨' || status === '취소됨' ? 'gray' : 'blue'
}

function statusHelper(status) {
  const helpers = {
    매칭대기중: '고객이 파트너 견적을 비교하고 있습니다.',
    매칭완료: '고객이 견적을 선택했고 시공 일정 확정을 기다리고 있습니다.',
    '시공 시작 대기중': '예약된 일정에 맞춰 시공 시작 처리를 진행하면 됩니다.',
    '시공 진행중': '시공이 시작되었습니다. 완료 후 결제 요청을 진행할 수 있습니다.',
    결제요청완료: '고객에게 결제 요청 메시지를 보낸 상태입니다.',
    완료됨: '시공과 결제까지 모두 완료된 작업입니다.',
  }
  return helpers[status] || '작업 상태를 확인해 주세요.'
}

export function ContractorRecordsPage({ go }) {
  const [items, setItems] = useState(() => contractorWorkOrders.map(mapWorkOrder).map(applyStoredWorkProgress))
  const [status, setStatus] = useState('loading')

  const resetMockProgress = () => {
    clearWorkProgress()
    setItems(contractorWorkOrders.map(mapWorkOrder))
    setStatus('fallback')
  }

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        setItems(data.items?.map(mapWorkOrder).map(applyStoredWorkProgress) ?? [])
        setStatus('loaded')
      })
      .catch(() => {
        if (!ignore) {
          setItems(contractorWorkOrders.map(mapWorkOrder).map(applyStoredWorkProgress))
          setStatus('fallback')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <ContractorPage
      title="시공 기록"
      go={go}
      back={() => go(contractorScreens.home)}
      action={<button className="contractor-page-text-action" type="button" onClick={resetMockProgress}>테스트 초기화</button>}
    >
      {status === 'loading' ? <p className="muted center">시공 기록을 불러오는 중입니다.</p> : null}
      {status === 'fallback' ? <p className="muted center">서버 연결 전이라 예시 기록을 표시합니다.</p> : null}
      <div className="contractor-list">
        {items.map((item) => (
          <button className="contractor-line-card contractor-work-card clickable" type="button" key={item.id} onClick={() => go(contractorScreens.recordDetail, { workOrder: item, workOrderId: item.workOrderId })}>
            <FaTools />
            <div>
              <strong>{item.title}</strong>
              <p>{item.region}</p>
              <small>{item.date} {item.time}</small>
              {item.startedAt ? <small>시작 {formatStartedAt(item.startedAt)}</small> : null}
            </div>
            <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
          </button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRecordDetailPage({ go, routeState = {} }) {
  const [item, setItem] = useState(() => applyStoredWorkProgress(routeState.workOrder || (!routeState.workOrderId ? mapWorkOrder(contractorWorkOrders[0]) : null)))
  const [actionStatus, setActionStatus] = useState('')
  const [confirmStart, setConfirmStart] = useState(false)
  const [confirmPaymentRequest, setConfirmPaymentRequest] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  useEffect(() => {
    const stateItem = routeState.workOrder
    const stateWorkOrderId = routeState.workOrderId
    if (!stateWorkOrderId) return
    if (stateWorkOrderId) {
      fetchContractorWorkOrder(stateWorkOrderId)
        .then((data) => setItem(applyStoredWorkProgress(mapWorkOrder(data))))
        .catch(() => setItem(applyStoredWorkProgress(stateItem || mapWorkOrder(contractorWorkOrders[0]))))
    }
  }, [routeState.workOrder, routeState.workOrderId])

  const startWork = async () => {
    if (!item) return
    setActionStatus('submitting')
    const startedAt = item.startedAt || new Date().toISOString()
    const nextItem = {
      ...item,
      rawStatus: 'IN_PROGRESS',
      status: statusLabel('IN_PROGRESS'),
      startedAt,
    }
    try {
      if (item.workOrderId) {
        await startContractorWorkOrder(item.workOrderId)
      }
      saveWorkProgress(item, {
        rawStatus: nextItem.rawStatus,
        status: nextItem.status,
        startedAt: nextItem.startedAt,
      })
      setItem(nextItem)
      setActionStatus('done')
      setConfirmStart(false)
    } catch {
      if (!item.workOrderId) {
        saveWorkProgress(item, {
          rawStatus: nextItem.rawStatus,
          status: nextItem.status,
          startedAt: nextItem.startedAt,
        })
        setItem(nextItem)
        setActionStatus('done')
        setConfirmStart(false)
        return
      }
      setActionStatus('error')
      setConfirmStart(false)
    }
  }

  const completeAndRequestPayment = () => {
    if (!item) return
    const autoMessage = `${contractorProfile.name} 시공자님이 결제를 요청했어요.`
    const nextItem = {
      ...item,
      rawStatus: 'PAYMENT_REQUESTED',
      status: '결제요청완료',
      paymentRequested: true,
      paymentAutoMessage: autoMessage,
    }

    saveWorkProgress(item, {
      rawStatus: nextItem.rawStatus,
      status: nextItem.status,
      startedAt: nextItem.startedAt,
      paymentRequested: true,
      paymentAutoMessage: autoMessage,
    })
    setItem(nextItem)
    setConfirmPaymentRequest(false)
  }

  const openPaymentChat = () => {
    const autoMessage = item.paymentAutoMessage || `${contractorProfile.name} 시공자님이 결제를 요청했어요.`

    go(contractorScreens.chatRoom, {
      chat: {
        id: item.id || contractorChats[0].id,
        name: item.customerName ? `${item.customerName}님` : contractorChats[0].name,
        preview: autoMessage,
        time: '방금 전',
      },
      autoMessage,
    })
  }

  const completeWork = () => {
    if (!item) return
    const nextItem = {
      ...item,
      rawStatus: 'COMPLETED',
      status: statusLabel('COMPLETED'),
      completed: true,
    }

    saveWorkProgress(item, {
      rawStatus: nextItem.rawStatus,
      status: nextItem.status,
      startedAt: nextItem.startedAt,
      paymentRequested: nextItem.paymentRequested,
      paymentAutoMessage: nextItem.paymentAutoMessage,
      completed: true,
    })
    setItem(nextItem)
    setConfirmComplete(false)
  }

  if (!item) {
    return (
      <ContractorPage title="작업 상세" go={go} back={() => go(contractorScreens.records)}>
        <p className="muted center">작업 정보를 불러오는 중입니다.</p>
      </ContractorPage>
    )
  }

  return (
    <ContractorPage title="작업 상세" go={go} back={() => go(contractorScreens.records)}>
      <article className="contractor-detail-card contractor-work-detail-card">
        <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
        <h1>{item.title}</h1>
        <p>{item.region}</p>
        <p className="contractor-status-helper">{statusHelper(item.status)}</p>
        <dl>
          <div><dt>일정</dt><dd>{item.date} {item.time}</dd></div>
          {item.startedAt ? <div><dt>시공 시작시간</dt><dd>{formatStartedAt(item.startedAt)}</dd></div> : null}
          <div><dt>금액</dt><dd>{item.amount}</dd></div>
        </dl>
        {item.completed || item.status === '완료됨' ? null : item.paymentRequested || item.status === '결제요청완료' ? (
          <>
            <div className="contractor-bottom-actions single">
              <button type="button" disabled>
                결제 요청 완료
              </button>
            </div>
            <div className="contractor-bottom-actions single">
              <button type="button" onClick={openPaymentChat}>
                1:1 채팅으로 진입
              </button>
            </div>
            <div className="contractor-bottom-actions single">
              <button type="button" onClick={() => setConfirmComplete(true)}>
                완료
              </button>
            </div>
          </>
        ) : item.startedAt ? (
          <>
            <div className="contractor-bottom-actions single">
              <button type="button" disabled>
                시공 시작됨
              </button>
            </div>
            <div className="contractor-bottom-actions single">
              <button type="button" disabled={actionStatus === 'submitting'} onClick={() => setConfirmPaymentRequest(true)}>
                시공완료 / 결제 요청
              </button>
            </div>
          </>
        ) : (
          <div className="contractor-bottom-actions single">
            <button type="button" disabled={actionStatus === 'submitting'} onClick={() => setConfirmStart(true)}>
              {actionStatus === 'submitting' ? '처리중...' : '시공 시작'}
            </button>
          </div>
        )}
        {actionStatus === 'error' ? <p className="muted center">상태 변경에 실패했습니다.</p> : null}
      </article>

      {confirmStart ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>시공을 시작할까요?</h2>
            <p>시공 시작시간이 기록되고 작업 상태가 시공 진행중으로 변경됩니다.</p>
            <div className="contractor-bottom-actions">
              <button type="button" onClick={() => setConfirmStart(false)}>닫기</button>
              <button type="button" onClick={startWork}>시작하기</button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmPaymentRequest ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>시공완료와 결제 요청을 처리할까요?</h2>
            <p>상태가 결제요청완료로 변경되고 채팅 진입 버튼이 표시됩니다.</p>
            <div className="contractor-bottom-actions">
              <button type="button" onClick={() => setConfirmPaymentRequest(false)}>닫기</button>
              <button type="button" onClick={completeAndRequestPayment}>처리하기</button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmComplete ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>작업을 완료할까요?</h2>
            <p>완료 후에는 기록만 확인할 수 있고 작업 버튼은 사라집니다.</p>
            <div className="contractor-bottom-actions">
              <button type="button" onClick={() => setConfirmComplete(false)}>닫기</button>
              <button type="button" onClick={completeWork}>완료하기</button>
            </div>
          </div>
        </div>
      ) : null}
    </ContractorPage>
  )
}

export function ContractorPaymentRequestPage({ go, routeState = {} }) {
  const item = applyStoredWorkProgress(routeState.workOrder || mapWorkOrder(contractorWorkOrders[0]))
  const [form, setForm] = useState({ extraAmount: '', memo: '' })
  const [confirmPayment, setConfirmPayment] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const requestPayment = () => {
    const extraAmountText = form.extraAmount ? ` 추가비용 ${formatWon(String(form.extraAmount).replace(/[^0-9]/g, ''))}` : ''
    const memoText = form.memo.trim() ? ` (${form.memo.trim()})` : ''
    const autoMessage = `${contractorProfile.name} 시공자님이 결제를 요청했어요.${extraAmountText}${memoText}`
    saveWorkProgress(item, {
      rawStatus: 'PAYMENT_REQUESTED',
      status: '결제요청완료',
      startedAt: item.startedAt,
    })

    go(contractorScreens.chatRoom, {
      chat: {
        id: item.id || contractorChats[0].id,
        name: item.customerName ? `${item.customerName}님` : contractorChats[0].name,
        preview: autoMessage,
        time: '방금 전',
      },
      autoMessage,
    })
  }

  return (
    <ContractorPage title="결제 요청" go={go} back={() => go(contractorScreens.recordDetail, { workOrder: item })}>
      <article className="contractor-detail-card contractor-work-detail-card">
        <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
        <h1>{item.title}</h1>
        <p>{item.region}</p>
        <dl>
          <div><dt>기존 금액</dt><dd>{item.amount}</dd></div>
          <div><dt>일정</dt><dd>{item.date} {item.time}</dd></div>
          {item.startedAt ? <div><dt>시공 시작시간</dt><dd>{formatStartedAt(item.startedAt)}</dd></div> : null}
        </dl>
      </article>

      <div className="contractor-form compact">
        <label>
          <span>추가비용</span>
          <input value={form.extraAmount} onChange={(event) => update('extraAmount', event.target.value)} placeholder="0" />
        </label>
        <label>
          <span>추가 안내</span>
          <textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="추가 작업 내용이나 결제 안내를 입력해주세요." />
        </label>
      </div>

      <div className="contractor-bottom-actions single">
        <button type="button" onClick={() => setConfirmPayment(true)}>결제 요청하기</button>
      </div>

      {confirmPayment ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>결제를 요청할까요?</h2>
            <p>확인하면 고객 채팅방에 결제 요청 메시지가 자동으로 전송됩니다.</p>
            <div className="contractor-bottom-actions">
              <button type="button" onClick={() => setConfirmPayment(false)}>닫기</button>
              <button type="button" onClick={requestPayment}>요청하기</button>
            </div>
          </div>
        </div>
      ) : null}
    </ContractorPage>
  )
}
