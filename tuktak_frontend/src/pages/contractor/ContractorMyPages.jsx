import { useEffect, useMemo, useState } from 'react'
import { FaChevronRight, FaUserCircle } from 'react-icons/fa'
import {
  contractorProfile,
  contractorRegionTree,
  contractorScreens,
  contractorServiceTree,
} from '../../data/contractorData'
import {
  fetchContractorServices,
  fetchReferenceCodes,
  fetchServiceTasks,
  updateContractorServices,
} from '../../services/contractorService'
import { checkEmailAvailability } from '../../services/authService'
import { getMe, updateMe } from '../../services/userService'
import { ContractorPage, MenuTile } from './ContractorPageShared'
import mypageInfoIcon from '../../assets/figma/contractor-mypage-info.png'
import mypageRegionIcon from '../../assets/figma/contractor-mypage-region.png'
import mypageServicesIcon from '../../assets/figma/contractor-mypage-services.png'

const fallbackUserInfo = {
  name: contractorProfile.name,
  email: contractorProfile.email,
  phone: contractorProfile.phone,
}

const infoFields = [
  { key: 'name', label: '이름' },
  { key: 'email', label: '이메일' },
  { key: 'phone', label: '휴대폰번호' },
]

// 사용자 기본정보 API 응답을 마이페이지 표시값으로 정리
function normalizeUserInfo(user = {}) {
  return {
    name: user.name || fallbackUserInfo.name,
    email: user.email || fallbackUserInfo.email,
    phone: user.phone || fallbackUserInfo.phone,
  }
}

const getOptionKey = (option) => (typeof option === 'object' ? option.id : option)
const getOptionLabel = (option) => (typeof option === 'object' ? option.label : option)

