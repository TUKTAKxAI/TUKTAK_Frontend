import { api } from '../../api/apiClient'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
// import { fetchAiEstimateDetail, fetchMyAiEstimates } from '../../api/mypageApi'
import { EstimateCard, SearchBar } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'
import { screenPaths } from '../../routes/customerRoutes'
import preview1 from '../../assets/figma/preview1.webp';
import preview2 from '../../assets/figma/preview2.webp';
import preview3 from '../../assets/figma/preview3.webp';
import preview4 from '../../assets/figma/preview4.webp';
import loadingSvg from '../../assets/figma/loading.svg?raw';
import confirmSvg from '../../assets/figma/confirm.svg?raw';

const previewImages = [preview1, preview2, preview3, preview4];

function formatWon(value) {
  return Number(value || 0).toLocaleString('ko-KR')
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
    <section className="service-hero flex flex-col h-full bg-[#F2F3F5]">
      <CustomerTopBar go={go} />

      <div className="flex flex-col items-center flex-1 py-0">
        <h1 className="text-2xl font-bold text-gray-900 mt-0 text-center">AI 견적 서비스</h1>
        
        <div className="w-full max-w-125 mx-auto text-left -mt-3 ml-2">
          <h2 className="text-base font-semibold text-gray-700 leading-snug">
            AI로 수리 비용 및 시간을<br />미리 예측하세요
          </h2>
          <p className="text-md font-semibold text-gray-700 mt-8 ml-3 leading-relaxed">
            수리부위 사진과 설명을 첨부하면<br />AI가 견적서를 제공합니다
          </p>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide py-8 gap-4 px-[25%] cursor-grab active:cursor-grabbing items-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {previewImages.map((img, index) => (
            <div 
              key={index} 
              className={`min-w-[85%] ml-5 transition-all duration-500 snap-center flex justify-center items-center
                ${activeIndex === index ? 'scale-100 opacity-100' : 'scale-70 opacity-40'}
              `}
            >
              <div className="w-full aspect-9/16 bg-white rounded-3xl shadow-lg border border-gray-300 overflow-hidden">
                 <img 
                   src={img} 
                   alt={`미리보기 ${index + 1}`} 
                   className="w-full h-full object-cover" 
                   draggable="false" 
                 />
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 도트 */}
        <div className="flex justify-center space-x-2 mb-6">
          {previewImages.map((_, i) => (
            <button 
              key={i} 
              onClick={() => goToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`} 
            />
          ))}
        </div>

        <div className="w-full px-6 mt-auto pb-6">
          <PrimaryButton onClick={onClick}>{buttonLabel}</PrimaryButton>
        </div>
      </div>
    </section>
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
  const [remainingCount, setRemainingCount] = useState(3);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = JSON.parse(localStorage.getItem('tuktak_ai_limit'));

    if (storedData && storedData.date === today) {
      setRemainingCount(storedData.count);
    } else {
      localStorage.setItem('tuktak_ai_limit', JSON.stringify({ date: today, count: 3 }));
      setRemainingCount(3);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitEstimate = async () => {
    if (remainingCount <= 0) return alert('오늘 견적 횟수를 모두 사용했습니다. 내일 다시 시도해주세요!');
    if (!image || !description) return alert('사진과 상세 내용을 모두 입력해주세요!');

    const formData = new FormData();
    formData.append('images', image);
    formData.append('description', description);

    try {
      
      const data = await api.post('/api/v1/ai-estimates', formData);
      
      if (data.success) {
        const newCount = remainingCount - 1;
        setRemainingCount(newCount);
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('tuktak_ai_limit', JSON.stringify({ date: today, count: newCount }));

        navigate(screenPaths[screens.estimateLoading], { 
          state: { estimateId: data.estimate_id } 
        });
      } else {
        alert('견적 요청에 실패했습니다: ' + (data.detail || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('견적 요청 실패:', error);
      alert(`백엔드 서버와 통신하는 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <section className="form-screen flex flex-col h-full bg-[#F2F3F5] pb-10">
      <CustomerTopBar go={go} />
      
      <div className="flex flex-col flex-1 px-6 pt-4">
        <button 
          className="mb-6 flex transition-transform active:scale-90" 
          onClick={() => go(screens.riskHome)}
        >
          <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
        </button>
        
        <p className="text-sm font-medium text-gray-700 text-center mb-4">
          시공하고싶은 위치의 사진을 업로드 해주세요 !
        </p>
        
        <label 
          className="w-full h-56 flex justify-center items-center cursor-pointer mb-8 relative overflow-hidden bg-white"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%236B7280' stroke-width='2' stroke-dasharray='14%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
            borderRadius: '16px'
          }}
        >
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} style={{ display: 'none' }} />
          {preview ? (
            <img src={preview} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
          ) : (
            <div 
              className="bg-white rounded-full flex justify-center items-center"
              style={{ width: '200px', height: '96px', flexShrink: 0 }}
            >
              <div className="camera-icon" />
            </div>
          )}
        </label>

        <p className="text-sm font-medium text-gray-700 text-center mb-3">
          시공에 대한 상세 내용을 적어주세요 !
        </p>
        
        <textarea 
          className="w-full h-32 px-4 pt-1 pb-4 border border-gray-400 rounded-xl text-sm placeholder:text-[11px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          placeholder="Ex) 문틀을 모던한 디자인으로 흰색으로 하고싶어요" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: 'none' }}
        />
        
        <div className="mt-10 flex flex-col items-center w-full">
          <p className="text-[13px] text-gray-500 mb-3">남은 견적받기 횟수 {remainingCount}/3</p>
          <div className="w-full max-w-sm">
            <PrimaryButton onClick={submitEstimate} disabled={remainingCount <= 0}>
              {remainingCount > 0 ? 'AI 견적 요청하기' : '오늘 횟수 소진됨'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EstimateLoadingPage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const estimateId = location.state?.estimateId;

useEffect(() => {
    if (!estimateId) {
      alert('잘못된 접근입니다.');
      go(screens.estimateHome);
      return;
    }
    
    const interval = setInterval(async () => {
      try {
        const data = await api.get(`/api/v1/ai-estimates/${estimateId}`);
        
        if (data.success && (data.estimate.estimate_status === 'COMPLETED' || data.estimate.estimate_status === 'SUCCESS')) {
          clearInterval(interval);
          
          navigate(screenPaths[screens.estimateDone], { 
            state: { resultData: data.estimate } 
          });
        }
      } catch (error) {
        console.error('상태 확인 실패:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [estimateId, navigate, go]);

  return (
    <section className="status-screen flex flex-col items-center justify-center h-full bg-[#F2F3F5] overflow-hidden">
      <div className="transform scale-[2.5] mb-16 flex justify-center">
        <Logo />
      </div>
      
      <h2 
        className="mb-5 w-full px-4 font-bold text-gray-800 text-center whitespace-nowrap tracking-tighter"
        style={{ fontSize: '24px' }}
      >
        AI 견적서 생성중 ...
      </h2>
      
      <div className="w-52 h-52 mb-8 flex justify-center items-center pointer-events-none">
        <div 
          className="w-full h-full flex justify-center items-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: loadingSvg }} 
        />
      </div>
      
      <PrimaryButton narrow orange className="relative z-10" onClick={() => go(screens.estimateStart)}>
        취소
      </PrimaryButton>
    </section>
  )
}

export function EstimateDonePage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.resultData;

  const goToOutput = () => {
    navigate(screenPaths[screens.estimateOutput], { 
      state: { resultData: resultData } 
    });
  };

  return (
    <section className="status-screen flex flex-col items-center justify-center h-full bg-[#F2F3F5] overflow-hidden">
      <div className="transform scale-[2.5] mb-16 flex justify-center">
        <Logo />
      </div>
      
      <h2 
        className="mb-5 w-full px-4 font-bold text-gray-800 text-center whitespace-nowrap tracking-tighter"
        style={{ fontSize: '24px' }}
      >
        AI 견적서가 생성 되었습니다 !
      </h2>
      
      <div className="w-48 h-48 mb-12 flex justify-center items-center pointer-events-none">
        <div 
          className="w-full h-full flex justify-center items-center transform scale-[2] [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: confirmSvg }} 
        />
      </div>

        <PrimaryButton narrow className="relative z-10" onClick={goToOutput}>
          확인하기
        </PrimaryButton>
    </section>
  )
}

export function EstimateOutputPage({ go }) {
  const location = useLocation();
  // EstimateLoadingPage 또는 다른 곳에서 state로 넘겨받은 AI 견적 데이터
  const resultData = location.state?.resultData;

  // 데이터가 없을 경우에 대한 예외 처리 (RiskOutputPage와 동일한 스타일 적용)
  if (!resultData) {
    return (
      <section className="flex flex-col h-full bg-[#F2F3F5] items-center justify-center">
        <p className="mb-4 text-gray-600">견적서 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.estimateHome)}>홈으로</PrimaryButton>
      </section>
    );
  }

  return (
    <section className="flex flex-col h-full bg-[#F2F3F5]">
      {/* 1. 상단 고정 헤더 (PDF 버튼 제거 및 Risk 스타일 적용) */}
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <button onClick={() => go(screens.estimateHome)} className="p-2 -ml-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
            <h1 className="text-[17px] font-bold text-gray-900">AI 시공 견적서</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">{resultData.created_at?.split('T')[0]}</p>
        </div>
        {/* 가운데 정렬을 맞추기 위한 투명한 빈 박스 */}
        <div className="w-10"></div> 
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        
        {/* 2. 시공명 & 예상 비용 버블 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <h2 className="text-[14px] font-semibold text-gray-500 mb-1">{resultData.repair_task_name || 'AI 시공 견적'}</h2>
            <p className="text-[22px] text-gray-900 font-bold mt-1 tracking-tight">
              예상 비용 : {formatWon(resultData.min_price)} 원 ~ {formatWon(resultData.max_price)} 원
            </p>
        </div>

        {/* 3. 소요 시간 & 심각도 정보 */}
        <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">예상 소요 시간</p>
                <strong className="text-[18px] font-bold text-gray-900">
                  {resultData.estimated_minutes_min}~{resultData.estimated_minutes_max}분
                </strong>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">문제 심각도</p>
                <strong className={`text-[18px] font-bold ${resultData.severity === 'HIGH' ? 'text-red-500' : 'text-blue-600'}`}>
                  {resultData.severity || '보통'}
                </strong>
            </div>
        </div>

        {/* 4. 시공 상세 분석, 요청 내용, AI 요약 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          
          <section className="border-b border-gray-100 pb-6">
            <h3 className="text-[16px] font-bold text-gray-800 mb-4">시공 분석 정보</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-[14px] text-gray-700">
                <span className="w-16 text-gray-400 font-medium">분류</span> 
                <span className="flex-1">{resultData.main_category} &gt; {resultData.object_label}</span>
              </li>
              <li className="flex items-start text-[14px] text-gray-700">
                <span className="w-16 text-gray-400 font-medium">증상</span> 
                <span className="flex-1 text-red-500 font-medium">{resultData.problem_label}</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">고객 요청 상세</h3>
            <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {resultData.description || '요청 내용이 없습니다.'}
            </p>
          </section>

          <section>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">AI 종합 요약</h3>
            {/* AI 요약 내용은 시각적으로 눈에 띄도록 옅은 파란색 배경을 적용했습니다 */}
            <p className="text-[14px] text-gray-600 leading-relaxed bg-blue-50 p-4 rounded-xl">
              {resultData.ai_summary}
            </p>
          </section>

        </div>
      </main>

      {/* 5. 하단 액션 버튼 */}
      <div className="px-2 pt-6 pb-0 bg-F2F3F5 border-t border-gray-200 flex space-x-5">
        <PrimaryButton ghost onClick={() => go(screens.estimateHome)} style={{ border: '1px solid #ccc', width: '180px', height: '52px', fontSize: '20px', fontWeight: 'bold' }}>확 인</PrimaryButton>
        <PrimaryButton onClick={() => go(screens.matchingEstimateSelect)} style={{ width: '180px', height: '52px', fontSize: '18px', fontWeight: 'bold' }}>매칭 시작하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MyEstimateListPage({ go, back }) {
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
            subtitle: `${formatWon(item.min_price)}원 ~ ${formatWon(item.max_price)}원`,
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
          subtitle: `예상 비용: ${formatWon(detailItem.min_price)}원 ~ ${formatWon(detailItem.max_price)}원`,
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
    <section className="subpage-screen history-page estimate-list-page">
      <div className="subpage-title-row">          
        <button 
            className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
            onClick={() => go(screens.mypage)}
          >
            <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
          </button>
        <img className="subpage-title-icon estimate-title-icon" src={figmaAssets.mypageAiEstimateTitle} alt="" />
        <h1>내 AI 견적서</h1>
      </div>
      
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
            <span>{item.date}</span>
            <small>{item.status}</small>
          </div>
          <button 
            onClick={onClose} 
            aria-label="닫기"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
            style={{ fontSize: '18px', paddingBottom: '2px' }}
          >
            ✕
          </button>
        </div>
        <div className="estimate-result-title">
          <img src={figmaAssets.mypageAiEstimateTitle} alt="" />
          <div>
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>
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
          <p>{item.details?.summary}</p>
          <div className="document-art estimate compact" />
        </div>
        <div className="estimate-result-actions">
          <PrimaryButton ghost onClick={onClose}>확인</PrimaryButton>
          <PrimaryButton onClick={onStartMatching}>매칭 시작하기</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
