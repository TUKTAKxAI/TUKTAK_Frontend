import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FaChevronLeft,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaMapMarkerAlt,
  FaRegStar,
  FaShieldAlt,
  FaTimes,
  FaUserCircle,
} from 'react-icons/fa'
import { fetchHomeAddress, saveHomeAddress } from '../../api/homeApi'
import { fetchMatchingHistory, fetchMyProfile, updateMyProfile } from '../../api/mypageApi'
import { HistoryCard, InfoRows, MenuTile, ReviewCard, SearchBar } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Avatar, PrimaryButton } from '../../components/customer/FormControls'
import { JusoSearchModal } from '../../components/customer/JusoSearchModal'
import { reviewCards, screens } from '../../data/customerData'
import { useAuth } from '../../context/authContext'
import { formatPhoneNumber } from '../../utils/phone'

// 마이페이지 메인 홈: 각 마이페이지 메뉴로 이동하는 화면
export function MyPage({ go }) {
  const [profile, setProfile] = useState({
    nickname: '사용자',
    name: '사용자',
    email: '',
    userId: '',
  })

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchMyProfile(), fetchHomeAddress()]).then(([profileData, addressData]) => {
      if (isMounted) {
        const displayAddress = [addressData.detail, addressData.title]
          .filter(Boolean)
          .filter((item, index, items) => items.indexOf(item) === index)
          .join(' ')

        setProfile((current) => ({
          ...current,
          ...profileData,
          address: displayAddress || current.address,
        }))
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const displayName = profile.nickname || profile.name || '사용자'
  const accountLabel = profile.email || profile.userId || '로그인 계정'

  return (
    <section className="subpage-screen mypage-screen cds--white">
      <header className="mypage-list-header">
        <span className="mypage-list-header-spacer" aria-hidden="true" />
        <h1>마이페이지</h1>
        <button type="button" className="mypage-list-back" onClick={() => go(screens.home)} aria-label="닫기">
          <FaTimes />
        </button>
      </header>
      <div className="mypage-hero-card">
        <div className="mypage-hero-avatar">
          <img className="profile-photo-icon" src={figmaAssets.mypageProfilePhoto} alt="" />
        </div>
        <div>
          <p className="mypage-hero-eyebrow">MY TUKTAK</p>
          <h2>{displayName}님, 안녕하세요!</h2>
          <p>{accountLabel}</p>
        </div>
      </div>
      <nav className="mypage-menu-list">
        <MenuTile Icon={FaClipboardList} label="매칭 히스토리" onClick={() => go(screens.matchHistory)} />
        <MenuTile Icon={FaFileInvoiceDollar} label="내 AI 견적서" onClick={() => go(screens.myEstimateList)} />
        <MenuTile Icon={FaShieldAlt} label="내 리스크리포트" onClick={() => go(screens.myRiskList)} />
        <MenuTile Icon={FaRegStar} label="내가 쓴 리뷰" onClick={() => go(screens.myReviews)} />
        <MenuTile Icon={FaUserCircle} label="내 정보" onClick={() => go(screens.profile)} />
      </nav>
    </section>
  )
}

// 내가 쓴 리뷰: 검색, 정렬, 삭제 기능을 담당
export function MyReviewsPage({ back }) {
  const [myReviews, setMyReviews] = useState(reviewCards)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('latest')
  const [reviewIdToDelete, setReviewIdToDelete] = useState(null)
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
    <section className="subpage-screen history-page reviews-list-page cds--white">
      <header className="mypage-list-header">
        <button type="button" className="mypage-list-back" onClick={back} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <h1>내가 쓴 리뷰</h1>
        <span className="mypage-list-header-spacer" aria-hidden="true" />
      </header>
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
              onDelete={(reviewId) => setReviewIdToDelete(reviewId)}
            />
          ))}
          {filteredReviews.length === 0 ? <p className="empty-list-message">검색 결과가 없습니다.</p> : null}
        </div>
      </div>
      {reviewIdToDelete ? (
        <DeleteReviewConfirmModal
          onClose={() => setReviewIdToDelete(null)}
          onConfirm={() => {
            setMyReviews((reviews) => reviews.filter((item) => item.id !== reviewIdToDelete))
            setReviewIdToDelete(null)
          }}
        />
      ) : null}
    </section>
  )
}

