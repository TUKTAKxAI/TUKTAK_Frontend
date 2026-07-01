import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { EstimateCard, SearchBar } from '../../components/customer/Cards'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { estimateCards, screens } from '../../data/customerData'
import { screenPaths } from '../../routes/customerRoutes'
import { figmaAssets } from '../../components/customer/figmaAssets'
import preview1 from '../../assets/figma/preview1.webp';
import preview2 from '../../assets/figma/preview2.webp';
import preview3 from '../../assets/figma/preview3.webp';
import preview4 from '../../assets/figma/preview4.webp';
import loadingSvg from '../../assets/figma/loading.svg?raw';
import confirmSvg from '../../assets/figma/confirm.svg?raw';

const previewImages = [preview1, preview2, preview3, preview4];

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

      <div className="flex flex-col items-center flex-1 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mt-4 text-center">AI 견적 서비스</h1>
        
        <div className="w-full max-w-125 mx-auto text-left mt-0 ml-2">
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
      const token = localStorage.getItem('tuktak_access_token');
      const response = await fetch('/api/v1/ai-estimates', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
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
      alert('백엔드 서버와 통신하는 중 오류가 발생했습니다. 서버가 켜져 있는지 확인해 주세요.');
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

    const token = localStorage.getItem('tuktak_access_token');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/ai-estimates/${estimateId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
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
        AI 견적서를 생성중 입니다 ...
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
  const resultData = location.state?.resultData;

  if (!resultData) {
    return (
      <section className="document-screen">
        <p style={{ textAlign: 'center', marginTop: '50px' }}>견적서 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.estimateHome)}>홈으로</PrimaryButton>
      </section>
    );
  }

  return (
    <section className="document-screen flex flex-col flex-1 p-6 bg-[#F2F3F5] h-full">
      <article className="document-card border border-gray-400 rounded-2xl bg-white flex-1 p-6 flex flex-col relative shadow-sm h-full">
        <div className="document-head flex justify-between items-start border-b pb-4">
          <div>
            <span className="text-sm text-gray-400">{resultData.created_at?.split('T')[0]}</span>
          </div>
          
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold">{resultData.repair_task_name} 시공 견적서</h2>
            <p className="text-gray-500 mt-1">예상 비용 : {Number(resultData.min_price).toLocaleString()}원</p>
          </div>
          
          <div 
            className="flex flex-col items-center text-blue-600 cursor-pointer hover:text-blue-800 transition" 
            onClick={() => {
              if (resultData.pdf_url) {
                window.open(resultData.pdf_url, '_blank');
              } else {
                alert('생성된 PDF 파일 경로가 존재하지 않습니다.');
              }
            }}
            title="PDF 새 탭에서 열기"
          >
            <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded-md font-bold text-xs">PDF</div>
            <span className="text-[10px] font-bold mt-1">저장</span>
          </div>
        </div>

        <div className="document-body flex-1 mt-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-3">견적서 상세 내용</h3>
          
          {resultData.pdf_url ? (
            <div className="flex-1 w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-300">
              <iframe 
                src={`${resultData.pdf_url}#toolbar=0`} 
                className="w-full h-full"
                title="견적서 PDF 뷰어"
              />
            </div>
          ) : (
            <div className="flex-1 w-full bg-yellow-50 p-6 rounded-xl border border-gray-200 overflow-y-auto whitespace-pre-line text-sm text-gray-700">
              {resultData.ai_summary}
            </div>
          )}
        </div>
      </article>

      <div className="flex space-x-4 mt-6">
        <PrimaryButton ghost onClick={() => go(screens.estimateHome)}>확인</PrimaryButton>
        <PrimaryButton onClick={() => go(screens.matchingEstimateSelect)}>매칭 시작하기</PrimaryButton>
      </div>
    </section>
  )
}

export function MyEstimateListPage({ go }) {
  return (
    <section className="subpage-screen">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={() => go(screens.mypage)}>‹</button>
        <h1>내 AI 견적서</h1>
      </div>
      <SearchBar />
      <div className="list-stack">
        {estimateCards.map((item) => (
          <EstimateCard key={item.id} item={item} onClick={() => go(screens.estimateOutput)} />
        ))}
      </div>
    </section>
  )
}