import { api } from '../../api/apiClient'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { EstimateCard, SearchBar } from '../../components/customer/Cards'
import { CustomerPage } from './CustomerPageShared'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { PrimaryButton } from '../../components/customer/FormControls'
import { FaCloudUploadAlt, FaChevronLeft, FaTimes } from 'react-icons/fa'
import { screens } from '../../data/customerData'
import { screenPaths } from '../../routes/customerRoutes'
import preview1 from '../../assets/figma/preview1.webp';
import preview2 from '../../assets/figma/preview2.webp';
import preview3 from '../../assets/figma/preview3.webp';
import preview4 from '../../assets/figma/preview4.webp';
import loadingCarbonSvg from '../../assets/figma/loading-carbon.svg?raw';
import confirmCarbonSvg from '../../assets/figma/confirm-carbon.svg?raw';

const previewImages = [preview1, preview2, preview3, preview4];

function formatWon(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}

function getInitialRemainingCount() {
  const today = new Date().toISOString().split('T')[0]
  const storedData = JSON.parse(localStorage.getItem('tuktak_ai_limit'))

  if (storedData && storedData.date === today) {
    return storedData.count
  }

  localStorage.setItem('tuktak_ai_limit', JSON.stringify({ date: today, count: 3 }))
  return 3
}

function normalizeMissingInfoLabel(item) {
  const labels = {
    repair_object: '수리 대상',
    repair_symptom: '고장 증상',
    object_label: '수리 대상',
    problem_label: '고장 증상',
    main_category: '서비스 분야',
    brand_model: '브랜드/모델명',
    model_name: '모델명',
  };

  return labels[item] || item;
}

function getMissingInfoPlaceholder(item) {
  const label = normalizeMissingInfoLabel(item);
  const placeholders = {
    '브랜드/모델명': '예) 삼성 무풍 에어컨, LG 트롬 세탁기 F21VDD',
    '수리 대상': '예) 거실 벽걸이 에어컨, 주방 싱크대, 욕실 변기',
    '고장 증상': '예) 찬바람이 안 나오고 실외기 소리가 커요',
    '서비스 분야': '예) 에어컨 수리, 배관 누수, 전기/조명',
    '모델명': '예) AF17B7538WZ, F21VDD, WF21T6500KV',
  };

  return placeholders[label] || `예) ${label} 정보를 구체적으로 입력해 주세요`;
}

function ServiceHero({ onClick, buttonLabel, go }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % previewImages.length;

      if (scrollRef.current) {
        const cardWidth = scrollRef.current.offsetWidth * 0.5;
        scrollRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        });
        setActiveIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const goToIndex = (index) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.5;
      scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.5;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    }
  };

  return (
    <CustomerPage go={go} className="cds--white">
      <div className="estimate-hero">
      <div className="estimate-hero-body">
        <div className="estimate-hero-head">
          <span className="estimate-hero-eyebrow">AI 견적 서비스</span>
          <h1 className="estimate-hero-title">
            AI로 수리 비용 및 시간을<br />미리 예측하세요
          </h1>
          <p className="estimate-hero-desc">
            수리부위 사진과 설명을 첨부하면<br />AI가 견적서를 제공합니다
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="estimate-hero-carousel"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {previewImages.map((img, index) => (
            <div
              key={index}
              className={`estimate-hero-slide ${activeIndex === index ? 'is-active' : ''}`}
            >
              <div className="estimate-hero-frame">
                <img
                  src={img}
                  alt={`미리보기 ${index + 1}`}
                  className="estimate-hero-frame-img"
                  draggable="false"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 도트 */}
        <div className="estimate-hero-dots">
          {previewImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              aria-label={`${i + 1}번째 미리보기`}
              className={`estimate-hero-dot ${activeIndex === i ? 'is-active' : ''}`}
            />
          ))}
        </div>

        <div className="estimate-hero-actions">
          <PrimaryButton onClick={onClick}>{buttonLabel}</PrimaryButton>
        </div>
      </div>
      </div>
    </CustomerPage>
  )
}

export function EstimateHomePage({ go }) {
  return (
    <ServiceHero
      onClick={() => go(screens.estimateStart)}
      buttonLabel="AI 견적 받기"
      go={go}
    />
  )
}


