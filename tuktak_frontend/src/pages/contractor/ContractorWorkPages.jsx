import { useEffect, useState } from 'react'
import { FaTools } from 'react-icons/fa'
import { contractorScreens } from '../../data/contractorData'
import {
  completeContractorWorkOrder,
  fetchContractorWorkOrder,
  fetchContractorWorkOrders,
  startContractorWorkOrder,
} from '../../services/contractorService'
import { ContractorPage, InfoModal, StatusBadge } from './ContractorPageShared'

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

function statusTone(status) {
  return status === '완료됨' || status === '취소됨' ? 'gray' : 'blue'
}

function statusHelper(status) {
  const helpers = {
    매칭대기중: '고객이 파트너 견적을 비교하고 있습니다.',
    매칭완료: '고객이 견적을 선택했고 시공 일정 확정을 기다리고 있습니다.',
    '시공 시작 대기중': '예약된 일정에 맞춰 시공 시작 처리를 진행하면 됩니다.',
    '시공 진행중': '시공이 시작되었습니다. 완료 처리를 진행할 수 있습니다.',
    완료됨: '시공이 완료된 작업입니다.',
  }
  return helpers[status] || '작업 상태를 확인해 주세요.'
}

export function ContractorRecordsPage({ go }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const nextItems = data.items?.map(mapWorkOrder) ?? []
        setItems(nextItems)
        setStatus(nextItems.length ? 'loaded' : 'empty')
      })
      .catch(() => {
        if (!ignore) {
          setItems([])
          setStatus('error')
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
    >
      {status === 'loading' ? <p className="muted center">시공 기록을 불러오는 중입니다.</p> : null}
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
      {status === 'empty' ? (
        <InfoModal
          title="시공 기록이 없습니다"
          message="고객이 견적을 선택하면 시공 기록에서 작업을 관리할 수 있습니다."
          onConfirm={() => go(contractorScreens.home)}
        />
      ) : null}
      {status === 'error' ? (
        <InfoModal
          title="시공 기록을 불러오지 못했습니다"
          message="서버 연결 또는 로그인 상태를 확인한 뒤 다시 시도해주세요."
          onConfirm={() => go(contractorScreens.home)}
        />
      ) : null}
    </ContractorPage>
  )
}

export function ContractorRecordDetailPage({ go, routeState = {} }) {
  const [item, setItem] = useState(() => routeState.workOrder || null)
  const [actionStatus, setActionStatus] = useState('')
  const [confirmStart, setConfirmStart] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  useEffect(() => {
    const stateItem = routeState.workOrder
    const stateWorkOrderId = routeState.workOrderId
    if (!stateWorkOrderId) return
    if (stateWorkOrderId) {
      fetchContractorWorkOrder(stateWorkOrderId)
        .then((data) => setItem(mapWorkOrder(data)))
        .catch(() => setItem(stateItem || null))
    }
  }, [routeState.workOrder, routeState.workOrderId])

  const startWork = async () => {
    if (!item) return
    if (!item.workOrderId) {
      setActionStatus('error')
      setConfirmStart(false)
      return
    }
    setActionStatus('submitting')
    try {
      const data = await startContractorWorkOrder(item.workOrderId)
      const nextItem = data?.work_order ? mapWorkOrder(data.work_order) : {
        ...item,
        rawStatus: 'IN_PROGRESS',
        status: statusLabel('IN_PROGRESS'),
        startedAt: item.startedAt || new Date().toISOString(),
      }
      setItem(nextItem)
      setActionStatus('done')
      setConfirmStart(false)
    } catch {
      setActionStatus('error')
      setConfirmStart(false)
    }
  }

  const completeWork = async () => {
    if (!item) return
    if (!item.workOrderId) {
      setActionStatus('error')
      setConfirmComplete(false)
      return
    }
    setActionStatus('submitting')
    try {
      const data = await completeContractorWorkOrder(item.workOrderId)
      const nextItem = data?.work_order ? mapWorkOrder(data.work_order) : {
        ...item,
        rawStatus: 'COMPLETED',
        status: statusLabel('COMPLETED'),
      }
      setItem(nextItem)
      setActionStatus('done')
      setConfirmComplete(false)
    } catch {
      setActionStatus('error')
      setConfirmComplete(false)
    }
  }

  if (!item) {
    return (
      <ContractorPage title="작업 상세" go={go} back={() => go(contractorScreens.records)}>
        <p className="muted center">작업 정보를 불러오는 중입니다.</p>
        <InfoModal
          title="작업 정보를 찾을 수 없습니다"
          message="시공 기록에서 다시 확인해주세요."
          onConfirm={() => go(contractorScreens.records)}
        />
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
        {item.status === '완료됨' ? null : item.startedAt || item.rawStatus === 'IN_PROGRESS' ? (
          <>
            <div className="contractor-bottom-actions single">
              <button type="button" disabled>
                시공 시작됨
              </button>
            </div>
            <div className="contractor-bottom-actions single">
              <button type="button" disabled={actionStatus === 'submitting'} onClick={() => setConfirmComplete(true)}>
                시공 완료
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

      {confirmComplete ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal">
            <h2>작업을 완료할까요?</h2>
            <p>작업 상태가 완료로 변경됩니다.</p>
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
  const item = routeState.workOrder || null

  return (
    <ContractorPage title="결제 요청" go={go} back={() => go(contractorScreens.recordDetail, { workOrder: item })}>
      <article className="contractor-detail-card contractor-work-detail-card">
        <h1>결제 요청 API가 연결되지 않았습니다.</h1>
        <p>현재 시공 기록 화면은 백엔드 work-orders 조회, 시작, 완료 API만 사용합니다.</p>
      </article>
    </ContractorPage>
  )
}
