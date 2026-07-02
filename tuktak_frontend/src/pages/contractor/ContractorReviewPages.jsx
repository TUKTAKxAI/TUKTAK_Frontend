import { FaStar } from 'react-icons/fa'
import { contractorReviews } from '../../data/contractorData'
import { ContractorPage } from './ContractorPageShared'

export function ContractorReviewsPage() {
  return (
    <ContractorPage title="리뷰 보기">
      <div className="contractor-list">
        {contractorReviews.map((review) => (
          <article className="contractor-review-card" key={review.id}>
            <div><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
            <h2>{review.title}</h2>
            <strong>{review.customer}</strong>
            <p>{review.body}</p>
          </article>
        ))}
      </div>
    </ContractorPage>
  )
}
