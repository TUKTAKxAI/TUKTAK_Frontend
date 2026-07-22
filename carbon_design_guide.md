# TUKTAK Carbon Design System 가이드

이 문서는 TUKTAK 프론트엔드(`tuktak_frontend`)를 IBM Carbon Design System 톤으로 재설계하면서
합의된 규칙을 정리한 것입니다. 세션이 초기화되어도 이 문서를 읽으면 동일한 스타일로
이어서 작업할 수 있도록, "어떻게 만들었는가"뿐 아니라 "왜 이렇게 했는가"까지 기록합니다.

새 화면을 Carbon 스타일로 옮길 때는 이 문서를 프롬프트에 첨부하거나 요약해서 전달하세요.

---

## 0. 최우선 원칙

1. **기능/로직은 절대 변경하지 않는다.** state, handler, API 호출, navigate 대상, 데이터 바인딩은
   100% 그대로 두고 JSX 구조·className·CSS만 바꾼다. 리팩터링·최적화·에러 핸들링 추가 등
   요청받지 않은 변경은 하지 않는다.
2. **기존 컴포넌트/에셋 재사용을 우선한다.** `figmaAssets`에 이미 있는 이미지, 이미 쓰이는
   `react-icons/fa` 아이콘을 우선 사용하고, 명시적 승인 없이 새 외부 에셋을 들이지 않는다.
3. **같은 형식으로 만들어달라는 요청은 클래스까지 그대로 재사용한다.** 예를 들어 매칭 페이지의
   빈 상태(ServiceHero)는 견적 홈 화면의 `.estimate-hero-*` 클래스를 이름까지 그대로 재사용했다
   (새로 베끼지 않음) — 두 화면이 완전히 동일한 룩을 유지하고, 한쪽을 고치면 다른 쪽도 같이
   맞춰지게 하기 위함이다.
4. **레거시(옛 디자인) 클래스는 건드리지 않는다.** 아직 요청받지 않은 화면(예: `MatchingDonePage`)이
   구식 클래스(`current-matching-panel` 등)를 쓰고 있으면 그대로 둔다. 새 스타일은 항상 새
   클래스 이름으로 만들어서 기존 화면에 영향이 가지 않게 한다. 단, 여러 화면이 공유하는
   컴포넌트(`MatchingStatusBadge` 같은)의 클래스를 새로 스타일링하면 그 컴포넌트를 쓰는 다른
   화면에도 자동 반영되는 부수효과가 있을 수 있음을 인지하고 진행한다.

---

## 1. 색상 (Carbon 토큰)

실제 `@carbon/styles`의 `--cds-*` CSS 커스텀 프로퍼티를 우선 사용하고, 그 값이 없을 때를 대비해
항상 **hex fallback을 같이 적는다**: `var(--cds-text-primary, #161616)` 형식.

| 용도 | 변수 | Hex | 비고 |
|---|---|---|---|
| 배경 (기본) | `--cds-background` | `#ffffff` | |
| 배경 (레이어/카드 hover, 연한 회색) | `--cds-layer` | `#f4f4f4` | ghost 버튼 hover 배경 등 |
| 브랜드/주요 액션 | `--cds-background-brand` | `#0f62fe` | Blue 60. Primary 버튼, 강조 텍스트, 아이콘 |
| 브랜드 hover | `--cds-background-brand-hover` | `#0353e9` / `#0043ce` | Primary 버튼 hover |
| 텍스트 기본 | `--cds-text-primary` | `#161616` | 제목, 본문 |
| 텍스트 보조 | `--cds-text-secondary` | `#525252` | 설명, 캡션, 라벨 |
| 텍스트 placeholder | — | `#a8a8a8` | 비활성/placeholder |
| 테두리 (연함) | `--cds-border-subtle` | `#e0e0e0` | 카드, 구분선 |
| 테두리 (진함) | `--cds-border-strong` | `#8d8d8d` | ghost 버튼 테두리 |
| 성공 | — | `#24a148` | 완료 체크, 성공 배지 |
| 에러 | — | `#da1e28` | 에러 텍스트/아이콘 |
| 경고/긴급 | — | `#ff832b` / hover `#eb6200` | Carbon Orange 40/60. 에러(red)보다 톤을 낮추면서도 긴급함을 표현해야 하는 CTA(예: 긴급 수리 요청 버튼)에 사용. **주의**: `--cds-support-warning`은 실제 `@carbon/styles`에서 Yellow(`#f1c21b`)로 정의되어 흰 글자와 대비가 나쁘므로 이 용도로는 var() 없이 hex 리터럴만 쓴다 |
| 브랜드 연한 배경(배지용) | — | `#edf5ff` | 상태 배지, 아이콘 타일 배경 |

