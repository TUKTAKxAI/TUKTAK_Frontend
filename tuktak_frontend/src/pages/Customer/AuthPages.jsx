import { ChoiceCard } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { BackButton, PrimaryButton } from '../../components/customer/FormControls'
import { JusoSearchModal } from '../../components/customer/JusoSearchModal'
import confirmCarbonSvg from '../../assets/figma/confirm-carbon.svg?raw'
import { screens, signupTerms } from '../../data/customerData'
import { contractorScreens, partnerSignupTerms } from '../../data/contractorData'
import { contractorScreenPaths } from '../../routes/contractorRoutes'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/authContext'
import {
  login,
  signupCustomer,
  signupPartner,
  checkEmailAvailability,
} from '../../services/authService'
import {
  fetchReferenceCodes,
  fetchServiceTasks,
  updateContractorServices,
} from '../../services/contractorService'
import { clearAuthTokens } from '../../api/client'
import { categoryGroups, regionGroups } from '../../data/signupCategoryData'
import { formatPhoneNumber, isValidPhoneNumber } from '../../utils/phone'
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

const PREFERRED_ROLE_KEY = 'tuktak_preferred_role'

function setPreferredRole(role) {
  window.localStorage.setItem(PREFERRED_ROLE_KEY, role)
}

// ----------------------------------------------------------------------------
// 회원가입 온보딩 단계 화면들이 공유하는 상단 헤더 (뒤로가기 + 로고 마크 + 워드마크)
// 로그인 화면의 .login-shell-bar 와 동일한 룩을 씀
// ----------------------------------------------------------------------------
function AuthStepHeader({ back }) {
  return (
    <div className="auth-step-header">
      <BackButton onClick={back} />
      <img src={figmaAssets.logoMark} alt="TUKTAK" className="auth-step-header-logo" />
      <span className="auth-step-header-wordmark">TUKTAK</span>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 분야 선택 / 작업지역 선택에 공용으로 쓰는 좌-우 패널 컴포넌트
// (파트너 "전문 분야" 화면과 "작업 지역" 화면이 동일한 UI 패턴이라 재사용)
// ----------------------------------------------------------------------------
function MultiSelectPanel({ groups, selected, onToggle, onReset, footerLabel, maxCount, hideCount }) {
  const [activeGroupKey, setActiveGroupKey] = useState(groups[0]?.key)

  const activeGroup = groups.find((g) => g.key === activeGroupKey) || groups[0]
  const effectiveActiveGroupKey = activeGroup?.key

  return (
    <div className="select-panel">
      <div className="select-panel-body">
        <div className="sidebar-list">
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              className={effectiveActiveGroupKey === group.key ? "active" : ""}
              onClick={() => setActiveGroupKey(group.key)}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="item-list">
          {activeGroup?.items.map((item) => {
            const isSelected = selected.some((s) => s.id === item.id)

            return (
              <label
                key={item.id}
                className={`item-row ${isSelected ? "selected" : ""}`}
              >
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
        <div className={`footer-count-row ${hideCount ? "reset-only" : ""}`}>
          {!hideCount && (
            <span>
              {footerLabel} {selected.length} / {maxCount}
            </span>
          )}

          <button type="button" className="reset-button" onClick={onReset}>
            ↻ 초기화
          </button>
        </div>

        <div className="chip-row">
          {selected.map((item) => (
            <span className="chip" key={item.id}>
              {item.label}
              <button type="button" onClick={() => onToggle(item)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// 전화번호 자릿수 부족 등, 서버 검증 에러 대신 미리 보여주는 안내 모달
function AuthErrorModal({ message, onClose }) {
  if (!message) return null

  return (
    <div className="auth-terms-modal-overlay" onClick={onClose}>
      <div className="auth-error-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="auth-error-modal-title">입력을 확인해주세요</h3>
        <p className="auth-error-modal-body">{message}</p>
        <button className="auth-error-modal-close" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  )
}

function getUserRole(user) {
  const currentUser = user?.data?.user ?? user?.data ?? user?.user ?? user
  return String(currentUser?.user_type || currentUser?.userType || currentUser?.role || currentUser?.type || '').toUpperCase()
}

const normalizeSignupId = (value) => (value === undefined || value === null ? '' : String(value))
const uniqueSignupIds = (values = []) => [...new Set(values.map(normalizeSignupId).filter(Boolean))]
const numericSignupIds = (values = []) => uniqueSignupIds(values).filter((value) => /^\d+$/.test(value))

function buildSignupServiceGroups(tasks = []) {
  const groups = tasks.reduce((acc, task) => {
    const key = task.main_category || '기타'
    if (!acc[key]) {
      acc[key] = {
        key,
        label: key,
        items: [],
      }
    }
    acc[key].items.push({
      id: normalizeSignupId(task.service_task_id),
      label: task.task_name,
    })
    return acc
  }, {})

  return Object.values(groups)
}

function buildSignupRegionGroups(codes = []) {
  const parents = codes.filter((code) => !code.parent_code_id)
  const children = codes.filter((code) => code.parent_code_id)

  if (parents.length === 0) {
    return codes.length > 0
      ? [{
          key: 'region',
          label: '지역',
          items: codes.map((code) => ({
            id: normalizeSignupId(code.code_id),
            label: code.code_name,
          })),
        }]
      : []
  }

  return parents.map((parent) => ({
    key: normalizeSignupId(parent.code_id),
    label: parent.code_name,
    items: children
      .filter((child) => normalizeSignupId(child.parent_code_id) === normalizeSignupId(parent.code_id))
      .map((child) => ({
        id: normalizeSignupId(child.code_id),
        label: child.code_name,
      })),
  })).filter((group) => group.items.length > 0)
}

function hasContractorAccess(user) {
  const role = getUserRole(user)
  if (role === 'CONTRACTOR' || role === 'BOTH' || role === 'PARTNER') return true

  const currentUser = user?.data?.user ?? user?.data ?? user?.user ?? user
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
  return roles.some((item) => {
    const normalized = String(item?.role || item?.name || item).toUpperCase()
    return normalized === 'CONTRACTOR' || normalized === 'BOTH' || normalized === 'PARTNER'
  })
}

function hasCustomerAccess(user) {
  const role = getUserRole(user)
  if (!role || role === 'CUSTOMER' || role === 'BOTH' || role === 'USER') return true

  const currentUser = user?.data?.user ?? user?.data ?? user?.user ?? user
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
  return roles.some((item) => {
    const normalized = String(item?.role || item?.name || item).toUpperCase()
    return normalized === 'CUSTOMER' || normalized === 'BOTH' || normalized === 'USER'
  })
}

// 약관 유형 코드 - 백엔드 app/core/agreements.py 의 get_agreement_catalog() 기준.
// 고객/파트너 구분 없이 이 4개만 존재하며, 전부 필수(is_required=True)입니다.
// terms_version 은 settings.xxx_version 값과 정확히 일치해야 하며, 지금은
// "1.0"으로 하드코딩되어 있습니다. 나중에 백엔드에서 약관 버전을 올리면
// (.env 의 terms_of_service_version 등) 여기도 같이 맞춰줘야 합니다.
const agreementTermsTypes = [
  "TERMS_OF_SERVICE",
  "PRIVACY_POLICY",
  "IMAGE_ANALYSIS",
  "MATCHING_INFO",
]

export function AuthPages({
  screen,
  setScreen,
  go,
  back,
  userType,
  setUserType,
  terms,
  setTerms,
  initialSelectedRole = "customer",
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
  const [partnerServiceGroups, setPartnerServiceGroups] = useState(categoryGroups)
  const [partnerRegionGroups, setPartnerRegionGroups] = useState(regionGroups)

  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchServiceTasks().catch(() => []),
      fetchReferenceCodes({ code_group: 'REGION' }).catch(() => []),
    ]).then(([tasks, codes]) => {
      if (ignore) return

      const nextServiceGroups = buildSignupServiceGroups(tasks)
      const nextRegionGroups = buildSignupRegionGroups(codes)

      if (nextServiceGroups.length > 0) {
        setPartnerServiceGroups(nextServiceGroups)
      }

      if (nextRegionGroups.length > 0) {
        setPartnerRegionGroups(nextRegionGroups)
      }
    })

    return () => {
      ignore = true
    }
  }, [])


  const handleLogin = async () => {
    try {
      await login(
        loginData.email,
        loginData.password
      );

      const currentUser = await authLogin();
      if (selectedRole === "partner") {
        if (hasContractorAccess(currentUser)) {
          setPreferredRole("partner");
          go(contractorScreenPaths[contractorScreens.home]);
          return;
        }

        alert("파트너 등록이 필요합니다. 기존 계정 정보로 파트너 등록을 이어갑니다.");
        clearAuthTokens();
        setUserType("partner");
        setSignupData((current) => ({
          ...current,
          email: loginData.email,
          password: loginData.password,
          passwordConfirm: loginData.password,
        }));
        setEmailCheckResult(false);
        setCheckedEmail(loginData.email);
        go(screens.userType);
        return;
      }

      if (!hasCustomerAccess(currentUser)) {
        alert("고객 서비스 등록이 필요합니다. 기존 계정 정보로 고객 등록을 이어갑니다.");
        clearAuthTokens();
        setUserType("customer");
        setSignupData((current) => ({
          ...current,
          email: loginData.email,
          password: loginData.password,
          passwordConfirm: loginData.password,
        }));
        setEmailCheckResult(false);
        setCheckedEmail(loginData.email);
        go(screens.userType);
        return;
      }

      setPreferredRole("customer");
      go(screens.home);

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

  const getSignupErrorMessage = (detail, roleLabel) => {
    if (detail === "Existing account password does not match") {
      return "이미 가입된 이메일입니다. 기존 계정 비밀번호를 입력해주세요."
    }

    if (detail === "Account already has customer access") {
      return "이미 고객으로 가입된 계정입니다. 로그인해주세요."
    }

    if (detail === "Account already has contractor access") {
      return "이미 파트너로 등록된 계정입니다. 로그인해주세요."
    }

    if (detail === "Phone does not match existing account") {
      return `기존 계정의 휴대폰번호와 달라 ${roleLabel} 등록을 진행할 수 없어요.`
    }

    if (typeof detail === "string") return detail
    return JSON.stringify(detail ?? "회원가입에 실패했습니다.", null, 2)
  }

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
      alert(getSignupErrorMessage(detail ?? err.data ?? err.message, "고객"));
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

    const selectedServiceTaskIds = numericSignupIds(partnerSignupData.categories.map((category) => category.id))

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

    const selectedRegionCodeIds = numericSignupIds(partnerSignupData.workRegions.map((region) => region.id))

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
        category_ids: selectedServiceTaskIds.map(Number),
        work_region_ids: selectedRegionCodeIds.map(Number),
        agreements,
      })

      await login(signupData.email, signupData.password);
      await updateContractorServices(
        selectedServiceTaskIds.flatMap((serviceTaskId) => (
          selectedRegionCodeIds.map((regionCodeId) => ({
            service_task_id: Number(serviceTaskId),
            region_code_id: Number(regionCodeId),
            experience_years: null,
            minimum_visit_fee: null,
            service_radius_km: null,
            is_active: true,
          }))
        ))
      )
      go(screens.welcome)
      await authLogin();
    } catch (err) {
      const detail = err.data?.detail;
      alert(getSignupErrorMessage(detail ?? err.data ?? err.message, "파트너"));
    }
  }

  const [selectedRole, setSelectedRole] = useState(initialSelectedRole === "partner" ? "partner" : "customer");

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

  // 전화번호 자릿수가 부족할 때 alert 대신 보여줄 안내 모달 메시지
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCompanyAddressModal, setShowCompanyAddressModal] = useState(false);

  // 사업자등록증 이미지 미리보기 (PDF 등 이미지가 아닌 파일은 미리보기 없이 파일명만 표시)
  const businessRegPreviewUrl = useMemo(() => {
    const file = partnerSignupData.businessRegFile;

    if (!file || !file.type?.startsWith('image/')) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [partnerSignupData.businessRegFile]);

  useEffect(() => {
    return () => {
      if (businessRegPreviewUrl) {
        URL.revokeObjectURL(businessRegPreviewUrl);
      }
    };
  }, [businessRegPreviewUrl]);

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
    setPhoneErrorMessage("");

    setShowSignupPassword(false);
    setShowSignupPasswordConfirm(false);

    setTerms([false, false, false, false, false]);

    setUserType("customer");

    setShowAddressModal(false);
    setShowCompanyAddressModal(false);
  };


  if (screen === screens.login) {
    return (
      <section className="login-screen cds--white">
        <header className="login-shell-bar">
          <img src={figmaAssets.logoMark} alt="TUKTAK" className="login-shell-logo" />
          <span className="login-shell-wordmark">TUKTAK</span>
        </header>

        <div className="login-body">
          <h1 className="login-heading">로그인</h1>

          <div className="login-role-switcher" role="group" aria-label="로그인 유형">
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

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="login-email">아이디</label>
            <div className="carbon-field-control">
              <input
                id="login-email"
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
            </div>
          </div>

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="login-password">비밀번호</label>
            <div className="carbon-field-control">
              <input
                id="login-password"
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
                className="carbon-password-toggle"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                aria-label={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showLoginPassword ? (
                  <FaEye size={18} />
                ) : (
                  <FaEyeSlash size={18} />
                )}
              </button>
            </div>
          </div>

          <PrimaryButton onClick={handleLogin}>
            로그인
          </PrimaryButton>

          {selectedRole === "customer" && (
            <>
              <div className="carbon-divider">또는</div>

              <p className="carbon-sns-label">SNS로 로그인</p>

              <div className="carbon-sns-row">
                <button type="button">
                  <img src={figmaAssets.kakao} alt="카카오" />
                </button>
                <button type="button">
                  <img src={figmaAssets.google} alt="구글" />
                </button>
                <button type="button">
                  <img src={figmaAssets.naver} alt="네이버" />
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className={`carbon-link-row ${selectedRole === "partner" ? "carbon-link-row-spaced" : ""}`}
            onClick={() => {
              resetSignupForm();
              go(screens.signup);
            }}
          >
            회원가입 | 아이디 찾기 | 비밀번호 찾기
          </button>
        </div>
      </section>
    )
  }

  if (screen === screens.signup) {
    return (
      <section className="signup-screen cds--white">
        <header className="signup-shell-bar">
          <img src={figmaAssets.logoMark} alt="TUKTAK" className="signup-shell-logo" />
          <span className="signup-shell-wordmark">TUKTAK</span>
        </header>

        <div className="signup-body">
          <h1 className="signup-heading">회원가입</h1>
          <p className="signup-subheading">
            회원가입을 통해 수리 관련 서비스를 경험하세요
          </p>

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="signup-name">이름</label>
            <div className="carbon-field-control">
              <input
                id="signup-name"
                placeholder="이름"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="signup-email">이메일</label>
            <div className="carbon-field-control carbon-field-control-action">
              <input
                id="signup-email"
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
                className="signup-inline-action"
                onClick={handleCheckEmail}
              >
                중복확인
              </button>
            </div>
          </div>

          {emailCheckResult === true && (
            <p className="signup-helper-text success">
              사용 가능한 이메일입니다.
            </p>
          )}

          {emailCheckResult === false && (
            <p className="signup-helper-text error">
              이미 가입된 이메일입니다. 기존 계정 비밀번호가 맞으면 선택한 역할을 추가로 등록할 수 있어요.
            </p>
          )}

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="signup-password">비밀번호</label>
            <div className="carbon-field-control">
              <input
                id="signup-password"
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
                className="carbon-password-toggle"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                aria-label={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showSignupPassword ? (
                  <FaEye size={18} />
                ) : (
                  <FaEyeSlash size={18} />
                )}
              </button>
            </div>
          </div>

          <p
            className={`signup-helper-text ${signupData.password &&
              !isValidPassword(signupData.password)
              ? "error"
              : ""
              }`}
          >
            영문, 숫자, 특수문자를 포함한 8~20자
          </p>

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="signup-password-confirm">비밀번호 확인</label>
            <div className="carbon-field-control">
              <input
                id="signup-password-confirm"
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
                className="carbon-password-toggle"
                onClick={() =>
                  setShowSignupPasswordConfirm(!showSignupPasswordConfirm)
                }
                aria-label={showSignupPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showSignupPasswordConfirm ? (
                  <FaEye size={18} />
                ) : (
                  <FaEyeSlash size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="carbon-field">
            <label className="carbon-field-label" htmlFor="signup-nickname">닉네임</label>
            <div className="carbon-field-control">
              <input
                id="signup-nickname"
                placeholder="닉네임"
                value={signupData.nickname}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    nickname: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <p
            className={`signup-helper-text ${signupData.nickname &&
              !isValidNickname(signupData.nickname)
              ? "error"
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
                emailCheckResult === null ||
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
            type="button"
            className="carbon-link-row"
            onClick={() => {
              resetSignupForm();
              setScreen(screens.login);
            }}
          >
            이미 아이디가 있어요
          </button>
        </div>
      </section>
    )
  }

  // 유형 선택: 고객/파트너 모두 다음은 공용 terms 화면으로 이동
  // (terms 화면 안에서 userType 에 따라 문구/약관/다음 이동지가 분기됩니다)
  if (screen === screens.userType) {
    return (
      <section className="auth-screen auth-step-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">어떤 사용자신가요?</h2>

        <div className="auth-usertype-cards">
          <ChoiceCard active={userType === 'customer'} onClick={() => setUserType('customer')} title="고객" text="시공자에게 수리를 맡겨보세요" />
          <ChoiceCard active={userType === 'partner'} onClick={() => setUserType('partner')} title="파트너" text="시공이 필요한 고객을 만나보세요" />
        </div>

        <div className="auth-step-actions">
          <PrimaryButton narrow onClick={() => go(screens.terms)}>다음</PrimaryButton>
        </div>
      </section>
    )
  }

  // 약관 동의 - 고객/파트너 공용 화면, 문구/약관목록/다음 이동지만 분기
  if (screen === screens.terms) {
    return (
      <section className="auth-screen auth-step-screen">
        <AuthStepHeader back={back} />

        <h2 className="auth-step-title">
          <strong>{userType === 'partner' ? '파트너' : '고객'}</strong>님의 가입을 위해 약관에 동의해주세요
        </h2>

        <div className="auth-terms-panel">
          <div className="auth-terms-list">
            {currentSignupTerms.map((item, index) => (
              <label className="auth-terms-check-line" key={item}>
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

            <label className="auth-terms-check-line auth-terms-check-all">
              <input
                type="checkbox"
                checked={currentSignupTerms.every((_, index) => terms[index])}
                onChange={() => {
                  const allChecked = currentSignupTerms.every((_, index) => terms[index])
                  setTerms((current) =>
                    current.map((value, valueIndex) =>
                      valueIndex < currentSignupTerms.length ? !allChecked : value
                    )
                  )
                }}
              />
              <span>모두 선택</span>
            </label>
          </div>

          <button
            className="auth-outline-button"
            onClick={() => setShowTermsModal(true)}
          >
            약관 자세히보기
          </button>
        </div>

        <div className="auth-step-actions">
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

        {showTermsModal && (
          <div
            className="auth-terms-modal-overlay"
            onClick={() => setShowTermsModal(false)}
          >
            <div
              className="auth-terms-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="auth-terms-modal-title">서비스 이용약관</h3>

              <div className="auth-terms-modal-body">
                <p>
                  여기는 임시 약관 내용입니다.
                </p>

                <p>
                  추후 백엔드 또는 PDF와 연결하여 실제 약관을
                  보여주면 됩니다.
                </p>

                {userType !== 'partner' && (
                  <div>
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
                  <div>
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
                className="auth-terms-modal-close"
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
      <section className="auth-screen auth-step-screen auth-select-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">
          <strong>파트너</strong>님의 전문 분야를 알려주세요
        </h2>

        <MultiSelectPanel
          groups={partnerServiceGroups}
          selected={partnerSignupData.categories}
          onToggle={(item) => togglePartnerSelection('categories', item, 999)}
          onReset={() => setPartnerSignupData((prev) => ({ ...prev, categories: [] }))}
          footerLabel="선택한 분야"
          maxCount={999}
          hideCount
        />

        <div className="auth-step-actions">
          <PrimaryButton
            narrow
            onClick={() => go(screens.bizReg)}
            disabled={partnerSignupData.categories.length === 0}
          >
            다음
          </PrimaryButton>
        </div>
      </section>
    )
  }

  // ---------------------------------------------------------------
  // 파트너 전용: 사업자등록증 업로드 + 사업자등록번호 수동 입력
  // ---------------------------------------------------------------
  if (screen === screens.bizReg) {
    return (
      <section className="auth-screen auth-step-screen auth-bizreg-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">
          <strong>파트너</strong>님의 사업자등록증을 업로드해주세요
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

        <div className="carbon-field-control">
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
        </div>

        <div className="auth-step-actions">
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
        </div>
      </section>
    )
  }

  // ---------------------------------------------------------------
  // 파트너 전용: 업체 정보 (업체 주소 검색 포함)
  // ---------------------------------------------------------------
  if (screen === screens.companyInfo) {
    return (
      <section className="auth-screen auth-step-screen auth-companyinfo-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">
          <strong>파트너</strong>님의 업체 정보를 입력해주세요
        </h2>

        <div className="carbon-field-control">
          <input
            placeholder="업체명"
            value={partnerSignupData.companyName}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, companyName: e.target.value })
            }
          />
        </div>

        <div className="carbon-field-control">
          <input
            placeholder="업체 대표 이름"
            value={partnerSignupData.ownerName}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, ownerName: e.target.value })
            }
          />
        </div>

        <div className="carbon-field-control">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={13}
            placeholder="업체 전화번호"
            value={partnerSignupData.companyPhone}
            onChange={(e) => {
              setPartnerSignupData({ ...partnerSignupData, companyPhone: formatPhoneNumber(e.target.value) });
            }}
          />
        </div>

        {/* TODO: 실제 백엔드가 허용하는 business_status 값 목록으로 옵션을 맞춰주세요 */}
        <div className="carbon-field-control">
          <select
            value={partnerSignupData.businessStatus}
            onChange={(e) =>
              setPartnerSignupData({ ...partnerSignupData, businessStatus: e.target.value })
            }
          >
            <option value="">사업자 구분 선택</option>
            <option value="INDIVIDUAL">개인사업자</option>
            <option value="CORPORATE">법인사업자</option>
          </select>
        </div>

        <button
          className="auth-outline-button"
          type="button"
          onClick={() => setShowCompanyAddressModal(true)}
        >
          주소 검색
        </button>

        <div className="carbon-field-control">
          <input
            value={partnerSignupData.companyAddress}
            placeholder="검색한 주소가 표시됩니다."
            readOnly
          />
        </div>

        <div className="carbon-field-control">
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
        </div>

        <div className="auth-step-actions">
          <PrimaryButton
            narrow
            onClick={() => {
              if (!isValidPhoneNumber(partnerSignupData.companyPhone)) {
                setPhoneErrorMessage('업체 전화번호를 정확히 입력해주세요. (숫자 9자리 이상)')
                return
              }

              go(screens.phone)
            }}
            disabled={
              !partnerSignupData.companyName.trim() ||
              !partnerSignupData.businessStatus ||
              !partnerSignupData.companyAddress.trim() ||
              !partnerSignupData.companyPhone.trim()
            }
          >
            다음
          </PrimaryButton>
        </div>

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

        <AuthErrorModal
          message={phoneErrorMessage}
          onClose={() => setPhoneErrorMessage('')}
        />
      </section>
    )
  }

  // 전화번호 - 고객/파트너 공용 (문구, 다음 이동지, 건너뛰기 노출 여부만 분기)
  if (screen === screens.phone) {
    return (
      <section className="auth-screen auth-step-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">
          <strong>{userType === 'partner' ? '파트너' : '고객'}</strong>님의 전화번호를 알려주세요
        </h2>

        <div className="auth-phone-row">
          <select
            className="auth-phone-carrier"
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

          <div className="carbon-field-control">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="XXX-XXXX-XXXX"
              value={signupData.phone}
              onChange={(e) => {
                setSignupData({
                  ...signupData,
                  phone: formatPhoneNumber(e.target.value),
                });
              }}
            />
          </div>
        </div>

        <div className="auth-step-actions">
          <PrimaryButton
            narrow
            onClick={() => {
              if (!isValidPhoneNumber(signupData.phone)) {
                setPhoneErrorMessage('휴대폰 번호를 정확히 입력해주세요. (숫자 9자리 이상)')
                return
              }

              go(userType === 'partner' ? screens.region : screens.address)
            }}
            disabled={!signupData.phone.trim()}
          >
            다음
          </PrimaryButton>
        </div>

        {/* 파트너는 시안상 건너뛰기 노출 안 됨 (필수 단계) */}
        {userType !== 'partner' && (
          <button
            className="auth-step-skip"
            onClick={() => go(screens.address)}
          >
            건너뛰기
          </button>
        )}

        <AuthErrorModal
          message={phoneErrorMessage}
          onClose={() => setPhoneErrorMessage('')}
        />
      </section>
    )
  }

  // 고객 전용: 주소 입력
  if (screen === screens.address) {
    return (
      <section className="auth-screen auth-step-screen auth-address-screen">
        <AuthStepHeader back={back} />

        <h2 className="auth-step-title">
          고객님의 주소를 알려주세요
        </h2>

        <button
          className="auth-outline-button"
          type="button"
          onClick={() => setShowAddressModal(true)}
        >
          주소 검색
        </button>

        <div className="carbon-field-control">
          <input
            value={signupData.address}
            placeholder="검색한 주소가 표시됩니다."
            readOnly
          />
        </div>

        <div className="carbon-field-control">
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
        </div>

        <div className="auth-step-actions">
          <PrimaryButton
            narrow
            onClick={handleSignup}
            disabled={!signupData.address.trim()}
          >
            다음
          </PrimaryButton>
        </div>

        <button
          className="auth-step-skip"
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
      <section className="auth-screen auth-step-screen auth-select-screen">
        <AuthStepHeader back={back} />
        <h2 className="auth-step-title">
          <strong>파트너</strong>님의 작업 지역을 선택하세요
        </h2>

        <MultiSelectPanel
          groups={partnerRegionGroups}
          selected={partnerSignupData.workRegions}
          onToggle={(item) => togglePartnerSelection('workRegions', item, 10)}
          onReset={() => setPartnerSignupData((prev) => ({ ...prev, workRegions: [] }))}
          footerLabel="선택한 곳"
          maxCount={10}
        />

        <div className="auth-step-actions">
          <PrimaryButton
            narrow
            onClick={handlePartnerSignup}
            disabled={partnerSignupData.workRegions.length === 0}
          >
            다음
          </PrimaryButton>
        </div>
      </section>
    )
  }

  // 완료 화면 - 고객/파트너 공용, 문구만 분기
  // EstimateDonePage 와 동일한 "처리 완료" 포맷(.estimate-done-*)을 그대로 재사용
  return (
    <section className="estimate-done">
      <img src={figmaAssets.logoMark} alt="" className="estimate-status-logo" />
      <div className="estimate-done-icon" dangerouslySetInnerHTML={{ __html: confirmCarbonSvg }} />
      <h2 className="estimate-done-title">{userType === 'partner' ? '파트너' : '고객'}님, 환영합니다!</h2>
      <p className="estimate-done-desc">회원가입이 완료되었어요</p>
      <div className="estimate-done-actions">
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
      </div>
    </section>
  )
}
