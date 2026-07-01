const JUSO_POPUP_URL = 'https://business.juso.go.kr/addrlink/addrMobileLinkUrl.do'

export function hasJusoConfirmKey() {
  return Boolean(import.meta.env.VITE_JUSO_CONFIRM_KEY)
}

export function getJusoPopupUrl() {
  const confirmKey = import.meta.env.VITE_JUSO_CONFIRM_KEY
  const returnUrl = `${window.location.origin}/juso-callback.html`
  const cssUrl = `${window.location.origin}/addrlinkMobileSample.css`
  const params = new URLSearchParams({
    confmKey: confirmKey,
    returnUrl,
    resultType: '4',
    useDetailAddr: 'Y',
    cssUrl,
  })

  return `${JUSO_POPUP_URL}?${params.toString()}`
}
