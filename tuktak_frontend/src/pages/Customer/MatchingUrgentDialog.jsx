import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { screens } from '../../data/customerData'
import { UrgentModal } from './MatchingPages'

export function MatchingUrgentDialog({ go }) {
  const flow = useCustomerFlow()

  if (!flow.showUrgentModal) return null

  return (
    <UrgentModal
      close={() => flow.setShowUrgentModal(false)}
      confirm={async () => {
        try {
          await flow.submitMatchingRequest(true)
          flow.setShowUrgentModal(false)
          go(screens.matchingProgress)
        } catch {
          flow.updateMatchingFlow({
            matchingStatus: '매칭 요청 실패',
            matchingError: '긴급 매칭 요청에 실패했습니다. AI 견적서와 주소 정보를 확인해주세요.',
          })
          flow.setShowUrgentModal(false)
        }
      }}
    />
  )
}
