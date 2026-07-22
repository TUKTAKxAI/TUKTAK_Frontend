import { figmaAssets } from './figmaAssets'

export function PrimaryButton({ children, onClick, narrow, orange, ghost, disabled, style }) {
  return (
    <button
      className={`primary-button ${narrow ? 'narrow' : ''} ${orange ? 'orange' : ''} ${ghost ? 'ghost' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}

export function BackButton({ onClick, inline }) {
  return (
    <button className={`${inline ? 'inline-back' : 'floating-back'} image-button`} onClick={onClick} aria-label="뒤로가기">
      <img src={figmaAssets.back} alt="" />
    </button>
  )
}

export function Avatar({ large, tone = 'blue' }) {
  return <div className={`avatar ${large ? 'large' : ''} ${tone}`} />
}
