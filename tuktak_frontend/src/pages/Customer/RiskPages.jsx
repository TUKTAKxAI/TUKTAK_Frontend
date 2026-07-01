import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createRiskReport, fetchMyAiEstimates, fetchMyRiskReports, fetchRiskReportDetail } from '../../api/mypageApi'
import { RiskCard, SearchBar } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'
import { screenPaths } from '../../routes/customerRoutes'

const DAY_MS = 24 * 60 * 60 * 1000

function getRiskStatus(item) {
  if (item.isExpired !== undefined && item.expireLabel && item.expiresAt) return item

  const createdAt = new Date(`${item.date}T00:00:00`)
  if (Number.isNaN(createdAt.getTime())) {
    return {
      ...item,
      isExpired: false,
      expireLabel: '30일 뒤 만료',
      expiresAt: '',
    }
  }

  const expiresAt = new Date(createdAt)
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  const today = new Date()
  const isExpired = today > expiresAt
  const daysLeft = Math.max(0, Math.ceil((expiresAt - today) / DAY_MS))

  return {
    ...item,
    isExpired,
    expireLabel: isExpired ? '만료됨' : `${daysLeft}일 뒤 만료`,
    expiresAt: expiresAt.toISOString().slice(0, 10),
  }
}

function downloadRiskReportPdf(item) {
  if (item.pdfUrl) {
    window.open(item.pdfUrl, '_blank')
    return
  }

  const printWindow = window.open('', '_blank', 'width=720,height=900')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>${item.title} 리스크 리포트</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 32px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          h2 { margin: 28px 0 10px; font-size: 18px; }
          p, li { color: #4b5563; line-height: 1.55; }
          .meta { color: #6b7280; margin-bottom: 22px; }
          .score { display: flex; gap: 14px; margin: 18px 0; }
          .score div { flex: 1; padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; }
          .score strong { display: block; margin-top: 6px; font-size: 26px; color: #111827; }
          section { padding-top: 14px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>${item.title} 리스크 리포트</h1>
        <p class="meta">생성일 ${item.date} · 만료일 ${item.expiresAt} · ${item.estimatePrice}</p>
        <div class="score">
          <div>리스크 점수<strong>${item.riskScore}</strong></div>
          <div>리스크 등급<strong>${item.riskLevel}</strong></div>
        </div>
        <section>
          <h2>요약</h2>
          <p>${item.summary}</p>
        </section>
        <section>
          <h2>주요 위험 요소</h2>
          <ul>${(item.items ?? []).map((risk) => `<li>${risk}</li>`).join('')}</ul>
        </section>
        <section>
          <h2>확인 체크리스트</h2>
          <ul>${(item.checklist ?? []).map((check) => `<li>${check}</li>`).join('')}</ul>
        </section>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

function RiskReportDetailView({ item }) {
  return (
    <>
      <div className="estimate-result-title risk-result-title">
        <img src={figmaAssets.mypageRiskReportTitle} alt="" />
        <div>
          <h2>{item.title} 리스크 리포트</h2>
          <p>{item.estimatePrice}</p>
        </div>
      </div>
      <div className="risk-score-panel">
        <div>
          <span>리스크 점수</span>
          <strong>{item.riskScore}</strong>
        </div>
        <div>
          <span>리스크 등급</span>
          <strong>{item.riskLevel}</strong>
        </div>
      </div>
      <div className="risk-result-body">
        <section>
          <h3>요약</h3>
          <p>{item.summary}</p>
        </section>
        <section>
          <h3>주요 위험 요소</h3>
          <ul>
            {(item.items ?? []).map((risk) => <li key={risk}>{risk}</li>)}
          </ul>
        </section>
        <section>
          <h3>확인 체크리스트</h3>
          <ul>
            {(item.checklist ?? []).map((check) => <li key={check}>{check}</li>)}
          </ul>
        </section>
        <div className="document-art risk compact" />
      </div>
    </>
  )
}

export function RiskHomePage({ go }) {
  return (
    <section className="service-hero">
      <CustomerTopBar go={go} />
      <h1>AI 리스크 리포트 서비스</h1>
      <h2>AI로 발생할 리스크를 미리 확인해 보세요</h2>
      <p>매칭이 시작되면 견적서에 기반하여 리스크를 계산해 리포트를 작성해드립니다.</p>
      <div className="service-shot-row">
        <div className="phone-shot first risk" />
        <div className="phone-shot second risk" />
        <div className="phone-shot fourth risk" />
      </div>
      <div className="dot-row"><span className="active dim" /><span /><span /><span className="active dim" /></div>
      <PrimaryButton narrow onClick={() => go(screens.riskSelect)}>리스크 리포트 받기</PrimaryButton>
    </section>
  )
}

export function RiskSelectPage({ go }) {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchMyAiEstimates()
      .then((data) => {
        if (isMounted) setEstimates(data)
      })
      .catch((error) => {
        console.error('견적서 목록 불러오기 실패:', error)
        if (isMounted) setEstimates([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const requestRiskReport = async (estimateId) => {
    try {
      const data = await createRiskReport(estimateId)

      if (!data.riskReportId) {
        alert('리스크 리포트 요청에 실패했습니다.')
        return
      }

      navigate(screenPaths[screens.riskLoading], {
        state: {
          riskReportId: data.riskReportId,
          resultData: data.report,
        },
      })
    } catch (error) {
      console.error('리스크 리포트 요청 실패:', error)
      alert('백엔드 서버와 통신하는 중 오류가 발생했습니다.')
    }
  }

  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.riskHome)}>‹</button>
      <h1>AI 리스크 리포트</h1>
      {isLoading ? (
        <p className="empty-list-message">견적서 목록을 불러오는 중입니다...</p>
      ) : estimates.length === 0 ? (
        <div className="empty-state-panel">
          <h2>생성된 AI 견적서가 없습니다</h2>
          <p>리스크 리포트는 AI 견적서를 기준으로 생성됩니다.</p>
          <PrimaryButton narrow onClick={() => go(screens.estimateStart)}>AI 견적서 생성</PrimaryButton>
        </div>
      ) : (
        <>
          <h2>AI 견적서를 선택해주세요</h2>
          <div className="list-stack">
            {estimates.map((estimate) => (
              <article className="record-card estimate-card large" key={estimate.id}>
                <div className="record-side">
                  <span>{estimate.date || '날짜 없음'}</span>
                  <small>{estimate.status === 'COMPLETED' ? '완료' : '진행중'}</small>
                </div>
                <div className="record-main">
                  <h3>{estimate.title}</h3>
                  <p>시공 위치 : {estimate.details?.location || '확인 필요'}</p>
                  <p>{estimate.subtitle}</p>
                  <button className="wide-action" onClick={() => requestRiskReport(estimate.id)}>리스크 리포트 요청하기</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export function RiskLoadingPage({ go }) {
  const location = useLocation()
  const navigate = useNavigate()
  const riskReportId = location.state?.riskReportId
  const initialResult = location.state?.resultData

  useEffect(() => {
    if (!riskReportId) {
      go(screens.riskHome)
      return undefined
    }

    let isActive = true

    const checkStatus = async () => {
      try {
        const report = await fetchRiskReportDetail(riskReportId)
        const status = report.reportStatus
        const isCompleted = !status || ['COMPLETED', 'SUCCESS', 'DONE'].includes(status)

        if (isActive && isCompleted) {
          navigate(screenPaths[screens.riskDone], {
            state: { resultData: report },
          })
        }
      } catch (error) {
        console.error('리스크 리포트 상태 확인 실패:', error)
      }
    }

    if (initialResult && !initialResult.reportStatus) {
      navigate(screenPaths[screens.riskDone], {
        state: { resultData: getRiskStatus(initialResult) },
      })
      return undefined
    }

    checkStatus()
    const interval = window.setInterval(checkStatus, 3000)

    return () => {
      isActive = false
      window.clearInterval(interval)
    }
  }, [go, initialResult, navigate, riskReportId])

  return (
    <section className="status-screen">
      <Logo />
      <h2>리스크 리포트 생성중 입니다 ...</h2>
      <div className="status-ring loading" />
      <PrimaryButton narrow orange onClick={() => go(screens.riskSelect)}>취소</PrimaryButton>
    </section>
  )
}

export function RiskDonePage({ go }) {
  const location = useLocation()
  const navigate = useNavigate()
  const resultData = location.state?.resultData

  const goToOutput = () => {
    navigate(screenPaths[screens.riskOutput], {
      state: { resultData },
    })
  }

  return (
    <section className="status-screen">
      <Logo />
      <h2>리스크 리포트가 생성되었습니다 !</h2>
      <div className="status-ring success">✓</div>
      <PrimaryButton narrow onClick={goToOutput}>확인하기</PrimaryButton>
    </section>
  )
}

export function RiskOutputPage({ go }) {
  const location = useLocation()
  const resultData = location.state?.resultData ? getRiskStatus(location.state.resultData) : null

  if (!resultData) {
    return (
      <section className="document-screen">
        <p className="empty-list-message">리포트 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.riskHome)}>홈으로</PrimaryButton>
      </section>
    )
  }

  return (
    <section className="document-screen risk-output-screen">
      <div className="risk-output-fixed-head">
        <CustomerTopBar go={go} compact />
        <div className="risk-output-title-row">
          <button className="inline-back-arrow" onClick={() => go(screens.riskHome)}>‹</button>
          <div>
            <h1>AI 리스크 리포트</h1>
            <p>{resultData.date} · {resultData.expireLabel} · 만료일 {resultData.expiresAt}</p>
          </div>
        </div>
      </div>
      <article className="risk-output-card">
        <RiskReportDetailView item={resultData} />
        <div className="estimate-result-actions risk-result-actions">
          <PrimaryButton ghost onClick={() => downloadRiskReportPdf(resultData)}>PDF 다운로드</PrimaryButton>
          <PrimaryButton onClick={() => go(screens.riskHome)}>확인</PrimaryButton>
        </div>
      </article>
    </section>
  )
}

export function MyRiskListPage({ go, back }) {
  const [selectedRisk, setSelectedRisk] = useState(null)
  const [riskList, setRiskList] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('latest')

  useEffect(() => {
    let isMounted = true

    fetchMyRiskReports().then((data) => {
      if (isMounted) setRiskList(data)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRiskCards = riskList
    .map(getRiskStatus)
    .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
    .filter((item) => filter === 'latest' || item.isExpired)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <section className="subpage-screen history-page risk-list-page">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon risk-title-icon" src={figmaAssets.mypageRiskReportTitle} alt="" />
        <h1>내 리스크리포트</h1>
      </div>
      <div className="history-search-row risk-search-row">
        <SearchBar value={query} onChange={setQuery} />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="리스크리포트 필터">
          <option value="latest">최신순</option>
          <option value="expired">만료됨</option>
        </select>
      </div>
      <div className="history-scroll-area">
        <div className="list-stack">
          {filteredRiskCards.map((item) => (
            <RiskCard
              key={item.id}
              item={item}
              onClick={async () => setSelectedRisk(getRiskStatus(await fetchRiskReportDetail(item.id)))}
            />
          ))}
          {filteredRiskCards.length === 0 ? <p className="empty-list-message">검색 결과가 없습니다.</p> : null}
        </div>
      </div>
      {selectedRisk ? <RiskReportModal item={selectedRisk} onClose={() => setSelectedRisk(null)} /> : null}
    </section>
  )
}

function RiskReportModal({ item, onClose }) {
  return (
    <div className="estimate-result-overlay risk-result-overlay">
      <article className="estimate-result-modal risk-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>{item.date}</span>
            <small>{item.expireLabel} · 만료일 {item.expiresAt}</small>
          </div>
          <button onClick={onClose} aria-label="닫기">×</button>
        </div>
        <RiskReportDetailView item={item} />
        <div className="estimate-result-actions risk-result-actions">
          <PrimaryButton ghost onClick={() => downloadRiskReportPdf(item)}>PDF 다운로드</PrimaryButton>
          <PrimaryButton onClick={onClose}>확인</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
