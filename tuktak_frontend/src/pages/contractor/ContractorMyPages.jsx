import { useMemo, useState } from 'react'
import { FaChevronRight, FaMapMarkerAlt, FaSearch, FaStar, FaUserCircle } from 'react-icons/fa'
import {
  contractorProfile,
  contractorRegionTree,
  contractorScreens,
  contractorServiceTree,
} from '../../data/contractorData'
import { ContractorPage, MenuTile } from './ContractorPageShared'

const infoFields = [
  { key: 'name', label: '이름', value: contractorProfile.name },
  { key: 'businessName', label: '업체명', value: contractorProfile.businessName },
  { key: 'email', label: '이메일', value: contractorProfile.email },
  { key: 'phone', label: '휴대폰번호', value: contractorProfile.phone },
]

function SplitTreeSelector({ tree, selected, onToggle }) {
  const [activeCategory, setActiveCategory] = useState(tree[0]?.category || '')
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
        {activeGroup.options.map((option) => (
          <label className="contractor-checkbox-row" key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function ContractorMypagePage({ go }) {
  return (
    <ContractorPage title="마이페이지" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-profile-head">
        <FaUserCircle />
        <div>
          <h1>{contractorProfile.name} 파트너님,<br />안녕하세요</h1>
          <p>{contractorProfile.email}</p>
        </div>
      </div>
      <div className="contractor-menu-grid compact">
        <MenuTile icon={<FaSearch />} label="내 정보" onClick={() => go(contractorScreens.myInfo)} />
        <MenuTile icon={<FaStar />} label="내 전문분야" onClick={() => go(contractorScreens.myServices)} />
        <MenuTile icon={<FaMapMarkerAlt />} label="내 지역" onClick={() => go(contractorScreens.myRegions)} />
      </div>
    </ContractorPage>
  )
}

export function ContractorMyInfoPage({ go }) {
  const [editingKey, setEditingKey] = useState(null)
  const [draftValues, setDraftValues] = useState(() => Object.fromEntries(infoFields.map((field) => [field.key, field.value])))
  const editingField = useMemo(() => infoFields.find((field) => field.key === editingKey), [editingKey])

  return (
    <ContractorPage title="내 정보" go={go} back={() => go(contractorScreens.mypage)}>
      <div className="contractor-edit-list">
        {infoFields.map((field) => (
          <button className="contractor-edit-row" type="button" key={field.key} onClick={() => setEditingKey(field.key)}>
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
              onChange={(event) => setDraftValues((current) => ({ ...current, [editingField.key]: event.target.value }))}
            />
          </label>
          <div className="contractor-bottom-actions">
            <button type="button" onClick={() => setEditingKey(null)}>취소</button>
            <button type="button" onClick={() => setEditingKey(null)}>완료</button>
          </div>
        </div>
      ) : null}
    </ContractorPage>
  )
}

export function ContractorMyServicesPage({ go }) {
  const [selected, setSelected] = useState(contractorProfile.services)
  const toggle = (option) => {
    setSelected((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]))
  }

  return (
    <ContractorPage title="내 전문분야" go={go} back={() => go(contractorScreens.mypage)}>
      <SplitTreeSelector tree={contractorServiceTree} selected={selected} onToggle={toggle} />
      <p className="contractor-selected-summary">{selected.length}개 분야 선택됨</p>
      <div className="contractor-bottom-actions sticky">
        <button type="button" onClick={() => go(contractorScreens.mypage)}>취소</button>
        <button type="button" onClick={() => go(contractorScreens.mypage)}>완료</button>
      </div>
    </ContractorPage>
  )
}

export function ContractorMyRegionsPage({ go }) {
  const [selected, setSelected] = useState(contractorProfile.regions)
  const toggle = (option) => {
    setSelected((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]))
  }

  return (
    <ContractorPage title="내 지역" go={go} back={() => go(contractorScreens.mypage)}>
      <SplitTreeSelector tree={contractorRegionTree} selected={selected} onToggle={toggle} />
      <p className="contractor-selected-summary">{selected.length}개 지역 선택됨</p>
      <div className="contractor-bottom-actions sticky">
        <button type="button" onClick={() => go(contractorScreens.mypage)}>취소</button>
        <button type="button" onClick={() => go(contractorScreens.mypage)}>완료</button>
      </div>
    </ContractorPage>
  )
}