**적용 방법**: 화면의 루트 컨테이너(예: `CustomerPage`)에 `className="cds--white"`를 추가해서
Carbon 테마 클래스를 상위에 걸어야 `--cds-*` 변수들이 실제로 값을 가진다. 이게 없으면
fallback hex만 적용된다.

---

## 2. 타이포그래피

- 폰트: 기존 앱 전역은 `Inter, Pretendard, system-ui, sans-serif`. 로그인 화면 등 순수 Carbon
  섹션은 `'IBM Plex Sans', sans-serif`도 사용(선택적, 필수는 아님).
- 제목(h1~h2급): `18~28px`, `font-weight: 600`.
- 본문/설명: `13~15px`, `font-weight: 400~500`, `color: var(--cds-text-secondary)`.
- eyebrow(작은 라벨, 카드/히어로 상단): `11~12px`, `font-weight: 600`, `letter-spacing: 0.32px`,
  `text-transform: uppercase`(필요시), `color: var(--cds-background-brand)`.
- 버튼 텍스트: `14~16px`, `font-weight: 600`.

---

## 3. Spacing & Radius

Carbon은 옛 디자인(더 둥글고 큰 radius: 14~28px)과 달리 **각지고 절제된 모서리**를 쓴다.

| 요소 | border-radius |
|---|---|
| 버튼, 카드, 입력 등 대부분 | `4px` |
| 작은 배지/태그 | `2px` |
| 배지 pill (완전 둥근 형태가 필요할 때만) | `999px` |
| 아이콘 타일 | `4px` (레거시처럼 `8px+`로 둥글리지 않음) |

Spacing은 4px 배수를 기본으로 사용: `padding: 8px / 12px / 16px / 20px / 24px / 32px`,
카드 내부 padding은 보통 `20px`, 섹션 간 `gap`은 `16~24px`.

버튼 높이: 상황별로 다르나 히어로/주요 CTA는 `min-height: 48px`, 카드 내 액션 버튼은
`padding: 12px 0` 정도. (구 디자인의 `min-height: 58px` + `border-radius: 16px` 큰 버튼은
Carbon 섹션에서는 쓰지 않는다 — 그건 레거시 `.primary-button` 기본형이고, Carbon 섹션에서는
`.estimate-hero-actions .primary-button`처럼 컨텍스트 클래스로 `border-radius: 4px`,
`font-size: 15~16px`, `min-height: 48px`로 오버라이드한다.)

---

## 4. 버튼 규칙

- **Primary 버튼**: 배경 `var(--cds-background-brand, #0f62fe)`, `border-radius: 4px`,
  `color: #fff`, hover 시 `var(--cds-background-brand-hover, #0353e9)`.
- **Ghost/보조 버튼**: 배경 `transparent`, `border: 1px solid var(--cds-border-strong, #8d8d8d)`,
  `color: var(--cds-text-primary)`, hover 시 배경만 `var(--cds-layer, #f4f4f4)`로 채운다
  (테두리색은 hover에도 안 바뀜).
- 기존 전역 `.primary-button` / `.secondary-button` 클래스(구 디자인, `border-radius: 16px`,
  둥근 큰 버튼)는 그대로 두고, Carbon 화면에서는 **자식 셀렉터로 오버라이드**한다
  (예: `.estimate-hero-actions .primary-button { border-radius: 4px; ... }`). 즉 기존
  버튼 컴포넌트/마크업은 재사용하되, 그 화면 전용 클래스로 스타일만 감싸 덮어쓴다.
- 버튼 2개를 나란히 놓을 때(취소/확인, ghost/primary): `display: flex; gap: 12px`, 각 버튼
  `flex: 1`.

---

## 5. 카드 / 컨테이너 패턴

- 기본 카드: `background: var(--cds-background, #ffffff)`,
  `border: 1px solid var(--cds-border-subtle, #e0e0e0)`, `border-radius: 4px`, `padding: 20px`.
  그림자(box-shadow)는 쓰지 않는다 — Carbon은 테두리로 구분한다.
