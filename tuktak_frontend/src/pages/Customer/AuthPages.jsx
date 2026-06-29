import { ChoiceCard } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { BackButton, Field, Logo, PrimaryButton, SecondaryButton } from '../../components/customer/FormControls'
import { screens, terms as termLabels } from '../../data/customerData'

export function AuthPages({ screen, setScreen, go, back, userType, setUserType, terms, setTerms }) {
  if (screen === screens.login) {
    return (
      <section className="auth-screen login-screen">
        <Logo size="large" />
        <div className="login-row">
          <h1>로그인</h1>
          <div className="role-toggle" aria-label="사용자 유형">
            <button className="active">고객</button>
            <button onClick={() => setUserType('partner')}>파트너</button>
          </div>
        </div>
        <Field placeholder="아이디" />
        <Field placeholder="비밀번호" type="password" action="보기" />
        <PrimaryButton onClick={() => setScreen(screens.home)}>로그인</PrimaryButton>
        <div className="divider">- 혹은 -</div>
        <p className="muted center">SNS로 로그인</p>
        <div className="sns-row">
          <button><img src={figmaAssets.kakao} alt="카카오" /></button>
          <span />
          <button><img src={figmaAssets.google} alt="구글" /></button>
          <span />
          <button><img src={figmaAssets.naver} alt="네이버" /></button>
        </div>
        <button className="link-row" onClick={() => go(screens.signup)}>
          회원가입 | 아이디 찾기 | 비밀번호 찾기
        </button>
      </section>
    )
  }

  if (screen === screens.signup) {
    return (
      <section className="auth-screen">
        <Logo />
        <h2 className="hero-copy">회원가입을 통해 수리 관련 서비스를 경험하세요</h2>
        <Field placeholder="이름" />
        <Field placeholder="아이디" action="중복확인" />
        <Field placeholder="이메일" action="중복확인" />
        <Field placeholder="비밀번호" type="password" action="보기" />
        <Field placeholder="비밀번호 확인" type="password" action="보기" />
        <PrimaryButton onClick={() => go(screens.userType)}>회원가입 하기</PrimaryButton>
        <button className="link-row" onClick={() => setScreen(screens.login)}>이미 아이디가 있어요</button>
      </section>
    )
  }

  if (screen === screens.userType) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">어떤 사용자신가요?</h2>
        <ChoiceCard active={userType === 'customer'} onClick={() => setUserType('customer')} title="고객" text="고객 파트너에게 수리를 맡겨보세요" />
        <ChoiceCard active={userType === 'partner'} onClick={() => setUserType('partner')} title="파트너" text="파트너 시공이 필요한 고객을 만나보세요" />
        <PrimaryButton onClick={() => go(screens.terms)}>다음</PrimaryButton>
      </section>
    )
  }

  if (screen === screens.terms) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 가입을 위해 약관에 동의해주세요</h2>
        <div className="terms-panel">
          {termLabels.map((item, index) => (
            <label className="check-line" key={item}>
              <input
                type="checkbox"
                checked={terms[index]}
                onChange={() =>
                  setTerms((values) => values.map((value, valueIndex) => (valueIndex === index ? !value : value)))
                }
              />
              <span>{index < 4 ? '(필수)' : '(선택)'} {item}</span>
            </label>
          ))}
          <button className="small-outline">약관 자세히보기</button>
        </div>
        <div className="button-row">
          <SecondaryButton onClick={back}>취소</SecondaryButton>
          <PrimaryButton onClick={() => go(screens.phone)}>동의 및 진행</PrimaryButton>
        </div>
      </section>
    )
  }

  if (screen === screens.phone) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 전화번호를 알려주세요</h2>
        <div className="phone-row">
          <select defaultValue="KT">
            <option>KT</option>
            <option>SKT</option>
            <option>LG U+</option>
          </select>
          <Field placeholder="XXX - XXXX - XXXX" />
        </div>
        <PrimaryButton narrow onClick={() => go(screens.address)}>다음</PrimaryButton>
        <button className="link-row" onClick={() => go(screens.address)}>건너뛰기</button>
      </section>
    )
  }

  if (screen === screens.address) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 주소를 알려주세요</h2>
        <button className="input-like">주소 검색</button>
        <Field placeholder="상세 주소 입력 (ex : 202동 301호)" />
        <PrimaryButton narrow onClick={() => go(screens.welcome)}>다음</PrimaryButton>
        <button className="link-row" onClick={() => go(screens.welcome)}>건너뛰기</button>
      </section>
    )
  }

  return (
    <section className="auth-screen">
      <Logo />
      <h2 className="hero-copy compact">고객님, 환영합니다!</h2>
      <p className="muted wide">TUKTAK에서 빠르게 견적을 받고 믿을 수 있는 파트너를 만나보세요</p>
      <PrimaryButton narrow onClick={() => setScreen(screens.home)}>완료</PrimaryButton>
    </section>
  )
}
