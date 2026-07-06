import { useEffect, useState } from 'react'
import { FaTools } from 'react-icons/fa'
import { contractorScreens, contractorWorkOrders } from '../../data/contractorData'
import {
  completeContractorWorkOrder,
  fetchContractorWorkOrder,
  fetchContractorWorkOrders,
  startContractorWorkOrder,
} from '../../services/contractorService'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '일정 협의'
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function statusLabel(status) {
  const labels = {
    CREATED: '생성됨',
    SCHEDULED: '예약됨',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소됨',
  }
  return labels[status] || status
}

function mapWorkOrder(item) {
  return {
    id: String(item.work_order_id),
    workOrderId: item.work_order_id,
    title: item.matching_request_title,
    region: item.contractor_name ? `담당 ${item.contractor_name}` : '시공 주소 확인 필요',
    date: formatDate(item.scheduled_date),
    time: item.scheduled_start_time || '',
    status: statusLabel(item.work_order_status),
    rawStatus: item.work_order_status,
    amount: formatWon(item.final_amount),
    customerName: item.customer_name,
  }
}

export function ContractorRecordsPage({ go }) {
  const [items, setItems] = useState(contractorWorkOrders)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    fetchContractorWorkOrders({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        setItems(data.items?.map(mapWorkOrder) ?? [])
        setStatus('loaded')
      })
      .catch(() => {
        if (!ignore) {
          setItems(contractorWorkOrders)
          setStatus('fallback')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <ContractorPage title="시공 기록" go={go} back={() => go(contractorScreens.home)}>
      {status === 'loading' ? <p className="muted center">시공 기록을 불러오는 중입니다.</p> : null}
      {status === 'fallback' ? <p className="muted center">서버 연결 전이라 예시 기록을 표시합니다.</p> : null}
      <div className="contractor-list">
        {items.map((item) => (
          <button className="contractor-line-card clickable" type="button" key={item.id} onClick={() => go(contractorScreens.recordDetail, { workOrder: item, workOrderId: item.workOrderId })}>
            <FaTools />
            <div>
              <strong>{item.title}</strong>
              <p>{item.region}</p>
              <small>{item.date} {item.time}</small>
            </div>
            <StatusBadge tone={item.status === '완료' ? 'gray' : 'blue'}>{item.status}</StatusBadge>
          </button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRecordDetailPage({ go, routeState = {} }) {
  const [item, setItem] = useState(routeState.workOrder || (!routeState.workOrderId ? contractorWorkOrders[0] : null))
  const [actionStatus, setActionStatus] = useState('')

  useEffect(() => {
    const stateItem = routeState.workOrder
    const stateWorkOrderId = routeState.workOrderId
    if (!stateWorkOrderId) return
    if (stateWorkOrderId) {
      fetchContractorWorkOrder(stateWorkOrderId)
        .then((data) => setItem(mapWorkOrder(data)))
        .catch(() => setItem(stateItem || contractorWorkOrders[0]))
    }
  }, [routeState.workOrder, routeState.workOrderId])

  const updateStatus = async (action) => {
    if (!item?.workOrderId) return
    setActionStatus('submitting')
    try {
      const data = action === 'start'
        ? await startContractorWorkOrder(item.workOrderId)
        : await completeContractorWorkOrder(item.workOrderId)
      setItem((current) => ({
        ...current,
        rawStatus: data.work_order_status,
        status: statusLabel(data.work_order_status),
      }))
      setActionStatus('done')
    } catch {
      setActionStatus('error')
    }
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
      <article className="contractor-detail-card">
        <StatusBadge>{item.status}</StatusBadge>
        <h1>{item.title}</h1>
        <p>{item.region}</p>
        <dl>
          <div><dt>일정</dt><dd>{item.date} {item.time}</dd></div>
          <div><dt>금액</dt><dd>{item.amount}</dd></div>
        </dl>
        <div className="contractor-button-row">
          <button type="button" disabled={!item.workOrderId || actionStatus === 'submitting'} onClick={() => updateStatus('start')}>시작 처리</button>
          <button type="button" disabled={!item.workOrderId || actionStatus === 'submitting'} onClick={() => updateStatus('complete')}>완료 처리</button>
        </div>
        {actionStatus === 'error' ? <p className="muted center">상태 변경에 실패했습니다.</p> : null}
      </article>
    </ContractorPage>
  )
}
