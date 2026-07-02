import { useEffect, useState } from 'react'
import { fetchMatchingHistory, fetchMyProfile, logout as requestLogout, updateMyProfile } from '../../api/mypageApi'
import { HistoryCard, InfoRows, MenuTile, ReviewCard, SearchBar } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Avatar, Logo, PrimaryButton } from '../../components/customer/FormControls'
import { reviewCards, screens } from '../../data/customerData'

// 마이페이지 메인 홈: 각 마이페이지 메뉴로 이동하는 화면
export function MyPage({ go, back }) {
  return (
    <section className="subpage-screen mypage-screen">
      <div className="top-brand-row">
        <Logo />
      </div>
      <button className="inline-back-arrow" onClick={back}>‹</button>
      <div className="mypage-hero">
        <img className="profile-photo-icon" src={figmaAssets.mypageProfilePhoto} alt="" />
        <div>
          <h1>전지원님,</h1>
          <h2>안녕하세요 !</h2>
          <p>abcd1234</p>
        </div>
      </div>
      <div className="tile-grid">
        <MenuTile image={figmaAssets.mypageMatching} label="매칭 히스토리" onClick={() => go(screens.matchHistory)} />
        <MenuTile image={figmaAssets.mypageAiEstimate} label="내 AI 견적서" onClick={() => go(screens.myEstimateList)} />
        <MenuTile image={figmaAssets.mypageRiskReport} label="내 리스크리포트" onClick={() => go(screens.myRiskList)} />
        <MenuTile image={figmaAssets.mypageWrittenReview} label="내가 쓴 리뷰" onClick={() => go(screens.myReviews)} />
        <MenuTile image={figmaAssets.mypageProfile} label="내 정보" onClick={() => go(screens.profile)} />
      </div>
    </section>
  )
}

// 내가 쓴 리뷰: 검색, 정렬, 삭제 기능을 담당
export function MyReviewsPage({ go, back }) {
  const [myReviews, setMyReviews] = useState(reviewCards)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('latest')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredReviews = myReviews
    .filter((review) => (
      `${review.partner} ${review.specialty} ${review.title} ${review.body}`
        .toLowerCase()
        .includes(normalizedQuery)
    ))
    .sort((a, b) => {
      if (sort === 'ratingHigh') return b.rating - a.rating
      if (sort === 'ratingLow') return a.rating - b.rating
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  return (
    <section className="subpage-screen history-page reviews-list-page">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon review-title-icon" src={figmaAssets.mypageWrittenReviewTitle} alt="" />
        <h1>내가 쓴 리뷰</h1>
      </div>
      <div className="history-search-row review-search-row">
        <SearchBar value={query} onChange={setQuery} />
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="내가 쓴 리뷰 정렬">
          <option value="latest">최신순</option>
          <option value="ratingHigh">별점높은순</option>
          <option value="ratingLow">별점낮은순</option>
        </select>
      </div>
      <div className="history-scroll-area">
        <div className="list-stack">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={(reviewId) => setMyReviews((reviews) => reviews.filter((item) => item.id !== reviewId))}
            />
          ))}
          {filteredReviews.length === 0 ? <p className="empty-list-message">검색 결과가 없습니다.</p> : null}
        </div>
      </div>
    </section>
  )
}

// 내 정보 수정 가능 항목 설정
const profileFieldConfig = [
  { key: 'nickname', label: '닉네임', editable: true, type: 'text' },
  { key: 'name', label: '이름', editable: true, type: 'text' },
  { key: 'email', label: '이메일', editable: false, helper: '이메일은 로그인 계정이라 현재 화면에서는 변경할 수 없어요.' },
  { key: 'phone', label: '휴대폰 번호 변경', editable: true, type: 'tel' },
  { key: 'social', label: '연동된 소셜 계정', editable: false, helper: '소셜 계정 연동 관리는 백엔드 인증 API 연결 후 활성화할 예정입니다.' },
  { key: 'address', label: '주소 관리', editable: true, type: 'text' },
  { key: 'payment', label: '결제 수단 관리', editable: true, type: 'text' },
]

