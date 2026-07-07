import { FaExclamationTriangle, FaStar, FaUserCircle } from 'react-icons/fa'
import { contractorReviews, contractorScreens } from '../../data/contractorData'
import { ContractorPage } from './ContractorPageShared'

function RatingStars({ rating }) {
  return (
    <div className="contractor-review-stars" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FaStar className={index < rating ? 'filled' : ''} key={index} />
      ))}
      <span>{rating}.0</span>
    </div>
  )
}

export function ContractorReviewsPage({ go }) {
  return (
    <ContractorPage title="리뷰 보기" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorReviews.map((review) => (
          <article className="contractor-review-card" key={review.id}>
            <div className="contractor-review-top">
              <div className="contractor-review-profile">
                <FaUserCircle />
                <strong>{review.customer}</strong>
              </div>
              <button className="contractor-report-button" type="button" aria-label="리뷰 신고">
                <FaExclamationTriangle />
              </button>
            </div>
            <RatingStars rating={review.rating} />
            <h2>{review.serviceName}</h2>
            <p className="contractor-review-price">{review.amount}</p>
            <p className="contractor-review-body">{review.body}</p>
            <time>{review.date}</time>
          </article>
        ))}
      </div>
    </ContractorPage>
  )
}
