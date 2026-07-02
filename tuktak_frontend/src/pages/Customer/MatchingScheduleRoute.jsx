import { useCustomerFlow } from '../../context/CustomerFlowContext'
import { MatchingSchedulePage } from './MatchingPages'

export function MatchingScheduleRoute({ go }) {
  const flow = useCustomerFlow()

  return <MatchingSchedulePage go={go} openUrgent={() => flow.setShowUrgentModal(true)} />
}