- 카드 헤더는 `eyebrow`(라벨) + `h2`(제목) 조합, 우측에 상태 배지를 둘 때는
  `display: flex; justify-content: space-between; align-items: flex-start`.
- 카드 내부 통계(2열 요약)는 `grid` 또는 `flex`로 배경 `var(--cds-layer, #f4f4f4)`인
  작은 박스 2개를 나란히 배치, 라벨(`span`, secondary color) + 값(`strong`, primary color,
  굵게) 구조.
- 리스트 아이템(견적서 카드 등)은 카드 안에 얇은 구분선(`border-top: 1px solid
  var(--cds-border-subtle)`)으로 나누거나 개별 소카드로 만든다.

---

## 6. 상태 배지 (Status Badge)

```css
background: #edf5ff;
color: var(--cds-background-brand, #0f62fe);
border-radius: 2px;
font-size: 11px;
font-weight: 600;
padding: 5px 10px;
```
에러/경고 상태는 같은 형태에 색만 `#da1e28` 계열로 교체.

---

## 7. 로딩 / 완료(Status) 화면 포맷

`EstimateLoadingPage` / `EstimateDonePage` / `MatchingHomePage`(로딩 상태)가 공유하는 포맷.
새로운 "로딩 중" 또는 "처리 완료" 화면을 만들 때는 이 구조를 그대로 따른다:

```jsx
<div className="estimate-loading">  {/* 또는 estimate-done 등, 레이아웃 공유 */}
  <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
  <div className="estimate-loading-spinner" dangerouslySetInnerHTML={{ __html: loadingCarbonSvg }} />
  <p className="estimate-loading-title">상태 설명 텍스트</p>
</div>
```

- `.estimate-loading`: `flex-direction: column; align-items: center; justify-content: center;
  height: 100%; text-align: center;`
- `.estimate-status-logo`: `width/height: 96px; margin-bottom: 40px;` — 로고를 크게, 애니메이션과
  확실히 떨어뜨린다 (이전에 48px/12px이었던 걸 사용자 피드백으로 키움).
- 로딩/완료 SVG는 **CSS `@keyframes`를 SVG 파일 내부 `<style>` 태그에 직접 삽입**하고
  `?raw` import + `dangerouslySetInnerHTML`로 주입한다. SMIL(`<animate>`)은 headless
  Chromium에서 7~9배 느리게 재생되는 문제가 확인되어 사용하지 않는다.
- 로딩/완료 두 화면은 **레이아웃 클래스를 공유**해서 전환 시 어색함이 없게 한다(로고 크기,
  위치, 간격이 완전히 동일).

---

## 8. 히어로(Hero) / 빈 상태(Empty State) 화면 포맷

`/customer/estimate`, `/customer/matching`의 "아직 데이터 없음" 화면이 공유하는
`.estimate-hero-*` 클래스 세트. 새 서비스의 빈 상태 화면도 이 구조를 그대로 재사용한다:

```
.estimate-hero            (전체 컨테이너, flex column, height 100%)
.estimate-hero-body       (컨텐츠 wrapper)
.estimate-hero-head       (상단 텍스트 영역, text-align center, padding: 8px 24px 0)
.estimate-hero-eyebrow    (작은 브랜드 라벨)
.estimate-hero-title      (메인 타이틀, <br/> 허용)
.estimate-hero-desc       (설명 텍스트)
.estimate-hero-carousel   (미리보기 이미지 캐러셀)
.estimate-hero-slide / .is-active
.estimate-hero-frame / .estimate-hero-frame-img
.estimate-hero-dots / .estimate-hero-dot / .is-active
.estimate-hero-actions    (하단 CTA 버튼 영역, margin-top: auto)
```

캐러셀 로직(자동 슬라이드 `useEffect`, `scrollRef`, `goToIndex`, `handleScroll`)은 화면마다
다르지만 클래스명/시각 스타일은 항상 동일하게 유지한다.

---

## 9. 페이지 헤더(Detail 화면 상단바) 패턴

`EstimateOutputPage` 등 상세 결과 화면에서 쓰는 헤더 구조:

```
.estimate-output-header        (flex, align-items: center, justify-content: space-between)
.estimate-output-back          (뒤로가기 버튼, FaChevronLeft 아이콘 — 원시 SVG 대신 react-icons/fa 사용)
.estimate-output-header-title  (h1 + p)
.estimate-output-header-spacer (뒤로가기 버튼과 대칭 맞추는 빈 공간)
```

