import { useEffect, useMemo, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaTimes,
  FaTools,
  FaUserCircle,
  FaUserCog,
} from 'react-icons/fa'
import { contractorProfile, contractorScreens } from '../../data/contractorData'
import { categoryGroups, regionGroups } from '../Customer/AuthPages'
import {
  fetchContractorMe,
  fetchContractorServices,
  fetchReferenceCodes,
  fetchServiceTasks,
  updateContractorMe,
  updateContractorServices,
} from '../../services/contractorService'
import { logout } from '../../services/authService'
import { getMe, updateMe } from '../../services/userService'
import './ContractorPages.css'

// 회원가입(/signup/category · /signup/region)에서 쓰는 선택 목록을 그대로 가져와
// 시공자 마이페이지의 전문분야/지역 체크박스로 재사용한다.
// 회원가입 데이터 형태({key,label,items}) → 선택 패널 형태({category,options})로 변환.
const toSelectTree = (groups) =>
  groups.map((group) => ({ category: group.label, options: group.items }))
const contractorServiceTree = toSelectTree(categoryGroups)
const contractorRegionTree = toSelectTree(regionGroups)

const fallbackUserInfo = {
  name: contractorProfile.name,
  businessName: contractorProfile.businessName,
  email: contractorProfile.email,
  phone: contractorProfile.phone,
  contactPhone: contractorProfile.phone,
}

const infoFields = [
  { key: 'name', label: '이름', locked: true },
  { key: 'businessName', label: '업체명', locked: true },
  { key: 'email', label: '이메일', locked: true },
  { key: 'phone', label: '휴대폰번호' },
  { key: 'contactPhone', label: '시공자 연락처' },
]

// 사용자/시공자 API 응답을 마이페이지 표시값으로 정리
function normalizeUserInfo(user = {}, contractor = {}) {
  return {
    name: user.name || fallbackUserInfo.name,
    businessName: user.businessName || contractor.business_name || fallbackUserInfo.businessName,
    email: user.email || fallbackUserInfo.email,
    phone: user.phone || contractor.contact_phone || fallbackUserInfo.phone,
    contactPhone: contractor.contact_phone || user.phone || fallbackUserInfo.contactPhone,
  }
}

function formatInfoValue(key, value) {
  return value || '-'
}

const normalizeId = (value) => (value === undefined || value === null ? '' : String(value))
const getOptionKey = (option) => normalizeId(typeof option === 'object' ? option.id : option)
const getOptionLabel = (option) => (typeof option === 'object' ? option.label : option)
const uniqueIds = (values = []) => [...new Set(values.map(normalizeId).filter(Boolean))]
const numericIds = (values = []) => uniqueIds(values).filter((value) => /^\d+$/.test(value))
const toApiId = (value) => (/^\d+$/.test(normalizeId(value)) ? Number(value) : value)
const getServiceTaskId = (service) => service.service_task_id ?? service.serviceTaskId ?? service.task_id ?? service.taskId
const getRegionCodeId = (service) => service.region_code_id ?? service.regionCodeId ?? service.code_id ?? service.codeId
const PENDING_SERVICE_TASK_IDS_KEY = 'tuktak:contractor:pendingServiceTaskIds'
const PENDING_REGION_CODE_IDS_KEY = 'tuktak:contractor:pendingRegionCodeIds'

function readPendingIds(key) {
  try {
    return uniqueIds(JSON.parse(window.localStorage.getItem(key) || '[]'))
  } catch {
    return []
  }
}

function writePendingIds(key, values) {
  window.localStorage.setItem(key, JSON.stringify(uniqueIds(values)))
}

function clearPendingContractorServiceSelections() {
  window.localStorage.removeItem(PENDING_SERVICE_TASK_IDS_KEY)
  window.localStorage.removeItem(PENDING_REGION_CODE_IDS_KEY)
}

