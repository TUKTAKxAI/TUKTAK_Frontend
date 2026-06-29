import { HeroBlock, InfoPanel, PartnerCard } from '../../components/customer/Cards'
import { Avatar, PrimaryButton, SecondaryButton } from '../../components/customer/FormControls'
import { partners, screens } from '../../data/customerData'

export function MatchingPage({ go }) {
  return (
    <section className="list-stack">
      {partners.map((partner) => (
        <PartnerCard key={partner.name} partner={partner} onClick={() => go(screens.partner)} />
      ))}
      <SecondaryButton onClick={() => go(screens.matchHistory)}>매칭 히스토리</SecondaryButton>
    </section>
  )
}

export function PartnerDetailPage({ go }) {
  return (
    <section>
      <div className="profile-hero">
        <Avatar large />
        <h2>홍길동 파트너</h2>
        <p>목공 전문 / 경력 13년</p>
        <strong>별점 5.0</strong>
      </div>
      <InfoPanel rows={[['진행 가능 비용', '620,000원'], ['가능 일정', '오늘 18:00'], ['전문 지역', '서울 전역']]} />
      <div className="button-row">
        <SecondaryButton onClick={() => go(screens.chatRoom)}>채팅하기</SecondaryButton>
        <PrimaryButton onClick={() => go(screens.reviewWrite)}>선택하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MatchHistoryPage({ go }) {
  return (
    <section className="list-stack">
      {partners.map((partner) => (
        <article className="white-card" key={partner.name}>
          <h3>{partner.name}</h3>
          <p>{partner.specialty}</p>
          <p className="muted">거실 몰딩 시공 완료</p>
          <button className="inline-button" onClick={() => go(screens.reviewWrite)}>
            리뷰 작성
          </button>
        </article>
      ))}
    </section>
  )
}

export function ReviewWritePage({ go }) {
  return (
    <section>
      <HeroBlock title="시공은 어떠셨나요?" text="파트너와 진행한 시공 경험을 남겨주세요." />
      <div className="stars">★★★★★</div>
      <textarea className="textarea tall" placeholder="리뷰 내용을 입력해주세요" />
      <PrimaryButton onClick={() => go(screens.myReviews)}>작성 완료</PrimaryButton>
    </section>
  )
}