뒤로가기 등 단순 아이콘은 인라인 SVG를 새로 그리지 말고 `react-icons/fa`에서 가져다 쓴다
(`import { FaChevronLeft } from 'react-icons/fa'`).

---

## 10. 아이콘

- 승인된 아이콘 라이브러리: `react-icons/fa` (이미 프로젝트 의존성에 포함).
- 사람 얼굴/로고/일러스트가 아닌 단순 UI 아이콘(화살표, 체크, 업로드 등)은 항상 이 라이브러리에서
  가져온다. 새 아이콘 SVG를 직접 그리거나 새 아이콘 패키지를 추가하지 않는다.
- 로고, 브랜드 마크, 애니메이션이 필요한 상태 아이콘(로딩 스피너, 완료 체크)만 `figmaAssets` /
  `assets/figma/*.svg`의 커스텀 에셋을 사용한다.

---

## 11. 레이아웃 컨테이너

- 고객용 화면은 모바일 폭(약 `max-width: 412px`) 컨테이너 안에서 디자인된다. 새 컴포넌트를
  검증할 때도 이 폭을 기준으로 스크린샷을 찍는다.
- 화면 루트는 `CustomerPage` 래퍼로 감싸고, Carbon 색상 토큰이 필요한 화면은
  `<CustomerPage className="cds--white">`로 테마 클래스를 붙인다.

---

## 12. ⚠️ 반드시 지켜야 할 CSS 작업 방식 (중요 버그 회피)

이 프로젝트 빌드 환경에서 **일부 Tailwind 유틸리티 클래스가 간헐적으로 CSS를 생성하지 못하는
버그가 확인되었다.** 영향받는 클래스 예시: `flex`, `absolute`, `inset-0`, `aspect-*`,
`overflow-x-auto`, 가끔 `w-full`.

→ **따라서 Carbon 스타일 신규 마크업에는 Tailwind 유틸리티 클래스에 의존하지 말고, 항상
`App.css`에 전용 커스텀 클래스를 만들어 그 안에서 `display: flex`, `position: absolute` 등을
직접 명시한다.** 기존 Tailwind 유틸리티가 이미 쓰이고 있는 레거시 코드는 건드릴 필요 없지만,
새로 추가하는 Carbon 섹션은 이 규칙을 반드시 따른다.

---

## 13. 검증 절차 (새 화면을 Carbon으로 옮길 때 매번 반복)

1. `App.css`에 해당 화면 전용 클래스 블록 추가 (섹션 주석으로 구분: `/* ===== 화면명 — Carbon
   스타일 ===== */`).
2. 대상 `.jsx` 파일의 JSX만 교체 (state/handler/props는 그대로).
3. `src/main.jsx`에 임시 `DebugHarness`를 추가해 `/debug/topbar` 경로에서 해당 컴포넌트만
   단독 렌더링 (`MemoryRouter` 또는 `BrowserRouter` + 필요한 Provider로 감싸기).
4. `playwright`를 devDependency로 임시 설치, `page.route()`로 API 응답을 모킹해 각 상태
   (로딩/성공/빈 상태/에러 등)를 스크린샷으로 캡처.
5. 스크린샷을 확인해 Carbon 규칙(색상/spacing/radius/타이포)을 지켰는지, 로직이 안 깨졌는지
   확인.
6. **정리(필수)**: `main.jsx`를 원래 상태로 되돌리기 → 임시 `pw-*.mjs` 스크립트 삭제 →
   `npm uninstall playwright` → 개발 서버 프로세스 종료 → `git status` / `git diff --
   src/main.jsx`로 잔여 변경 없는지 확인 → `npx vite build`로 최종 빌드 성공 확인.
7. 사용자에게 한국어로 변경 요약 보고 (건드린 파일/클래스, 로직 보존 여부, 공유 클래스 재사용
   여부, 의도적으로 건드리지 않은 화면 명시).

---

## 14. 지금까지 Carbon으로 전환된 화면 목록

- `EstimateLoadingPage`, `EstimateDonePage` (로고 확대, 간격 조정)
- `EstimateOutputPage` (헤더, 요약 카드, 상세 섹션, 액션 버튼 전면 재설계)
- `MatchingHomePage` — 빈 상태(`ServiceHero`, `.estimate-hero-*` 재사용), 로딩 상태
  (`.estimate-loading` 재사용), 진행중 매칭 카드(`.matching-current-*` 신규)
