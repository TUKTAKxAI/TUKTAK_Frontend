import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { contractorScreens } from '../../data/contractorData'
import { fetchContractorMatchingRequests } from '../../services/contractorService'
import { ContractorPage, InfoModal, RequestCard, StatusBadge } from './ContractorPageShared'
import { ContractorQuotesPanel } from './ContractorQuotePages'

const regionOptions = ['경기도 김포시', '경기도 고양시', '서울특별시 강남구', '서울특별시 마포구', '인천광역시 서구']
const serviceOptions = ['도어락 수리', '창호 수리', '에어컨 수리', '문 수리', '도배', '배관 수리']
const timeOptions = [
  { label: '전체 시간', value: 'all' },
  { label: '오전 09:00 - 12:00', value: 'morning' },
  { label: '오후 12:00 - 18:00', value: 'afternoon' },
  { label: '저녁 18:00 - 21:00', value: 'evening' },
]

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

function mapRequest(item) {
  return {
    id: String(item.matching_request_id),
    matchingRequestId: item.matching_request_id,
    matchingTargetId: item.matching_target_id,
    quoteId: item.quote_id,
    city: item.region_code_id ? `지역 코드 ${item.region_code_id}` : '지역 미정',
    region: item.region_code_id ? `지역 코드 ${item.region_code_id}` : '지역 미정',
    title: item.title,
    budget: formatBudget(item.budget_min, item.budget_max),
    desiredDate: formatDate(item.preferred_date),
    time: '시간 협의',
    status: item.target_status || item.matching_status,
  }
}

function getRequestKey(item) {
  return item.matchingRequestId || item.id
}

function matchesTime(item, selectedTime) {
  if (selectedTime === 'all') return true
  const timeText = item.time || ''
  if (selectedTime === 'morning') return /09|10|11|12/.test(timeText)
  if (selectedTime === 'afternoon') return /12|13|14|15|16|17|18/.test(timeText)
  if (selectedTime === 'evening') return /18|19|20|21/.test(timeText)
  return true
}

function RequestEstimatePreview({ item }) {
  if (!item) {
    return <p className="muted center">요청 정보를 불러오지 못했습니다.</p>
  }

  return (
    <article className="contractor-detail-card contractor-request-detail-card">
      <StatusBadge>{item.status}</StatusBadge>
      <h1>{item.title}</h1>
      <p>{item.region}</p>
      <dl>
        <div><dt>요청 일시</dt><dd>{item.desiredDate} {item.time}</dd></div>
        <div><dt>고객 예산</dt><dd>{item.budget}</dd></div>
        <div><dt>매칭 상태</dt><dd>{item.status}</dd></div>
      </dl>
    </article>
  )
}

