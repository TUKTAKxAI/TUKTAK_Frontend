import { FaMapMarkerAlt, FaSearch, FaStar, FaUserCircle } from 'react-icons/fa'
import { contractorProfile, contractorScreens, contractorServiceOptions } from '../../data/contractorData'
import { ContractorPage, MenuTile } from './ContractorPageShared'

export function ContractorMypagePage({ go }) {
  return (
    <ContractorPage title="TUKTAK PARTNERS">
      <div className="contractor-profile-head">
        <FaUserCircle />
        <div>
          <h1>{contractorProfile.name} 파트너님,<br />안녕하세요!</h1>
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
  return (
    <ContractorPage title="내 정보" back={() => go(contractorScreens.mypage)}>
      <div className="contractor-form">
        <label><span>업체명</span><input defaultValue={contractorProfile.businessName} /></label>
        <label><span>이메일</span><input defaultValue={contractorProfile.email} /></label>
        <label><span>알림</span><select defaultValue="on"><option value="on">ON</option><option value="off">OFF</option></select></label>
      </div>
    </ContractorPage>
  )
}

export function ContractorMyServicesPage({ go }) {
  return (
    <ContractorPage title="내 전문분야" back={() => go(contractorScreens.mypage)}>
      <div className="contractor-service-grid">
        {contractorServiceOptions.map((item, index) => (
          <button className={index < 4 ? 'selected' : ''} type="button" key={item}>{item}</button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorMyRegionsPage({ go }) {
  return (
    <ContractorPage title="내 지역" back={() => go(contractorScreens.mypage)}>
      <div className="contractor-list">
        {contractorProfile.regions.map((region) => (
          <article className="contractor-line-card" key={region}>
            <FaMapMarkerAlt />
            <div><strong>{region}</strong><p>작업 가능 지역</p></div>
          </article>
        ))}
      </div>
    </ContractorPage>
  )
}