- `MatchingEstimateSelectPage`(`/customer/matching/estimate`) — 로딩 상태(`.estimate-loading` +
  `loadingCarbonSvg` 재사용), 빈/에러 상태(`.matching-select-status-*` 신규, `estimate-done`류
  포맷 참고), 견적서 카드 목록(`.matching-select-*` 신규, 상태 배지는 공유 컴포넌트
  `MatchingStatusBadge` 재사용)
- `MatchingAddressListPage`(`/customer/matching/address`) — 검색 폼/결과 목록/선택된 주소 카드
  전면 재설계(`.matching-addr-*` 신규)
- `MatchingSchedulePage`(`/customer/matching/schedule`) — 날짜/시간 입력을 상단 영역
  (`.matching-schedule-top`, `flex:1; justify-content:center`로 남는 공간 안에서 수직 중앙 정렬)에,
  긴급 수리 요청 버튼·상태 메시지·취소/제출 액션을 하단 영역(`.matching-schedule-bottom`, gap
  16px로 서로 붙여서 표시)에 묶는 2단 구조로 재편. `.matching-schedule-screen`에
  `padding-bottom: 88px`을 줘서 하단 고정 네비게이션(`.bottom-nav`, 64px)에 취소/제출 버튼이
  가려지지 않도록 함. 날짜/시계 아이콘은 커스텀 PNG 대신
  `react-icons/fa`(`FaRegCalendarAlt`, `FaRegClock`)로 교체, 긴급 버튼 아이콘도
  `FaExclamationTriangle`로 교체(가이드 10번 원칙 — 단순 UI 아이콘은 react-icons 사용).
  긴급 버튼 배경은 에러 레드(`#da1e28`) 대신 경고/긴급 색(`#ff832b`, 1번 색상 표 참고. `--cds-support-warning`
  변수는 실제 Yellow로 정의되어 있어 사용하지 않고 hex 리터럴로 직접 지정)으로 톤 조정.
  긴급 확인 모달(`UrgentModal`)도 레거시 `.modal-overlay`/`.modal-card`(하단 시트, 24px 라운드) 대신
  중앙 정렬 `.urgent-modal-*` 신규 클래스로 재설계, 아이콘은 기존 `error.svg`(에즈지프 프레임 시퀀스,
  Carbon과 무관한 보라빛 `#3C3CFF` 블롭 애니메이션이라 부적합 판단) 대신 새로 제작한
  `assets/figma/urgent-alert.svg`(경고 색 원형 배지 + CSS `@keyframes` pulse 링, `loading-carbon.svg`와
  동일한 경량 패턴) 사용. `error.svg`는 `MatchingEstimateSelectPage`의 에러/빈 상태 아이콘으로 계속
  쓰이므로 그대로 둠(공용 에셋이라 내용은 수정하지 않고 새 전용 SVG를 추가하는 방식 선택).
- (미전환, 의도적으로 유지) `MatchingDonePage` — 구 클래스(`current-matching-panel` 등) 사용 중
- `RiskHomePage`(`/customer/risk`) — 빈 상태(`ServiceHero`, `.estimate-hero-*` 재사용, 콘텐츠만
  리스크 리포트 문구로 교체)
- `RiskSelectPage`(`/customer/risk/select`) — 로딩 상태(`.estimate-loading` + `loadingCarbonSvg`
  재사용), 빈 상태(`.matching-select-status` + `errorSvg` 재사용, 로직은 원래대로 `estimates.length
  === 0` 하나로만 판단하고 별도 에러 상태를 새로 만들지 않음), 견적서 카드 목록은 신규
  `.risk-select-*` 클래스(담당 시공자 줄이 추가로 있어 `matching-select-card`와 완전히 같지는
  않음), 상태 배지는 공유 클래스 `.matching-status-badge`를 컴포넌트 없이 직접 사용
- `RiskLoadingPage` / `RiskDonePage` — `.estimate-loading` / `.estimate-done` 레이아웃 그대로 재사용,
  로고·SVG도 `loadingCarbonSvg` / `confirmCarbonSvg`로 교체(레거시 `loading.svg` / `confirm.svg`,
  `Logo` 컴포넌트 확대 방식 제거)