// 백엔드 연결 전 기본 표시값
const initialProfile = {
  nickname: '전지원',
  name: '전지원',
  email: 'abcd123@gmail.com',
  phone: '010-1234-5678',
  social: '카카오 연동됨',
  address: '서울시 종로구 인사동길',
  payment: '신한카드 **** 1234',
}

// 내 정보: 프로필 조회, 항목 수정, 로그아웃/회원탈퇴 모달을 담당
export function ProfilePage({ go, back }) {
  const [profile, setProfile] = useState(initialProfile)
  const [editingField, setEditingField] = useState(null)
  const [draftValue, setDraftValue] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    let isMounted = true

    fetchMyProfile().then((data) => {
      if (isMounted) setProfile((current) => ({ ...current, ...data }))
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 화면에 보여줄 내 정보 행으로 변환
  const profileRowsForView = profileFieldConfig.map((field) => ({
    ...field,
    value: profile[field.key],
  }))

  // 정보 행 클릭 시 수정 모달 열기
  const openEditModal = (field) => {
    setEditingField(field)
    setDraftValue(profile[field.key] ?? '')
  }

  // 수정 모달 저장: 백엔드 연결 가능 시 PATCH /users/me 호출
  const saveProfileField = async () => {
    if (!editingField?.editable) {
      setEditingField(null)
      return
    }

    const updated = await updateMyProfile(editingField.key, draftValue)
    setProfile((current) => ({
      ...current,
      [editingField.key]: draftValue,
      ...updated,
    }))
    setEditingField(null)
  }

  // 로그아웃/회원탈퇴 확인 모달 처리
  const runConfirmAction = async () => {
    setConfirmAction(null)
    if (confirmAction === 'logout') {
      await requestLogout().catch(() => undefined)
      go(screens.login)
    }
  }

  return (
    <section className="subpage-screen profile-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon profile-title-icon" src={figmaAssets.mypageProfileTitle} alt="" />
        <h1>내 정보</h1>
      </div>
      <div className="profile-top">
        <img className="profile-photo-icon large" src={figmaAssets.mypageProfilePhoto} alt="" />
        <h2>{profile.name} 님</h2>
      </div>
      <InfoRows rows={profileRowsForView} onSelect={openEditModal} />
      <div className="profile-action-row">
        <button onClick={() => setConfirmAction('withdraw')}>회원탈퇴</button>
        <span>|</span>
        <button onClick={() => setConfirmAction('logout')}>로그아웃</button>
      </div>
      {editingField ? (
        <ProfileEditModal
          field={editingField}
          value={draftValue}
          onChange={setDraftValue}
          onClose={() => setEditingField(null)}
          onSave={saveProfileField}
        />
      ) : null}
      {confirmAction ? (
        <ProfileConfirmModal
          action={confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={runConfirmAction}
        />
      ) : null}
    </section>
  )
}

// 내 정보 수정 모달: 항목별 입력/읽기 전용 안내
function ProfileEditModal({ field, value, onChange, onClose, onSave }) {
  return (
    <div className="estimate-result-overlay profile-modal-overlay">
      <article className="estimate-result-modal profile-edit-modal">
        <div className="estimate-result-head">
          <div>
            <span>내 정보 수정</span>
            <small>{field.label}</small>
          </div>
          <button onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="estimate-result-title profile-edit-title">
          <img src={figmaAssets.mypageProfileTitle} alt="" />
          <div>
            <h2>{field.label}</h2>
            <p>{field.editable ? '변경할 내용을 입력해 주세요.' : '현재는 읽기 전용 항목입니다.'}</p>
          </div>
        </div>
        {field.editable ? (
          <label className="profile-edit-field">
            <span>{field.label}</span>
            <input
              type={field.type ?? 'text'}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
        ) : (
          <p className="profile-readonly-message">{field.helper}</p>
        )}
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton onClick={onSave}>{field.editable ? '저장' : '확인'}</PrimaryButton>
        </div>
      </article>
    </div>
  )
}

// 로그아웃/회원탈퇴 확인 모달
function ProfileConfirmModal({ action, onClose, onConfirm }) {
  const isWithdraw = action === 'withdraw'

  return (
    <div className="estimate-result-overlay profile-modal-overlay">
      <article className="estimate-result-modal profile-confirm-modal">
        <div className="estimate-result-title profile-edit-title">
          <img src={figmaAssets.mypageProfileTitle} alt="" />
          <div>
            <h2>{isWithdraw ? '회원탈퇴' : '로그아웃'}</h2>
            <p>{isWithdraw ? '정말 회원탈퇴를 진행할까요?' : '현재 계정에서 로그아웃할까요?'}</p>
          </div>
        </div>
        <p className="profile-readonly-message">
          {isWithdraw
            ? '회원탈퇴 API 연결 전이라 지금은 확인 흐름만 동작합니다.'
            : '로그아웃을 누르면 로그인 화면으로 이동합니다.'}
        </p>
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton orange={isWithdraw} onClick={onConfirm}>
            {isWithdraw ? '탈퇴하기' : '로그아웃'}
          </PrimaryButton>
        </div>
      </article>
    </div>
  )
}

// 매칭 히스토리: work-orders 기반 목록, 검색, 필터, 리뷰 작성 모달을 담당
export function MatchHistoryPage({ go, back }) {
  const [reviewTarget, setReviewTarget] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('latest')

  useEffect(() => {
    let isMounted = true

    fetchMatchingHistory().then((data) => {
      if (isMounted) setHistoryList(data)
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 검색어와 상태 필터를 적용한 히스토리 목록
  const normalizedQuery = query.trim().toLowerCase()
  const filteredHistoryCards = historyList
    .filter((item) => filter === 'latest' || item.status === filter)
    .filter((item) => (
      `${item.date} ${item.status} ${item.title} ${item.cost} ${item.partner} ${item.schedule}`
        .toLowerCase()
        .includes(normalizedQuery)
    ))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <section className="subpage-screen history-page">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon" src={figmaAssets.matchingHistoryTitle} alt="" />
        <h1>매칭 히스토리</h1>
      </div>
      <div className="history-search-row">
        <SearchBar value={query} onChange={setQuery} />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="매칭 히스토리 필터">
          <option value="latest">최신순</option>
          <option value="진행중">진행중</option>
          <option value="완료됨">완료됨</option>
        </select>
      </div>
      <div className="history-scroll-area">
        <div className="list-stack">
          {filteredHistoryCards.map((item) => (
            <HistoryCard key={item.id} item={item} onClickReview={() => setReviewTarget(item)} />
          ))}
          {filteredHistoryCards.length === 0 ? (
            <div className="history-empty-state">
              <img src={figmaAssets.matchingHistoryEmpty} alt="" />
              <strong>매칭 히스토리가 없습니다</strong>
              <p>검색어나 필터 조건을 다시 확인해 주세요.</p>
            </div>
          ) : null}
        </div>
      </div>
      {reviewTarget ? (
        <ReviewWriteModal
          item={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={() => {
            setReviewTarget(null)
            go(screens.myReviews)
          }}
        />
      ) : null}
    </section>
  )
}

// 리뷰 작성 모달: 별점과 리뷰 내용을 입력받음
function ReviewWriteModal({ item, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const canSubmit = rating > 0 && body.trim().length > 0

  return (
    <div className="mypage-review-overlay">
      <article className="mypage-review-modal">
        <div className="mypage-review-head">
          <img src={figmaAssets.mypageReview} alt="" />
          <h1>리뷰 작성</h1>
          <button onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="mypage-review-partner">
          <Avatar large tone="light" />
          <strong>{item.partner.replace('담당 파트너 : ', '')} 파트너님</strong>
          <span>★★★★☆ 4.5/5</span>
        </div>
        <h2>이분의 시공은 어떠셨나요?</h2>
        <div className="mypage-review-stars" aria-label="별점 선택">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              className={score <= rating ? 'active' : ''}
              onClick={() => setRating(score)}
              aria-label={`${score}점`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="mypage-review-textarea"
          placeholder="이분의 시공은 어땠는지 자세하게 알려주세요."
          value={body}
          maxLength={300}
          onChange={(event) => setBody(event.target.value)}
        />
        <p className="mypage-review-helper">{body.length}/300</p>
        <div className="mypage-review-actions">
          <PrimaryButton orange onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton onClick={onSubmit} disabled={!canSubmit}>완료</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