export function EstimateStartPage({ go }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [remainingCount] = useState(getInitialRemainingCount);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitEstimate = () => {
    if (remainingCount <= 0) return alert('오늘 견적 횟수를 모두 사용했습니다. 내일 다시 시도해주세요!');
    if (!image || !description) return alert('사진과 상세 내용을 모두 입력해주세요!');

    // 요청하기를 누르는 즉시 로딩 화면으로 이동하고, 실제 API 호출은 로딩 화면에서 처리함
    navigate(screenPaths[screens.estimateLoading], {
      state: { image, description }
    });
  };

  return (
    <CustomerPage go={go} back={() => go(screens.estimateHome)} className="cds--white">
      <div className="estimate-start">
        <div className="estimate-start-field">
          <span className="estimate-start-label">01. 사진 업로드</span>
          <p className="estimate-start-help">시공하고싶은 위치의 사진을 업로드 해주세요</p>

          <label className="estimate-start-upload">
            <input type="file" accept="image/*" className="estimate-start-upload-input" onChange={handleImageChange} />
            {preview ? (
              <img src={preview} alt="미리보기" className="estimate-start-upload-preview" />
            ) : (
              <span className="estimate-start-upload-placeholder">
                <FaCloudUploadAlt aria-hidden="true" />
                <strong>사진을 선택해주세요</strong>
                <small>수리할 곳이 잘 보이는 사진이면 좋아요</small>
              </span>
            )}
          </label>
        </div>

        <div className="estimate-start-field">
          <span className="estimate-start-label">02. 상세 내용</span>
          <p className="estimate-start-help">시공에 대한 상세 내용을 적어주세요</p>

          <textarea
            className="estimate-start-textarea"
            placeholder="Ex) 문틀을 모던한 디자인으로 흰색으로 &#13;&#10;하고싶어요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="estimate-start-actions">
          <p className="estimate-start-count">남은 견적받기 횟수 {remainingCount}/3</p>
          <PrimaryButton onClick={submitEstimate} disabled={remainingCount <= 0}>
            {remainingCount > 0 ? 'AI 견적 요청하기' : '오늘 횟수 소진됨'}
          </PrimaryButton>
        </div>
      </div>
    </CustomerPage>
  )
}

