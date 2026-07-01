import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { riskCards, screens } from '../../data/customerData'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RiskCard, SearchBar } from '../../components/customer/Cards'
import { screenPaths } from '../../routes/customerRoutes'
import { figmaAssets } from '../../components/customer/figmaAssets'
import preview5 from '../../assets/figma/preview5.webp';
import preview6 from '../../assets/figma/preview6.webp';
import preview7 from '../../assets/figma/preview7.webp';
import preview8 from '../../assets/figma/preview8.webp';
import loadingSvg from '../../assets/figma/loading.svg?raw';
import confirmSvg from '../../assets/figma/confirm.svg?raw';
import errorSvg from "../../assets/figma/error.svg?raw"

const previewImages = [preview5, preview6, preview7, preview8];

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
        <h1 className="text-2xl font-bold text-gray-900 mt-4 text-center">AI 리스크리포트 서비스</h1>
        
        <div className="w-full max-w-125 mx-auto text-left mt-0 ml-2">
          <h2 className="text-base font-semibold text-gray-700 leading-snug">
            AI로 발생할 리스크를<br />미리 확인해 보세요
          </h2>
          <p className="text-md font-semibold text-gray-700 mt-8 ml-3 leading-relaxed">
            매칭이 시작되면 견적서에 기반하여<br />리스크를 계산해 리포트를 작성해드립니다.
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

export function RiskHomePage({ go }) {
  return (
    <ServiceHero
      onClick={() => go(screens.riskSelect)}
      buttonLabel="AI 리스크 리포트 받기"
      go={go}
    />
  )
}

