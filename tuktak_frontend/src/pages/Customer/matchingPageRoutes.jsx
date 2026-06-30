import { screens } from '../../data/customerData'
import { MatchingScheduleRoute } from './MatchingScheduleRoute'
import {
  MatchingAddressListPage,
  MatchingAddressSelectPage,
  MatchingAuctionPage,
  MatchingDonePage,
  MatchingEstimateSelectPage,
  MatchingHomePage,
  MatchingPartnerInfoPage,
  MatchingPartnerPage,
  MatchingProgressPage,
  ReviewWritePage,
} from './MatchingPages'

export function getMatchingPageRoutes({ go }) {
  return {
    [screens.matchingHome]: <MatchingHomePage go={go} />,
    [screens.matchingEstimateSelect]: <MatchingEstimateSelectPage go={go} />,
    [screens.matchingAddressList]: <MatchingAddressListPage go={go} />,
    [screens.matchingAddressSelect]: <MatchingAddressSelectPage go={go} />,
    [screens.matchingSchedule]: <MatchingScheduleRoute go={go} />,
    [screens.matchingProgress]: <MatchingProgressPage go={go} />,
    [screens.matchingAuction]: <MatchingAuctionPage go={go} />,
    [screens.matchingPartner]: <MatchingPartnerPage go={go} />,
    [screens.matchingPartnerInfo]: <MatchingPartnerInfoPage go={go} />,
    [screens.matchingDone]: <MatchingDonePage go={go} />,
    [screens.reviewWrite]: <ReviewWritePage go={go} />,
  }
}
