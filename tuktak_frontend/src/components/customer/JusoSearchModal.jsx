import { useState } from 'react'
import { searchJusoAddresses } from '../../api/jusoApi'
import { PrimaryButton } from './FormControls'

export function JusoSearchModal({ onClose, onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [items, setItems] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (event) => {
    event?.preventDefault()

    if (keyword.trim().length < 2) {
      setError('주소를 2글자 이상 입력해주세요.')
      return
    }

    setIsSearching(true)
    setError('')
    setItems([])

    try {
      const data = await searchJusoAddresses({ keyword: keyword.trim() })
      setItems(data.items)
      if (data.items.length === 0) {
        setError('검색 결과가 없습니다. 건물명이나 도로명을 다시 확인해주세요.')
      }
    } catch (searchError) {
      setError(searchError.message || '주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal juso-search-modal" onClick={(event) => event.stopPropagation()}>
        <h3>주소 검색</h3>
        <form className="address-search-row" onSubmit={handleSearch}>
          <input
            className="address-search-input"
            placeholder="도로명 주소 또는 건물명을 입력하세요"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="address-search-btn" type="submit" disabled={isSearching}>
            {isSearching ? '검색중' : '검색'}
          </button>
        </form>
        {error ? <p className="home-address-error">{error}</p> : null}
        <div className="address-result-list">
          {items.length === 0 ? (
            <div className="empty-result">주소를 검색해 주세요.</div>
          ) : (
            items.map((item) => (
              <button
                className="address-item"
                key={`${item.bdMgtSn}-${item.roadAddr}`}
                type="button"
                onClick={() => onSelect(item)}
              >
                <div className="address-main">{item.roadAddr}</div>
                <div className="address-sub">우편번호 {item.zipNo}</div>
              </button>
            ))
          )}
        </div>
        <PrimaryButton ghost onClick={onClose}>닫기</PrimaryButton>
      </div>
    </div>
  )
}
