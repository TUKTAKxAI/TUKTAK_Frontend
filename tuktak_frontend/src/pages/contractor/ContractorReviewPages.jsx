import { useMemo, useState } from 'react'
import { FaExclamationTriangle, FaStar, FaUserCircle } from 'react-icons/fa'
import { contractorReviews, contractorScreens } from '../../data/contractorData'
import { ContractorPage } from './ContractorPageShared'

const reviewSortOptions = [
  { label: '최신순', value: 'newest' },
  { label: '오래된순', value: 'oldest' },
  { label: '별점 높은순', value: 'ratingHigh' },
  { label: '별점 낮은순', value: 'ratingLow' },
]

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
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const averageRating = useMemo(() => {
    if (!contractorReviews.length) return '0.0'
    const total = contractorReviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / contractorReviews.length).toFixed(1)
  }, [])
  const filteredReviews = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return contractorReviews.filter((review) => (
      !keyword || `${review.customer} ${review.serviceName} ${review.body}`.toLowerCase().includes(keyword)
    )).toSorted((a, b) => {
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sort === 'ratingHigh') return b.rating - a.rating
      if (sort === 'ratingLow') return a.rating - b.rating
      return new Date(b.date) - new Date(a.date)
    })
  }, [query, sort])

  const sortedReviewCount = filteredReviews.length

  return (
    <ContractorPage title="리뷰 보기" go={go} back={() => go(contractorScreens.home)}>
      <section className="contractor-review-summary">
        <div>
          <small>평균 평점</small>
          <strong>{averageRating}</strong>
        </div>
        <div>
          <small>표시 리뷰</small>
          <strong>{sortedReviewCount}개</strong>
        </div>
      </section>

      <label className="contractor-search-bar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="고객명, 작업명, 리뷰 내용 검색"
        />
      </label>

      <label className="contractor-sort-select">
        <span>정렬</span>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          {reviewSortOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>

      <div className="contractor-list">
        {filteredReviews.map((review) => (
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
        {filteredReviews.length === 0 ? <p className="contractor-empty-message">표시할 리뷰가 없습니다.</p> : null}
      </div>
    </ContractorPage>
  )
}