// 리뷰 삭제 확인 모달: 로그아웃/회원탈퇴 확인 모달(ProfileConfirmModal)과 동일한
// Carbon 모달 셸(.estimate-result-*)을 재사용해 파괴적 액션에 확인 절차를 둔다.
function DeleteReviewConfirmModal({ onClose, onConfirm }) {
  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>리뷰 삭제</span>
            <small>이 리뷰를 삭제할까요?</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기"><FaTimes /></button>
        </div>
        <p className="mypage-readonly-note">삭제한 리뷰는 다시 되돌릴 수 없습니다.</p>
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton orange onClick={onConfirm}>삭제하기</PrimaryButton>
        </div>
      </article>
    </div>
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

const initialProfile = {
  nickname: '사용자',
  name: '사용자',
  email: '',
  phone: '',
  social: '연동 정보 없음',
  address: '주소를 등록해 주세요',
  payment: '결제 수단을 등록해 주세요',
}

// 내 정보: 프로필 조회, 항목 수정, 로그아웃/회원탈퇴 모달을 담당
export function ProfilePage({ go, back }) {
  const { logout } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [editingField, setEditingField] = useState(null)
  const [draftValue, setDraftValue] = useState('')
  const [draftAddress, setDraftAddress] = useState(null)
  const [draftAddressDetail, setDraftAddressDetail] = useState('')
  const [addressError, setAddressError] = useState('')
  const [showAddressSearch, setShowAddressSearch] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchMyProfile(), fetchHomeAddress()]).then(([profileData, addressData]) => {
      if (!isMounted) return

      const displayAddress = [addressData.detail, addressData.title]
        .filter(Boolean)
        .filter((item, index, items) => items.indexOf(item) === index)
        .join(' ')

      setProfile((current) => ({
        ...current,
        ...profileData,
        address: displayAddress || current.address,
      }))
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
    setDraftAddress(null)
    setDraftAddressDetail('')
    setAddressError('')
  }

  const closeEditModal = () => {
    setEditingField(null)
    setDraftAddress(null)
    setDraftAddressDetail('')
    setAddressError('')
    setShowAddressSearch(false)
  }

  // 수정 모달 저장: 주소와 프로필 항목 모두 PATCH /users/me 호출
  const saveProfileField = async () => {
    if (!editingField?.editable) {
      setEditingField(null)
      return
    }

    if (editingField.key === 'address') {
      if (!draftAddress && !draftValue.trim()) {
        setAddressError('주소를 먼저 검색해주세요.')
        return
      }

      let savedAddress

      try {
        savedAddress = await saveHomeAddress({
          detail: draftAddress?.detail ?? draftValue,
          title: draftAddressDetail.trim() || draftAddress?.title || draftValue,
          zipNo: draftAddress?.zipNo ?? '',
          regionCodeId: draftAddress?.regionCodeId ?? null,
        })
      } catch {
        setAddressError('주소 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      const displayAddress = [
        savedAddress.detail || draftAddress?.detail || draftValue,
        draftAddressDetail.trim(),
      ].filter(Boolean).join(' ')

      setProfile((current) => ({
        ...current,
        address: displayAddress || savedAddress.title || draftValue,
      }))
      setDraftAddress(null)
      setDraftAddressDetail('')
      setAddressError('')
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
      await logout().catch(() => undefined)
      go(screens.login)
    }
  }

  return (
    <section className="subpage-screen profile-screen cds--white">
      <header className="mypage-list-header">
        <button type="button" className="mypage-list-back" onClick={back} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <h1>내 정보</h1>
        <span className="mypage-list-header-spacer" aria-hidden="true" />
      </header>
      <div className="mypage-profile-hero">
        <div className="mypage-hero-avatar">
          <img className="profile-photo-icon large" src={figmaAssets.mypageProfilePhoto} alt="" />
        </div>
        <h2>{profile.name} 님</h2>
      </div>
      <InfoRows rows={profileRowsForView} onSelect={openEditModal} />
      <div className="profile-action-row">
        <button type="button" className="is-danger" onClick={() => setConfirmAction('withdraw')}>회원탈퇴</button>
        <span>|</span>
        <button type="button" onClick={() => setConfirmAction('logout')}>로그아웃</button>
      </div>
      {editingField ? (
        <ProfileEditModal
          field={editingField}
          value={draftValue}
          address={draftAddress}
          addressDetail={draftAddressDetail}
          addressError={addressError}
          onChange={setDraftValue}
          onAddressDetailChange={setDraftAddressDetail}
          onAddressSearch={() => setShowAddressSearch(true)}
          onClose={closeEditModal}
          onSave={saveProfileField}
        />
      ) : null}
      {showAddressSearch ? (
        <JusoSearchModal
          onClose={() => setShowAddressSearch(false)}
          onSelect={(item) => {
            const nextAddress = {
              title: item.roadAddrPart1 || item.roadAddr,
              detail: item.roadAddr,
              zipNo: item.zipNo || '',
              regionCodeId: item.admCd || null,
            }

            setDraftAddress(nextAddress)
            setDraftValue(nextAddress.detail)
            setDraftAddressDetail('')
            setAddressError('')
            setShowAddressSearch(false)
          }}
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
function ProfileEditModal({
  field,
  value,
  address,
  addressDetail,
  addressError,
  onChange,
  onAddressDetailChange,
  onAddressSearch,
  onClose,
  onSave,
}) {
  const isAddressField = field.key === 'address'

  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>내 정보 수정</span>
            <small>{field.label}</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기"><FaTimes /></button>
        </div>
        {field.editable && isAddressField ? (
          <div className="mypage-address-search">
            <span>{field.label}</span>
            <button className="mypage-address-trigger" type="button" onClick={onAddressSearch}>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>도로명, 지번 또는 건물명으로 검색</span>
            </button>
            {addressError ? <p className="mypage-address-error">{addressError}</p> : null}
            <div className="mypage-address-card">
              <em>{address ? '선택된 주소' : '현재 주소'}</em>
              <h3>{address?.title || value || '주소를 검색해 주세요'}</h3>
              <p>{address?.detail || value || '주소찾기를 눌러 도로명주소를 선택해 주세요.'}</p>
            </div>
            {address ? (
              <label className="mypage-field">
                <span>상세 주소</span>
                <input
                  type="text"
                  placeholder="상세 주소 입력 (ex : 202동 301호)"
                  value={addressDetail}
                  onChange={(event) => onAddressDetailChange(event.target.value)}
                />
              </label>
            ) : null}
          </div>
        ) : field.editable ? (
          <label className="mypage-field">
            <span>{field.label}</span>
            <input
              type={field.type ?? 'text'}
              inputMode={field.type === 'tel' ? 'numeric' : undefined}
              maxLength={field.type === 'tel' ? 13 : undefined}
              value={value}
              onChange={(event) => onChange(field.type === 'tel' ? formatPhoneNumber(event.target.value) : event.target.value)}
            />
          </label>
        ) : (
          <p className="mypage-readonly-note">{field.helper}</p>
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
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>{isWithdraw ? '회원탈퇴' : '로그아웃'}</span>
            <small>{isWithdraw ? '정말 회원탈퇴를 진행할까요?' : '현재 계정에서 로그아웃할까요?'}</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기"><FaTimes /></button>
        </div>
        <p className="mypage-readonly-note">
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
  const location = useLocation()
  const [reviewTarget, setReviewTarget] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(location.state?.statusFilter || 'latest')

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
    <section className="subpage-screen history-page cds--white">
      <header className="mypage-list-header">
        <button type="button" className="mypage-list-back" onClick={back} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <h1>매칭 히스토리</h1>
        <span className="mypage-list-header-spacer" aria-hidden="true" />
      </header>
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
              <span className="history-empty-state-icon" aria-hidden="true"><FaClipboardList /></span>
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
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>리뷰 작성</span>
            <small>이분의 시공은 어떠셨나요?</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기"><FaTimes /></button>
        </div>
        <div className="mypage-review-partner">
          <Avatar large tone="light" />
          <div>
            <strong>{item.partner.replace('담당 파트너 : ', '')} 파트너님</strong>
            <span>★★★★☆ 4.5/5</span>
          </div>
        </div>
        <div className="mypage-review-stars" aria-label="별점 선택">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
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
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>취소</PrimaryButton>
          <PrimaryButton onClick={onSubmit} disabled={!canSubmit}>완료</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
