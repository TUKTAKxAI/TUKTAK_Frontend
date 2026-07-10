import { useEffect, useState } from 'react'
import { FaCamera, FaFileInvoice } from 'react-icons/fa'
import { contractorScreens } from '../../data/contractorData'
import { fetchContractorMatchingRequests } from '../../services/contractorService'
import { ContractorPage, RequestCard, StatusBadge } from './ContractorPageShared'

function formatDate(value) {
  return value ? String(value).slice(0, 10).replaceAll('-', '.') : '일정 협의'
}

function formatWon(value) {
  if (value === undefined || value === null || value === '') return '협의'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function formatBudget(min, max) {
  if (min && max) return `${formatWon(min)} ~ ${formatWon(max)}`
  return formatWon(max || min)
}

function formatTimeRange(start, end) {
  if (start && end) return `${start} - ${end}`
  return '시간 협의'
}

function mapRequest(item) {
  const regionName = item.region_name || (item.region_code_id ? `지역 코드 ${item.region_code_id}` : '지역 미정')
  return {
    id: String(item.matching_request_id),
    matchingRequestId: item.matching_request_id,
    matchingTargetId: item.matching_target_id,
    quoteId: item.quote_id,
    city: regionName,
    region: item.address || regionName,
    regionName,
    title: item.title,
    serviceTaskName: item.service_task_name,
    budget: formatBudget(item.budget_min, item.budget_max),
    desiredDate: formatDate(item.preferred_date),
    time: formatTimeRange(item.preferred_time_start, item.preferred_time_end),
    status: item.target_status || item.matching_status,
    aiEstimate: {
      summary: '고객의 AI 견적 기반 매칭 요청입니다.',
      priceRange: formatBudget(item.budget_min, item.budget_max),
      expectedTime: '상세 협의',
      note: item.request_message || `매칭 상태: ${item.matching_status}`,
    },
    photos: ['고객 첨부 사진', 'AI 견적 이미지'],
  }
}

function groupByRegion(items) {
  return items.reduce((groups, item) => {
    const key = item.regionName || '지역 미정'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
}

function RequestEstimatePreview({ item }) {
  if (!item) {
    return <p className="muted center">요청 정보를 불러오지 못했습니다.</p>
  }

  return (
    <article className="contractor-detail-card">
      <StatusBadge>{item.status}</StatusBadge>
      <h1>{item.title}</h1>
      <p>{item.region}</p>
      <dl>
        <div><dt>요청 일시</dt><dd>{item.desiredDate} {item.time}</dd></div>
        <div><dt>고객 예산</dt><dd>{item.budget}</dd></div>
        <div><dt>AI 예상 비용</dt><dd>{item.aiEstimate.priceRange}</dd></div>
        <div><dt>예상 소요시간</dt><dd>{item.aiEstimate.expectedTime}</dd></div>
      </dl>
      <div className="contractor-ai-summary">
        <FaFileInvoice />
        <div>
          <strong>AI 견적 요약</strong>
          <p>{item.aiEstimate.summary}</p>
          <small>{item.aiEstimate.note}</small>
        </div>
      </div>
      <div className="contractor-photo-grid">
        {item.photos.map((photo) => (
          <div className="contractor-photo-mock" key={photo}>
            <FaCamera />
            <span>{photo}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export function ContractorRequestsPage({ go }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    fetchContractorMatchingRequests({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        setItems(data.items?.map(mapRequest) ?? [])
        setStatus('loaded')
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

  const groupedItems = groupByRegion(items)
  const regionNames = Object.keys(groupedItems)

  return (
    <ContractorPage title="시공 요청 목록" go={go} back={() => go(contractorScreens.home)}>
      {status === 'loading' ? <p className="muted center">시공 요청을 불러오는 중입니다.</p> : null}
      {status === 'error' ? <p className="muted center">시공 요청을 불러오지 못했습니다.</p> : null}
      {status === 'loaded' && items.length === 0 ? <p className="muted center">현재 설정한 지역에 도착한 시공 요청이 없습니다.</p> : null}
      <div className="contractor-list">
        {regionNames.map((regionName) => (
          <section className="contractor-region-request-group" key={regionName}>
            <h2>{regionName}</h2>
            <div className="contractor-list">
              {groupedItems[regionName].map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  onDetail={() => go(contractorScreens.requestDetail, { request: item, matchingRequestId: item.matchingRequestId })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRequestDetailPage({ go, routeState = {} }) {
  const [item, setItem] = useState(routeState.request || null)

  useEffect(() => {
    if (item || !routeState.matchingRequestId) return

    let ignore = false
    fetchContractorMatchingRequests({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const found = data.items?.find((request) => request.matching_request_id === routeState.matchingRequestId)
        setItem(found ? mapRequest(found) : null)
      })
      .catch(() => {
        if (!ignore) setItem(null)
      })

    return () => {
      ignore = true
    }
  }, [item, routeState.matchingRequestId])

  return (
    <ContractorPage title="시공 요청 상세" go={go} back={() => go(contractorScreens.requests)}>
      <RequestEstimatePreview item={item} />
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => go(contractorScreens.requests)}>닫기</button>
        <button
          type="button"
          disabled={!item?.matchingRequestId || item?.quoteId}
          onClick={() => go(contractorScreens.quoteForm, { request: item, matchingRequestId: item.matchingRequestId })}
        >
          {item?.quoteId ? '견적 전송 완료' : '견적서 작성하기'}
        </button>
      </div>
    </ContractorPage>
  )
}

export function ContractorAiEstimatePage({ go, routeState = {} }) {
  const item = routeState.request || null

  return (
    <ContractorPage title="AI 견적서 보기" go={go} back={() => go(contractorScreens.requestDetail)}>
      <RequestEstimatePreview item={item} />
    </ContractorPage>
  )
}
