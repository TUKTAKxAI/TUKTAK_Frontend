import { InfoPanel, MenuRow, ReviewCard } from '../../components/customer/Cards'
import { Avatar } from '../../components/customer/FormControls'
import { profileRows, reviews, screens } from '../../data/customerData'

export function MyPage({ go }) {
  return (
    <section>
      <div className="my-hero">
        <Avatar large />
        <h2>강대근 님, 안녕하세요!</h2>
        <p>abc123@gmail.com</p>
      </div>
      <div className="menu-panel">
        <MenuRow label="AI 견적서 목록" onClick={() => go(screens.estimateList)} />
        <MenuRow label="매칭 히스토리" onClick={() => go(screens.matchHistory)} />
        <MenuRow label="리스크 리포트 목록" onClick={() => go(screens.risk)} />
        <MenuRow label="작성한 리뷰" onClick={() => go(screens.myReviews)} />
        <MenuRow label="내 정보 조회 / 수정" onClick={() => go(screens.profile)} />
      </div>
    </section>
  )
}

export function MyReviewsPage() {
  return (
    <section>
      <div className="search-box">검색</div>
      <div className="list-stack">
        {reviews.map((review) => (
          <ReviewCard review={review} key={review.title} />
        ))}
      </div>
    </section>
  )
}

export function ProfilePage() {
  return (
    <section>
      <div className="profile-hero">
        <Avatar large />
        <h2>강대근 님</h2>
      </div>
      <InfoPanel rows={profileRows} />
      <p className="withdraw">회원탈퇴 | 로그아웃</p>
    </section>
  )
}
