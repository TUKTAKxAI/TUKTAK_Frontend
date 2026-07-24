import { api } from '../../api/apiClient'
import { CustomerPage } from './CustomerPageShared'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { PrimaryButton } from '../../components/customer/FormControls'
import { screens } from '../../data/customerData'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RiskCard, SearchBar } from '../../components/customer/Cards'
import { screenPaths } from '../../routes/customerRoutes'
import { FaChevronLeft, FaExclamationTriangle, FaCoins, FaShieldAlt, FaFileContract, FaSearch, FaTimes } from 'react-icons/fa'
import preview5 from '../../assets/figma/preview5.webp';
import preview6 from '../../assets/figma/preview6.webp';
import preview7 from '../../assets/figma/preview7.webp';
import preview8 from '../../assets/figma/preview8.webp';
import loadingCarbonSvg from '../../assets/figma/loading-carbon.svg?raw';
import confirmCarbonSvg from '../../assets/figma/confirm-carbon.svg?raw';
import urgentAlertSvg from "../../assets/figma/urgent-alert.svg?raw"

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
    <CustomerPage go={go} className="cds--white">
      <div className="estimate-hero">
      <div className="estimate-hero-body">
        <div className="estimate-hero-head">
          <span className="estimate-hero-eyebrow">AI 리스크 리포트 서비스</span>
          <h1 className="estimate-hero-title">
            AI로 발생할 리스크를<br />미리 확인해 보세요
          </h1>
          <p className="estimate-hero-desc">
            매칭이 시작되면 견적서에 기반하여<br />리스크를 계산해 리포트를 작성해드립니다.
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
        const data = await api.get('/api/v1/users/me/ai-estimates', {
          params: { status: 'COMPLETED', page: 1, size: 20 },
        });
        
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

  // 요청하기를 누르는 즉시 로딩 화면으로 이동하고, 실제 API 호출은 로딩 화면에서 처리함
  const requestRiskReport = (estimateId) => {
    navigate(screenPaths[screens.riskLoading], {
      state: { estimateId }
    });
  };

  if (isLoading) {
    return (
      <CustomerPage go={go} back={() => go(screens.riskHome)} className="cds--white">
        <div className="estimate-loading">
          <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
          <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
          <p className="estimate-loading-title">AI 견적서 불러오는 중...</p>
        </div>
      </CustomerPage>
    );
  }

  if (estimates.length === 0) {
    return (
      <CustomerPage go={go} back={() => go(screens.riskHome)} className="cds--white">
        <div className="matching-select-status">
          <div className="matching-select-status-icon" dangerouslySetInnerHTML={{ __html: urgentAlertSvg }} />
          <h2 className="matching-select-status-title">생성된 AI 견적서가 없습니다</h2>
          <p className="matching-select-status-desc">AI 견적서를 새로 만들어 볼까요?</p>
          <PrimaryButton narrow onClick={() => go(screens.estimateStart)}>AI 견적서 생성</PrimaryButton>
        </div>
      </CustomerPage>
    );
  }

  return (
    <CustomerPage go={go} back={() => go(screens.riskHome)} className="cds--white">
      <div className="risk-select">
        <h1 className="risk-select-heading">AI 리스크 리포트</h1>
        <p className="risk-select-subheading">AI 견적서를 선택해주세요</p>

        <div className="risk-select-list">
          {estimates.map((estimate) => (
            <article key={estimate.estimate_id} className="risk-select-card">
              <div className="risk-select-card-head">
                <span className="risk-select-card-date">
                  {estimate.created_at ? estimate.created_at.split('T')[0] : '날짜 없음'}
                </span>
                <span className="matching-status-badge">
                  {estimate.estimate_status === 'COMPLETED' ? '완료' : '진행중'}
                </span>
              </div>
              <h3 className="risk-select-card-title">{estimate.repair_task_name || 'AI 시공 견적'}</h3>
              <p className="risk-select-card-meta">담당 시공자 : {estimate.contractor_name || '미정'}</p>
              <p className="risk-select-card-cost">
                확정 시공 비용 : {estimate.min_price ? Number(estimate.min_price).toLocaleString() : '0'}원
              </p>
              <button
                type="button"
                className="risk-select-card-button"
                onClick={() => requestRiskReport(estimate.estimate_id)}
              >
                리스크 리포트 요청하기
              </button>
            </article>
          ))}
        </div>
      </div>
    </CustomerPage>
  )
}