- `RiskOutputPage`(`/customer/risk/output`) — 헤더는 `EstimateOutputPage` 패턴을 그대로 따르되
  화면 전용 `.risk-output-header-*` 클래스로 새로 만듦(9번 항목 원칙: 다른 화면 영향 차단).
  점수/등급 통계 박스, 카드, 섹션 구분선(`.risk-output-section + .risk-output-section`으로 인접
  형제만 구분선 부여 — 중간 카테고리가 조건부로 비어 있어도 항상 올바른 위치에 구분선이
  그려지도록 `border-top` 방식 채택), 체크리스트(번호 원형 배지), 세부 위험 요소 목록(불릿)
  전부 신규 `.risk-output-*` 클래스. 이모지(🚨💰⚠️📝🔍)는 전부 삭제하고 `react-icons/fa`
  (`FaExclamationTriangle`, `FaCoins`, `FaShieldAlt`, `FaFileContract`, `FaSearch`)로 교체(10번
  항목 원칙). 리스크 등급 색상은 `.risk-output-grade.is-low/is-medium/is-high`로 LOW=성공 그린,
  MEDIUM=경고 오렌지, HIGH=에러 레드(1번 색상 표 기준) 매핑.
- `ChatListPage`(`/customer/chat`) — 커스텀 PNG 아이콘 제목(`chat.png`)을 다른 리스트류 화면과
  동일하게 일반 텍스트 `<h1>`로 교체(아이콘 삭제), 필터 탭은 알약(pill) 버튼 대신 Carbon
  underline 탭(`.chat-inbox-filter`, 활성 시 하단 2px 브랜드 블루 보더)으로 재설계, 목록은
  카드형이 아닌 얇은 구분선 리스트(`.chat-inbox-item`)로 재구성(리스트 항목이 많을 수 있는
  화면이라 카드보다 Carbon structured-list 쪽이 적합하다고 판단). 안읽음 배지는 브랜드 블루
  원형(`.chat-inbox-item-badge`, `border-radius: 999px` — 배지이므로 pill 허용 규칙에 해당).
- `ChatRoomPage`(`/customer/chat/room`) — 헤더는 `EstimateOutputPage`/`RiskOutputPage`와 같은
  뒤로가기+제목+spacer 패턴을 참고해 화면 전용 `.chat-thread-view-header` 등으로 신규 작성,
  뒤로가기 아이콘은 커스텀 PNG(`figmaAssets.back`) 대신 다른 상세 화면들과 통일되게
  `FaChevronLeft`로 교체. 메시지 말풍선은 Carbon 4px 라운드 사각형으로(과도하게 둥근 iMessage류
  버블 지양), 내 메시지만 브랜드 블루 배경. 검색 하이라이트(`mark.search-highlight`)는 이전에
  전혀 스타일이 없던 클래스였는데 이번에 노란색 배경으로 새로 정의. 채팅방 메뉴는 기존과 동일하게
  **우측에서 슬라이드 인되는 드로어 방향은 유지**하면서(기능/상호작용 방향은 안 건드림) 색상·
  라운드·구분선만 Carbon화(`.chat-thread-menu-panel`), 그림자는 `urgent-modal` 패턴처럼 배경 딤
  처리로 대체하고 없앰. 메뉴 아이템 이모지(⚙️🖼️📎⭐🚪)는 전부 `react-icons/fa`
  (`FaCog`, `FaImage`, `FaPaperclip`, `FaStar`, `FaSignOutAlt`)로 교체, 나가기 항목만 에러 레드.
  검색 결과 이동 오버레이(◀▶ 유니코드 화살표)도 `FaChevronLeft`/`FaChevronRight`로 교체.
  **정리**: 이 파일(`ChatPage.jsx`)이 유일한 소비자였던 구버전 `.chat-list-screen`,
  `.chat-page-title`, `.chat-filter`, `.chat-thread`, `.chat-empty`, `.chat-room-screen`,
  `.chat-room-head`, `.chat-room-title`, `.chat-room-actions`, `.message-list`, `.message`,
  `.chat-compose`, `.chat-search-bar`, `.chat-search-header`, `.chat-search-btn`, `.chat-menu*`
  CSS 전체를 App.css에서 완전히 삭제함(다른 화면 어디서도 참조하지 않는 것을 grep으로 확인 후
  진행) — 지난 `RiskOutputPage` 작업에서 죽은 CSS와 새 클래스명이 우연히 겹쳐 버그가 난 사례가
  있어서, 이번엔 사용처가 없어진 만큼 아예 지워서 향후 같은 이름 재사용 시 충돌할 여지를
  없앴다. `.inline-back-arrow`(다른 레거시 화면들이 공유)와 `.menu-icon`(채팅과 무관하게 이미
  죽어있던 클래스)은 범위 밖이라 손대지 않음.
