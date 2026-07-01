import { useEffect, useState } from 'react'
import { fetchAiEstimateDetail, fetchMyAiEstimates } from '../../api/mypageApi'
import { EstimateCard, SearchBar } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'

function ServiceHero({ title, subtitle, body, onClick, buttonLabel }) {
  return (
    <section className="service-hero">
      <CustomerTopBar />
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <p>{body}</p>
      <div className="service-shot-row">
        <div className="phone-shot first" />
        <div className="phone-shot second" />
        <div className="phone-shot third" />
        <div className="phone-shot fourth" />
      </div>
      <div className="dot-row"><span className="active" /><span /><span /><span /><span className="active dim" /></div>
      <PrimaryButton narrow onClick={onClick}>{buttonLabel}</PrimaryButton>
    </section>
  )
}

export function EstimateHomePage({ go }) {
  return (
    <ServiceHero
      title="AI 견적 서비스"
      subtitle="AI로 수리 비용 및 시간을 미리 예측하세요"
      body="수리부위 사진과 설명을 첨부하면 AI가 견적서를 제공합니다"
      onClick={() => go(screens.estimateStart)}
      buttonLabel="AI 견적 받기"
    />
  )
}

export function EstimateStartPage({ go }) {
  return (
    <section className="form-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.estimateHome)}>‹</button>
      <p className="form-label">시공하고싶은 위치의 사진을 업로드 해주세요 !</p>
      <button className="upload-zone" type="button">
        <div className="camera-icon" />
      </button>
      <p className="form-label">시공에 대한 상세 내용을 적어주세요 !</p>
      <textarea className="textarea tall short" placeholder="Ex) 문틀을 모던한 디자인으로 흰색으로 하고싶어요" />
      <p className="muted center">남은 견적받기 횟수 2/3</p>
      <PrimaryButton onClick={() => go(screens.estimateLoading)}>AI 견적 요청하기</PrimaryButton>
    </section>
  )
}

export function EstimateLoadingPage({ go }) {
  return (
    <section className="status-screen">
      <Logo />
      <h2>AI 견적서를 생성중 입니다 ...</h2>
      <div className="status-ring loading" />
      <PrimaryButton narrow orange onClick={() => go(screens.estimateStart)}>취소</PrimaryButton>
    </section>
  )
}

export function EstimateDonePage({ go }) {
  return (
    <section className="status-screen">
      <Logo />
      <h2>AI 견적서가 생성 되었습니다 !</h2>
      <div className="status-ring success">✓</div>
      <PrimaryButton narrow onClick={() => go(screens.estimateOutput)}>확인하기</PrimaryButton>
    </section>
  )
}

export function EstimateOutputPage({ go }) {
  return (
    <section className="document-screen">
      <article className="document-card">
        <div className="document-head">
          <div>
            <span>2026-06-16</span>
          </div>
          <div className="align-right">
            <h2>몰딩 시공 견적서</h2>
            <p>예상 비용 : 670,000</p>
          </div>
          <div className="pdf-icon">PDF</div>
        </div>
        <div className="document-body">
          <h3>견적서 내용 ....</h3>
          <div className="document-art estimate" />
        </div>
      </article>
      <div className="button-row bottom-actions">
        <PrimaryButton ghost onClick={() => go(screens.estimateHome)}>확인</PrimaryButton>
        <PrimaryButton onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MyEstimateListPage({ go, back }) {
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [estimateList, setEstimateList] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('latest')

  useEffect(() => {
    let isMounted = true

    fetchMyAiEstimates().then((data) => {
      if (isMounted) setEstimateList(data)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredEstimateCards = estimateList
    .filter((item) => (
      `${item.date} ${item.status} ${item.title} ${item.subtitle} ${item.details?.location ?? ''} ${item.details?.request ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery)
    ))
    .sort((a, b) => {
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sort === 'price') return b.price - a.price
      return new Date(b.date) - new Date(a.date)
    })

  return (
    <section className="subpage-screen history-page estimate-list-page">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon estimate-title-icon" src={figmaAssets.mypageAiEstimateTitle} alt="" />
        <h1>내 AI 견적서</h1>
      </div>
      <div className="history-search-row estimate-search-row">
        <SearchBar value={query} onChange={setQuery} />
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="AI 견적서 정렬">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="price">가격순</option>
        </select>
      </div>
      <div className="history-scroll-area">
        <div className="list-stack">
          {filteredEstimateCards.map((item) => (
            <EstimateCard
              key={item.id}
              item={item}
              onClick={async () => setSelectedEstimate(await fetchAiEstimateDetail(item.id))}
            />
          ))}
          {filteredEstimateCards.length === 0 ? <p className="empty-list-message">검색 결과가 없습니다.</p> : null}
        </div>
      </div>
      {selectedEstimate ? (
        <EstimateResultModal
          item={selectedEstimate}
          onClose={() => setSelectedEstimate(null)}
          onStartMatching={() => go(screens.matchingEstimateSelect)}
        />
      ) : null}
    </section>
  )
}

function EstimateResultModal({ item, onClose, onStartMatching }) {
  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>{item.date}</span>
            <small>{item.status}</small>
          </div>
          <button onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="estimate-result-title">
          <img src={figmaAssets.mypageAiEstimateTitle} alt="" />
          <div>
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>
        </div>
        <div className="estimate-result-body">
          <section>
            <span>시공 위치</span>
            <strong>{item.details?.location}</strong>
          </section>
          <section>
            <span>요청 내용</span>
            <strong>{item.details?.request}</strong>
          </section>
          <section>
            <span>예상 시간</span>
            <strong>{item.details?.estimatedTime}</strong>
          </section>
          <p>{item.details?.summary}</p>
          <div className="document-art estimate compact" />
        </div>
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>확인</PrimaryButton>
          <PrimaryButton onClick={onStartMatching}>매칭 시작하기</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