// 4. 로딩 페이지 (기존 백엔드 통신 폴링 완벽히 적용됨)
export function RiskLoadingPage({ go }) {
  const location = useLocation();
  const navigate = useNavigate();
  const estimateId = location.state?.estimateId;

  useEffect(() => {
    if (!estimateId) {
      alert('잘못된 접근입니다.');
      go(screens.riskHome);
      return;
    }

    // AbortController로 리포트 생성 요청 자체를 취소해서, 개발 모드의 StrictMode
    // 이중 마운트나 리렌더로 effect가 다시 실행되더라도 리포트가 중복 생성되지 않게 함.
    const controller = new AbortController();
    let pollTimer;

    // 로딩 화면에 진입하자마자 실제 리스크 리포트 생성 요청을 보내고, 완료될 때까지 상태를 폴링함
    const createRiskReport = async () => {
      try {
        const data = await api.post('/api/v1/risk-reports', { estimate_id: estimateId }, { signal: controller.signal });

        if (!data || !data.risk_report_id) {
          alert('리스크 리포트 요청에 실패했습니다.');
          go(screens.riskSelect);
          return;
        }

        pollTimer = setInterval(async () => {
          try {
            const statusData = await api.get(`/api/v1/risk-reports/${data.risk_report_id}`, { signal: controller.signal });

            if (statusData.success && statusData.report && (statusData.report.report_status === 'COMPLETED' || statusData.report.report_status === 'SUCCESS')) {
              clearInterval(pollTimer);
              navigate(screenPaths[screens.riskDone], {
                state: { resultData: statusData.report }
              });
            }
            if (statusData.success && statusData.report && statusData.report.report_status === 'FAILED') {
              clearInterval(pollTimer);
              navigate(screenPaths[screens.riskOutput], {
                state: { resultData: statusData.report }
              });
            }
          } catch (error) {
            if (error.code === 'ERR_CANCELED') return;
            console.error('상태 확인 실패:', error);
          }
        }, 3000);
      } catch (error) {
        if (error.code === 'ERR_CANCELED') return;
        console.error('요청 실패:', error);
        // 에러 메시지도 클라이언트가 던져주는 예쁜 메시지로 출력합니다.
        alert(`백엔드 서버와 통신하는 중 오류가 발생했습니다: ${error.message}`);
        go(screens.riskSelect);
      }
    };

    createRiskReport();

    return () => {
      controller.abort();
      clearInterval(pollTimer);
    };
    // go/navigate는 이 effect가 다시 실행되어야 할 트리거가 아니라(둘 다 렌더마다
    // 새로 생성될 수 있는 콜백), estimateId만 실제 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateId]);

  return (
    <section className="estimate-loading">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
      <h2 className="estimate-loading-title">리스크 리포트 생성중...</h2>
      <p className="estimate-loading-desc">견적서 데이터를 분석해서<br />리스크를 계산하고 있어요</p>
      <button type="button" className="estimate-loading-cancel" onClick={() => go(screens.riskSelect)}>
        취소
      </button>
    </section>
  )
}

// 5. 생성 완료 페이지
export function RiskDonePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.resultData;

  const goToOutput = () => {
    navigate(screenPaths[screens.riskOutput], {
      state: { resultData: resultData }
    });
  };

  return (
    <section className="estimate-done">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-done-icon" dangerouslySetInnerHTML={{ __html: confirmCarbonSvg }} />
      <h2 className="estimate-done-title">리스크 리포트가 생성됐어요</h2>
      <p className="estimate-done-desc">핵심 리스크와 체크리스트를<br />확인해보세요</p>
      <div className="estimate-done-actions">
        <PrimaryButton narrow onClick={goToOutput}>확인하기</PrimaryButton>
      </div>
    </section>
  )
}

const compactRiskText = (value, maxLength = 95) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?。]|다\.|요\.|니다\.)\s*/)[0] || text;
  const compact = firstSentence.length >= 28 ? firstSentence : text;
  return compact.length > maxLength ? `${compact.slice(0, maxLength).trim()}...` : compact;
};

const compactDetailText = (item, maxLength = 110) => {
  const text = item?.expected_impact || item?.description || (typeof item === 'string' ? item : '');
  return compactRiskText(text, maxLength);
};