export function ContractorRequestsPage({ go }) {
  const [activeTab, setActiveTab] = useState('requests')
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [searchModal, setSearchModal] = useState(null)
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedTime, setSelectedTime] = useState('all')
  const [activeSearch, setActiveSearch] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchContractorMatchingRequests({ page: 1, size: 50 })
      .then((data) => {
        if (ignore) return
        const nextItems = data.items?.map(mapRequest) ?? []
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

  const sortedItems = useMemo(() => {
    return items.filter((item) => {
      if (activeSearch === 'region') {
        return selectedRegions.some((region) => `${item.city} ${item.region}`.includes(region))
      }
      if (activeSearch === 'service') {
        return selectedServices.some((service) => item.title.includes(service))
      }
      if (activeSearch === 'time') {
        return matchesTime(item, selectedTime)
      }
      return true
    })
  }, [activeSearch, items, selectedRegions, selectedServices, selectedTime])

  const toggleRegion = (region) => {
    setSelectedRegions((current) => (
      current.includes(region) ? current.filter((item) => item !== region) : [...current, region]
    ))
  }

  const toggleService = (service) => {
    setSelectedServices((current) => (
      current.includes(service) ? current.filter((item) => item !== service) : [...current, service]
    ))
  }

  const applySearch = (type) => {
    setActiveSearch(type)
    setSearchModal(null)
  }

  const clearSearch = () => {
    setActiveSearch(null)
    setSearchModal(null)
  }

  return (
    <ContractorPage title="시공 요청" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-filter">
        <button className={activeTab === 'requests' ? 'active' : ''} type="button" onClick={() => setActiveTab('requests')}>
          받은 요청
        </button>
        <button className={activeTab === 'quotes' ? 'active' : ''} type="button" onClick={() => setActiveTab('quotes')}>
          보낸 견적
        </button>
      </div>

      {activeTab === 'quotes' ? (
        <ContractorQuotesPanel onEmptyConfirm={() => setActiveTab('requests')} />
      ) : (
        <>
          {status === 'loading' ? <p className="muted center">시공 요청을 불러오는 중입니다.</p> : null}

          <section className="contractor-preferred-panel">
            <div>
              <small>조회된 시공 요청</small>
              <strong>{items.length}건</strong>
            </div>
            <button type="button" onClick={() => setSearchModal('menu')}>
              <FaSearch /> 검색하기
            </button>
          </section>

          {activeSearch ? (
            <button className="contractor-search-reset" type="button" onClick={clearSearch}>
              검색 조건 해제
            </button>
          ) : null}

          <div className="contractor-list">
            {sortedItems.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                onDetail={() => go(contractorScreens.requestDetail, { request: item, matchingRequestId: getRequestKey(item) })}
              />
            ))}
            {sortedItems.length === 0 ? <p className="contractor-empty-message">검색 조건에 맞는 요청이 없습니다.</p> : null}
          </div>

          {status === 'empty' ? (
            <InfoModal
              title="받은 시공 요청이 없습니다"
              message="현재 확인할 수 있는 시공 요청이 없습니다."
              onConfirm={() => go(contractorScreens.home)}
            />
          ) : null}

          {status === 'error' ? (
            <InfoModal
              title="시공 요청을 불러오지 못했습니다"
              message="서버 연결 또는 로그인 상태를 확인한 뒤 다시 시도해주세요."
              onConfirm={() => go(contractorScreens.home)}
            />
          ) : null}
        </>
      )}

      {searchModal ? (
        <div className="contractor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="contractor-modal contractor-search-modal">
            {searchModal === 'menu' ? (
              <>
                <h2>요청 검색</h2>
                <p>원하는 기준으로 시공 요청을 좁혀볼 수 있어요.</p>
                <div className="contractor-search-options">
                  <button type="button" onClick={() => setSearchModal('region')}>내 작업지역으로 검색하기</button>
                  <button type="button" onClick={() => setSearchModal('service')}>내 전문분야로 검색하기</button>
                  <button type="button" onClick={() => setSearchModal('time')}>시간으로 검색하기</button>
                </div>
              </>
            ) : null}

            {searchModal === 'region' ? (
              <>
                <h2>작업지역 선택</h2>
                <p>기본 설정 지역을 먼저 선택해두었습니다.</p>
                <div className="contractor-check-list">
                  {regionOptions.map((region) => (
                    <label className="contractor-checkbox-row" key={region}>
                      <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
                <div className="contractor-bottom-actions">
                  <button type="button" onClick={() => setSearchModal('menu')}>뒤로</button>
                  <button type="button" onClick={() => applySearch('region')}>검색하기</button>
                </div>
              </>
            ) : null}

            {searchModal === 'service' ? (
              <>
                <h2>전문분야 선택</h2>
                <p>내 전문분야를 기준으로 요청을 찾아볼게요.</p>
                <div className="contractor-check-list">
                  {serviceOptions.map((service) => (
                    <label className="contractor-checkbox-row" key={service}>
                      <input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggleService(service)} />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
                <div className="contractor-bottom-actions">
                  <button type="button" onClick={() => setSearchModal('menu')}>뒤로</button>
                  <button type="button" onClick={() => applySearch('service')}>검색하기</button>
                </div>
              </>
            ) : null}

            {searchModal === 'time' ? (
              <>
                <h2>시간대 선택</h2>
                <p>방문 가능한 시간대에 맞는 요청을 찾아보세요.</p>
                <label className="contractor-sort-select">
                  <span>시간</span>
                  <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <div className="contractor-bottom-actions">
                  <button type="button" onClick={() => setSearchModal('menu')}>뒤로</button>
                  <button type="button" onClick={() => applySearch('time')}>검색하기</button>
                </div>
              </>
            ) : null}

            <button className="contractor-modal-close" type="button" onClick={() => setSearchModal(null)}>닫기</button>
          </div>
        </div>
      ) : null}
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
      {!item ? (
        <InfoModal
          title="요청 정보를 찾을 수 없습니다"
          message="요청 목록에서 다시 확인해주세요."
          onConfirm={() => go(contractorScreens.requests)}
        />
      ) : null}
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => go(contractorScreens.requests)}>닫기</button>
        <button
          type="button"
          disabled={!item || item?.quoteId}
          onClick={() => go(contractorScreens.quoteForm, { request: item, matchingRequestId: getRequestKey(item) })}
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
      {!item ? (
        <InfoModal
          title="AI 견적 정보를 찾을 수 없습니다"
          message="시공 요청 상세에서 다시 확인해주세요."
          onConfirm={() => go(contractorScreens.requests)}
        />
      ) : null}
    </ContractorPage>
  )
}
