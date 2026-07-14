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
- (미전환, 의도적으로 유지) `MatchingDonePage` — 구 클래스(`current-matching-panel` 등) 사용 중
