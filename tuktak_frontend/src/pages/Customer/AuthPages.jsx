import { ChoiceCard } from '../../components/customer/Cards'
import { figmaAssets } from '../../components/customer/figmaAssets'
import { BackButton, Logo, PrimaryButton } from '../../components/customer/FormControls'
import { JusoSearchModal } from '../../components/customer/JusoSearchModal'
import { screens, signupTerms } from '../../data/customerData'
import { contractorScreens, partnerSignupTerms } from '../../data/contractorData'
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
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

// ----------------------------------------------------------------------------
// 분야 선택 / 작업지역 선택에 공용으로 쓰는 좌-우 패널 컴포넌트
// (파트너 "전문 분야" 화면과 "작업 지역" 화면이 동일한 UI 패턴이라 재사용)
// ----------------------------------------------------------------------------
function MultiSelectPanel({ groups, selected, onToggle, onReset, footerLabel, maxCount }) {
  const [activeGroupKey, setActiveGroupKey] = useState(groups[0]?.key)

  const activeGroup = groups.find((g) => g.key === activeGroupKey) || groups[0]

  return (
    <div className="select-panel">
      <div className="select-panel-body">
        <div className="sidebar-list">
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              className={activeGroupKey === group.key ? "active" : ""}
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
        <div className="footer-count-row">
          <span>
            {footerLabel} {selected.length} / {maxCount}
          </span>

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

// TODO: 실제로는 API로 받아오거나 별도 데이터 파일로 분리하세요.
// (2026-07 데이터 수집 계획서의 object 범주를 기존 대분류에 매핑해 반영함)
const categoryGroups = [
  {
    key: "appliance",
    label: "가전",
    items: [
      { id: "appliance_all", label: "가전 전체" },
      { id: "aircon", label: "에어컨" },
      { id: "aircon_remote", label: "에어컨 리모컨" },
      { id: "washer", label: "세탁기" },
      { id: "fridge", label: "냉장고" },
      { id: "tv", label: "TV" },
      { id: "gas_range", label: "가스레인지" },
      { id: "induction", label: "인덕션" },
      { id: "dishwasher", label: "식기세척기" },
      { id: "boiler", label: "보일러" },
      { id: "water_heater", label: "온수기" },
    ],
  },
  {
    key: "plumbing",
    label: "배관 / 누수",
    items: [
      { id: "plumbing_all", label: "배관/누수 전체" },
      { id: "leak", label: "누수 탐지" },
      { id: "pipe", label: "배관 교체" },
      { id: "sink", label: "싱크대" },
      { id: "faucet", label: "수전" },
      { id: "drain", label: "배수구" },
      { id: "sewer", label: "하수구" },
    ],
  },
  {
    key: "bathroom",
    label: "욕실",
    items: [
      { id: "bathroom_all", label: "욕실 전체" },
      { id: "wash_basin", label: "세면대" },
      { id: "toilet", label: "변기" },
      { id: "shower", label: "샤워기" },
      { id: "bathtub", label: "욕조" },
      { id: "bathroom_ceiling", label: "욕실 천장" },
      { id: "bathroom_floor", label: "욕실 바닥" },
    ],
  },
  {
    key: "kitchen",
    label: "주방",
    items: [
      { id: "kitchen_all", label: "주방 전체" },
      { id: "kitchen_floor", label: "주방 바닥" },
    ],
  },
  {
    key: "electric",
    label: "전기 / 조명",
    items: [
      { id: "electric_all", label: "전기/조명 전체" },
      { id: "outlet", label: "콘센트" },
      { id: "switch", label: "스위치" },
      { id: "lighting", label: "조명" },
      { id: "breaker", label: "차단기" },
    ],
  },
  {
    key: "wall",
    label: "도배 / 벽면",
    items: [
      { id: "wall_all", label: "도배/벽면 전체" },
      { id: "wall", label: "벽" },
      { id: "ceiling", label: "천장" },
      { id: "wallpaper", label: "벽지" },
      { id: "paint", label: "페인트" },
    ],
  },
  {
    key: "tile",
    label: "타일 / 바닥",
    items: [
      { id: "tile_all", label: "타일/바닥 전체" },
      { id: "tile", label: "타일" },
      { id: "wood_floor", label: "마루" },
      { id: "vinyl_floor", label: "장판" },
    ],
  },
  {
    key: "door",
    label: "창호 / 문",
    items: [
      { id: "door_all", label: "창호/문 전체" },
      { id: "door", label: "문" },
      { id: "door_knob", label: "문고리" },
      { id: "door_lock", label: "도어락" },
      { id: "window", label: "창문" },
      { id: "screen_door", label: "방충망" },
      { id: "sash", label: "샷시" },
    ],
  },
  {
    key: "furniture",
    label: "가구 / 설치",
    items: [
      { id: "furniture_all", label: "가구/설치 전체" },
      { id: "storage_cabinet", label: "수납장" },
      { id: "built_in_closet", label: "붙박이장" },
      { id: "curtain_blind", label: "커튼/블라인드" },
      { id: "furniture", label: "가구" },
    ],
  },
  {
    key: "etc",
    label: "기타",
    items: [
      { id: "etc_all", label: "기타 전체" },
      { id: "unknown", label: "알 수 없음" },
      { id: "etc_other", label: "기타" },
    ],
  },
]

// TODO: 실제로는 API로 받아오거나 별도 데이터 파일로 분리하고,
// id 값은 실제 행정구역 코드(regionCodeId)로 교체하는 것을 권장합니다.
// (대한민국 17개 광역시/도 + 시/군/구 전체 반영, 가나다순)
const regionGroups = [
  {
    key: "seoul",
    label: "서울",
    items: [
      { id: "seoul_all", label: "서울 전체" },
      { id: "gangnam", label: "강남구" },
      { id: "gangdong", label: "강동구" },
      { id: "gangbuk", label: "강북구" },
      { id: "gangseo", label: "강서구" },
      { id: "gwanak", label: "관악구" },
      { id: "gwangjin", label: "광진구" },
      { id: "guro", label: "구로구" },
      { id: "geumcheon", label: "금천구" },
      { id: "nowon", label: "노원구" },
      { id: "dobong", label: "도봉구" },
      { id: "dongdaemun", label: "동대문구" },
      { id: "dongjak", label: "동작구" },
      { id: "mapo", label: "마포구" },
      { id: "seodaemun", label: "서대문구" },
      { id: "seocho", label: "서초구" },
      { id: "seongdong", label: "성동구" },
      { id: "seongbuk", label: "성북구" },
      { id: "songpa", label: "송파구" },
      { id: "yangcheon", label: "양천구" },
      { id: "yeongdeungpo", label: "영등포구" },
      { id: "yongsan", label: "용산구" },
      { id: "eunpyeong", label: "은평구" },
      { id: "jongno", label: "종로구" },
      { id: "jung", label: "중구" },
      { id: "jungnang", label: "중랑구" },
    ],
  },
  {
    key: "busan",
    label: "부산",
    items: [
      { id: "busan_all", label: "부산 전체" },
      { id: "busan_gangseo", label: "강서구" },
      { id: "busan_geumjeong", label: "금정구" },
      { id: "busan_gijang", label: "기장군" },
      { id: "busan_nam", label: "남구" },
      { id: "busan_dong", label: "동구" },
      { id: "busan_dongnae", label: "동래구" },
      { id: "busan_busanjin", label: "부산진구" },
      { id: "busan_buk", label: "북구" },
      { id: "busan_sasang", label: "사상구" },
      { id: "busan_saha", label: "사하구" },
      { id: "busan_seo", label: "서구" },
      { id: "busan_suyeong", label: "수영구" },
      { id: "busan_yeonje", label: "연제구" },
      { id: "busan_yeongdo", label: "영도구" },
      { id: "busan_jung", label: "중구" },
      { id: "busan_haeundae", label: "해운대구" },
    ],
  },
  {
    key: "daegu",
    label: "대구",
    items: [
      { id: "daegu_all", label: "대구 전체" },
      { id: "daegu_gunwi", label: "군위군" },
      { id: "daegu_nam", label: "남구" },
      { id: "daegu_dalseo", label: "달서구" },
      { id: "daegu_dalseong", label: "달성군" },
      { id: "daegu_dong", label: "동구" },
      { id: "daegu_buk", label: "북구" },
      { id: "daegu_seo", label: "서구" },
      { id: "daegu_suseong", label: "수성구" },
      { id: "daegu_jung", label: "중구" },
    ],
  },
  {
    key: "incheon",
    label: "인천",
    items: [
      { id: "incheon_all", label: "인천 전체" },
      { id: "incheon_ganghwa", label: "강화군" },
      { id: "incheon_gyeyang", label: "계양구" },
      { id: "incheon_namdong", label: "남동구" },
      { id: "incheon_dong", label: "동구" },
      { id: "incheon_michuhol", label: "미추홀구" },
      { id: "incheon_bupyeong", label: "부평구" },
      { id: "incheon_seo", label: "서구" },
      { id: "incheon_yeonsu", label: "연수구" },
      { id: "incheon_ongjin", label: "옹진군" },
      { id: "incheon_jung", label: "중구" },
    ],
  },
  {
    key: "gwangju",
    label: "광주",
    items: [
      { id: "gwangju_all", label: "광주 전체" },
      { id: "gwangju_gwangsan", label: "광산구" },
      { id: "gwangju_nam", label: "남구" },
      { id: "gwangju_dong", label: "동구" },
      { id: "gwangju_buk", label: "북구" },
      { id: "gwangju_seo", label: "서구" },
    ],
  },
  {
    key: "daejeon",
    label: "대전",
    items: [
      { id: "daejeon_all", label: "대전 전체" },
      { id: "daejeon_daedeok", label: "대덕구" },
      { id: "daejeon_dong", label: "동구" },
      { id: "daejeon_seo", label: "서구" },
      { id: "daejeon_yuseong", label: "유성구" },
      { id: "daejeon_jung", label: "중구" },
    ],
  },
  {
    key: "ulsan",
    label: "울산",
    items: [
      { id: "ulsan_all", label: "울산 전체" },
      { id: "ulsan_nam", label: "남구" },
      { id: "ulsan_dong", label: "동구" },
      { id: "ulsan_buk", label: "북구" },
      { id: "ulsan_ulju", label: "울주군" },
      { id: "ulsan_jung", label: "중구" },
    ],
  },
  {
    key: "sejong",
    label: "세종",
    items: [{ id: "sejong_all", label: "세종 전체" }],
  },
  {
    key: "gyeonggi",
    label: "경기",
    items: [
      { id: "gyeonggi_all", label: "경기 전체" },
      { id: "gyeonggi_gapyeong", label: "가평군" },
      { id: "gyeonggi_goyang", label: "고양시" },
      { id: "gyeonggi_gwacheon", label: "과천시" },
      { id: "gyeonggi_gwangmyeong", label: "광명시" },
      { id: "gyeonggi_gwangju", label: "광주시" },
      { id: "gyeonggi_guri", label: "구리시" },
      { id: "gyeonggi_gunpo", label: "군포시" },
      { id: "gyeonggi_gimpo", label: "김포시" },
      { id: "gyeonggi_namyangju", label: "남양주시" },
      { id: "gyeonggi_dongducheon", label: "동두천시" },
      { id: "gyeonggi_bucheon", label: "부천시" },
      { id: "gyeonggi_seongnam", label: "성남시" },
      { id: "gyeonggi_suwon", label: "수원시" },
      { id: "gyeonggi_siheung", label: "시흥시" },
      { id: "gyeonggi_ansan", label: "안산시" },
      { id: "gyeonggi_anseong", label: "안성시" },
      { id: "gyeonggi_anyang", label: "안양시" },
      { id: "gyeonggi_yangju", label: "양주시" },
      { id: "gyeonggi_yangpyeong", label: "양평군" },
      { id: "gyeonggi_yeoju", label: "여주시" },
      { id: "gyeonggi_yeoncheon", label: "연천군" },
      { id: "gyeonggi_osan", label: "오산시" },
      { id: "gyeonggi_yongin", label: "용인시" },
      { id: "gyeonggi_uiwang", label: "의왕시" },
      { id: "gyeonggi_uijeongbu", label: "의정부시" },
      { id: "gyeonggi_icheon", label: "이천시" },
      { id: "gyeonggi_paju", label: "파주시" },
      { id: "gyeonggi_pyeongtaek", label: "평택시" },
      { id: "gyeonggi_pocheon", label: "포천시" },
      { id: "gyeonggi_hanam", label: "하남시" },
      { id: "gyeonggi_hwaseong", label: "화성시" },
    ],
  },
  {
    key: "gangwon",
    label: "강원",
    items: [
      { id: "gangwon_all", label: "강원 전체" },
      { id: "gangwon_gangneung", label: "강릉시" },
      { id: "gangwon_goseong", label: "고성군" },
      { id: "gangwon_donghae", label: "동해시" },
      { id: "gangwon_samcheok", label: "삼척시" },
      { id: "gangwon_sokcho", label: "속초시" },
      { id: "gangwon_yanggu", label: "양구군" },
      { id: "gangwon_yangyang", label: "양양군" },
      { id: "gangwon_yeongwol", label: "영월군" },
      { id: "gangwon_wonju", label: "원주시" },
      { id: "gangwon_inje", label: "인제군" },
      { id: "gangwon_jeongseon", label: "정선군" },
      { id: "gangwon_cheorwon", label: "철원군" },
      { id: "gangwon_chuncheon", label: "춘천시" },
      { id: "gangwon_taebaek", label: "태백시" },
      { id: "gangwon_pyeongchang", label: "평창군" },
      { id: "gangwon_hongcheon", label: "홍천군" },
      { id: "gangwon_hwacheon", label: "화천군" },
      { id: "gangwon_hoengseong", label: "횡성군" },
    ],
  },
  {
    key: "chungbuk",
    label: "충북",
    items: [
      { id: "chungbuk_all", label: "충북 전체" },
      { id: "chungbuk_goesan", label: "괴산군" },
      { id: "chungbuk_danyang", label: "단양군" },
      { id: "chungbuk_boeun", label: "보은군" },
      { id: "chungbuk_yeongdong", label: "영동군" },
      { id: "chungbuk_okcheon", label: "옥천군" },
      { id: "chungbuk_eumseong", label: "음성군" },
      { id: "chungbuk_jecheon", label: "제천시" },
      { id: "chungbuk_jeungpyeong", label: "증평군" },
      { id: "chungbuk_jincheon", label: "진천군" },
      { id: "chungbuk_cheongju", label: "청주시" },
      { id: "chungbuk_chungju", label: "충주시" },
    ],
  },
  {
    key: "chungnam",
    label: "충남",
    items: [
      { id: "chungnam_all", label: "충남 전체" },
      { id: "chungnam_gyeryong", label: "계룡시" },
      { id: "chungnam_gongju", label: "공주시" },
      { id: "chungnam_geumsan", label: "금산군" },
      { id: "chungnam_nonsan", label: "논산시" },
      { id: "chungnam_dangjin", label: "당진시" },
      { id: "chungnam_boryeong", label: "보령시" },
      { id: "chungnam_buyeo", label: "부여군" },
      { id: "chungnam_seosan", label: "서산시" },
      { id: "chungnam_seocheon", label: "서천군" },
      { id: "chungnam_asan", label: "아산시" },
      { id: "chungnam_yesan", label: "예산군" },
      { id: "chungnam_cheonan", label: "천안시" },
      { id: "chungnam_cheongyang", label: "청양군" },
      { id: "chungnam_taean", label: "태안군" },
      { id: "chungnam_hongseong", label: "홍성군" },
    ],
  },
  {
    key: "jeonbuk",
    label: "전북",
    items: [
      { id: "jeonbuk_all", label: "전북 전체" },
      { id: "jeonbuk_gochang", label: "고창군" },
      { id: "jeonbuk_gunsan", label: "군산시" },
      { id: "jeonbuk_gimje", label: "김제시" },
      { id: "jeonbuk_namwon", label: "남원시" },
      { id: "jeonbuk_muju", label: "무주군" },
      { id: "jeonbuk_buan", label: "부안군" },
      { id: "jeonbuk_sunchang", label: "순창군" },
      { id: "jeonbuk_wanju", label: "완주군" },
      { id: "jeonbuk_iksan", label: "익산시" },
      { id: "jeonbuk_imsil", label: "임실군" },
      { id: "jeonbuk_jangsu", label: "장수군" },
      { id: "jeonbuk_jeonju", label: "전주시" },
      { id: "jeonbuk_jeongeup", label: "정읍시" },
      { id: "jeonbuk_jinan", label: "진안군" },
    ],
  },
  {
    key: "jeonnam",
    label: "전남",
    items: [
      { id: "jeonnam_all", label: "전남 전체" },
      { id: "jeonnam_gangjin", label: "강진군" },
      { id: "jeonnam_goheung", label: "고흥군" },
      { id: "jeonnam_gokseong", label: "곡성군" },
      { id: "jeonnam_gwangyang", label: "광양시" },
      { id: "jeonnam_gurye", label: "구례군" },
      { id: "jeonnam_naju", label: "나주시" },
      { id: "jeonnam_damyang", label: "담양군" },
      { id: "jeonnam_mokpo", label: "목포시" },
      { id: "jeonnam_muan", label: "무안군" },
      { id: "jeonnam_boseong", label: "보성군" },
      { id: "jeonnam_suncheon", label: "순천시" },
      { id: "jeonnam_sinan", label: "신안군" },
      { id: "jeonnam_yeosu", label: "여수시" },
      { id: "jeonnam_yeonggwang", label: "영광군" },
      { id: "jeonnam_yeongam", label: "영암군" },
      { id: "jeonnam_wando", label: "완도군" },
      { id: "jeonnam_jangseong", label: "장성군" },
      { id: "jeonnam_jangheung", label: "장흥군" },
      { id: "jeonnam_jindo", label: "진도군" },
      { id: "jeonnam_hampyeong", label: "함평군" },
      { id: "jeonnam_haenam", label: "해남군" },
      { id: "jeonnam_hwasun", label: "화순군" },
    ],
  },
  {
    key: "gyeongbuk",
    label: "경북",
    items: [
      { id: "gyeongbuk_all", label: "경북 전체" },
      { id: "gyeongbuk_gyeongsan", label: "경산시" },
      { id: "gyeongbuk_gyeongju", label: "경주시" },
      { id: "gyeongbuk_goryeong", label: "고령군" },
      { id: "gyeongbuk_gumi", label: "구미시" },
      { id: "gyeongbuk_gimcheon", label: "김천시" },
      { id: "gyeongbuk_mungyeong", label: "문경시" },
      { id: "gyeongbuk_bonghwa", label: "봉화군" },
      { id: "gyeongbuk_sangju", label: "상주시" },
      { id: "gyeongbuk_seongju", label: "성주군" },
      { id: "gyeongbuk_andong", label: "안동시" },
      { id: "gyeongbuk_yeongdeok", label: "영덕군" },
      { id: "gyeongbuk_yeongyang", label: "영양군" },
      { id: "gyeongbuk_yeongju", label: "영주시" },
      { id: "gyeongbuk_yeongcheon", label: "영천시" },
      { id: "gyeongbuk_yecheon", label: "예천군" },
      { id: "gyeongbuk_ulleung", label: "울릉군" },
      { id: "gyeongbuk_uljin", label: "울진군" },
      { id: "gyeongbuk_uiseong", label: "의성군" },
      { id: "gyeongbuk_cheongdo", label: "청도군" },
      { id: "gyeongbuk_cheongsong", label: "청송군" },
      { id: "gyeongbuk_chilgok", label: "칠곡군" },
      { id: "gyeongbuk_pohang", label: "포항시" },
    ],
  },
  {
    key: "gyeongnam",
    label: "경남",
    items: [
      { id: "gyeongnam_all", label: "경남 전체" },
      { id: "gyeongnam_geoje", label: "거제시" },
      { id: "gyeongnam_geochang", label: "거창군" },
      { id: "gyeongnam_gimhae", label: "김해시" },
      { id: "gyeongnam_namhae", label: "남해군" },
      { id: "gyeongnam_miryang", label: "밀양시" },
      { id: "gyeongnam_sacheon", label: "사천시" },
      { id: "gyeongnam_sancheong", label: "산청군" },
      { id: "gyeongnam_yangsan", label: "양산시" },
      { id: "gyeongnam_uiryeong", label: "의령군" },
      { id: "gyeongnam_jinju", label: "진주시" },
      { id: "gyeongnam_changnyeong", label: "창녕군" },
      { id: "gyeongnam_changwon", label: "창원시" },
      { id: "gyeongnam_tongyeong", label: "통영시" },
      { id: "gyeongnam_hadong", label: "하동군" },
      { id: "gyeongnam_haman", label: "함안군" },
      { id: "gyeongnam_hamyang", label: "함양군" },
      { id: "gyeongnam_hapcheon", label: "합천군" },
    ],
  },
  {
    key: "jeju",
    label: "제주",
    items: [
      { id: "jeju_all", label: "제주 전체" },
      { id: "jeju_jejusi", label: "제주시" },
      { id: "jeju_seogwipo", label: "서귀포시" },
    ],
  },
]

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
