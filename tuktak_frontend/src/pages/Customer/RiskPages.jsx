import { api } from '../../api/apiClient'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { Logo, PrimaryButton } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RiskCard, SearchBar } from '../../components/customer/Cards'
import { screenPaths } from '../../routes/customerRoutes'
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

      <div className="flex flex-col items-center flex-1 py-0">
        <h1 className="text-2xl font-bold text-gray-900 mt-4 text-center">AI 리스크리포트 서비스</h1>
        
        <div className="w-full max-w-125 mx-auto text-left -mt-3 ml-2">
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
        const data = await api.get('/api/v1/users/me/ai-estimates');
        
        if (data && data.items) {
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
      const data = await api.post('/api/v1/risk-reports', { estimate_id: estimateId });

      if (data && data.risk_report_id) {
        navigate(screenPaths[screens.riskLoading], { 
          state: { riskReportId: data.risk_report_id } 
        });
      } else {
        alert('리스크 리포트 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('요청 실패:', error);
      // 에러 메시지도 클라이언트가 던져주는 예쁜 메시지로 출력합니다.
      alert(`백엔드 서버와 통신하는 중 오류가 발생했습니다: ${error.message}`);
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
              <p className="text-center text-gray-500 font-medium text-[15px]">AI 견적서 불러오는 중 ...</p>
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

    
    const interval = setInterval(async () => {
      try {
        const data = await api.get(`/api/v1/risk-reports/${riskReportId}`);
        
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
        리스크 리포트 생성중 ...
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

export function RiskOutputPage({ go }) {
  const location = useLocation();
  const resultData = location.state?.resultData;

  if (!resultData) {
    return (
      <section className="flex flex-col h-full bg-[#F2F3F5] items-center justify-center">
        <p className="mb-4 text-gray-600">리포트 데이터를 불러올 수 없습니다.</p>
        <PrimaryButton narrow onClick={() => go(screens.riskHome)}>홈으로</PrimaryButton>
      </section>
    );
  }

  // 💡 [안전장치] 백엔드에서 _json이 붙은 이름으로 보낼 수도 있고 안 붙이고 보낼 수도 있어서 둘 다 대응하도록 변수로 빼두었습니다.
  const riskItems = resultData.risk_items || resultData.risk_items_json || [];
  const checklist = resultData.checklist || resultData.checklist_json || [];
  const additionalCostRisks = resultData.additional_cost_risks || resultData.additional_cost_risks_json || [];
  const safetyRisks = resultData.safety_risks || resultData.safety_risks_json || [];
  const contractRisks = resultData.contract_risks || resultData.contract_risks_json || [];
  const fieldVariableRisks = resultData.field_variable_risks || resultData.field_variable_risks_json || [];

  return (
    <section className="flex flex-col h-full bg-[#F2F3F5]">
      {/* 상단 고정 헤더 */}
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <button onClick={() => go(screens.riskHome)} className="p-2 -ml-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
            <h1 className="text-[17px] font-bold text-gray-900">시공 리스크 리포트</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">{resultData.created_at?.split('T')[0]}</p>
        </div>
        <div className='w-10' />
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* 1. 리스크 점수 & 등급 (기존 유지) */}
        <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">리스크 점수</p>
                <strong className="text-[20px] font-bold text-gray-900">{resultData.risk_score}점</strong>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 mb-1">리스크 등급</p>
                <strong className={`text-[20px] font-bold ${resultData.risk_level === 'LOW' ? 'text-green-500' : resultData.risk_level === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {resultData.risk_level}
                </strong>
            </div>
        </div>

        {/* ======================================================= */}
        {/* 💡 첫 번째 버블: 주요 위험 요소 (핵심 요약)               */}
        {/* ======================================================= */}
        {riskItems.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[16px] font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🚨</span> 핵심 리스크 요약
            </h3>
            <ul className="space-y-3">
              {riskItems.map((item, idx) => (
                <li key={idx} className="flex flex-col text-[14px] text-gray-700 bg-red-50 p-4 rounded-xl border border-red-100">
                  <span className="font-bold text-gray-900 mb-1">
                    {item.title || "주의 사항"}
                    {item.level && <span className="ml-2 text-[10px] bg-white px-2 py-0.5 rounded text-red-500 border border-red-200">{item.level}</span>}
                  </span>
                  <span className="text-[13px] text-gray-600 leading-relaxed">
                    {item.description || "상세 내용이 없습니다."}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ======================================================= */}
        {/* 💡 두 번째 버블: 요약 -> 체크리스트 -> 4대 세부 위험 요소 */}
        {/* ======================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-8">
          
          {/* 1. 종합 요약 */}
          <section>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">상세 요약</h3>
            <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {resultData.summary || "요약 정보가 없습니다."}
            </p>
          </section>

          {/* 2. 확인 체크리스트 */}
          {checklist.length > 0 && (
            <section className="border-t border-gray-300 pt-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4">확인 체크리스트</h3>
              <ul className="space-y-3">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center text-[14px] text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 mr-3 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {/* 💡 백엔드 JSON에서 'label'이라는 이름표로 보내주므로 item.label을 1순위로 찾습니다. */}
                    <span>{item.label || item.task || item.title || (typeof item === 'string' ? item : '')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. 세부 카테고리 1: 추가 비용 위험 요소 */}
          {additionalCostRisks.length > 0 && (
            <section className="border-t border-gray-300 pt-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💰</span> 추가 비용 위험 요소
              </h3>
              <ul className="space-y-3">
                {additionalCostRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[14px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {item.title && <strong className="text-gray-900">{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {item.expected_impact || item.description || (typeof item === 'string' ? item : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. 세부 카테고리 2: 안전 및 자격 위험 요소 */}
          {safetyRisks.length > 0 && (
            <section className="border-t border-gray-300 pt-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">⚠️</span> 안전 및 자격 위험 요소
              </h3>
              <ul className="space-y-3">
                {safetyRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[14px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {item.title && <strong className="text-gray-900">{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {item.expected_impact || item.description || (typeof item === 'string' ? item : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 5. 세부 카테고리 3: 계약 및 분쟁 위험 요소 */}
          {contractRisks.length > 0 && (
            <section className="border-t border-gray-300 pt-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📝</span> 계약 및 분쟁 위험 요소
              </h3>
              <ul className="space-y-3">
                {contractRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[14px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {item.title && <strong className="text-gray-900">{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {item.expected_impact || item.description || (typeof item === 'string' ? item : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 6. 세부 카테고리 4: 확인 어려운 현장 변수 */}
          {fieldVariableRisks.length > 0 && (
            <section className="border-t border-gray-300 pt-6">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🔍</span> 확인 어려운 현장 변수
              </h3>
              <ul className="space-y-3">
                {fieldVariableRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[14px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {item.title && <strong className="text-gray-900">{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {item.expected_impact || item.description || (typeof item === 'string' ? item : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </main>

      <div className="px-6 pt-6 pb-0 bg-F2F3F5 border-gray-200">
        <PrimaryButton onClick={() => go(screens.riskHome)}>확인</PrimaryButton>
      </div>
    </section>
  )
}

// 7. 내 리스크 리포트 목록 페이지 (실제 데이터 연동)
export function MyRiskListPage({ go, back }) {
  // 💡 모달에 띄울 데이터를 담아둘 상태(State) 상자를 만듭니다.
  const [selectedRisk, setSelectedRisk] = useState(null);
  
  const [riskReports, setRiskReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyRiskReports = async () => {
      try {
        const data = await api.get('/api/v1/risk-reports');
        
        if (data && data.items) {
          const mappedList = data.items.map((item) => ({
            ...item, 
            id: item.risk_report_id,
            date: item.created_at ? item.created_at.split('T')[0] : '날짜 없음',
            title: item.repair_task_name || '시공 리스크 리포트', 
            riskScore: item.risk_score || 0,                         
            riskLevel: item.risk_level || '미정',                    
            isExpired: false,                                        
            expireLabel: item.report_status === 'COMPLETED' ? '완료' : '진행중' 
          }));
          
          setRiskReports(mappedList);
        }
      } catch (error) {
        console.error('리스크 리포트 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRiskReports();
  }, []);

  const handleCardClick = async (reportId) => {
    try {
      const data = await api.get(`/api/v1/risk-reports/${reportId}`);
      
      if (data && data.report) {
        // 💡 예전엔 navigate로 화면을 이동시켰지만, 이제는 모달 상자(selectedRisk)에 데이터를 쏙 담습니다!
        setSelectedRisk(data.report);
      }
    } catch (error) {
      console.error('상세 정보 불러오기 실패:', error);
      alert('상세 리포트 정보를 불러오지 못했습니다.');
    }
  };

  return (
    <section className="subpage-screen history-page risk-list-page">
      <div className="subpage-title-row">          
        <button 
            className="mr-3 flex items-center justify-center transition-transform active:scale-90" 
            onClick={() => go(screens.mypage)}
          >
            <img src={figmaAssets.back} alt="뒤로가기" className="w-6 h-6 object-contain" />
          </button>
        <img className="subpage-title-icon risk-title-icon" src={figmaAssets.mypageRiskReportTitle} alt="" />
        <h1>내 리스크리포트</h1>
      </div>
      
      <SearchBar />
      
      <div className="list-stack overflow-y-auto pb-10">
        {isLoading ? (
          <p className="text-center text-gray-500 mt-10">목록을 불러오는 중 ...</p>
        ) : riskReports.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">생성된 리스크 리포트가 없습니다.</p>
        ) : (
          riskReports.map((item) => (
            <RiskCard 
              key={item.id} 
              item={item} 
              onClick={() => handleCardClick(item.id)} 
            />
          ))
        )}
      </div>

      {/* 💡 상자에 데이터가 들어가면 팝업(모달)을 화면 최상단에 띄워줍니다! */}
      {selectedRisk ? (
        <RiskReportModal 
          item={selectedRisk} 
          onClose={() => setSelectedRisk(null)} 
        />
      ) : null}
    </section>
  )
}

// ==============================================================
// 💡 새롭게 추가된 리스크 리포트 전용 팝업(모달) 컴포넌트입니다!
// 견적서 모달과 동일한 오버레이 배경을 쓰되, 안쪽은 리포트 디자인으로 꽉 채웠습니다.
// ==============================================================
function RiskReportModal({ item, onClose }) {
  const riskItems = item.risk_items || item.risk_items_json || [];
  const checklist = item.checklist || item.checklist_json || [];
  const additionalCostRisks = item.additional_cost_risks || item.additional_cost_risks_json || [];
  const safetyRisks = item.safety_risks || item.safety_risks_json || [];
  const contractRisks = item.contract_risks || item.contract_risks_json || [];
  const fieldVariableRisks = item.field_variable_risks || item.field_variable_risks_json || [];

  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
        
        {/* 모달 상단 헤더 (날짜, 상태, 닫기 버튼) */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[13px] text-gray-500 mr-2">{item.created_at?.split('T')[0]}</span>
            <small className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[11px] font-bold">
              {item.report_status === 'COMPLETED' ? '완료' : '진행중'}
            </small>
          </div>
          {/* 💡 여기서도 X 버튼을 정가운데로 예쁘게 정렬했습니다! */}
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            style={{ fontSize: '18px', paddingBottom: '2px' }}
          >
            ✕
          </button>
        </div>

        {/* 1. 점수 및 등급 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1">리스크 점수</p>
            <strong className="text-[20px] font-bold text-gray-900">{item.risk_score}점</strong>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1">리스크 등급</p>
            <strong className={`text-[20px] font-bold ${item.risk_level === 'LOW' ? 'text-green-500' : item.risk_level === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'}`}>
              {item.risk_level}
            </strong>
          </div>
        </div>

        {/* 2. 상세 요약 */}
        <div className="space-y-6 text-left">
          <section>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2">상세 요약</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {item.summary || "요약 정보가 없습니다."}
            </p>
          </section>

          {/* 3. 체크리스트 */}
          {checklist.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-[15px] font-bold text-gray-800 mb-3">확인 체크리스트</h3>
              <ul className="space-y-2">
                {checklist.map((c, idx) => (
                  <li key={idx} className="flex items-center text-[13px] text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 mr-3 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{c.label || c.task || c.title || (typeof c === 'string' ? c : '')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. 세부 위험 요소 모음 */}
          {additionalCostRisks.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">💰</span> 추가 비용 위험
              </h3>
              <ul className="space-y-2">
                {additionalCostRisks.map((r, idx) => (
                  <li key={idx} className="flex items-start text-[13px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {r.title && <strong className="text-gray-900">{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {safetyRisks.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">⚠️</span> 안전 및 자격 위험
              </h3>
              <ul className="space-y-2">
                {safetyRisks.map((r, idx) => (
                  <li key={idx} className="flex items-start text-[13px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {r.title && <strong className="text-gray-900">{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {contractRisks.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📝</span> 계약 및 분쟁 위험
              </h3>
              <ul className="space-y-2">
                {contractRisks.map((r, idx) => (
                  <li key={idx} className="flex items-start text-[13px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {r.title && <strong className="text-gray-900">{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {fieldVariableRisks.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-[15px] font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🔍</span> 확인 어려운 현장 변수
              </h3>
              <ul className="space-y-2">
                {fieldVariableRisks.map((r, idx) => (
                  <li key={idx} className="flex items-start text-[13px] text-gray-700">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span>
                      {r.title && <strong className="text-gray-900">{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 확인 버튼 */}
        <div className="mt-8 flex justify-center">
          <PrimaryButton onClick={onClose} style={{ width: '100%', height: '52px', fontSize: '16px', fontWeight: 'bold' }}>
            확인
          </PrimaryButton>
        </div>

      </article>
    </div>
  )
}