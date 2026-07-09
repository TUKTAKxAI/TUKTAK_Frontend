import { useEffect, useMemo, useState } from 'react'
import { FaChevronRight, FaUserCircle } from 'react-icons/fa'
import {
  contractorProfile,
  contractorRegionTree,
  contractorScreens,
  contractorServiceTree,
} from '../../data/contractorData'
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
import { ContractorPage, MenuTile } from './ContractorPageShared'
import mypageInfoIcon from '../../assets/figma/contractor-mypage-info.png'
import mypageRegionIcon from '../../assets/figma/contractor-mypage-region.png'
import mypageServicesIcon from '../../assets/figma/contractor-mypage-services.png'

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
const toApiId = (value) => (/^\d+$/.test(normalizeId(value)) ? Number(value) : value)
const getServiceTaskId = (service) => service.service_task_id ?? service.serviceTaskId ?? service.task_id ?? service.taskId
const getRegionCodeId = (service) => service.region_code_id ?? service.regionCodeId ?? service.code_id ?? service.codeId

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

// 전문분야/지역 페이지에서 공통으로 쓰는 2단 선택 UI
function SplitTreeSelector({ tree, selected, onToggle }) {
  const [activeCategory, setActiveCategory] = useState(tree[0]?.category || '')
  const effectiveActiveCategory = tree.some((group) => group.category === activeCategory)
    ? activeCategory
    : tree[0]?.category || ''

  const activeGroup = useMemo(
    () => tree.find((group) => group.category === effectiveActiveCategory) || tree[0],
    [effectiveActiveCategory, tree],
  )

  return (
    <div className="contractor-split-selector">
      <aside className="contractor-category-list" aria-label="대분류">
        {tree.map((group) => (
          <button
            className={group.category === activeGroup?.category ? 'active' : ''}
            type="button"
            key={group.category}
            onClick={() => setActiveCategory(group.category)}
          >
            {group.category}
          </button>
        ))}
      </aside>

      <div className="contractor-subcategory-list" aria-label="소분류">
        {(activeGroup?.options || []).map((option) => (
          <label className="contractor-checkbox-row" key={getOptionKey(option)}>
            <input
              type="checkbox"
              checked={selected.map(normalizeId).includes(getOptionKey(option))}
              onChange={() => onToggle(getOptionKey(option))}
            />
            <span>{getOptionLabel(option)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// 선택한 항목을 하단 칩으로 보여주고 삭제/초기화 처리
function SelectedOptionDock({ selected, tree, maxCount, unit, onRemove, onReset }) {
  const labelMap = useMemo(() => {
    return tree.reduce((acc, group) => {
      group.options.forEach((option) => {
        acc.set(getOptionKey(option), getOptionLabel(option))
      })
      return acc
    }, new Map())
  }, [tree])

  return (
    <div className="contractor-selection-dock">
      <div className="contractor-selection-dock-head">
        <span>선택한 {unit}{maxCount ? ` ${selected.length} / ${maxCount}` : ''}</span>
        <button type="button" onClick={onReset}>↻ 초기화</button>
      </div>
      {selected.length > 0 ? (
        <div className="contractor-selection-chip-row">
          {selected.map((item) => (
            <button className="contractor-selection-chip" type="button" key={item} onClick={() => onRemove(item)}>
              {labelMap.get(item) || item} ×
            </button>
          ))}
        </div>
      ) : (
        <p className="contractor-selection-empty">선택한 {unit}이 없어요.</p>
      )}
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
    <ContractorPage title="마이페이지" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-profile-head">
        <FaUserCircle />
        <div>
          <h1>{profile.name} 파트너님,<br />안녕하세요</h1>
          <p>{profile.email}</p>
        </div>
      </div>
      <div className="contractor-menu-grid compact">
        <MenuTile icon={<img className="contractor-menu-icon" src={mypageInfoIcon} alt="" />} label="내 정보" onClick={() => go(contractorScreens.myInfo)} />
        <MenuTile icon={<img className="contractor-menu-icon" src={mypageServicesIcon} alt="" />} label="내 전문분야" onClick={() => go(contractorScreens.myServices)} />
        <MenuTile icon={<img className="contractor-menu-icon" src={mypageRegionIcon} alt="" />} label="내 지역" onClick={() => go(contractorScreens.myRegions)} />
      </div>
    </ContractorPage>
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
    <ContractorPage title="내 정보" go={go} back={() => go(contractorScreens.mypage)}>
      <div className="contractor-edit-list">
        {infoFields.map((field) => (
          <button
            className={`contractor-edit-row ${field.locked ? 'locked' : ''}`}
            type="button"
            key={field.key}
            onClick={() => startEdit(field.key)}
            disabled={field.locked}
          >
            <span>{field.label}</span>
            <strong>{formatInfoValue(field.key, draftValues[field.key])}</strong>
            {field.locked ? null : <FaChevronRight />}
          </button>
        ))}
      </div>

      {editingField ? (
        <div className="contractor-edit-panel">
          <label>
            <span>{editingField.label} 수정</span>
            <input
              value={draftValues[editingField.key]}
              onChange={(event) => handleDraftChange(editingField.key, event.target.value)}
            />
          </label>
          {infoMessage ? <p className="contractor-helper-message">{infoMessage}</p> : null}
          <div className="contractor-bottom-actions">
            <button type="button" onClick={closeEdit}>취소</button>
            <button type="button" onClick={completeEdit} disabled={isSavingInfo}>
              {isSavingInfo ? '저장중' : '완료'}
            </button>
          </div>
        </div>
      ) : null}

      {infoMessage && !editingField ? <p className="contractor-helper-message">{infoMessage}</p> : null}

      <div className="contractor-account-actions">
        <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? '로그아웃 중' : '로그아웃'}
        </button>
      </div>
    </ContractorPage>
  )
}

export function ContractorMyServicesPage({ go }) {
  const [tree, setTree] = useState(contractorServiceTree)
  const [selected, setSelected] = useState(contractorProfile.services)
  const [savedServices, setSavedServices] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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

      if (services.length > 0) {
        setSavedServices(services)
        setSelected(uniqueIds(services.map(getServiceTaskId)))
      } else if (nextTree.length === 0) {
        setStatusMessage('전문분야 API 연결 전이라 임시데이터를 표시함.')
      }
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
    const selectedTaskIds = uniqueIds(selected)
    const regionIds = uniqueIds(savedServices.map(getRegionCodeId))

    if (selectedTaskIds.length === 0) {
      setStatusMessage('현재는 임시 전문분야 데이터라 화면에서만 선택 상태가 반영돼요.')
      return
    }

    if (regionIds.length === 0) {
      setStatusMessage('저장하려면 기존 서비스 지역 ID가 필요해요. 내 지역 API와 함께 연결하면 저장됩니다.')
      return
    }

    const payload = selectedTaskIds.flatMap((serviceTaskId) => (
      regionIds.map((regionCodeId) => {
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
      setStatusMessage('전문분야가 저장됐어요.')
      go(contractorScreens.mypage)
    } catch {
      setStatusMessage('저장 API 연결 전이라 화면 선택만 유지했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ContractorPage title="내 전문분야" go={go} back={() => go(contractorScreens.mypage)}>
      <SplitTreeSelector tree={tree} selected={selected} onToggle={toggle} />
      <SelectedOptionDock
        selected={selected}
        tree={tree}
        unit="전문분야"
        onRemove={toggle}
        onReset={() => {
          setSelected([])
          setStatusMessage('')
        }}
      />
      {statusMessage ? <p className="contractor-helper-message">{statusMessage}</p> : null}
      <div className="contractor-bottom-actions sticky">
        <button type="button" onClick={() => go(contractorScreens.mypage)}>취소</button>
        <button type="button" onClick={saveServices} disabled={isSaving}>
          {isSaving ? '저장중' : '완료'}
        </button>
      </div>
    </ContractorPage>
  )
}

export function ContractorMyRegionsPage({ go }) {
  const [tree, setTree] = useState(contractorRegionTree)
  const [selected, setSelected] = useState(contractorProfile.regions)
  const [savedServices, setSavedServices] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
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

      if (services.length > 0) {
        setSavedServices(services)
        setSelected(uniqueIds(services.map(getRegionCodeId)))
      } else if (nextTree.length === 0) {
        setStatusMessage('지역 API 연결 전이라 임시데이터를 표시함.')
      }
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
    const selectedRegionIds = uniqueIds(selected)
    const serviceTaskIds = uniqueIds(savedServices.map(getServiceTaskId))

    if (selectedRegionIds.length === 0) {
      setStatusMessage('현재는 임시 지역 데이터라 화면에서만 선택 상태가 반영돼요.')
      return
    }

    if (serviceTaskIds.length === 0) {
      setStatusMessage('저장하려면 기존 전문분야 ID가 필요해요. 내 전문분야 API와 함께 연결하면 저장됩니다.')
      return
    }

    const payload = serviceTaskIds.flatMap((serviceTaskId) => (
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
      setStatusMessage('지역이 저장됐어요.')
      go(contractorScreens.mypage)
    } catch {
      setStatusMessage('저장 API 연결 전이라 화면 선택만 유지했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ContractorPage title="내 지역" go={go} back={() => go(contractorScreens.mypage)}>
      <SplitTreeSelector tree={tree} selected={selected} onToggle={toggle} />
      <SelectedOptionDock
        selected={selected}
        tree={tree}
        maxCount={maxRegionCount}
        unit="지역"
        onRemove={toggle}
        onReset={() => {
          setSelected([])
          setStatusMessage('')
        }}
      />
      {statusMessage ? <p className="contractor-helper-message">{statusMessage}</p> : null}
      <div className="contractor-bottom-actions sticky">
        <button type="button" onClick={() => go(contractorScreens.mypage)}>취소</button>
        <button type="button" onClick={saveRegions} disabled={isSaving}>
          {isSaving ? '저장중' : '완료'}
        </button>
      </div>
    </ContractorPage>
  )
}
