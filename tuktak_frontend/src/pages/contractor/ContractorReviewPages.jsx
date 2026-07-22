import { FaChevronLeft, FaExclamationTriangle, FaStar, FaUserCircle } from 'react-icons/fa'
import { contractorReviews, contractorScreens } from '../../data/contractorData'
import { ContractorPage } from './ContractorPageShared'

function RatingStars({ rating }) {
  return (
    <div className="contractor-reviews-stars" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FaStar className={index < rating ? 'is-filled' : ''} key={index} aria-hidden="true" />
      ))}
      <span>{rating}.0</span>
    </div>
  )
}

export function ContractorReviewsPage({ go }) {
  return (
    <ContractorPage go={go}>
      <div className="contractor-reviews cds--white">
        <header className="contractor-active-header">
          <button
            type="button"
            className="contractor-active-back"
            onClick={() => go(contractorScreens.home)}
            aria-label="뒤로가기"
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          <div className="contractor-active-header-title">
            <p className="contractor-active-eyebrow">시공자</p>
            <h1>리뷰 보기</h1>
          </div>
          <span className="contractor-active-header-spacer" aria-hidden="true" />
        </header>

        <div className="contractor-reviews-list">
          {contractorReviews.map((review) => (
            <article className="contractor-reviews-card" key={review.id}>
              <div className="contractor-reviews-card-top">
                <div className="contractor-reviews-card-profile">
                  <FaUserCircle aria-hidden="true" />
                  <strong>{review.customer}</strong>
                </div>
                <button className="contractor-reviews-report" type="button" aria-label="리뷰 신고">
                  <FaExclamationTriangle aria-hidden="true" />
                </button>
              </div>

              <RatingStars rating={review.rating} />

              <h2 className="contractor-reviews-card-title">{review.serviceName}</h2>
              <p className="contractor-reviews-card-price">{review.amount}</p>
              <p className="contractor-reviews-card-body">{review.body}</p>
              <time className="contractor-reviews-card-date">{review.date}</time>
            </article>
          ))}
        </div>
      </div>
    </ContractorPage>
  )
}
