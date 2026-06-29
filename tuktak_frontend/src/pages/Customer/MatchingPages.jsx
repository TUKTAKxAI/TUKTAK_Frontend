import { PartnerBidCard } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Avatar, Logo, PrimaryButton } from '../../components/customer/FormControls'
import { addressRows, partnerBids, screens } from '../../data/customerData'

export function MatchingHomePage({ go }) {
  return (
    <section className="service-hero">
      <CustomerTopBar go={go} />
      <h1>매칭 서비스</h1>
      <h2>근처 최고의 시공 업자와 매칭해보세요</h2>
      <p>AI 견적서, 지역 기반으로 근처 최고의 시공 업자와 매칭해드립니다</p>
      <div className="service-shot-row">
        <div className="phone-shot first match" />
        <div className="phone-shot second match" />
        <div className="phone-shot fourth match" />
      </div>
      <div className="dot-row"><span className="active dim" /><span /><span /><span className="active dim" /></div>
      <PrimaryButton narrow onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
    </section>
  )
}

export function MatchingEstimateSelectPage({ go }) {
  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingHome)}>‹</button>
      <h2>AI 견적서를 선택해주세요</h2>
      <article className="record-card estimate-card large">
        <div className="record-side">
          <span>2026-06-16</span>
          <small>방금</small>
        </div>
        <div className="record-main">
          <h3>거실 몰딩 시공</h3>
          <p>담당 시공자 : 김철수</p>
          <p>확정 시공 비용 : 600,000</p>
          <button className="wide-action" onClick={() => go(screens.matchingAddressList)}>매칭하기</button>
        </div>
      </article>
    </section>
  )
}

export function MatchingAddressListPage({ go }) {
  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingEstimateSelect)}>‹</button>
      <p className="small-copy">시공 지역을 알려주세요 !</p>
      <h1>내 주소목록</h1>
      <div className="empty-state-address">주소를 선택해 주세요!</div>
      <PrimaryButton narrow onClick={() => go(screens.matchingAddressSelect)}>다음</PrimaryButton>
    </section>
  )
}

export function MatchingAddressSelectPage({ go }) {
  return (
    <section className="selection-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAddressList)}>‹</button>
      <p className="small-copy">시공 지역을 알려주세요 !</p>
      <h1>서울시 종로구 ...</h1>
      <button className="location-button">현재 위치로 찾기</button>
      <div className="address-list">
        {addressRows.map((row) => (
          <div className="address-row" key={row.text}>
            <div className={`address-icon ${row.icon}`} />
            <span>{row.text}</span>
            <em>✎</em>
            {row.selected ? <strong>✓</strong> : null}
          </div>
        ))}
      </div>
      <button className="add-address">⊕ 주소 추가하기</button>
      <PrimaryButton narrow onClick={() => go(screens.matchingSchedule)}>다음</PrimaryButton>
    </section>
  )
}

