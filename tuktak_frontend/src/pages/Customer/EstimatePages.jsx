import { EstimateItem, HeroBlock } from '../../components/customer/Cards'
import { Field, PrimaryButton } from '../../components/customer/FormControls'
import { estimates, screens } from '../../data/customerData'

export function EstimateHomePage({ go }) {
  return (
    <section>
      <HeroBlock
        title="AI 견적을 시작해보세요"
        text="사진과 시공 정보를 입력하면 예상 비용과 위험 요소를 빠르게 확인할 수 있어요."
      />
      <PrimaryButton onClick={() => go(screens.estimateForm)}>AI 견적 시작하기</PrimaryButton>
      <div className="list-stack spaced">
        {estimates.map((item) => (
          <EstimateItem key={item.title} item={item} onClick={() => go(screens.estimateList)} />
        ))}
      </div>
    </section>
  )
}

export function EstimateFormPage({ go }) {
  return (
    <section>
      <h2 className="page-copy">수리 정보를 알려주세요</h2>
      <Field placeholder="시공 분야 선택" />
      <Field placeholder="예상 위치 입력" />
      <textarea className="textarea" placeholder="문제 상황을 자세히 입력해주세요" />
      <button className="upload-box">사진 추가</button>
      <PrimaryButton onClick={() => go(screens.estimateList)}>견적 생성</PrimaryButton>
    </section>
  )
}

export function EstimateListPage({ go }) {
  return (
    <section className="list-stack">
      {estimates.map((item) => (
        <EstimateItem key={item.title} item={item} onClick={() => go(screens.matching)} />
      ))}
    </section>
  )
}
