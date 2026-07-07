import { ChoiceCard } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { BackButton, Logo, PrimaryButton } from '../../components/customer/FormControls'
import { JusoSearchModal } from '../../components/customer/JusoSearchModal'
import { screens, signupTerms } from '../../data/customerData'
import {
  contractorRegionTree,
  contractorScreens,
  contractorServiceTree,
  partnerSignupTerms,
} from '../../data/contractorData'
import { contractorScreenPaths } from '../../routes/contractorRoutes'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import {
  login,
  signupCustomer,
  signupPartner,
  checkEmailAvailability,
} from '../../services/authService'
import { searchJusoAddresses } from '../../api/jusoApi'
import { clearLocalTestState } from '../../api/client'
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";

const toSelectionGroups = (tree) =>
  tree.map((group) => ({
    key: group.category,
    label: group.category,
    items: group.options.map((option) => ({
      id: option,
      label: option,
    })),
  }))

const categoryGroups = toSelectionGroups(contractorServiceTree)
const regionGroups = toSelectionGroups(contractorRegionTree)

function MultiSelectPanel({ groups, selected, onToggle, onReset, footerLabel, maxCount }) {
  const [activeGroupKey, setActiveGroupKey] = useState(groups[0]?.key)
  const activeGroup = groups.find((group) => group.key === activeGroupKey) || groups[0]

  return (
    <div className="select-panel">
      <div className="select-panel-body">
        <div className="sidebar-list">
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              className={activeGroupKey === group.key ? 'active' : ''}
              onClick={() => setActiveGroupKey(group.key)}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="item-list">
          {activeGroup?.items.map((item) => {
            const isSelected = selected.some((selectedItem) => selectedItem.id === item.id)

            return (
              <label className={`item-row ${isSelected ? 'selected' : ''}`} key={item.id}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    onToggle({
                      id: item.id,
                      label: item.label,
                      groupKey: activeGroup.key,
                      groupLabel: activeGroup.label,
                    })
                  }
                />
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="select-panel-footer">
        <div className="footer-count-row">
          <span>
            {footerLabel} {selected.length} / {maxCount}
          </span>
          <button type="button" className="reset-button" onClick={onReset}>
            초기화
          </button>
        </div>

        <div className="chip-row">
          {selected.map((item) => (
            <span className="chip" key={item.id}>
              {item.label}
              <button type="button" onClick={() => onToggle(item)}>
                x
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

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

  // 약관 유형/버전 + 체크박스 상태(terms)로 서버에 보낼 agreements 배열 생성
  const buildAgreementsPayload = () =>
    agreementTermsTypes.map((type, index) => ({
      terms_type: type,
      terms_version: "1.0",
      is_agreed: !!terms[index],
    }))

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
    zipNo: '',
    regionCodeId: null,
  })

  // 파트너 전용 데이터
  // (이름/이메일/비밀번호/전화번호는 signupData 를 공용으로 사용합니다)
  const [partnerSignupData, setPartnerSignupData] = useState({
    categories: [],           // [{id, label, groupKey, groupLabel}]
    businessRegFile: null,
    businessNumber: '',       // 사업자등록번호 (수동 입력)
    companyName: '',
    ownerName: '',
    companyPhone: '',
    businessStatus: '',       // TODO: 백엔드가 허용하는 실제 값(enum) 확인 필요
    companyAddress: '',
    companyDetailAddress: '',
    companyZipNo: '',
    companyRegionCodeId: null,
    workRegions: [],          // [{id, label, groupKey, groupLabel}]
  })


  const handleLogin = async () => {
    try {
      await login(
        loginData.email,
        loginData.password
      );

      if (selectedRole === "partner") {
        go(contractorScreenPaths[contractorScreens.home]);
      } else {
        go(screens.home);
      }

      await authLogin();

    } catch (err) {
      // client.js 의 응답 인터셉터가 에러를 normalizeError()로 감싸면서
      // err.response 가 아니라 err.data 에 서버 응답 본문을 담아줍니다.
      const detail = err.data?.detail;

      // 이메일 형식이 잘못된 경우(422)
      if (Array.isArray(detail)) {
        alert("올바른 이메일 형식으로 입력해주세요.");
        return;
      }

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

  // 파트너 카테고리/지역 선택 토글 헬퍼
  const togglePartnerSelection = (field, item, max) => {
    setPartnerSignupData((prev) => {
      const exists = prev[field].some((x) => x.id === item.id)

      if (exists) {
        return { ...prev, [field]: prev[field].filter((x) => x.id !== item.id) }
      }

      if (prev[field].length >= max) {
        alert(`최대 ${max}개까지 선택할 수 있습니다.`)
        return prev
      }

      return { ...prev, [field]: [...prev[field], item] }
    })
  }

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

    const agreements = buildAgreementsPayload()

    try {

      await signupCustomer({
        name: signupData.name,
        nickname: signupData.nickname,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        default_address_json: signupData.address.trim()
          ? {
            address: signupData.address,
            address_detail: signupData.detailAddress.trim(),
            zip_no: signupData.zipNo,
            region_code_id: signupData.regionCodeId,
          }
          : null,
        agreements,
      });

      await login(signupData.email, signupData.password);
      go(screens.welcome)
      await authLogin();

    } catch (err) {
      const detail = err.data?.detail;
      alert(
        typeof detail === "string"
          ? detail
          : JSON.stringify(err.data ?? err.message, null, 2)
      );
    }

  }

  // 파트너 최종 가입 처리 (작업지역 선택 화면의 "다음"에서 호출)
  const handlePartnerSignup = async () => {

    if (!isValidPassword(signupData.password)) {
      alert(
        "비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다."
      );
      return;
    }

    if (signupData.password !== signupData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    if (!isValidNickname(signupData.nickname)) {
      alert("닉네임은 2글자 이상 입력해주세요.");
      return;
    }

    if (partnerSignupData.categories.length === 0) {
      alert("전문 분야를 1개 이상 선택해주세요.")
      return
    }

    if (!partnerSignupData.businessRegFile) {
      alert("사업자등록증을 업로드해주세요.")
      return
    }

    if (!partnerSignupData.businessNumber.trim()) {
      alert("사업자등록번호를 입력해주세요.")
      return
    }

    if (!partnerSignupData.companyName.trim()) {
      alert("업체명을 입력해주세요.")
      return
    }

    if (!partnerSignupData.businessStatus) {
      alert("사업자 구분을 선택해주세요.")
      return
    }

    if (!partnerSignupData.companyAddress.trim()) {
      alert("업체 주소를 입력해주세요.")
      return
    }

    if (partnerSignupData.workRegions.length === 0) {
      alert("작업 지역을 1개 이상 선택해주세요.")
      return
    }

    const agreements = buildAgreementsPayload()

    try {
      // TODO: businessRegFile 은 File 객체입니다. 지금은 백엔드가 이 필드를
      // 빈 값({})으로 받아도 검증 에러를 내지 않아 임시로 그대로 두었지만,
      // 실제 파일 업로드는 multipart/form-data 또는 presigned URL 방식으로
      // 별도 구현이 필요합니다. authService.js 의 signupPartner 를 조정하세요.
      await signupPartner({
        name: signupData.name,
        nickname: signupData.nickname,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        business_registration_file: partnerSignupData.businessRegFile,
        business_number: partnerSignupData.businessNumber,
        business_name: partnerSignupData.companyName,
        representative_name: partnerSignupData.ownerName,
        contact_phone: partnerSignupData.companyPhone,
        business_status: partnerSignupData.businessStatus,
        company_address_json: {
          address: partnerSignupData.companyAddress,
          address_detail: partnerSignupData.companyDetailAddress.trim(),
          zip_no: partnerSignupData.companyZipNo,
          region_code_id: partnerSignupData.companyRegionCodeId,
        },
        category_ids: partnerSignupData.categories.map((c) => c.id),
        work_region_ids: partnerSignupData.workRegions.map((r) => r.id),
        agreements,
      })

      await login(signupData.email, signupData.password);
      go(screens.welcome)
      await authLogin();
    } catch (err) {
      const detail = err.data?.detail;
      alert(
        typeof detail === "string"
          ? detail
          : JSON.stringify(err.data ?? err.message, null, 2)
      );
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

  const currentSignupTerms = userType === 'partner' ? partnerSignupTerms : signupTerms;

  const isRequiredTermsChecked = terms.slice(0, 4).every(Boolean);

  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCompanyAddressModal, setShowCompanyAddressModal] = useState(false);

  // 사업자등록증 이미지 미리보기 (PDF 등 이미지가 아닌 파일은 미리보기 없이 파일명만 표시)
  const [businessRegPreviewUrl, setBusinessRegPreviewUrl] = useState(null);

  useEffect(() => {
    const file = partnerSignupData.businessRegFile;

    if (!file || !file.type?.startsWith('image/')) {
      setBusinessRegPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setBusinessRegPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [partnerSignupData.businessRegFile]);

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
      zipNo: '',
      regionCodeId: null,
    });

    setPartnerSignupData({
      categories: [],
      businessRegFile: null,
      businessNumber: '',
      companyName: '',
      ownerName: '',
      companyPhone: '',
      businessStatus: '',
      companyAddress: '',
      companyDetailAddress: '',
      companyZipNo: '',
      companyRegionCodeId: null,
      workRegions: [],
    });

    setEmailCheckResult(null);
    setCheckedEmail("");

    setShowSignupPassword(false);
    setShowSignupPasswordConfirm(false);

    setTerms([false, false, false, false, false]);

    setUserType("customer");

    setShowAddressModal(false);
    setShowCompanyAddressModal(false);
  };

  const resetLocalTestState = () => {
    clearLocalTestState();
    setLoginData({ email: '', password: '' });
    resetSignupForm();
    alert("로컬 테스트 데이터가 초기화되었습니다.");
  };

  const searchAddress = async () => {
    if (addressKeyword.trim().length < 2) {
      alert("주소를 2글자 이상 입력해주세요.");
      return;
    }

    try {
      const data = await searchJusoAddresses({
        keyword: addressKeyword,
        currentPage: 1,
        countPerPage: 10,
      });

      setAddressList(data.items || []);

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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
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

        <button
          className="link-row"
          type="button"
          onClick={resetLocalTestState}
        >
          테스트 데이터 초기화
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

  // 유형 선택: 고객/파트너 모두 다음은 공용 terms 화면으로 이동
  // (terms 화면 안에서 userType 에 따라 문구/약관/다음 이동지가 분기됩니다)
  if (screen === screens.userType) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">어떤 사용자신가요?</h2>
        <ChoiceCard active={userType === 'customer'} onClick={() => setUserType('customer')} title="고객" text="시공자에게 수리를 맡겨보세요" />
        <ChoiceCard active={userType === 'partner'} onClick={() => setUserType('partner')} title="파트너" text="시공이 필요한 고객을 만나보세요" />
        <PrimaryButton narrow onClick={() => go(screens.terms)}>다음</PrimaryButton>
      </section>
    )
  }

  // 약관 동의 - 고객/파트너 공용 화면, 문구/약관목록/다음 이동지만 분기
  if (screen === screens.terms) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />

        <h2 className="hero-copy huge">
          <strong>{userType === 'partner' ? '파트너' : '고객'}</strong>님의 가입을 위해 약관에 동의해주세요
        </h2>

        <div className="terms-panel docked">
          <button
            className="small-outline"
            onClick={() => setShowTermsModal(true)}
          >
            약관 자세히보기
          </button>

          {currentSignupTerms.map((item, index) => (
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
              onClick={() =>
                go(userType === 'partner' ? screens.category : screens.phone)
              }
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

                {userType !== 'partner' && (
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
                )}

                {userType === 'partner' && (
                  <div className="terms-modal-content">
                    <p>
                      {/* TODO: 파트너용 약관 상세 내용으로 교체 */}
                      파트너 서비스 이용약관 / 시공 표준(시방서) 준수 및
                      하자보수(AS) 정책 / 고객 매칭을 위한 프로필 정보 공개
                      관련 상세 내용을 이곳에 채워주세요.
                    </p>
                  </div>
                )}
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

  // ---------------------------------------------------------------
  // 파트너 전용: 전문 분야 선택
  // ---------------------------------------------------------------
  if (screen === screens.category) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">
          <strong>파트너</strong>님의 전문 분야를<br />알려주세요
        </h2>

        <MultiSelectPanel
          groups={categoryGroups}
          selected={partnerSignupData.categories}
          onToggle={(item) => togglePartnerSelection('categories', item, 999)}
          onReset={() => setPartnerSignupData((prev) => ({ ...prev, categories: [] }))}
          footerLabel="선택한 분야"
          maxCount={999}
        />

        <PrimaryButton
          narrow
          onClick={() => go(screens.bizReg)}
          disabled={partnerSignupData.categories.length === 0}
        >
          다음
        </PrimaryButton>
      </section>
    )
  }

  // ---------------------------------------------------------------
  // 파트너 전용: 사업자등록증 업로드 + 사업자등록번호 수동 입력
  // ---------------------------------------------------------------
  if (screen === screens.bizReg) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">
          <strong>파트너</strong>님의<br />사업자등록증을<br />업로드해주세요
        </h2>

        <label className="upload-box">
          <input
            type="file"
            accept="image/*,.pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setPartnerSignupData((prev) => ({ ...prev, businessRegFile: file }))
              }
            }}
          />

          {businessRegPreviewUrl ? (
            <img
              src={businessRegPreviewUrl}
              alt="사업자등록증 미리보기"
              className="upload-preview-image"
            />
          ) : partnerSignupData.businessRegFile ? (
            <span className="upload-filename">
              {partnerSignupData.businessRegFile.name}
            </span>
          ) : (
            <FaCamera size={32} />
          )}
        </label>

        <label className="field">
          <input
            inputMode="numeric"
            maxLength={12}
            placeholder="사업자등록번호 (예: 123-45-67890)"
            value={partnerSignupData.businessNumber}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10)

              let formatted = digits

              if (digits.length > 3 && digits.length <= 5) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
              } else if (digits.length > 5) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`
              }

              setPartnerSignupData((prev) => ({
                ...prev,
                businessNumber: formatted,
              }))
            }}
          />
        </label>

        <PrimaryButton
          narrow
          onClick={() => go(screens.companyInfo)}
          disabled={
            !partnerSignupData.businessRegFile ||
            !partnerSignupData.businessNumber.trim()
          }
        >
          다음
        </PrimaryButton>
      </section>
    )
  }

  // ---------------------------------------------------------------
  // 파트너 전용: 업체 정보 (업체 주소 검색 포함)
  // ---------------------------------------------------------------
  if (screen === screens.companyInfo) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">
          <strong>파트너</strong>님의<br />업체 정보를<br />입력해주세요
        </h2>

        <label className="field">
          <input
            placeholder="업체명"
            value={partnerSignupData.companyName}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, companyName: e.target.value })
            }
          />
        </label>

        <label className="field">
          <input
            placeholder="업체 대표 이름"
            value={partnerSignupData.ownerName}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, ownerName: e.target.value })
            }
          />
        </label>

        <label className="field">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={13}
            placeholder="업체 전화번호"
            value={partnerSignupData.companyPhone}
            onChange={(e) => {
              const phone = e.target.value.replace(/\D/g, "");

              let formatted = phone;

              if (phone.length > 3 && phone.length <= 7) {
                formatted = `${phone.slice(0, 3)}-${phone.slice(3)}`;
              } else if (phone.length > 7) {
                formatted = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`;
              }

              setPartnerSignupData({ ...partnerSignupData, companyPhone: formatted });
            }}
          />
        </label>

        {/* TODO: 실제 백엔드가 허용하는 business_status 값 목록으로 옵션을 맞춰주세요 */}
        <label className="field">
          <select
            value={partnerSignupData.businessStatus}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, businessStatus: e.target.value })
            }
            style={{ width: '100%', border: 0, background: 'transparent' }}
          >
            <option value="">사업자 구분 선택</option>
            <option value="INDIVIDUAL">개인사업자</option>
            <option value="CORPORATE">법인사업자</option>
          </select>
        </label>

        <button
          className="input-like"
          type="button"
          onClick={() => setShowCompanyAddressModal(true)}
        >
          주소 검색
        </button>

        <label className="field compact">
          <input
            value={partnerSignupData.companyAddress}
            placeholder="검색한 주소가 표시됩니다."
            readOnly
          />
        </label>

        <label className="field compact">
          <input
            placeholder="업체 상세 주소"
            value={partnerSignupData.companyDetailAddress}
            onChange={(e) =>
              setPartnerSignupData({
                ...partnerSignupData,
                companyDetailAddress: e.target.value,
              })
            }
          />
        </label>

        <PrimaryButton
          narrow
          onClick={() => go(screens.phone)}
          disabled={
            !partnerSignupData.companyName.trim() ||
            !partnerSignupData.businessStatus ||
            !partnerSignupData.companyAddress.trim()
          }
        >
          다음
        </PrimaryButton>

        {showCompanyAddressModal ? (
          <JusoSearchModal
            onClose={() => setShowCompanyAddressModal(false)}
            onSelect={(item) => {
              setPartnerSignupData((current) => ({
                ...current,
                companyAddress: item.roadAddr,
                companyZipNo: item.zipNo || '',
                companyRegionCodeId: item.admCd || null,
              }))
              setShowCompanyAddressModal(false)
            }}
          />
        ) : null}
      </section>
    )
  }

  // 전화번호 - 고객/파트너 공용 (문구, 다음 이동지, 건너뛰기 노출 여부만 분기)
  if (screen === screens.phone) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">
          <strong>{userType === 'partner' ? '파트너' : '고객'}</strong>님의 전화번호를 <br />알려주세요
        </h2>

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
          onClick={() =>
            go(userType === 'partner' ? screens.region : screens.address)
          }
          disabled={!signupData.phone.trim()}
        >
          다음
        </PrimaryButton>

        {/* 파트너는 시안상 건너뛰기 노출 안 됨 (필수 단계) */}
        {userType !== 'partner' && (
          <button
            className="link-row"
            onClick={() => go(screens.address)}
          >
            건너뛰기
          </button>
        )}
      </section>
    )
  }

  // 고객 전용: 주소 입력
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
          onClick={() => setShowAddressModal(true)}
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

        {showAddressModal ? (
          <JusoSearchModal
            onClose={() => setShowAddressModal(false)}
            onSelect={(item) => {
              setSignupData((current) => ({
                ...current,
                address: item.roadAddr,
                detailAddress: current.detailAddress,
                zipNo: item.zipNo || '',
                regionCodeId: item.admCd || null,
              }))
              setShowAddressModal(false)
            }}
          />
        ) : null}

      </section>
    );
  }

  // ---------------------------------------------------------------
  // 파트너 전용: 작업 지역 선택 (마지막 단계 -> 바로 가입 처리)
  // ---------------------------------------------------------------
  if (screen === screens.region) {
    return (
      <section className="auth-screen">
        <BackButton onClick={back} />
        <Logo />
        <h2 className="hero-copy compact">
          <strong>파트너</strong>님의 작업 지역을<br />선택하세요
        </h2>

        <MultiSelectPanel
          groups={regionGroups}
          selected={partnerSignupData.workRegions}
          onToggle={(item) => togglePartnerSelection('workRegions', item, 10)}
          onReset={() => setPartnerSignupData((prev) => ({ ...prev, workRegions: [] }))}
          footerLabel="선택한 곳"
          maxCount={10}
        />

        <PrimaryButton
          narrow
          onClick={handlePartnerSignup}
          disabled={partnerSignupData.workRegions.length === 0}
        >
          다음
        </PrimaryButton>
      </section>
    )
  }

  // 완료 화면 - 고객/파트너 공용, 문구만 분기
  return (
    <section className="auth-screen complete-screen">
      <Logo />
      <div className="complete-copy">
        <h2>{userType === 'partner' ? '파트너' : '고객'}님, 환영합니다 !</h2>
        <p>회원가입이 완료되었어요</p>
      </div>
      <div className="status-ring success">✓</div>
      <PrimaryButton
        narrow
        onClick={() =>
          userType === 'partner'
            ? go(contractorScreenPaths[contractorScreens.home])
            : go(screens.home)
        }
      >
        완료
      </PrimaryButton>
    </section>
  )
}
