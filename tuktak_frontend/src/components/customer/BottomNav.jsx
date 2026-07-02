import { navRoots, screens } from '../../data/customerData'
import { figmaAssets } from './figmaAssets'

const navItems = [
  ['AI 견적', 'ai', screens.estimateHome, figmaAssets.navAi],
  ['매칭', 'match', screens.matchingHome, figmaAssets.navMatch],
  ['홈', 'home', screens.home, figmaAssets.navHome],
  ['리스크', 'risk', screens.riskHome, figmaAssets.navRisk],
  ['채팅', 'chat', screens.chatList, figmaAssets.navChat],
]

export function BottomNav({ current, go }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(([label, key, target, icon]) => {
        const active = navRoots[key].includes(current)
        
        const isHome = key === 'home'

        return (
          <button 
            className={`${active ? 'active' : ''} ${isHome ? 'home-btn-wrapper' : ''}`} 
            key={target} 
            onClick={() => go(target)} 
            aria-label={label}
          >
            <span className={isHome ? 'home-circle' : 'nav-icon'}>
              <img src={icon} alt="" />
            </span>
          </button>
        )
      })}
    </nav>
  )
}