import { contractorNavItems } from '../../data/contractorData'

export function ContractorBottomNav({ current, go }) {
  return (
    <nav className="bottom-nav contractor-bottom-nav" aria-label="시공자 하단 메뉴">
      {contractorNavItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={current === item.key ? 'active' : ''}
          onClick={() => go(item.key)}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