- **버그 수정**: `RiskOutputPage`의 "핵심 리스크 요약" 카드가 항목이 많아지면 카드 자체가 내부
  스크롤로 잘리는 문제 발견 → 원인은 `App.css`에 이미 죽어 있던(더 이상 어떤 JSX에서도 쓰이지
  않는) 구버전 `.risk-output-card` 규칙(`overflow: auto; flex: 1 1 auto; min-height: 0;` 포함,
  `.risk-output-screen`/`.risk-output-fixed-head`/`.risk-output-title-row` 등과 한 세트)이 이번에
  새로 만든 Carbon `.risk-output-card`와 클래스 이름이 우연히 겹쳐서, 새 규칙이 명시적으로
  덮어쓰지 않은 속성(`overflow`, `flex`, `min-height`, `width`)이 옛 규칙에서 그대로 새어 들어온
  것. 죽은 블록 전체를 삭제해서 해결함. **교훈**: 새 Carbon 클래스를 만들기 전에 항상 `grep`으로
  같은 이름이 이미 파일 어딘가에 없는지 확인할 것(3번/4번 원칙에 있는 "새 클래스 이름"이 정말로
  새 이름인지 검증 필요).
- `MyPages.jsx` 전체(`/customer/mypage`, `/customer/mypage/matching-history`,
  `/customer/mypage/reviews`, `/customer/mypage/profile`) — `.record-card`/`.history-page`/
  `.search-shell`/`.review-card`/`.info-panel`/`.estimate-result-*`/`.mypage-*`/`.profile-*`가
  `MyPages.jsx` · `EstimatePages.jsx`의 `MyEstimateListPage` · `RiskPages.jsx`의
  `MyRiskListPage`에서만 쓰이는 것을 grep으로 확인한 뒤(다른 레거시 화면은 참조하지 않음)
  기존 클래스명을 그대로 재사용하며 전면 Carbon화. 마이페이지 홈의 5개 메뉴는 2열×3행
  이미지 타일 그리드 대신 세로 리스트(`.mypage-menu-item`, 48px 브랜드 틴트 아이콘 타일 +
  라벨 + `FaChevronRight`)로 배치를 바꿈 — 항목이 5개라 그리드로는 마지막 줄이 어중간하게
  남고, Carbon은 설정류 화면에 구조화 리스트를 선호하기 때문. 아이콘은 `figmaAssets`의
  타일 이미지 대신 `react-icons/fa`(`FaClipboardList`, `FaFileInvoiceDollar`, `FaShieldAlt`,
  `FaRegStar`, `FaUserCircle`)로 교체(10번 원칙), 48px 타일 안에 22px 크기로 넣어 마이페이지
  아이콘이 커야 한다는 요청을 충족. 프로필 사진은 기존 `figmaAssets.mypageProfilePhoto` SVG를
  그대로 재사용(2번 원칙, 브랜드 틴트 원형 배경만 새로 추가).
  매칭 히스토리·내가 쓴 리뷰 리스트는 `.history-page` 레이아웃(헤더/검색행/스크롤영역 3단
  그리드)을 그대로 유지한 채 시각 스타일만 Carbon화. 히스토리·견적서·리스크·리뷰 카드가
  모두 쓰던 `.record-card`(좌측 88px 사이드바 + 색상별 left-border 그리드)를 Carbon 카드
  1종(테두리만, 그림자 없음, 상단 날짜/제목 + 상태 배지 헤더, 하단 label:value 행)으로
  통일 — 4개 리스트 화면이 전부 동일한 카드 룩을 쓰도록 해서 "일관성 있게" 요청에 맞춤.
  프로필 모달(정보 수정/로그아웃·탈퇴 확인)과 리뷰 작성 모달, `EstimatePages.jsx`의
  `EstimateResultModal`, `RiskPages.jsx`의 `RiskReportModal`을 전부 `.estimate-result-overlay`/
  `.estimate-result-modal`/`.estimate-result-head`/`.estimate-result-actions` 모달 셸 하나로
  통합(기존엔 `.mypage-review-*` 전용 클래스가 따로 있었고 리스크 모달은 Tailwind 유틸리티로
  직접 그려져 있었음 — 12번 원칙 위반이라 이번에 걷어냄). `RiskReportModal`은
  `RiskOutputPage`가 쓰던 `.risk-output-stat-row`/`.risk-output-grade`/`.risk-output-card`/
  `.risk-output-section`/`.risk-output-checklist`/`.risk-output-bullet-list`를 그대로 재사용해
  전체 리스크 화면과 모달이 동일한 룩을 갖게 함(3번 원칙), 이모지(💰⚠️📝🔍)는
  `FaCoins`/`FaShieldAlt`/`FaFileContract`/`FaSearch`로 교체. `MyEstimateListPage`/
  `MyRiskListPage`의 뒤로가기 버튼도 `figmaAssets.back` + Tailwind 조합 대신 다른 상세
  화면들과 통일되게 `FaChevronLeft` 기반 `.mypage-list-back`으로 교체.
  **버그 수정**: `MenuTile`(마이페이지 메뉴 행)의 아이콘이 브랜드 블루가 아니라 검정으로
  렌더링되는 문제 발견 → `.mypage-menu-item span`(요소 선택자, 특이도 0,1,1)이 아이콘을 감싸는
  `.mypage-menu-icon`(클래스 선택자, 특이도 0,1,0)보다 특이도가 높아서 아이콘 색을
  덮어썼음(라벨 span과 아이콘 span이 같은 부모 안에 둘 다 `<span>`이라 발생). 라벨에
  `.mypage-menu-label` 클래스를 새로 붙여 분리하고 `.mypage-menu-item span` 규칙을
  `.mypage-menu-label`로 좁혀서 해결. 같은 패턴으로 `.mypage-hero-card p`가 브랜드블루
  eyebrow(`.mypage-hero-eyebrow`, 이것도 `<p>`)를 덮어쓰는 문제도 함께 발견해
  `.mypage-hero-card p:not(.mypage-hero-eyebrow)`로 수정. **교훈**: 같은 부모 안에 같은
  태그(`span`/`p` 등)가 여러 역할로 쓰일 때는 항상 전용 클래스로 구분할 것 — 요소 선택자
  기반 스코프 규칙은 특이도가 예상보다 높아서 나중에 추가한 전용 클래스 규칙을 조용히
  덮어쓸 수 있다. 이번엔 `playwright`로 실제 스크린샷을 찍어서 발견함(13번 검증 절차의
  가치를 재확인).