export function RiskOutputPage({ go }) {
  const location = useLocation();
  const resultData = location.state?.resultData;

  if (!resultData) {
    return (
      <section className="risk-output-empty">
        <p>리포트 데이터를 불러올 수 없습니다.</p>
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

  const riskGradeClass = resultData.risk_level === 'LOW' ? 'is-low' : resultData.risk_level === 'MEDIUM' ? 'is-medium' : 'is-high';
  const isFailed = resultData.report_status === 'FAILED';

  return (
    <section className="risk-output">
      <header className="risk-output-header">
        <button type="button" className="risk-output-back" onClick={() => go(screens.riskHome)} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <div className="risk-output-header-title">
          <h1>시공 리스크 리포트</h1>
          <p>{resultData.created_at?.split('T')[0]}</p>
        </div>
        <div className="risk-output-header-spacer" aria-hidden="true" />
      </header>

      <main className="risk-output-body">

        {/* 1. 리스크 점수 & 등급 */}
        <div className="risk-output-stat-row">
          <div className="risk-output-stat">
            <span>리스크 점수</span>
            <strong>{isFailed ? '-' : `${resultData.risk_score}점`}</strong>
          </div>
          <div className="risk-output-stat">
            <span>리스크 등급</span>
            <strong className={`risk-output-grade ${riskGradeClass}`}>{isFailed ? '근거 부족' : resultData.risk_level}</strong>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 💡 첫 번째 버블: 주요 위험 요소 (핵심 요약)               */}
        {/* ======================================================= */}
        {riskItems.length > 0 && (
          <div className="risk-output-card">
            <h3 className="risk-output-card-title">
              <FaExclamationTriangle aria-hidden="true" /> 핵심 리스크 요약
            </h3>
            <ul className="risk-output-alert-list">
              {riskItems.map((item, idx) => {
                const description = compactRiskText(item.description);
                return (
                  <li key={idx} className="risk-output-alert">
                    <div className="risk-output-alert-head">
                      <span className="risk-output-alert-title">{item.title || "주의 사항"}</span>
                      {item.level && <span className="risk-output-alert-level">{item.level}</span>}
                    </div>
                    {description && (
                      <p className="risk-output-alert-desc">
                        {description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ======================================================= */}
        {/* 💡 두 번째 버블: 요약 -> 체크리스트 -> 4대 세부 위험 요소 */}
        {/* ======================================================= */}
        <div className="risk-output-card">

          {/* 1. 종합 요약 */}
          <section className="risk-output-section">
            <h3>상세 요약</h3>
            <p className="risk-output-block">
              {compactRiskText(resultData.summary || resultData.failure_reason, 170) || "요약 정보가 없습니다."}
            </p>
          </section>

          {/* 2. 확인 체크리스트 */}
          {checklist.length > 0 && (
            <section className="risk-output-section">
              <h3>확인 체크리스트</h3>
              <ul className="risk-output-checklist">
                {checklist.map((item, idx) => (
                  <li key={idx}>
                    <span className="risk-output-checklist-index">{idx + 1}</span>
                    {/* 💡 백엔드 JSON에서 'label'이라는 이름표로 보내주므로 item.label을 1순위로 찾습니다. */}
                    <span>{item.label || item.task || item.title || (typeof item === 'string' ? item : '')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. 세부 카테고리 1: 추가 비용 위험 요소 */}
          {additionalCostRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaCoins aria-hidden="true" /> 추가 비용 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {additionalCostRisks.map((item, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {item.title && <strong>{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {compactDetailText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. 세부 카테고리 2: 안전 및 자격 위험 요소 */}
          {safetyRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaShieldAlt aria-hidden="true" /> 안전 및 자격 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {safetyRisks.map((item, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {item.title && <strong>{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {compactDetailText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 5. 세부 카테고리 3: 계약 및 분쟁 위험 요소 */}
          {contractRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaFileContract aria-hidden="true" /> 계약 및 분쟁 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {contractRisks.map((item, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {item.title && <strong>{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {compactDetailText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 6. 세부 카테고리 4: 확인 어려운 현장 변수 */}
          {fieldVariableRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaSearch aria-hidden="true" /> 확인 어려운 현장 변수</h3>
              <ul className="risk-output-bullet-list">
                {fieldVariableRisks.map((item, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {item.title && <strong>{item.title}</strong>}
                      {item.title && item.expected_impact && " : "}
                      {compactDetailText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </main>

      <div className="risk-output-actions">
        <PrimaryButton onClick={() => go(screens.riskHome)}>확인</PrimaryButton>
      </div>
    </section>
  )
}

// 7. 내 리스크 리포트 목록 페이지 (실제 데이터 연동)
export function MyRiskListPage({ go }) {
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
    <section className="subpage-screen history-page risk-list-page cds--white">
      <header className="mypage-list-header">
        <button type="button" className="mypage-list-back" onClick={() => go(screens.mypage)} aria-label="뒤로가기">
          <FaChevronLeft />
        </button>
        <h1>내 리스크리포트</h1>
        <span className="mypage-list-header-spacer" aria-hidden="true" />
      </header>

      <div className="mypage-search-only-row">
        <SearchBar />
      </div>

      <div className="history-scroll-area">
        <div className="list-stack">
          {isLoading ? (
            <p className="empty-list-message">목록을 불러오는 중...</p>
          ) : riskReports.length === 0 ? (
            <div className="history-empty-state">
              <span className="history-empty-state-icon" aria-hidden="true"><FaShieldAlt /></span>
              <strong>생성된 리스크 리포트가 없습니다</strong>
            </div>
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
  const checklist = item.checklist || item.checklist_json || [];
  const additionalCostRisks = item.additional_cost_risks || item.additional_cost_risks_json || [];
  const safetyRisks = item.safety_risks || item.safety_risks_json || [];
  const contractRisks = item.contract_risks || item.contract_risks_json || [];
  const fieldVariableRisks = item.field_variable_risks || item.field_variable_risks_json || [];
  const riskGradeClass = item.risk_level === 'LOW' ? 'is-low' : item.risk_level === 'MEDIUM' ? 'is-medium' : 'is-high';

  return (
    <div className="estimate-result-overlay">
      <article className="estimate-result-modal is-wide">
        <div className="estimate-result-head">
          <div>
            <span>시공 리스크 리포트</span>
            <small>{item.created_at?.split('T')[0]} · {item.report_status === 'COMPLETED' ? '완료' : '진행중'}</small>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <FaTimes />
          </button>
        </div>

        <div className="risk-output-stat-row" style={{ marginTop: '16px' }}>
          <div className="risk-output-stat">
            <span>리스크 점수</span>
            <strong>{item.risk_score}점</strong>
          </div>
          <div className="risk-output-stat">
            <span>리스크 등급</span>
            <strong className={`risk-output-grade ${riskGradeClass}`}>{item.risk_level}</strong>
          </div>
        </div>

        <div className="risk-output-card" style={{ marginTop: '16px' }}>
          <section className="risk-output-section">
            <h3>상세 요약</h3>
            <p className="risk-output-block">
              {item.summary || "요약 정보가 없습니다."}
            </p>
          </section>

          {checklist.length > 0 && (
            <section className="risk-output-section">
              <h3>확인 체크리스트</h3>
              <ul className="risk-output-checklist">
                {checklist.map((c, idx) => (
                  <li key={idx}>
                    <span className="risk-output-checklist-index">{idx + 1}</span>
                    <span>{c.label || c.task || c.title || (typeof c === 'string' ? c : '')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {additionalCostRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaCoins aria-hidden="true" /> 추가 비용 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {additionalCostRisks.map((r, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {r.title && <strong>{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {safetyRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaShieldAlt aria-hidden="true" /> 안전 및 자격 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {safetyRisks.map((r, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {r.title && <strong>{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {contractRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaFileContract aria-hidden="true" /> 계약 및 분쟁 위험 요소</h3>
              <ul className="risk-output-bullet-list">
                {contractRisks.map((r, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {r.title && <strong>{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {fieldVariableRisks.length > 0 && (
            <section className="risk-output-section">
              <h3><FaSearch aria-hidden="true" /> 확인 어려운 현장 변수</h3>
              <ul className="risk-output-bullet-list">
                {fieldVariableRisks.map((r, idx) => (
                  <li key={idx}>
                    <span className="risk-output-bullet">•</span>
                    <span>
                      {r.title && <strong>{r.title}</strong>}
                      {r.title && r.expected_impact && " : "}
                      {r.expected_impact || r.description || (typeof r === 'string' ? r : '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="estimate-result-actions single">
          <PrimaryButton onClick={onClose}>확인</PrimaryButton>
        </div>
      </article>
    </div>
  )
}
