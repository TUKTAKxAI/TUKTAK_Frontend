import { ChoiceCard } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { BackButton, Field, Logo, PrimaryButton } from '../../components/customer/FormControls'
import { screens, signupTerms } from '../../data/customerData'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  login,
  signupCustomer,
  checkEmailAvailability,
} from '../../services/authService'
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function AuthPages({
  screen,
  setScreen,
  go,
  back,
  userType,
  setUserType,
  terms,
  setTerms,
}) {

  const { login: authLogin } = useAuth()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    phoneCarrier: 'KT',
    address: '',
    detailAddress: '',
  })

  const handleLogin = async () => {
    try {
      const result = await login(
        loginData.email,
        loginData.password
      );

      authLogin(result);

      setScreen(screens.home);

    } catch (err) {
      const detail = err.response?.data?.detail;

      // 이메일 형식이 잘못된 경우(422)
      if (Array.isArray(detail)) {
        alert("올바른 이메일 형식으로 입력해주세요.");
        return;
      }

      // 로그인 실패
      if (
        detail === "Invalid email or password" ||
        detail === "Invalid credentials"
      ) {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      alert(
        typeof detail === "string"
          ? detail
          : "로그인에 실패했습니다."
      );
    }
  };

  const handleCheckEmail = async () => {

    if (!signupData.email) {
      alert("이메일을 입력해주세요.")
      return
    }

    try {

      const result = await checkEmailAvailability(
        signupData.email
      )

      if (result.available) {
        setEmailCheckResult(true);
      } else {
        setEmailCheckResult(false);
      }

      setCheckedEmail(signupData.email);

    } catch {
      setEmailCheckResult(null);
      alert("확인에 실패했습니다.");
    }

  }

  const isValidPassword = (password) => {
    // 8~20자, 영문, 숫자, 특수문자 포함
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;

    return passwordRegex.test(password);
  };

  const isValidNickname = (nickname) => {
    return nickname.trim().length >= 2;
  };

  const handleSignup = async () => {
    if (!isValidPassword(signupData.password)) {
      alert(
        "비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다."
      );
      return;
    }

    if (
      signupData.password !==
      signupData.passwordConfirm
    ) {

      alert("비밀번호가 일치하지 않습니다.")

      return
    }

    if (!isValidNickname(signupData.nickname)) {
      alert("닉네임은 2글자 이상 입력해주세요.");
      return;
    }

    const agreements = [

      {
        terms_type: "TERMS_OF_SERVICE",
        terms_version: "1.0",
        is_agreed: terms[0],
      },

      {
        terms_type: "PRIVACY_POLICY",
        terms_version: "1.0",
        is_agreed: terms[1],
      },

      {
        terms_type: "IMAGE_ANALYSIS",
        terms_version: "1.0",
        is_agreed: terms[2],
      },

      {
        terms_type: "MATCHING_INFO",
        terms_version: "1.0",
        is_agreed: terms[3],
      },

    ]

    try {

      await signupCustomer({
        name: signupData.name,
        nickname: signupData.nickname,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,

        address: signupData.address,
        detail_address: signupData.detailAddress,

        agreements,
      })

      go(screens.welcome)

    } catch (err) {
      alert(JSON.stringify(err.response?.data, null, 2));
    }

  }

  const [selectedRole, setSelectedRole] = useState("customer");

  // null : 아직 확인 안 함
  // true : 사용 가능
  // false : 이미 가입됨
  const [emailCheckResult, setEmailCheckResult] = useState(null);

  const [checkedEmail, setCheckedEmail] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupPasswordConfirm, setShowSignupPasswordConfirm] = useState(false);

  const isRequiredTermsChecked = terms.slice(0, 4).every(Boolean);

  const [showTermsModal, setShowTermsModal] = useState(false);

  const [addressKeyword, setAddressKeyword] = useState("");
  const [addressList, setAddressList] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const resetSignupForm = () => {
    setSignupData({
      name: '',
      nickname: '',
      email: '',
      password: '',
      passwordConfirm: '',
      phone: '',
      phoneCarrier: 'KT',
      address: '',
      detailAddress: '',
    });

    setEmailCheckResult(null);
    setCheckedEmail("");

    setShowSignupPassword(false);
    setShowSignupPasswordConfirm(false);

    setTerms([false, false, false, false]);

    setUserType("customer");

    setAddressKeyword("");
    setAddressList([]);
    setShowAddressModal(false);
  };

  const searchAddress = async () => {
    if (addressKeyword.trim().length < 2) {
      alert("주소를 2글자 이상 입력해주세요.");
      return;
    }

    try {
      const params = new URLSearchParams({
        confmKey: import.meta.env.VITE_JUSO_KEY,
        currentPage: "1",
        countPerPage: "10",
        keyword: addressKeyword,
        resultType: "json",
      });

      const response = await fetch(
        `https://business.juso.go.kr/addrlink/addrLinkApi.do?${params}`
      );

      const data = await response.json();

      if (data.results.common.errorCode !== "0") {
        alert(data.results.common.errorMessage);
        return;
      }

      setAddressList(data.results.juso || []);

    } catch (error) {
      console.error(error);
      alert("주소 검색 실패");
    }
  };

  if (screen === screens.login) {
    return (
      <section className="auth-screen login-screen">
        <Logo size="large" />

        <div className="login-row">
          <h1>로그인</h1>

          <div className="role-toggle">
            <button
              type="button"
              className={selectedRole === "customer" ? "active" : ""}
              onClick={() => setSelectedRole("customer")}
            >
              고객
            </button>

            <button
              type="button"
              className={selectedRole === "partner" ? "active" : ""}
              onClick={() => setSelectedRole("partner")}
            >
              파트너
            </button>
          </div>
        </div>

        <label className="field">
          <input
            type="email"
            placeholder="아이디"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                email: e.target.value,
              })
            }
          />
        </label>

        <label className="field">
          <input
            type={showLoginPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                password: e.target.value,
              })
            }
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
          >
            {showLoginPassword ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
        </label>

        <PrimaryButton onClick={handleLogin}>
          로그인
        </PrimaryButton>

        <div className="divider">- 혹은 -</div>

        <p className="muted center">SNS로 로그인</p>

        <div className="sns-row">
          <button>
            <img src={figmaAssets.kakao} alt="카카오" />
          </button>
          <span />
          <button>
            <img src={figmaAssets.google} alt="구글" />
          </button>
          <span />
          <button>
            <img src={figmaAssets.naver} alt="네이버" />
          </button>
        </div>

        <button
          className="link-row"
          onClick={() => {
            resetSignupForm();
            go(screens.signup);
          }}
        >
          회원가입 | 아이디 찾기 | 비밀번호 찾기
        </button>
      </section>
    )
  }

  if (screen === screens.signup) {
    return (
      <section className="auth-screen signup-screen">
        <Logo />
        <h2 className="hero-copy">
          회원가입을 통해<br />
          수리 관련 서비스를<br />
          경험하세요
        </h2>

        <label className="field">
          <input
            placeholder="이름"
            value={signupData.name}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                name: e.target.value,
              })
            }
          />
        </label>


        <label className="field">
          <input
            type="email"
            placeholder="이메일"
            value={signupData.email}
            onChange={(e) => {
              setSignupData({
                ...signupData,
                email: e.target.value,
              });

              setEmailCheckResult(null);
              setCheckedEmail("");
            }}
          />
          <button
            type="button"
            onClick={handleCheckEmail}
          >
            중복확인
          </button>
        </label>

        {emailCheckResult === true && (
          <p className="email-guide success">
            사용 가능한 이메일입니다.
          </p>
        )}

        {emailCheckResult === false && (
          <p className="email-guide invalid">
            이미 가입된 이메일입니다.
          </p>
        )}

        <label className="field">
          <input
            type={showSignupPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={signupData.password}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                password: e.target.value,
              })
            }
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowSignupPassword(!showSignupPassword)}
          >
            {showSignupPassword ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
        </label>

        <p
          className={`password-guide ${signupData.password &&
            !isValidPassword(signupData.password)
            ? "invalid"
            : ""
            }`}
        >
          영문, 숫자, 특수문자를 포함한 8~20자
        </p>

        <label className="field">
          <input
            type={showSignupPasswordConfirm ? "text" : "password"}
            placeholder="비밀번호 확인"
            value={signupData.passwordConfirm}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                passwordConfirm: e.target.value,
              })
            }
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowSignupPasswordConfirm(!showSignupPasswordConfirm)
            }
          >
            {showSignupPasswordConfirm ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
        </label>

        <label className="field">
          <input
            placeholder="닉네임"
            value={signupData.nickname}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                nickname: e.target.value,
              })
            }
          />
        </label>

        <p
          className={`password-guide ${signupData.nickname &&
            !isValidNickname(signupData.nickname)
            ? "invalid"
            : ""
            }`}
        >
          닉네임은 2글자 이상 입력해주세요.
        </p>

        <PrimaryButton
          onClick={() => {
            if (!signupData.name.trim()) {
              alert("이름을 입력해주세요.")
              return
            }

            if (!signupData.email.trim()) {
              alert("이메일을 입력해주세요.")
              return
            }

            if (
              emailCheckResult !== true ||
              checkedEmail !== signupData.email
            ) {
              alert("이메일 중복확인을 진행해주세요.");
              return
            }

            if (!signupData.password) {
              alert("비밀번호를 입력해주세요.")
              return
            }

            if (!isValidPassword(signupData.password)) {
              alert(
                "비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다."
              );
              return
            }

            if (signupData.password !== signupData.passwordConfirm) {
              alert("비밀번호가 일치하지 않습니다.")
              return
            }

            if (!signupData.nickname.trim()) {
              alert("닉네임을 입력해주세요.")
              return
            }

            if (!isValidNickname(signupData.nickname)) {
              alert("닉네임은 2글자 이상 입력해주세요.");
              return;
            }

            go(screens.userType)
          }}
        >
          회원가입 하기
        </PrimaryButton>

        <button
          className="link-row"
          onClick={() => {
            resetSignupForm();
            setScreen(screens.login);
          }}
        >
          이미 아이디가 있어요
        </button>
      </section>
    )
  }

  if (screen === screens.userType) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">어떤 사용자신가요?</h2>
        <ChoiceCard active={userType === 'customer'} onClick={() => setUserType('customer')} title="고객" text="파트너에게 수리를 맡겨보세요" />
        <ChoiceCard active={userType === 'partner'} onClick={() => setUserType('partner')} title="파트너" text="시공이 필요한 고객을 만나보세요" />
        <PrimaryButton narrow onClick={() => go(screens.terms)}>다음</PrimaryButton>
      </section>
    )
  }

  if (screen === screens.terms) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />

        <h2 className="hero-copy huge">
          고객님의 가입을 위해 약관에 동의해주세요
        </h2>

        <div className="terms-panel docked">
          <button
            className="small-outline"
            onClick={() => setShowTermsModal(true)}
          >
            약관 자세히보기
          </button>

          {signupTerms.map((item, index) => (
            <label className="check-line" key={item}>
              <input
                type="checkbox"
                checked={terms[index]}
                onChange={() =>
                  setTerms((current) =>
                    current.map((value, valueIndex) =>
                      valueIndex === index ? !value : value
                    )
                  )
                }
              />
              <span>{item}</span>
            </label>
          ))}

          <div className="button-row sticky-row">
            <PrimaryButton
              orange
              onClick={back}
            >
              취소
            </PrimaryButton>

            <PrimaryButton
              onClick={() => go(screens.phone)}
              disabled={!isRequiredTermsChecked}
            >
              동의 및 진행
            </PrimaryButton>
          </div>
        </div>

        {showTermsModal && (
          <div
            className="terms-modal-overlay"
            onClick={() => setShowTermsModal(false)}
          >
            <div
              className="terms-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>서비스 이용약관</h3>

              <div className="terms-modal-content">
                <p>
                  여기는 임시 약관 내용입니다.
                </p>

                <p>
                  추후 백엔드 또는 PDF와 연결하여 실제 약관을
                  보여주면 됩니다.
                </p>

                <div className="terms-modal-content">
                  <h4>1. [필수] 개인정보 수집 및 이용 동의</h4>

                  <p><strong>1) 수집 항목</strong></p>
                  <p>
                    이름, 휴대전화 번호, 서비스 이용기록, 기기 정보,
                    (매칭 시) 시공 희망 주소지
                  </p>

                  <p><strong>2) 수집 목적</strong></p>
                  <p>
                    서비스 가입 및 본인 인증, 시공 견적 산출,
                    고객 상담 및 CS 처리
                  </p>

                  <p><strong>3) 보유 및 이용기간</strong></p>
                  <p>
                    회원 탈퇴 시 즉시 파기
                    (단, 관계 법령에 따라 보존이 필요한 경우
                    해당 법령에서 정한 기간 동안 보관)
                  </p>

                  <p>
                    • 귀하는 동의를 거부할 권리가 있으나,
                    거부 시 서비스 가입 및 견적 산출이 제한됩니다.
                  </p>

                  <hr />

                  <h4>2. [필수] AI 품질 검사를 위한 이미지 데이터 처리 동의</h4>

                  <p><strong>1) 수집 항목</strong></p>
                  <p>
                    사용자가 직접 촬영하여 업로드한
                    시공 부위 사진 및 영상
                  </p>

                  <p><strong>2) 수집 및 이용 목적</strong></p>

                  <ul>
                    <li>
                      딥러닝(CNN) AI 모델을 활용한 이미지 유효성
                      (시공 부위 식별) 사전 검사
                    </li>

                    <li>
                      파손 심각도 및 수리 범위 1차 판별,
                      자동 견적 산출을 위한 데이터 분석
                    </li>

                    <li>
                      AI 엔진 고도화를 위한
                      비식별화(익명화)된 학습 데이터 활용
                    </li>
                  </ul>

                  <p><strong>3) 유의사항</strong></p>

                  <p>
                    업로드된 이미지 내에 개인을 식별할 수 있는 정보
                    (가족사진, 얼굴, 거울에 비친 모습 등)가
                    포함되지 않도록 주의하여 주시기 바랍니다.
                  </p>

                  <hr />

                  <h4>3. [필수] 시공 매칭을 위한 제3자(시공자) 정보 제공 동의</h4>

                  <p><strong>1) 제공받는 자</strong></p>

                  <p>
                    본 플랫폼과 제휴된 해당 지역 시공 파트너
                    (매칭된 시공자에 한함)
                  </p>

                  <p><strong>2) 제공하는 항목</strong></p>

                  <ul>
                    <li>
                      <strong>매칭 전</strong> :
                      동/읍/면 단위의 대략적 위치,
                      시공 희망 부위 사진,
                      AI 견적 리포트
                    </li>

                    <li>
                      <strong>매칭 후</strong> :
                      이름,
                      안심번호(또는 휴대전화 번호),
                      상세 주소
                    </li>
                  </ul>

                  <p><strong>3) 제공 목적</strong></p>

                  <p>
                    현장 방문, 정확한 견적 안내,
                    시공 서비스 제공 및 분쟁 해결
                  </p>

                  <p><strong>4) 보유 및 이용기간</strong></p>

                  <p>
                    시공 완료 및 하자보수(AS) 기간 종료 후 즉시 파기
                  </p>
                </div>

                <p>
                  ----------------------------------------
                </p>

                <p>
                  개인정보 수집 및 이용 동의 내용...
                </p>

                <p>
                  AI 이미지 분석 동의 내용...
                </p>

                <p>
                  제3자 정보 제공 동의 내용...
                </p>
              </div>

              <button
                className="primary-button narrow"
                onClick={() => setShowTermsModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (screen === screens.phone) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">고객님의 전화번호를 <br />알려주세요</h2>

        <div className="phone-row">
          <select
            value={signupData.phoneCarrier}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                phoneCarrier: e.target.value,
              })
            }
          >
            <option value="SKT">SKT</option>
            <option value="KT">KT</option>
            <option value="LG U+">LG U+</option>
          </select>

          <label className="field compact">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="XXX-XXXX-XXXX"
              value={signupData.phone}
              onChange={(e) => {
                const phone = e.target.value.replace(/\D/g, "");

                let formatted = phone;

                if (phone.length > 3 && phone.length <= 7) {
                  formatted = `${phone.slice(0, 3)}-${phone.slice(3)}`;
                } else if (phone.length > 7) {
                  formatted = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`;
                }

                setSignupData({
                  ...signupData,
                  phone: formatted,
                });
              }}
            />
          </label>
        </div>

        <PrimaryButton
          narrow
          onClick={() => go(screens.address)}
          disabled={!signupData.phone.trim()}
        >
          다음
        </PrimaryButton>

        <button
          className="link-row"
          onClick={() => go(screens.address)}
        >
          건너뛰기
        </button>
      </section>
    )
  }

  if (screen === screens.address) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />

        <h2 className="hero-copy compact">
          고객님의 주소를 <br />알려주세요
        </h2>

        <button
          className="input-like"
          type="button"
          onClick={() => {
            setAddressKeyword("");
            setAddressList([]);
            setShowAddressModal(true);
          }}
        >
          주소 검색
        </button>

        <label className="field compact">
          <input
            value={signupData.address}
            placeholder="검색한 주소가 표시됩니다."
            readOnly
          />
        </label>

        <label className="field compact">
          <input
            placeholder="상세 주소 입력 (ex : 202동 301호)"
            value={signupData.detailAddress}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                detailAddress: e.target.value,
              })
            }
          />
        </label>

        <PrimaryButton
          narrow
          onClick={handleSignup}
          disabled={!signupData.address.trim()}
        >
          다음
        </PrimaryButton>

        <button
          className="link-row"
          onClick={handleSignup}
        >
          건너뛰기
        </button>

        {showAddressModal && (
          <div
            className="terms-modal-overlay"
            onClick={() => setShowAddressModal(false)}
          >
            <div
              className="terms-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <h3>주소 검색</h3>

              <div className="address-search-row">
                <input
                  className="address-search-input"
                  placeholder="도로명 주소를 입력하세요"
                  value={addressKeyword}
                  onChange={(e) => setAddressKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchAddress();
                  }}
                />

                <button
                  className="address-search-btn"
                  onClick={searchAddress}
                >
                  검색
                </button>
              </div>

              <div className="address-result-list">

                {addressList.length === 0 ? (
                  <div className="empty-result">
                    🔍 검색 결과가 없습니다.
                  </div>
                ) : (
                  addressList.map((addr) => (
                    <button
                      key={addr.bdMgtSn}
                      className="address-item"
                      onClick={() => {
                        setSignupData(prev => ({
                          ...prev,
                          address: addr.roadAddr,
                        }));

                        setShowAddressModal(false);
                      }}
                    >
                      <div className="address-main">
                        {addr.roadAddr}
                      </div>

                      <div className="address-sub">
                        우편번호 {addr.zipNo}
                      </div>
                    </button>
                  ))
                )}

              </div>

              <button
                className="primary-button narrow"
                onClick={() => setShowAddressModal(false)}
              >
                닫기
              </button>

            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="auth-screen complete-screen">
      <Logo />
      <div className="complete-copy">
        <h2>고객님, 환영합니다 !</h2>
        <p>회원가입이 완료되었어요</p>
      </div>
      <div className="status-ring success">✓</div>
      <PrimaryButton narrow onClick={() => setScreen(screens.home)}>완료</PrimaryButton>
    </section>
  )
}