export function MatchingSchedulePage({ go, openUrgent }) {
  return (
    <section className="selection-screen schedule-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAddressSelect)}>‹</button>
      <h1>시공을 예약할 날짜와 시간을 선택해주세요</h1>
      <div className="schedule-row">
        <div className="schedule-icon calendar" />
        <button>2026-06-23 <span>⌑</span></button>
      </div>
      <div className="schedule-row">
        <div className="schedule-icon clock" />
        <button>15:00-18:00 <span>▼</span></button>
      </div>
      <button className="urgent-banner" onClick={openUrgent}>긴급 수리 요청</button>
      <div className="button-row bottom-actions">
        <PrimaryButton orange onClick={() => go(screens.matchingAddressSelect)}>취소</PrimaryButton>
        <PrimaryButton onClick={() => go(screens.matchingProgress)}>매칭 시작하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MatchingProgressPage({ go }) {
  return (
    <section className="status-screen">
      <button className="inline-back-arrow top-left" onClick={() => go(screens.matchingSchedule)}>‹</button>
      <Logo />
      <div className="status-ring loading" />
      <h2>매칭 진행중 ...</h2>
      <p>이 화면을 나가셔도 매칭은 계속 진행돼요</p>
      <PrimaryButton narrow onClick={() => go(screens.matchingAuction)}>확인</PrimaryButton>
    </section>
  )
}

export function MatchingAuctionPage({ go }) {
  return (
    <section className="selection-screen auction-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingProgress)}>‹</button>
      <Logo />
      <h1>몰딩 시공</h1>
      <div className="list-stack">
        {partnerBids.map((partner) => (
          <PartnerBidCard key={partner.id} partner={partner} onClick={() => go(screens.matchingPartnerInfo)} />
        ))}
      </div>
      <div className="auction-footer">
        <span>2026-06-16</span>
        <span>대기중인 파트너 : 3명</span>
      </div>
      <p className="muted center">기다리시면 추가 매칭이 진행될 수 있어요</p>
    </section>
  )
}

export function MatchingPartnerPage({ go }) {
  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <article className="document-card tall">
        <div className="partner-profile-card">
          <Avatar tone="light" />
          <div>
            <strong>홍길동 파트너</strong>
            <span>★★★★★ 4.5/5</span>
            <p>목공 전문 / 경력 13년</p>
            <p>0507-125-5484 (안심번호)</p>
          </div>
        </div>
        <h2 className="big-cost">제안 시공비용 : 620,000원</h2>
        <div className="partner-detail-copy">
          <p>예상 소요시간 : 약 3시간</p>
          <p>확정 방문시간 : 16:00</p>
          <p>확정 시공 일 : 2026-06-23</p>
          <p>...기타 상세 내용</p>
        </div>
        <PrimaryButton narrow onClick={() => go(screens.matchingDone)}>파트너 선택하기</PrimaryButton>
      </article>
    </section>
  )
}

export function MatchingPartnerInfoPage({ go }) {
  return (
    <section className="document-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.matchingAuction)}>‹</button>
      <article className="document-card tall">
        <div className="partner-info-top">
          <Avatar tone="light" />
          <div>
            <strong>홍길동 파트너</strong>
            <span>★★★★★ 4.5/5</span>
            <p>대표 번호 : 02-123-1234</p>
            <p>주소지 : 서울시 역삼동 ##번지</p>
            <p>전문 / 시공 분야 : 목공/문틀</p>
            <p>경력 사항 : 16년</p>
          </div>
        </div>
        <div className="partner-review-box">
          <small>최근리뷰</small>
          <div className="partner-mini-review">작성자 : 강대근 ★★★★★ 5/5</div>
          <div className="partner-mini-review">작성자 : 김 다니엘 ★★★★☆ 4.5/5</div>
        </div>
        <div className="score-strip">
          <div><span>👍</span><strong>4.5/5</strong></div>
          <button type="button" onClick={() => go(screens.matchingPartner)}><span>◯</span><strong>27건</strong></button>
          <div><span>✕</span><strong>2건</strong></div>
        </div>
      </article>
    </section>
  )
}

export function MatchingDonePage({ go }) {
  return (
    <section className="subpage-screen">
      <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
      <div className="list-stack">
        <article className="record-card done-card">
          <div className="record-side">
            <span>2026-06-16</span>
            <small>매칭 완료</small>
          </div>
          <div className="record-main">
            <h3>몰딩 시공</h3>
            <div className="partner-inline">
              <Avatar tone="light" />
              <div>
                <strong>홍길동 파트너 ★★★★★ 4.5/5</strong>
                <p>확정 시공비용 : 620,000원</p>
              </div>
            </div>
            <button className="wide-action" onClick={() => go(screens.chatRoom)}>1:1 채팅 상담</button>
          </div>
        </article>
        <article className="record-card done-card faded">
          <div className="record-side">
            <span>2026-02-13</span>
            <small>시공 완료</small>
          </div>
          <div className="record-main">
            <h3>거실 도배 시공</h3>
            <div className="partner-inline">
              <Avatar tone="plain" />
              <div>
                <strong>김도배 파트너 ★★★★★ 4.5/5</strong>
                <p>확정 시공비용 : 240,000원</p>
              </div>
            </div>
            <button className="wide-action disabled">만료됨</button>
          </div>
        </article>
      </div>
    </section>
  )
}

export function ReviewWritePage({ go }) {
  return (
    <section className="review-write-screen">
      <article className="review-write-card">
        <div className="review-write-head">
          <div className="title-icon review" />
          <h1>리뷰 작성</h1>
        </div>
        <div className="review-avatar-block">
          <Avatar large tone="light" />
          <strong>김도배 파트너님</strong>
          <span>★★★★☆ 4.5/5</span>
        </div>
        <h2>이분의 시공은 어떠셨나요?</h2>
        <div className="big-stars">☆☆☆☆☆</div>
        <textarea className="textarea tall" placeholder="이분의 시공은 어땠는지 자세하게 알려주세요." />
        <div className="button-row">
          <PrimaryButton orange onClick={() => go(screens.matchHistory)}>취소</PrimaryButton>
          <PrimaryButton onClick={() => go(screens.myReviews)}>완료</PrimaryButton>
        </div>
      </article>
    </section>
  )
}

export function UrgentModal({ close, confirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">!</div>
        <h3>긴급 수리 요청 선택 시</h3>
        <p>최대한 빠르게 시공을 받아볼 수 있으며, 추가 비용이 발생할 수 있어요.</p>
        <small>진행하시겠습니까?</small>
        <div className="button-row">
          <PrimaryButton orange onClick={close}>취소</PrimaryButton>
          <PrimaryButton onClick={confirm}>확인</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
