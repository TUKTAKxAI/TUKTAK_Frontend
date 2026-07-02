import { FaFileInvoice } from 'react-icons/fa'
import { contractorRequests, contractorScreens } from '../../data/contractorData'
import { ContractorPage, RequestCard, StatusBadge } from './ContractorPageShared'

export function ContractorRequestsPage({ go }) {
  return (
    <ContractorPage title="시공 요청 목록" back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorRequests.map((item) => (
          <RequestCard
            key={item.id}
            item={item}
            onDetail={() => go(contractorScreens.requestDetail)}
            onAiEstimate={() => go(contractorScreens.aiEstimate)}
            onQuote={() => go(contractorScreens.quoteForm)}
          />
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRequestDetailPage({ go }) {
  const item = contractorRequests[0]

  return (
    <ContractorPage title="시공 요청 상세" back={() => go(contractorScreens.requests)}>
      <article className="contractor-detail-card">
        <StatusBadge>{item.status}</StatusBadge>
        <h1>{item.title}</h1>
        <p>{item.region}</p>
        <dl>
          <div><dt>예산</dt><dd>{item.budget}</dd></div>
          <div><dt>희망일</dt><dd>{item.desiredDate} {item.time}</dd></div>
          <div><dt>요청 내용</dt><dd>고객이 등록한 시공 요청 상세를 보여줄 자리입니다.</dd></div>
        </dl>
        <div className="contractor-button-row">
          <button type="button" onClick={() => go(contractorScreens.aiEstimate)}>AI 견적서 보기</button>
          <button type="button" onClick={() => go(contractorScreens.quoteForm)}>견적 작성</button>
        </div>
      </article>
    </ContractorPage>
  )
}

export function ContractorAiEstimatePage({ go }) {
  return (
    <ContractorPage title="AI 견적서 보기" back={() => go(contractorScreens.requestDetail)}>
      <article className="contractor-detail-card">
        <FaFileInvoice className="contractor-hero-icon" />
        <h1>도어락 수리 AI 견적</h1>
        <p>현재 AI 견적서 상세 API가 확정되지 않아 목업 데이터로 표시합니다.</p>
        <dl>
          <div><dt>예상 비용</dt><dd>80,000원 ~ 120,000원</dd></div>
          <div><dt>예상 시간</dt><dd>1시간</dd></div>
          <div><dt>주의 사항</dt><dd>현장 도어락 모델 확인 필요</dd></div>
        </dl>
      </article>
    </ContractorPage>
  )
}
