import { screens } from '../../data/customerData'
import { figmaAssets } from './figmaAssets'

const navItems = [
  ['AI 견적', screens.estimate, figmaAssets.navAi],
  ['매칭', screens.matching, figmaAssets.navMatch],
  ['홈', screens.home, figmaAssets.navHome],
  ['리스크', screens.risk, figmaAssets.navRisk],
  ['채팅', screens.chatList, figmaAssets.navChat],
]

export function BottomNav({ current, go }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(([label, target, icon]) => (
        <button className={current === target ? 'active' : ''} key={target} onClick={() => go(target)} aria-label={label}>
          <span>
            <img src={icon} alt="" />
          </span>
        </button>
      ))}
    </nav>
  )
}