- **후속 수정 (`MyPages.jsx`)**: `/customer/mypage/profile`의 `.info-row`가 flex
  `justify-content: space-between`라 라벨 길이에 따라 값의 시작 위치가 행마다 들쭉날쭉했던
  문제를 `display:grid; grid-template-columns: 112px 1fr 14px`로 바꿔 모든 행의 라벨/값/화살표
  열이 고정폭으로 맞춰지게 수정. `/customer/mypage` 홈은 뒤로가기 화살표 대신 우측 상단
  닫기(X, `FaTimes`) 버튼으로 교체해 `go(screens.home)`로 `/customer/home`으로 나가도록 변경
  (`MyPage` 컴포넌트는 더 이상 `back` prop을 쓰지 않음, 헤더는 기존 `.mypage-list-back` 클래스
  재사용 + 좌우 위치만 스왑).
- **후속 수정 (`MatchingPages.jsx`)**: `/customer/matching/estimate`(`MatchingEstimateSelectPage`)
  에서 `loadStatus==='error'`(서버 에러)와 `loadStatus==='empty'`(생성된 AI 견적서 없음)가
  같은 `.matching-select-status-icon` 블록에서 `errorSvg` 하나를 공유하고 있었는데, "없음"
  케이스만 `MatchingSchedulePage`의 긴급 버튼에서 쓰던 `urgentAlertSvg`
  (`assets/figma/urgent-alert.svg`, 이미 이 파일에 import되어 있던 자산)로 교체
  (`loadStatus === 'error' ? errorSvg : urgentAlertSvg`). 실제 네트워크 에러 상태는 기존
  `errorSvg` 그대로 유지. 아이콘 래퍼(`.matching-select-status-icon`)가 이미 내부 `svg`를
  100% 크기로 스케일링하는 규칙을 갖고 있어 CSS 변경 없이 마크업의 svg 문자열만 바꿔서
  해결됨(2번 원칙: 새 자산을 만들지 않고 프로젝트에 이미 있는 에셋 재사용).
