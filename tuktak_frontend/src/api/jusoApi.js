const DEFAULT_JUSO_POPUP_URL = 'https://www.juso.go.kr/addrlink/addrLinkUrl.do'
const DEFAULT_JUSO_SEARCH_URL = 'https://business.juso.go.kr/addrlink/addrLinkApi.do'

export function hasJusoConfirmKey() {
  return Boolean(import.meta.env.VITE_JUSO_CONFIRM_KEY || import.meta.env.VITE_JUSO_SEARCH_KEY || import.meta.env.VITE_JUSO_KEY)
}

export function hasJusoSearchKey() {
  return Boolean(import.meta.env.VITE_JUSO_SEARCH_KEY || import.meta.env.VITE_JUSO_CONFIRM_KEY || import.meta.env.VITE_JUSO_KEY)
}

export function getJusoPopupUrl() {
  const confirmKey = import.meta.env.VITE_JUSO_CONFIRM_KEY || import.meta.env.VITE_JUSO_SEARCH_KEY || import.meta.env.VITE_JUSO_KEY
  const popupUrl = import.meta.env.VITE_JUSO_POPUP_URL || DEFAULT_JUSO_POPUP_URL
  const returnUrl = `${window.location.origin}/juso-callback.html`
  const cssUrl = `${window.location.origin}/addrlinkMobileSample.css`
  const params = new URLSearchParams({
    confmKey: confirmKey,
    returnUrl,
    resultType: '4',
    useDetailAddr: 'Y',
    cssUrl,
  })

  return `${popupUrl}?${params.toString()}`
}

export async function searchJusoAddresses({ keyword, currentPage = 1, countPerPage = 10 }) {
  const confirmKey = import.meta.env.VITE_JUSO_SEARCH_KEY || import.meta.env.VITE_JUSO_CONFIRM_KEY || import.meta.env.VITE_JUSO_KEY
  const searchUrl = import.meta.env.VITE_JUSO_SEARCH_URL || DEFAULT_JUSO_SEARCH_URL
  const params = new URLSearchParams({
    confmKey: confirmKey,
    currentPage: String(currentPage),
    countPerPage: String(countPerPage),
    keyword,
    resultType: 'json',
  })
  const response = await fetch(`${searchUrl}?${params.toString()}`)

  if (!response.ok) {
    throw new Error('주소 검색 API 호출에 실패했습니다.')
  }

  const data = await response.json()
  const common = data?.results?.common

  if (common?.errorCode && common.errorCode !== '0') {
    throw new Error(common.errorMessage || '주소 검색에 실패했습니다.')
  }

  return {
    items: data?.results?.juso || [],
    totalCount: Number(common?.totalCount || 0),
    currentPage: Number(common?.currentPage || currentPage),
    countPerPage: Number(common?.countPerPage || countPerPage),
  }
}