export function EstimateLoadingPage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { image, description } = location.state || {};

  useEffect(() => {
    if (!image || !description) {
      alert('잘못된 접근입니다.');
      go(screens.estimateHome);
      return;
    }

    // AbortController로 견적 생성 요청 자체를 취소해서, 개발 모드의 StrictMode
    // 이중 마운트나 리렌더로 effect가 다시 실행되더라도 견적서가 중복 생성되지 않게 함.
    const controller = new AbortController();
    let pollTimer;

    // 로딩 화면에 진입하자마자 실제 견적 생성 요청을 보내고, 완료될 때까지 상태를 폴링함
    const createEstimate = async () => {
      const formData = new FormData();
      formData.append('images', image);
      formData.append('description', description);

      try {
        const data = await api.post('/api/v1/ai-estimates', formData, { signal: controller.signal });

        if (data.response_status === 'needs_more_info' || data.estimate_status === 'NEEDS_MORE_INFO') {
          navigate(screenPaths[screens.estimateMoreInfo], {
            state: {
              image,
              description,
              estimateId: data.estimate_id,
              missingInfo: data.missing_info || [],
              message: data.message,
            }
          });
          return;
        }

        if (data.response_status && data.response_status !== 'completed') {
          alert(data.message || 'AI 견적 요청을 처리할 수 없습니다.');
          go(screens.estimateStart);
          return;
        }

        if (!data.success) {
          alert('견적 요청에 실패했습니다: ' + (data.detail || '알 수 없는 오류'));
          go(screens.estimateStart);
          return;
        }

        const newCount = getInitialRemainingCount() - 1;
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('tuktak_ai_limit', JSON.stringify({ date: today, count: newCount }));

        pollTimer = setInterval(async () => {
          try {
            const statusData = await api.get(`/api/v1/ai-estimates/${data.estimate_id}`, { signal: controller.signal });

            if (statusData.success && (statusData.estimate.estimate_status === 'COMPLETED' || statusData.estimate.estimate_status === 'SUCCESS')) {
              clearInterval(pollTimer);

              navigate(screenPaths[screens.estimateDone], {
                state: { resultData: statusData.estimate }
              });
            }
          } catch (error) {
            if (error.code === 'ERR_CANCELED') return;
            console.error('상태 확인 실패:', error);
          }
        }, 3000);
      } catch (error) {
        if (error.code === 'ERR_CANCELED') return;
        console.error('견적 요청 실패:', error);
        alert(`백엔드 서버와 통신하는 중 오류가 발생했습니다: ${error.message}`);
        go(screens.estimateStart);
      }
    };

    createEstimate();

    return () => {
      controller.abort();
      clearInterval(pollTimer);
    };
    // go/navigate는 이 effect가 다시 실행되어야 할 트리거가 아니라(둘 다 렌더마다
    // 새로 생성될 수 있는 콜백), image/description만 실제 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, description]);

  return (
    <section className="estimate-loading">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
      <h2 className="estimate-loading-title">AI 견적서 생성중...</h2>
      <p className="estimate-loading-desc">사진을 분석해서 예상 비용과 시간을 <br />계산하고 있어요</p>
      <button type="button" className="estimate-loading-cancel" onClick={() => go(screens.estimateStart)}>
        취소
      </button>
    </section>
  )
}

export function EstimateMoreInfoPage({ go }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { image, description, missingInfo = [], message } = location.state || {};
  const [answers, setAnswers] = useState(() =>
    missingInfo.reduce((acc, item) => ({ ...acc, [item]: '' }), {})
  );

  const hasRequiredState = Boolean(image && description && missingInfo.length);
  const isComplete = missingInfo.every((item) => answers[item]?.trim());

  const updateAnswer = (item, value) => {
    setAnswers((prev) => ({ ...prev, [item]: value }));
  };

  const submitMoreInfo = () => {
    if (!isComplete) {
      alert('부족한 정보를 모두 입력해 주세요.');
      return;
    }

    const additionalDescription = missingInfo
      .map((item) => `${normalizeMissingInfoLabel(item)}: ${answers[item].trim()}`)
      .join('\n');

    navigate(screenPaths[screens.estimateLoading], {
      state: {
        image,
        description: `${description}\n\n추가 정보:\n${additionalDescription}`,
      }
    });
  };

  if (!hasRequiredState) {
    return (
      <CustomerPage go={go} back={() => go(screens.estimateStart)} className="cds--white">
        <section className="estimate-more-info-empty">
          <h1>추가 정보 요청을 불러오지 못했어요</h1>
          <p>견적 요청 화면에서 다시 사진과 설명을 입력해 주세요.</p>
          <PrimaryButton narrow onClick={() => go(screens.estimateStart)}>다시 입력하기</PrimaryButton>
        </section>
      </CustomerPage>
    );
  }

  return (
    <CustomerPage go={go} back={() => go(screens.estimateStart)} className="cds--white">
      <section className="estimate-more-info">
        <header className="estimate-more-info-header">
          <span className="estimate-start-label">추가 정보 입력</span>
          <h1>견적을 위해 정보가 조금 더 필요해요</h1>
          <p>{message || '아래 항목을 알려주시면 AI 견적 생성을 이어서 진행할게요.'}</p>
        </header>

        <div className="estimate-missing-chip-list" aria-label="부족한 정보">
          {missingInfo.map((item) => (
            <span key={item} className="estimate-missing-chip">{normalizeMissingInfoLabel(item)}</span>
          ))}
        </div>

        <div className="estimate-more-info-thread">
          <div className="estimate-chat-bubble is-assistant">
            <strong>AI 견적 도우미</strong>
            <p>입력해 주신 내용은 확인했어요. 정확한 견적을 위해 아래 정보를 추가로 알려주세요.</p>
          </div>

          {missingInfo.map((item) => (
            <div key={item} className="estimate-more-info-field">
              <div className="estimate-chat-bubble is-assistant">
                <p>{normalizeMissingInfoLabel(item)} 정보를 입력해 주세요.</p>
              </div>
              <label className="estimate-more-info-answer">
                <span>{normalizeMissingInfoLabel(item)}</span>
                <textarea
                  className="estimate-more-info-textarea"
                  value={answers[item] || ''}
                  onChange={(event) => updateAnswer(item, event.target.value)}
                  placeholder={getMissingInfoPlaceholder(item)}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="estimate-more-info-actions">
          <button type="button" className="estimate-output-ghost-button" onClick={() => go(screens.estimateStart)}>
            처음부터 다시 입력
          </button>
          <PrimaryButton onClick={submitMoreInfo} disabled={!isComplete}>추가 정보 보내기</PrimaryButton>
        </div>
      </section>
    </CustomerPage>
  );
}

export function EstimateDonePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.resultData;

  const goToOutput = () => {
    navigate(screenPaths[screens.estimateOutput], {
      state: { resultData: resultData }
    });
  };

  return (
    <section className="estimate-done">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-done-icon" dangerouslySetInnerHTML={{ __html: confirmCarbonSvg }} />
      <h2 className="estimate-done-title">AI 견적서가 생성됐어요</h2>
      <p className="estimate-done-desc">예상 비용과 소요 시간을 확인해보세요</p>
      <div className="estimate-done-actions">
        <PrimaryButton narrow onClick={goToOutput}>확인하기</PrimaryButton>
      </div>
    </section>
  )
}

export function EstimateOutputPage({ go }) {
  const location = useLocation();
  // EstimateLoadingPage 또는 다른 곳에서 state로 넘겨받은 AI 견적 데이터
  // EstimateLoadingPage 또는 다른 곳에서 state로 넘겨받은 AI 견적 데이터
  const resultData = location.state?.resultData;

  // 데이터가 없을 경우에 대한 예외 처리
  if (!resultData) {
    return (
      <section className="estimate-output-empty">
        <p>견적서 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.estimateHome)}>홈으로</PrimaryButton>
      </section>
    );
  }

  return (
    <section className="estimate-output">
      <header className="estimate-output-header">
        <button type="button" className="estimate-output-back" onClick={() => go(screens.estimateHome)} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <div className="estimate-output-header-title">
          <h1>AI 시공 견적서</h1>
          <p>{resultData.created_at?.split('T')[0]}</p>
        </div>
        <div className="estimate-output-header-spacer" aria-hidden="true" />
      </header>

      <main className="estimate-output-body">
        {/* 시공명 & 예상 비용 */}
        <div className="estimate-output-card estimate-output-summary">
          <h2>{resultData.repair_task_name || 'AI 시공 견적'}</h2>
          <p className="estimate-output-price">
            예상 비용 : {formatWon(resultData.min_price)}원 ~ {formatWon(resultData.max_price)}원
          </p>
        </div>

        {/* 소요 시간 & 심각도 */}
        <div className="estimate-output-stat-row">
          <div className="estimate-output-stat">
            <span>예상 소요 시간</span>
            <strong>{resultData.estimated_minutes_min}~{resultData.estimated_minutes_max}분</strong>
          </div>
          <div className="estimate-output-stat">
            <span>문제 심각도</span>
            <strong className={resultData.severity === 'HIGH' ? 'is-high' : ''}>
              {resultData.severity || '보통'}
            </strong>
          </div>
        </div>

        {/* 시공 상세 분석, 요청 내용, AI 요약 */}
        <div className="estimate-output-card">
          <section className="estimate-output-section">
            <h3>시공 분석 정보</h3>
            <ul className="estimate-output-list">
              <li>
                <span>분류</span>
                <span>{resultData.main_category} &gt; {resultData.object_label}</span>
              </li>
              <li>
                <span>증상</span>
                <span>{resultData.problem_label}</span>
              </li>
            </ul>
          </section>

          <section className="estimate-output-section">
            <h3>고객 요청 상세</h3>
            <p className="estimate-output-block">{resultData.description || '요청 내용이 없습니다.'}</p>
          </section>

          <section className="estimate-output-section estimate-output-section--last">
            <h3>AI 종합 요약</h3>
            <p className="estimate-output-block estimate-output-block--highlight">{resultData.ai_summary}</p>
          </section>
        </div>
      </main>

      <div className="estimate-output-actions">
        <button type="button" className="estimate-output-ghost-button" onClick={() => go(screens.estimateHome)}>확인</button>
        <PrimaryButton onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MyEstimateListPage({ go }) {
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [estimateList, setEstimateList] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('latest');

  // ==========================================
  // 1. 견적서 목록 가져오기 (apiClient 직접 사용)
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchEstimates = async () => {
      try {
        // 💡 백엔드 엔드포인트에서 데이터 호출
        const data = await api.get('/api/v1/users/me/ai-estimates/');
        
        if (isMounted && data && data.items) {
          // 💡 화면 컴포넌트(<EstimateCard>)가 에러를 뿜지 않도록 프론트엔드 양식에 맞게 매핑(Mapping)합니다.
          const mappedList = data.items.map((item) => ({
            id: item.estimate_id,
            date: item.created_at ? item.created_at.split('T')[0] : '날짜 없음',
            status: item.estimate_status === 'COMPLETED' ? '완료' : '진행중',
            title: item.repair_task_name || 'AI 시공 견적',
            subtitle: `${parseInt(item.min_price?.toLocaleString()) || 0}원 ~ ${parseInt(item.max_price?.toLocaleString()) || 0}원`,
            price: item.min_price || 0, // 정렬용
            details: {
              location: item.main_category ? `${item.main_category} > ${item.object_label || ''}` : '미정',
              request: item.description || '요청 내용이 없습니다.',
              estimatedTime: `${item.estimated_minutes_min || 0}~${item.estimated_minutes_max || 0}분`,
              summary: item.ai_summary || ''
            }
          }));
          
          setEstimateList(mappedList);
        }
      } catch (error) {
        console.error('견적서 목록 불러오기 실패:', error);
      }
    };

    fetchEstimates();

    return () => {
      isMounted = false;
    };
  }, []);

  // 검색 및 정렬 로직 (기존과 동일)
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEstimateCards = estimateList
    .filter((item) => (
      `${item.date} ${item.status} ${item.title} ${item.subtitle} ${item.details?.location ?? ''} ${item.details?.request ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery)
    ))
    .sort((a, b) => {
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sort === 'price') return b.price - a.price;
      return new Date(b.date) - new Date(a.date);
    });

  // ==========================================
  // 2. 견적서 상세 정보 모달 띄우기 (apiClient 직접 사용)
  // ==========================================
  const handleCardClick = async (id) => {
    try {
      // 💡 특정 id로 상세 데이터 요청
      const data = await api.get(`/api/v1/ai-estimates/${id}`);
      
      if (data && data.estimate) {
        const detailItem = data.estimate;
        
        // 모달창에 띄우기 위해 똑같이 구조를 맞춰서 상태에 저장합니다.
        setSelectedEstimate({
          id: detailItem.estimate_id,
          date: detailItem.created_at ? detailItem.created_at.split('T')[0] : '날짜 없음',
          status: detailItem.estimate_status === 'COMPLETED' ? '완료' : '진행중',
          title: detailItem.repair_task_name || 'AI 시공 견적',
          subtitle: `예상 비용: ${parseInt(detailItem.min_price?.toLocaleString()) || 0}원 ~ ${parseInt(detailItem.max_price?.toLocaleString()) || 0}원`,
          details: {
            location: detailItem.main_category ? `${detailItem.main_category} > ${detailItem.object_label || ''}` : '미정',
            request: detailItem.description || '요청 내용이 없습니다.',
            estimatedTime: `${detailItem.estimated_minutes_min || 0}~${detailItem.estimated_minutes_max || 0}분`,
            summary: detailItem.ai_summary || ''
          }
        });
      }
    } catch (error) {
      console.error('상세 정보 불러오기 실패:', error);
      alert('상세 정보를 불러오지 못했습니다.');
    }
  };

  return (
    <section className="subpage-screen history-page estimate-list-page cds--white">
      <header className="mypage-list-header">
        <button type="button" className="mypage-list-back" onClick={() => go(screens.mypage)} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <h1>내 AI 견적서</h1>
        <span className="mypage-list-header-spacer" aria-hidden="true" />
      </header>

      <div className="history-search-row estimate-search-row">
        <SearchBar value={query} onChange={setQuery} />
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="AI 견적서 정렬">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="price">가격순</option>
        </select>
      </div>
      
      
      <div className="history-scroll-area">
        <div className="list-stack">
          {filteredEstimateCards.map((item) => (
            <EstimateCard
              key={item.id}
              item={item}
              onClick={() => handleCardClick(item.id)} // 💡 여기서 방금 만든 상세 조회 함수를 부릅니다!
            />
          ))}
          {filteredEstimateCards.length === 0 ? <p className="empty-list-message">검색 결과가 없습니다.</p> : null}
        </div>
      </div>
      
      
      {selectedEstimate ? (
        <EstimateResultModal
          item={selectedEstimate}
          onClose={() => setSelectedEstimate(null)}
          onStartMatching={() => go(screens.matchingEstimateSelect)}
        />
      ) : null}
    </section>
  )
}
function EstimateResultModal({ item, onClose, onStartMatching }) {
  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal">
        <div className="estimate-result-head">
          <div>
            <span>AI 견적서</span>
            <small>{item.date} · {item.status}</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <FaTimes />
          </button>
        </div>
        <div className="estimate-result-title">
          <h2>{item.title}</h2>
          <p>{item.subtitle}</p>
        </div>
        <div className="estimate-result-body">
          <section>
            <span>시공 위치</span>
            <strong>{item.details?.location}</strong>
          </section>
          <section>
            <span>요청 내용</span>
            <strong>{item.details?.request}</strong>
          </section>
          <section>
            <span>예상 시간</span>
            <strong>{item.details?.estimatedTime}</strong>
          </section>
          {item.details?.summary ? <p>{item.details.summary}</p> : null}
        </div>
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>확인</PrimaryButton>
          <PrimaryButton onClick={onStartMatching}>매칭 시작하기</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