// 전문분야 목록 API를 카테고리/체크리스트 형태로 변환
function buildServiceTree(tasks = []) {
  const groups = tasks.reduce((acc, task) => {
    const category = task.main_category || '기타'
    if (!acc[category]) acc[category] = []
    acc[category].push({
      id: task.service_task_id,
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
      ? [{ category: '지역', options: codes.map((code) => ({ id: code.code_id, label: code.code_name })) }]
      : []
  }

  return parents.map((parent) => ({
    category: parent.code_name,
    options: children
      .filter((child) => child.parent_code_id === parent.code_id)
      .map((child) => ({ id: child.code_id, label: child.code_name })),
  })).filter((group) => group.options.length > 0)
}

// 전문분야/지역 페이지에서 공통으로 쓰는 2단 선택 UI
function SplitTreeSelector({ tree, selected, onToggle }) {
  const [activeCategory, setActiveCategory] = useState(tree[0]?.category || '')

  useEffect(() => {
    if (!tree.some((group) => group.category === activeCategory)) {
      setActiveCategory(tree[0]?.category || '')
    }
  }, [activeCategory, tree])

  const activeGroup = useMemo(
    () => tree.find((group) => group.category === activeCategory) || tree[0],
    [activeCategory, tree],
  )

  return (
    <div className="contractor-split-selector">
      <aside className="contractor-category-list" aria-label="대분류">
        {tree.map((group) => (
          <button
            className={group.category === activeGroup.category ? 'active' : ''}
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
              checked={selected.includes(getOptionKey(option))}
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

  // 마이페이지 홈 상단 프로필은 /users/me 기준으로 표시
  useEffect(() => {
    let ignore = false

    getMe()
      .then((response) => {
        if (!ignore) setProfile(normalizeUserInfo(response.data?.user))
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
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle')
  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSavingInfo, setIsSavingInfo] = useState(false)
  const editingField = useMemo(() => infoFields.find((field) => field.key === editingKey), [editingKey])
  const isEditingEmail = editingKey === 'email'
  const isEmailChanged = draftValues.email !== originalValues.email

  // 내 정보 화면 진입 시 이름/이메일/전화번호 조회
  useEffect(() => {
    let ignore = false

    getMe()
      .then((response) => {
        if (ignore) return
        const nextUserInfo = normalizeUserInfo(response.data?.user)
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
    setEditingKey(key)
    setEmailCheckStatus('idle')
    setEmailCheckMessage('')
    setInfoMessage('')
  }

  const closeEdit = () => {
    setEditingKey(null)
    setEmailCheckStatus('idle')
    setEmailCheckMessage('')
    setInfoMessage('')
  }

  const handleDraftChange = (key, value) => {
    setDraftValues((current) => ({ ...current, [key]: value }))
    if (key === 'email') {
      setEmailCheckStatus('idle')
      setEmailCheckMessage('')
    }
  }

  // 이메일은 저장 전 중복확인 API를 먼저 호출
  const checkEmail = async () => {
    const email = draftValues.email.trim()

    if (!email) {
      setEmailCheckStatus('error')
      setEmailCheckMessage('이메일을 입력해주세요.')
      return
    }

    if (email === originalValues.email) {
      setEmailCheckStatus('success')
      setEmailCheckMessage('현재 사용 중인 이메일이에요.')
      return
    }

    try {
      setEmailCheckStatus('checking')
      const result = await checkEmailAvailability(email)
      if (result.available) {
        setEmailCheckStatus('success')
        setEmailCheckMessage('사용 가능한 이메일이에요.')
      } else {
        setEmailCheckStatus('error')
        setEmailCheckMessage('이미 사용 중인 이메일이에요.')
      }
    } catch {
      setEmailCheckStatus('error')
      setEmailCheckMessage('중복확인에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  // 이름/전화번호는 저장하고, 이메일 저장은 백엔드 API 추가 후 연결
  const completeEdit = async () => {
    if (isEditingEmail && isEmailChanged && emailCheckStatus !== 'success') {
      setEmailCheckStatus('error')
      setEmailCheckMessage('이메일 중복확인을 먼저 해주세요.')
      return
    }

    if (isEditingEmail && isEmailChanged) {
      setInfoMessage('이메일 저장 API가 준비되면 저장까지 연결할 수 있어요.')
      return
    }

    if (isEditingEmail) {
      closeEdit()
      return
    }

    try {
      setIsSavingInfo(true)
      const formData = new FormData()
      formData.append(editingKey, draftValues[editingKey])
      const response = await updateMe(formData)
      const updatedUserInfo = normalizeUserInfo({
        ...originalValues,
        ...(response.data?.user || {}),
        [editingKey]: draftValues[editingKey],
      })
      setOriginalValues(updatedUserInfo)
      setDraftValues(updatedUserInfo)
      closeEdit()
    } catch {
      setInfoMessage('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSavingInfo(false)
    }
  }

  return (
    <ContractorPage title="내 정보" go={go} back={() => go(contractorScreens.mypage)}>
      <div className="contractor-edit-list">
        {infoFields.map((field) => (
          <button className="contractor-edit-row" type="button" key={field.key} onClick={() => startEdit(field.key)}>
            <span>{field.label}</span>
            <strong>{draftValues[field.key]}</strong>
            <FaChevronRight />
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
          {isEditingEmail ? (
            <div className="contractor-email-check-row">
              {emailCheckMessage ? (
                <p className={`contractor-email-check-message ${emailCheckStatus}`}>{emailCheckMessage}</p>
              ) : null}
              <button type="button" onClick={checkEmail} disabled={emailCheckStatus === 'checking'}>
                {emailCheckStatus === 'checking' ? '확인중' : '중복확인'}
              </button>
            </div>
          ) : null}
          {infoMessage ? <p className="contractor-helper-message">{infoMessage}</p> : null}
          <div className="contractor-bottom-actions">
            <button type="button" onClick={closeEdit}>취소</button>
            <button type="button" onClick={completeEdit} disabled={isSavingInfo}>
              {isSavingInfo ? '저장중' : '완료'}
            </button>
          </div>
        </div>
      ) : null}
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
        setSelected([...new Set(services.map((service) => service.service_task_id))])
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
    setSelected((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]))
  }

  // 선택한 전문분야를 기존 지역 조합과 함께 저장
  const saveServices = async () => {
    const selectedTaskIds = selected.filter((item) => typeof item === 'number')
    const regionIds = [...new Set(savedServices.map((service) => service.region_code_id).filter(Boolean))]

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
          savedServices.find((service) => service.service_task_id === serviceTaskId && service.region_code_id === regionCodeId) ||
          savedServices.find((service) => service.region_code_id === regionCodeId)

        return {
          service_task_id: serviceTaskId,
          region_code_id: regionCodeId,
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
        setSelected([...new Set(services.map((service) => service.region_code_id))])
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
    setSelected((current) => {
      if (current.includes(option)) {
        setStatusMessage('')
        return current.filter((item) => item !== option)
      }

      if (current.length >= maxRegionCount) {
        setStatusMessage(`작업지역은 최대 ${maxRegionCount}개까지 선택할 수 있어요.`)
        return current
      }

      setStatusMessage('')
      return [...current, option]
    })
  }

  // 선택한 지역을 기존 전문분야 조합과 함께 저장
  const saveRegions = async () => {
    const selectedRegionIds = selected.filter((item) => typeof item === 'number')
    const serviceTaskIds = [...new Set(savedServices.map((service) => service.service_task_id).filter(Boolean))]

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
          savedServices.find((service) => service.service_task_id === serviceTaskId && service.region_code_id === regionCodeId) ||
          savedServices.find((service) => service.service_task_id === serviceTaskId)

        return {
          service_task_id: serviceTaskId,
          region_code_id: regionCodeId,
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