// 전문분야 목록 API를 카테고리/체크리스트 형태로 변환
function buildServiceTree(tasks = []) {
  const groups = tasks.reduce((acc, task) => {
    const category = task.main_category || '기타'
    if (!acc[category]) acc[category] = []
    acc[category].push({
      id: normalizeId(task.service_task_id),
      label: task.task_name,
    })
    return acc
  }, {})

  return Object.entries(groups).map(([category, options]) => ({ category, options }))
}

// 지역 코드 API를 시/도와 구/군 선택 구조로 변환
function buildRegionTree(codes = []) {
  const parents = codes.filter((code) => !code.parent_code_id)
  const children = codes.filter((code) => code.parent_code_id)

  if (parents.length === 0) {
    return codes.length > 0
      ? [{ category: '지역', options: codes.map((code) => ({ id: normalizeId(code.code_id), label: code.code_name })) }]
      : []
  }

  return parents.map((parent) => ({
    category: parent.code_name,
    options: children
      .filter((child) => normalizeId(child.parent_code_id) === normalizeId(parent.code_id))
      .map((child) => ({ id: normalizeId(child.code_id), label: child.code_name })),
  })).filter((group) => group.options.length > 0)
}

// 전문분야/지역 페이지에서 공통으로 쓰는 좌-우 2단 선택 UI.
// 회원가입(/signup/category · /signup/region)의 선택 박스와 동일한 마크업/클래스
// (.select-panel / .item-row / .chip 등, .auth-select-screen Carbon 오버라이드)를
// 그대로 재사용한다. 데이터 형태(tree/options, selected=id 배열)만 시공자 로직에 맞춰
// 어댑트했고, 하단 선택 칩·체크박스 표시까지 회원가입 화면과 같은 룩을 유지한다.
function ContractorSelectPanel({ tree, selected, onToggle, onReset, footerLabel, maxCount, hideCount }) {
  const [activeCategory, setActiveCategory] = useState(tree[0]?.category || '')
  const activeGroup = useMemo(
    () => tree.find((group) => group.category === activeCategory) || tree[0],
    [activeCategory, tree],
  )
  const selectedKeys = selected.map(normalizeId)

  const labelMap = useMemo(() => {
    return tree.reduce((acc, group) => {
      group.options.forEach((option) => {
        acc.set(getOptionKey(option), getOptionLabel(option))
      })
      return acc
    }, new Map())
  }, [tree])

  return (
    <div className="select-panel">
      <div className="select-panel-body">
        <div className="sidebar-list">
          {tree.map((group) => (
            <button
              key={group.category}
              type="button"
              className={activeGroup?.category === group.category ? 'active' : ''}
              onClick={() => setActiveCategory(group.category)}
            >
              {group.category}
            </button>
          ))}
        </div>

        <div className="item-list">
          {(activeGroup?.options || []).map((option) => {
            const key = getOptionKey(option)
            const isSelected = selectedKeys.includes(key)

            return (
              <label key={key} className={`item-row ${isSelected ? 'selected' : ''}`}>
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(key)} />
                <span>{getOptionLabel(option)}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="select-panel-footer">
        <div className={`footer-count-row ${hideCount ? 'reset-only' : ''}`}>
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
          {selectedKeys.map((key) => (
            <span className="chip" key={key}>
              {labelMap.get(key) || key}
              <button type="button" onClick={() => onToggle(key)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ContractorMypagePage({ go }) {
  const [profile, setProfile] = useState(fallbackUserInfo)

  // 마이페이지 홈 상단 프로필은 /users/me와 /contractors/me 기준으로 표시
  useEffect(() => {
    let ignore = false

    Promise.all([
      getMe().catch(() => null),
      fetchContractorMe().catch(() => null),
    ])
      .then(([userResponse, contractor]) => {
        if (!ignore) setProfile(normalizeUserInfo(userResponse?.data?.user, contractor))
      })
      .catch(() => {
        if (!ignore) setProfile(fallbackUserInfo)
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <section className="contractor-mypage contractor-mypage-home cds--white">
      <header className="contractor-mypage-header">
        <span className="contractor-mypage-header-spacer" aria-hidden="true" />
        <h1>마이페이지</h1>
        <button
          type="button"
          className="contractor-mypage-back"
          onClick={() => go(contractorScreens.home)}
          aria-label="닫기"
        >
          <FaTimes />
        </button>
      </header>

      <div className="contractor-mypage-home-body">
        <div className="contractor-mypage-hero">
          <span className="contractor-mypage-hero-avatar">
            <FaUserCircle aria-hidden="true" />
          </span>
          <div className="contractor-mypage-hero-body">
            <p className="contractor-mypage-hero-eyebrow">MY TUKTAK</p>
            <h2>{profile.name} 파트너님, 안녕하세요</h2>
            <p>{profile.email}</p>
          </div>
        </div>

        <nav className="contractor-mypage-menu">
          <button type="button" className="contractor-mypage-menu-item" onClick={() => go(contractorScreens.myInfo)}>
            <span className="contractor-mypage-menu-icon"><FaUserCog aria-hidden="true" /></span>
            <span className="contractor-mypage-menu-label">내 정보</span>
            <FaChevronRight className="contractor-mypage-menu-chevron" aria-hidden="true" />
          </button>
          <button type="button" className="contractor-mypage-menu-item" onClick={() => go(contractorScreens.myServices)}>
            <span className="contractor-mypage-menu-icon"><FaTools aria-hidden="true" /></span>
            <span className="contractor-mypage-menu-label">내 전문분야</span>
            <FaChevronRight className="contractor-mypage-menu-chevron" aria-hidden="true" />
          </button>
          <button type="button" className="contractor-mypage-menu-item" onClick={() => go(contractorScreens.myRegions)}>
            <span className="contractor-mypage-menu-icon"><FaMapMarkerAlt aria-hidden="true" /></span>
            <span className="contractor-mypage-menu-label">내 지역</span>
            <FaChevronRight className="contractor-mypage-menu-chevron" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  )
}

export function ContractorMyInfoPage({ go }) {
  const [editingKey, setEditingKey] = useState(null)
  const [originalValues, setOriginalValues] = useState(fallbackUserInfo)
  const [draftValues, setDraftValues] = useState(fallbackUserInfo)
  const [infoMessage, setInfoMessage] = useState('')
  const [isSavingInfo, setIsSavingInfo] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const editingField = useMemo(() => infoFields.find((field) => field.key === editingKey), [editingKey])

  // 내 정보 화면 진입 시 이름/업체명/이메일/전화번호 조회
  useEffect(() => {
    let ignore = false

    Promise.all([
      getMe().catch(() => null),
      fetchContractorMe().catch(() => null),
    ])
      .then(([userResponse, contractor]) => {
        if (ignore) return
        const nextUserInfo = normalizeUserInfo(userResponse?.data?.user, contractor)
        setOriginalValues(nextUserInfo)
        setDraftValues(nextUserInfo)
      })
      .catch(() => {
        if (ignore) return
        setOriginalValues(fallbackUserInfo)
        setDraftValues(fallbackUserInfo)
      })

    return () => {
      ignore = true
    }
  }, [])

  const startEdit = (key) => {
    if (infoFields.find((field) => field.key === key)?.locked) return
    setEditingKey(key)
    setInfoMessage('')
  }

  const closeEdit = () => {
    setEditingKey(null)
    setInfoMessage('')
  }

  const handleDraftChange = (key, value) => {
    setDraftValues((current) => ({ ...current, [key]: value }))
  }

  // 명세서 기준으로 휴대폰번호는 users/me, 시공자 정보는 contractors/me로 저장
  const completeEdit = async () => {
    try {
      setIsSavingInfo(true)

      if (editingKey === 'phone') {
        const formData = new FormData()
        formData.append('phone', draftValues.phone)
        const response = await updateMe(formData)
        const updatedUserInfo = normalizeUserInfo(
          { ...originalValues, ...(response.data?.user || {}), phone: draftValues.phone },
          { contact_phone: originalValues.contactPhone },
        )
        setOriginalValues(updatedUserInfo)
        setDraftValues(updatedUserInfo)
      }

      if (editingKey === 'contactPhone') {
        await updateContractorMe({ contact_phone: draftValues.contactPhone })
        const nextValues = { ...originalValues, contactPhone: draftValues.contactPhone }
        setOriginalValues(nextValues)
        setDraftValues(nextValues)
      }

      closeEdit()
    } catch {
      setInfoMessage('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSavingInfo(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      window.location.assign('/login')
    } catch {
      setInfoMessage('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.')
      setIsLoggingOut(false)
    }
  }

  return (
    <section className="contractor-mypage cds--white">
        <header className="contractor-mypage-header">
          <button
            type="button"
            className="contractor-mypage-back"
            onClick={() => go(contractorScreens.mypage)}
            aria-label="뒤로가기"
          >
            <FaChevronLeft />
          </button>
          <h1>내 정보</h1>
          <span className="contractor-mypage-header-spacer" aria-hidden="true" />
        </header>

        <div className="contractor-mypage-profile">
          <span className="contractor-mypage-hero-avatar">
            <FaUserCircle aria-hidden="true" />
          </span>
          <h2>{draftValues.name} 파트너님</h2>
        </div>

        <div className="contractor-mypage-info">
          {infoFields.map((field) => (
            <button
              className={`contractor-mypage-info-row ${field.locked ? 'locked' : ''}`}
              type="button"
              key={field.key}
              onClick={() => startEdit(field.key)}
              disabled={field.locked}
            >
              <span>{field.label}</span>
              <strong>{formatInfoValue(field.key, draftValues[field.key])}</strong>
              {field.locked ? <span aria-hidden="true" /> : <FaChevronRight />}
            </button>
          ))}
        </div>

        {editingField ? (
          <div className="contractor-mypage-edit">
            <label>
              <span>{editingField.label} 수정</span>
              <input
                value={draftValues[editingField.key]}
                onChange={(event) => handleDraftChange(editingField.key, event.target.value)}
              />
            </label>
            {infoMessage ? <p className="contractor-mypage-message">{infoMessage}</p> : null}
            <div className="contractor-mypage-actions">
              <button type="button" className="is-ghost" onClick={closeEdit}>취소</button>
              <button type="button" className="is-primary" onClick={completeEdit} disabled={isSavingInfo}>
                {isSavingInfo ? '저장중' : '완료'}
              </button>
            </div>
          </div>
        ) : null}

        {infoMessage && !editingField ? <p className="contractor-mypage-message">{infoMessage}</p> : null}

        <div className="contractor-mypage-account">
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? '로그아웃 중' : '로그아웃'}
          </button>
        </div>
    </section>
  )
}

export function ContractorMyServicesPage({ go }) {
  const [tree, setTree] = useState(contractorServiceTree)
  const [selected, setSelected] = useState([])
  const [savedServices, setSavedServices] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasServiceCatalog, setHasServiceCatalog] = useState(false)

  // 전문분야 목록과 가입 시 저장된 전문분야를 함께 조회
  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchServiceTasks().catch(() => []),
      fetchContractorServices().catch(() => []),
    ]).then(([tasks, services]) => {
      if (ignore) return

      const nextTree = buildServiceTree(tasks)
      if (nextTree.length > 0) {
        setTree(nextTree)
      }
      setHasServiceCatalog(nextTree.length > 0)

      const activeServices = services.filter((service) => service?.is_active !== false)
      const savedServiceTaskIds = uniqueIds(activeServices.map(getServiceTaskId))
      const pendingServiceTaskIds = readPendingIds(PENDING_SERVICE_TASK_IDS_KEY)

      if (activeServices.length > 0) {
        setSavedServices(activeServices)
        setSelected(savedServiceTaskIds)
        setStatusMessage(nextTree.length > 0 ? '' : '전문분야 목록 데이터가 비어 있습니다. 백엔드 service_tasks 데이터가 필요합니다.')
      } else if (nextTree.length > 0) {
        setSelected(pendingServiceTaskIds)
        setSavedServices([])
        setStatusMessage(pendingServiceTaskIds.length > 0 ? '아직 저장 전인 전문분야 선택값이 있습니다. 지역까지 선택하면 함께 저장됩니다.' : '저장된 전문분야가 없습니다. 전문분야를 선택해주세요.')
      } else if (nextTree.length === 0) {
        setStatusMessage('전문분야 API 연결 전이라 임시데이터를 표시함.')
        setSelected([])
        setSavedServices([])
        setStatusMessage('전문분야 목록 데이터가 비어 있습니다. 백엔드 service_tasks 데이터가 필요합니다.')
      }
    }).catch(() => {
      if (!ignore) {
        setSelected([])
        setSavedServices([])
        setHasServiceCatalog(false)
        setStatusMessage('전문분야 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }).finally(() => {
      if (!ignore) setIsLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [])

  // 전문분야는 선택 개수 제한 없이 토글
  const toggle = (option) => {
    const optionId = normalizeId(option)
    setSelected((current) => (current.map(normalizeId).includes(optionId) ? current.filter((item) => normalizeId(item) !== optionId) : [...current, optionId]))
  }

  // 선택한 전문분야를 기존 지역 조합과 함께 저장
  const saveServices = async () => {
    if (!hasServiceCatalog) {
      setStatusMessage('전문분야 목록 데이터가 비어 있습니다. 백엔드 service_tasks 데이터가 필요합니다.')
      return
    }

    const selectedTaskIds = numericIds(selected)
    const regionIds = numericIds(savedServices.map(getRegionCodeId))
    const pendingRegionIds = numericIds(readPendingIds(PENDING_REGION_CODE_IDS_KEY))
    const targetRegionIds = regionIds.length > 0 ? regionIds : pendingRegionIds

    if (selectedTaskIds.length === 0) {
      writePendingIds(PENDING_SERVICE_TASK_IDS_KEY, [])
      setStatusMessage('전문분야를 하나 이상 선택해주세요.')
      return
    }

    writePendingIds(PENDING_SERVICE_TASK_IDS_KEY, selectedTaskIds)

    if (targetRegionIds.length === 0) {
      writePendingIds(PENDING_REGION_CODE_IDS_KEY, [])
      setStatusMessage('전문분야 선택을 저장해뒀어요. 지역을 선택하면 함께 저장됩니다.')
      go(contractorScreens.myRegions)
      return
    }

    const payload = selectedTaskIds.flatMap((serviceTaskId) => (
      targetRegionIds.map((regionCodeId) => {
        const previous =
          savedServices.find((service) => normalizeId(getServiceTaskId(service)) === serviceTaskId && normalizeId(getRegionCodeId(service)) === regionCodeId) ||
          savedServices.find((service) => normalizeId(getRegionCodeId(service)) === regionCodeId)

        return {
          service_task_id: toApiId(serviceTaskId),
          region_code_id: toApiId(regionCodeId),
          experience_years: previous?.experience_years ?? null,
          minimum_visit_fee: previous?.minimum_visit_fee ?? null,
          service_radius_km: previous?.service_radius_km ?? null,
          is_active: true,
        }
      })
    ))

    try {
      setIsSaving(true)
      const result = await updateContractorServices(payload)
      setSavedServices(result.services || payload)
      clearPendingContractorServiceSelections()
      setStatusMessage('전문분야가 저장됐어요.')
      go(contractorScreens.mypage)
    } catch (error) {
      setStatusMessage(error?.message || '전문분야 저장에 실패했어요. 선택값을 다시 확인해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="contractor-mypage auth-select-screen cds--white">
        <header className="contractor-mypage-header">
          <button
            type="button"
            className="contractor-mypage-back"
            onClick={() => go(contractorScreens.mypage)}
            aria-label="뒤로가기"
          >
            <FaChevronLeft />
          </button>
          <h1>내 전문분야</h1>
          <span className="contractor-mypage-header-spacer" aria-hidden="true" />
        </header>

        <h2 className="contractor-select-heading">
          내 <strong>전문 분야</strong>를 선택해주세요
        </h2>

        <ContractorSelectPanel
          tree={tree}
          selected={selected}
          onToggle={toggle}
          onReset={() => {
            setSelected([])
            setStatusMessage('')
          }}
          footerLabel="선택한 분야"
          maxCount={999}
          hideCount
        />

        {statusMessage ? <p className="contractor-mypage-message">{statusMessage}</p> : null}

        <div className="contractor-mypage-actions">
          <button type="button" className="is-ghost" onClick={() => go(contractorScreens.mypage)}>취소</button>
          <button type="button" className="is-primary" onClick={saveServices} disabled={isLoading || isSaving || selected.length === 0}>
            {isSaving ? '저장중' : '완료'}
          </button>
        </div>
    </section>
  )
}

export function ContractorMyRegionsPage({ go }) {
  const [tree, setTree] = useState(contractorRegionTree)
  const [selected, setSelected] = useState([])
  const [savedServices, setSavedServices] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRegionCatalog, setHasRegionCatalog] = useState(false)
  const maxRegionCount = 10

  // 지역 목록과 가입 시 저장된 작업지역을 함께 조회
  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchReferenceCodes({ code_group: 'REGION' }).catch(() => []),
      fetchContractorServices().catch(() => []),
    ]).then(([codes, services]) => {
      if (ignore) return

      const nextTree = buildRegionTree(codes)
      if (nextTree.length > 0) {
        setTree(nextTree)
      }
      setHasRegionCatalog(nextTree.length > 0)

      const activeServices = services.filter((service) => service?.is_active !== false)
      const savedRegionIds = uniqueIds(activeServices.map(getRegionCodeId))
      const pendingRegionIds = readPendingIds(PENDING_REGION_CODE_IDS_KEY)

      if (activeServices.length > 0) {
        setSavedServices(activeServices)
        setSelected(savedRegionIds)
        if (savedRegionIds.length === 0) {
          setStatusMessage('저장된 작업 지역이 없습니다. 활동할 지역을 선택해주세요.')
        } else {
          setStatusMessage('')
        }
      } else if (activeServices.length === 0) {
        setSelected(pendingRegionIds)
        setSavedServices([])
        if (nextTree.length === 0) {
          setStatusMessage('지역 목록 데이터가 비어 있습니다. 백엔드 reference_codes REGION 데이터가 필요합니다.')
        } else {
          setStatusMessage(pendingRegionIds.length > 0 ? '아직 저장 전인 지역 선택값이 있습니다. 전문분야까지 선택하면 함께 저장됩니다.' : '저장된 작업 지역이 없습니다. 활동할 지역을 선택해주세요.')
        }
      } else if (nextTree.length === 0) {
        setStatusMessage('지역 목록 데이터가 비어 있습니다. 백엔드 reference_codes REGION 데이터가 필요합니다.')
      }
    }).catch(() => {
      if (!ignore) {
        setSelected([])
        setSavedServices([])
        setHasRegionCatalog(false)
        setStatusMessage('지역 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }).finally(() => {
      if (!ignore) setIsLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [])

  // 작업지역은 회원가입 정책과 동일하게 최대 10개까지 선택
  const toggle = (option) => {
    const optionId = normalizeId(option)
    setSelected((current) => {
      if (current.map(normalizeId).includes(optionId)) {
        setStatusMessage('')
        return current.filter((item) => normalizeId(item) !== optionId)
      }

      if (current.length >= maxRegionCount) {
        setStatusMessage(`작업지역은 최대 ${maxRegionCount}개까지 선택할 수 있어요.`)
        return current
      }

      setStatusMessage('')
      return [...current, optionId]
    })
  }

  // 선택한 지역을 기존 전문분야 조합과 함께 저장
  const saveRegions = async () => {
    if (!hasRegionCatalog) {
      setStatusMessage('지역 목록 데이터가 비어 있습니다. 백엔드 reference_codes REGION 데이터가 필요합니다.')
      return
    }

    const selectedRegionIds = numericIds(selected)
    const serviceTaskIds = numericIds(savedServices.map(getServiceTaskId))
    const pendingServiceTaskIds = numericIds(readPendingIds(PENDING_SERVICE_TASK_IDS_KEY))
    const targetServiceTaskIds = serviceTaskIds.length > 0 ? serviceTaskIds : pendingServiceTaskIds

    if (selectedRegionIds.length === 0) {
      writePendingIds(PENDING_REGION_CODE_IDS_KEY, [])
      setStatusMessage('지역을 하나 이상 선택해주세요.')
      return
    }

    writePendingIds(PENDING_REGION_CODE_IDS_KEY, selectedRegionIds)

    if (targetServiceTaskIds.length === 0) {
      writePendingIds(PENDING_SERVICE_TASK_IDS_KEY, [])
      setStatusMessage('지역 선택을 저장해뒀어요. 전문분야를 선택하면 함께 저장됩니다.')
      go(contractorScreens.myServices)
      return
    }

    const payload = targetServiceTaskIds.flatMap((serviceTaskId) => (
      selectedRegionIds.map((regionCodeId) => {
        const previous =
          savedServices.find((service) => normalizeId(getServiceTaskId(service)) === serviceTaskId && normalizeId(getRegionCodeId(service)) === regionCodeId) ||
          savedServices.find((service) => normalizeId(getServiceTaskId(service)) === serviceTaskId)

        return {
          service_task_id: toApiId(serviceTaskId),
          region_code_id: toApiId(regionCodeId),
          experience_years: previous?.experience_years ?? null,
          minimum_visit_fee: previous?.minimum_visit_fee ?? null,
          service_radius_km: previous?.service_radius_km ?? null,
          is_active: true,
        }
      })
    ))

    try {
      setIsSaving(true)
      const result = await updateContractorServices(payload)
      setSavedServices(result.services || payload)
      clearPendingContractorServiceSelections()
      setStatusMessage('지역이 저장됐어요.')
      go(contractorScreens.mypage)
    } catch (error) {
      setStatusMessage(error?.message || '지역 저장에 실패했어요. 선택값을 다시 확인해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="contractor-mypage auth-select-screen cds--white">
        <header className="contractor-mypage-header">
          <button
            type="button"
            className="contractor-mypage-back"
            onClick={() => go(contractorScreens.mypage)}
            aria-label="뒤로가기"
          >
            <FaChevronLeft />
          </button>
          <h1>내 지역</h1>
          <span className="contractor-mypage-header-spacer" aria-hidden="true" />
        </header>

        <h2 className="contractor-select-heading">
          내 <strong>작업 지역</strong>을 선택해주세요
        </h2>

        <ContractorSelectPanel
          tree={tree}
          selected={selected}
          onToggle={toggle}
          onReset={() => {
            setSelected([])
            setStatusMessage('')
          }}
          footerLabel="선택한 곳"
          maxCount={maxRegionCount}
        />

        {statusMessage ? <p className="contractor-mypage-message">{statusMessage}</p> : null}

        <div className="contractor-mypage-actions">
          <button type="button" className="is-ghost" onClick={() => go(contractorScreens.mypage)}>취소</button>
          <button type="button" className="is-primary" onClick={saveRegions} disabled={isLoading || isSaving || selected.length === 0}>
            {isSaving ? '저장중' : '완료'}
          </button>
        </div>
    </section>
  )
}
