import { figmaAssets } from './figmaAssets'

export function Field({ placeholder, action, type = 'text', compact }) {
  return (
    <label className={`field ${compact ? 'compact' : ''}`}>
      <input type={type} placeholder={placeholder} />
      {action && <button type="button">{action}</button>}
    </label>
  )
}

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

export function SecondaryButton({ children, onClick }) {
  return (
    <button className="secondary-button" onClick={onClick}>
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

export function Logo({ size }) {
  return (
    <div className={`logo-image ${size === 'large' ? 'large' : ''}`}>
      <img src={figmaAssets.logo} alt="TUKTAK" />
    </div>
  )
}

export function Avatar({ large, tone = 'blue' }) {
  return <div className={`avatar ${large ? 'large' : ''} ${tone}`} />
}