export function RiskSelectPage({ go }) {
  const navigate = useNavigate();
  
  // 💡 서버에서 받아온 견적서 목록을 담을 상태(State)
  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 컴포넌트가 켜지면 백엔드에서 견적서 목록을 가져오는 로직
  useEffect(() => {
    const fetchMyEstimates = async () => {
      try {
        const token = localStorage.getItem('tuktak_access_token');
        const response = await fetch('/api/v1/ai-estimates', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // 백엔드 응답 구조에 맞게 데이터 세팅 (보통 data.items 배열로 옴)
        if (response.ok && data.items) {
          setEstimates(data.items);
        }
      } catch (error) {
        console.error('견적서 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEstimates();
  }, []);

  const requestRiskReport = async (estimateId) => {
    try {
      const token = localStorage.getItem('tuktak_access_token');
      const response = await fetch('/api/v1/risk-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estimate_id: estimateId })
      });
      
      const data = await response.json();

      if (response.ok && data.risk_report_id) {
        navigate(screenPaths[screens.riskLoading], { 
          state: { riskReportId: data.risk_report_id } 
        });
      } else {
        alert('리스크 리포트 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('요청 실패:', error);
      alert('백엔드 서버와 통신하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className="selection-screen flex flex-col h-full bg-[#F2F3F5]">
      <CustomerTopBar go={go} />
      
      <div className="flex flex-col flex-1 px-6 pt-4">
        
        <div className="flex items-center mb-0">
          <button 
            className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
            onClick={() => go(screens.riskHome)}
          >
            <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 relative bottom-0.5">AI 리스크 리포트</h1>
        </div>

        {/* 💡 백엔드 연동: 로딩 중이거나 데이터가 없을 때의 처리 */}
        <div className="overflow-y-auto pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center mt-16">
              <div className="w-48 h-48 flex justify-center items-center pointer-events-none mb-4 [&>svg]:w-full [&>svg]:h-full"
                   dangerouslySetInnerHTML={{ __html: loadingSvg }} 
              />
              <p className="text-center text-gray-500 font-medium text-[15px]">견적서 목록을 불러오는 중입니다 ...</p>
            </div>
          ) : estimates.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-16">
              <div className="w-48 h-48 flex justify-center items-center pointer-events-none mb-4 [&>svg]:w-full [&>svg]:h-full"
                   dangerouslySetInnerHTML={{ __html: errorSvg }} 
              />
              <p className="text-center font-bold text-[20px] text-gray-900 mt-1">생성된 AI 견적서가 없습니다 !</p>
              <p className="text-center font-medium text-[15px] text-gray-900 mt-5">AI 견적서를 새로 만들어 볼까요?</p>
              <button 
                onClick={() => go(screens.estimateStart)}
                className="w-3/5 bg-[#1C54D4] text-white py-2.5 rounded-lg transition-colors hover:bg-blue-700 mt-2"
                style={{ fontSize: '16px', fontWeight: 'bold' }} 
              >
                AI 견적서 생성
              </button>
            </div>

          ) : (
            <>
              <h2 
                className="text-gray-700 text-center mb-6 font-bold"
                style={{ fontSize: '20px' }}
              >
                AI 견적서를 선택해주세요
              </h2>
              {
                estimates.map((estimate) => (
                  <article key={estimate.estimate_id} className="bg-white rounded-[14px] p-5 border border-gray-400 shadow-sm flex flex-col mb-4">
                    
                    <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-3">
                      <span className="text-[13px] text-gray-500">
                        {estimate.created_at ? estimate.created_at.split('T')[0] : '날짜 없음'}
                      </span>
                      <small className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-1 rounded">
                        {estimate.estimate_status === 'COMPLETED' ? '완료' : '진행중'}
                      </small>
                    </div>
                    
                    <div className="flex flex-col text-left ">
                      <h3 className="text-[22px] font-bold text-gray-900 mb-1.5 tracking-tight">
                        {estimate.repair_task_name || 'AI 시공 견적'}
                      </h3>
                      <p className="text-[13px] text-gray-500 mb-0.5">
                        담당 시공자 : {estimate.contractor_name || '미정'}
                      </p>
                      <p className="text-[13px] font-bold text-gray-500 mb-4.5">
                        확정 시공 비용 : {estimate.min_price ? Number(estimate.min_price).toLocaleString() : '0'}원
                      </p>
                      
                      <div className="flex justify-center w-full">
                        <button 
                          onClick={() => requestRiskReport(estimate.estimate_id)}
                          className="w-4/5 bg-[#1C54D4] text-white py-2.5 rounded-lg transition-colors hover:bg-blue-700"
                          style={{ fontSize: '16px', fontWeight: 'bold' }} 
                        >
                          리스크 리포트 요청하기
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              }
              </>
          )}
        </div>

      </div>
    </section>
  )
}

// 4. 로딩 페이지 (기존 백엔드 통신 폴링 완벽히 적용됨)
export function RiskLoadingPage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const riskReportId = location.state?.riskReportId;

  useEffect(() => {
    if (!riskReportId) {
      alert('잘못된 접근입니다.');
      go(screens.riskHome);
      return;
    }

    const token = localStorage.getItem('tuktak_access_token');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/risk-reports/${riskReportId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.report && (data.report.report_status === 'COMPLETED' || data.report.report_status === 'SUCCESS')) {
          clearInterval(interval);
          navigate(screenPaths[screens.riskDone], { 
            state: { resultData: data.report } 
          });
        }
      } catch (error) {
        console.error('상태 확인 실패:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [riskReportId, navigate, go]);

  return (
    <section className="status-screen flex flex-col items-center justify-center h-full bg-[#F2F3F5] overflow-hidden">
      <div className="transform scale-[2.5] mb-16 flex justify-center">
        <Logo />
      </div>
      
      <h2 
        className="mb-5 w-full px-4 font-bold text-gray-800 text-center whitespace-nowrap tracking-tighter"
        style={{ fontSize: '24px' }}
      >
        리스크 리포트를 생성중 입니다 ...
      </h2>
      
      <div className="w-48 h-48 mb-12 flex justify-center items-center pointer-events-none">
        <div 
          className="w-full h-full flex justify-center items-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: loadingSvg }} 
        />
      </div>
      
      <PrimaryButton narrow orange className="relative z-10" onClick={() => go(screens.riskSelect)}>
        취소
      </PrimaryButton>
    </section>
  )
}

// 5. 생성 완료 페이지
export function RiskDonePage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.resultData;

  const goToOutput = () => {
    navigate(screenPaths[screens.riskOutput], { 
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
        리스크 리포트가 생성되었습니다 !
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

// 6. 리포트 결과 출력 페이지
// 6. 리포트 결과 출력 페이지 (PDF 뷰어 제거 + JSON 데이터 리스트 렌더링 방식)
// 6. 리포트 결과 출력 페이지 (페이지 전체 구성 + 카드형 디자인)
// 6. 리포트 결과 출력 페이지 (백엔드 실제 데이터 연동 버전)
export function RiskOutputPage({ go }) {
  const location = useLocation();
  // RiskLoadingPage에서 navigate state로 전달받은 실제 데이터
  const resultData = location.state?.resultData;

  // 데이터가 없을 경우(직접 URL 접속 등)에 대한 예외 처리
  if (!resultData) {
    return (
      <section className="flex flex-col h-full bg-[#F2F3F5] items-center justify-center">
        <p className="mb-4">리포트 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.riskHome)}>홈으로</PrimaryButton>
      </section>
    );
  }

  return (
    <section className="flex flex-col h-full bg-[#F2F3F5]">
      {/* 1. 상단 고정 헤더 */}
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <button onClick={() => go(screens.riskHome)} className="p-2 -ml-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
            <h1 className="text-[17px] font-bold text-gray-900">시공 리스크 리포트</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">{resultData.created_at?.split('T')[0]}</p>
        </div>
        <button 
          onClick={() => resultData.pdf_url ? window.open(resultData.pdf_url, '_blank') : alert('PDF 파일이 생성되지 않았습니다.')}
          className="p-2 -mr-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        
        {/* 2. 제목 & 예상 비용 버블 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            {/* <h2 className="text-[20px] font-bold text-gray-900">몰딩 시공 리스크 리포트</h2> */}
            {/* 백엔드에서 받은 예상 비용 표시 */}
            <p className="text-[24px] text-gray-900 font-bold mt-1">예상 비용 : {resultData.min_price?.toLocaleString() || 0}원</p>
        </div>

        {/* 3. 리스크 점수 & 등급 */}
        <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">리스크 점수</p>
                <strong className="text-[20px] font-bold text-gray-900">{resultData.risk_score}점</strong>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">리스크 등급</p>
                <strong className="text-[20px] font-bold text-red-500">{resultData.risk_level}</strong>
            </div>
        </div>

        {/* 4. 요약, 위험요소, 체크리스트 상세 내용 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <section className="border-b border-gray-100 pb-6">
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">요약</h3>
            <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{resultData.summary}</p>
          </section>

          {resultData.risk_items?.length > 0 && (
            <section className="border-b border-gray-100 pb-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4">주요 위험 요소</h3>
              <ul className="space-y-3">
                {resultData.risk_items.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[14px] text-gray-700">
                    <span className="mr-2 text-red-500">•</span> {item.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-[16px] font-bold text-gray-800 mb-4">확인 체크리스트</h3>
            <ul className="space-y-3">
              {resultData.checklist?.map((item, idx) => (
                <li key={idx} className="flex items-center text-[14px] text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 mr-3 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {item.task}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <div className="p-6 bg-white border-t border-gray-200">
        <PrimaryButton onClick={() => go(screens.riskHome)}>확인</PrimaryButton>
      </div>
    </section>
  )
}

// 7. 내 리스크 리포트 목록 페이지 (실제 데이터 연동)
export function MyRiskListPage({ go }) {
  // 💡 리스크 리포트 목록을 백엔드에서 받아오도록 수정!
  const [riskReports, setRiskReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyRiskReports = async () => {
      try {
        const token = localStorage.getItem('tuktak_access_token');
        const response = await fetch('/api/v1/risk-reports', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.items) {
          setRiskReports(data.items);
        }
      } catch (error) {
        console.error('리스크 리포트 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRiskReports();
  }, []);

  return (
    <section className="subpage-screen history-page risk-list-page">
      <div className="subpage-title-row">
        <button className="inline-back-arrow" onClick={back}>‹</button>
        <img className="subpage-title-icon risk-title-icon" src={figmaAssets.mypageRiskReportTitle} alt="" />
        <h1>내 리스크리포트</h1>
      </div>
      <SearchBar />
      
      <div className="list-stack overflow-y-auto">
        {/* 💡 백엔드 연동: 로딩 및 빈 목록 처리 */}
        {isLoading ? (
          <p className="text-center text-gray-500 mt-10">목록을 불러오는 중입니다...</p>
        ) : riskReports.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">생성된 리스크 리포트가 없습니다.</p>
        ) : (
          // 진짜 데이터를 기존 RiskCard 컴포넌트에 넘겨주기
          riskReports.map((item) => (
            <RiskCard 
              key={item.risk_report_id} 
              item={item} 
              onClick={() => go(screens.riskOutput)} 
            />
          ))
        )}
      </div>
      {selectedRisk ? <RiskReportModal item={selectedRisk} onClose={() => setSelectedRisk(null)} /> : null}
    </section>
  )
}