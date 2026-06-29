import { HistoryCard, InfoRows, MenuTile, ReviewCard, SearchBar } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Avatar } from '../../components/customer/FormControls'
import { historyCards, profileRows, reviewCards, screens } from '../../data/customerData'

export function MyPage({ go }) {
  return (
    <section className="subpage-screen mypage-screen">
      <CustomerTopBar go={go} />
      <button className="inline-back-arrow" onClick={() => go(screens.home)}>‹</button>
      <div className="mypage-hero">
        <Avatar large tone="blue" />
        <div>
          <h1>강대근님,</h1>
          <h2>안녕하세요 !</h2>
          <p>abcd1234</p>
        </div>
      </div>
      <div className="tile-grid">
        <MenuTile icon="history" label="매칭 히스토리" onClick={() => go(screens.matchHistory)} />
        <MenuTile icon="estimate" label="내 AI 견적서" onClick={() => go(screens.myEstimateList)} />
        <MenuTile icon="risk" label="내 리스크리포트" onClick={() => go(screens.myRiskList)} />
        <MenuTile icon="review" label="내가 쓴 리뷰" onClick={() => go(screens.myReviews)} />
        <MenuTile icon="profile" label="내 정보" onClick={() => go(screens.profile)} />
      </div>
    </section>
  )
}

export function MyReviewsPage({ go }) {
  return (
    <section className="subpage-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
        <h1>내가 쓴 리뷰</h1>
      </div>
      <SearchBar />
      <div className="list-stack">
        {reviewCards.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}

export function ProfilePage({ go }) {
  return (
    <section className="subpage-screen profile-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
        <h1>내 정보</h1>
      </div>
      <div className="profile-top">
        <Avatar large tone="blue" />
        <h2>강대근 님</h2>
      </div>
      <InfoRows rows={profileRows} />
      <p className="withdraw">회원탈퇴 | 로그아웃</p>
    </section>
  )
}

export function MatchHistoryPage({ go }) {
  const pastHistories = historyCards.filter((item) => item.reviewable || item.status.includes('완료'))

  return (
    <section className="subpage-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
        <h1>매칭 히스토리</h1>
      </div>
      <SearchBar />
      <div className="list-stack">
        {pastHistories.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onClickReview={() => go(screens.reviewWrite)}
          />
        ))}
      </div>
    </section>
  )
}
