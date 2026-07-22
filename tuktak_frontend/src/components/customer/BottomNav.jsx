import { FaRobot, FaHandshake, FaHome, FaExclamationTriangle, FaCommentDots } from 'react-icons/fa'
import { navRoots, screens } from '../../data/customerData'

const navItems = [
  ['AI 견적', 'ai', screens.estimateHome, FaRobot],
  ['매칭', 'match', screens.matchingHome, FaHandshake],
  ['홈', 'home', screens.home, FaHome],
  ['리스크', 'risk', screens.riskHome, FaExclamationTriangle],
  ['채팅', 'chat', screens.chatList, FaCommentDots],
]

export function BottomNav({ current, go }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(([label, key, target, Icon]) => {
        const active = navRoots[key].includes(current)

        return (
          <button
            className={`${active ? 'active' : ''} ${key === 'home' ? 'is-home' : ''}`.trim()}
            key={target}
            onClick={() => go(target)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <Icon />
            </span>
            {key !== 'home' ? <span className="nav-label">{label}</span> : null}
          </button>
        )
      })}
    </nav>
  )
}
