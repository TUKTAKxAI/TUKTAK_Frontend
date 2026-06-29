import { figmaAssets } from '../../components/customer/figmaAssets'
import { HeaderIcon } from '../../components/customer/CustomerTopBar'
import { Logo } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'

const homeReviews = [
  {
    time: '3분 전',
    rating: 5,
    partner: '홍길동 파트너',
    title: '도어락 수리',
    body: '도어락이 갑자기 고장나서 당황스러웠는데, 정말 빠르게 와주셔서 해결해주셨습니다. 고치기도 빠르게 고쳐주시고 정말 친절하게 해주셔서 마음 편하게 시공 받았습니다.',
  },
  {
    time: '5분 전',
    rating: 5,
    partner: '김어락 파트너',
    title: '도어락 수리',
    body: '빠른 시공 좋았어요. 다음에 또 고장나면 이분한테 고쳐달라고 할 것 같아요. 어플 덕분에 이렇게 좋은 분도 알아가고 참 좋습니다.',
  },
]

function StarRating({ rating }) {
  return (
    <span className="home-stars">
      {'★'.repeat(rating)}
      <em>{rating}/5</em>
    </span>
  )
}

export function HomePage({ go }) {
  return (
    <section className="home-layout">
      <header className="home-topbar">
        <Logo />
        <div className="top-actions">
          <HeaderIcon src={figmaAssets.notification} label="알림" />
          <HeaderIcon src={figmaAssets.userProfile} label="마이페이지" onClick={() => go(screens.mypage)} />
        </div>
      </header>

      <button className="home-alert-card" type="button" onClick={() => go(screens.estimateHome)}>
        <div className="home-alert-mark">!</div>
        <div>
          <h2>예약된 시공이 없어요 !</h2>
          <p>수리할 곳이 있으신가요?</p>
          <p>지금 AI로 견적을 받아보세요</p>
        </div>
      </button>

      <button className="home-near-card" type="button" onClick={() => go(screens.matchingHome)}>
        <div className="home-location">서울시 종로구⌄</div>
        <div className="home-worker-row">
          <div className="home-worker-icon" />
          <h2>근처 13명의 시공자가 작업을 기다리고 있어요</h2>
        </div>
        <p>매칭이 빨리 될 확률이 높아요</p>
      </button>

      <section className="home-review-section">
        <h2>최신 리뷰</h2>
        <div className="home-review-panel">
          <div className="home-review-tabs">
            <button className="active">도어락</button>
            <button>목공</button>
            <button>배관</button>
            <button>보일러</button>
            <button>전기</button>
          </div>
          {homeReviews.map((review) => (
            <article className="home-review-item" key={`${review.partner}-${review.time}`}>
              <div className="home-review-meta">
                <div>
                  <small>{review.time}</small>
                  <StarRating rating={review.rating} />
                </div>
                <div className="home-review-title">
                  <strong>{review.partner}</strong>
                  <h3>{review.title}</h3>
                </div>
              </div>
              <p>{review.body}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
