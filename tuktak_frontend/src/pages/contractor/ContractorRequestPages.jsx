import { FaCamera, FaFileInvoice } from 'react-icons/fa'
import { contractorRequests, contractorScreens } from '../../data/contractorData'
import { ContractorPage, RequestCard, StatusBadge } from './ContractorPageShared'

function RequestEstimatePreview({ item }) {
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
  return (
    <ContractorPage title="시공 요청 목록" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorRequests.map((item) => (
          <RequestCard
            key={item.id}
            item={item}
            onDetail={() => go(contractorScreens.requestDetail)}
          />
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRequestDetailPage({ go }) {
  const item = contractorRequests[0]

  return (
    <ContractorPage title="시공 요청 상세" go={go} back={() => go(contractorScreens.requests)}>
      <RequestEstimatePreview item={item} />
      <div className="contractor-bottom-actions">
        <button type="button" onClick={() => go(contractorScreens.requests)}>닫기</button>
        <button type="button" onClick={() => go(contractorScreens.quoteForm)}>견적서 작성하기</button>
      </div>
    </ContractorPage>
  )
}

export function ContractorAiEstimatePage({ go }) {
  const item = contractorRequests[0]

  return (
    <ContractorPage title="AI 견적서 보기" go={go} back={() => go(contractorScreens.requestDetail)}>
      <RequestEstimatePreview item={item} />
    </ContractorPage>
  )
}
