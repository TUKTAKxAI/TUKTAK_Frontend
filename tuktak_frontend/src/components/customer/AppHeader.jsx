import { figmaAssets } from './figmaAssets'

export function AppHeader({ title, back, onSearch, minimal }) {
  return (
    <header className={`app-header ${minimal ? 'minimal' : ''}`}>
      <button className="icon-button image-button" onClick={back} aria-label="뒤로가기">
        <img src={figmaAssets.back} alt="" />
      </button>
      {!minimal ? (
        <button className="search-icon image-button" onClick={onSearch} aria-label="검색">
          <img src={figmaAssets.search} alt="" />
        </button>
      ) : null}
      <h1>{title}</h1>
    </header>
  )
}
