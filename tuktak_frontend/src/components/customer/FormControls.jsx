import { figmaAssets } from './figmaAssets'

export function Field({ placeholder, action, type = 'text' }) {
  return (
    <label className="field">
      <input type={type} placeholder={placeholder} />
      {action && <button type="button">{action}</button>}
    </label>
  )
}

export function PrimaryButton({ children, onClick, narrow }) {
  return (
    <button className={`primary-button ${narrow ? 'narrow' : ''}`} onClick={onClick}>
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

export function BackButton({ onClick }) {
  return (
    <button className="floating-back image-button" onClick={onClick} aria-label="뒤로가기">
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

export function Avatar({ large }) {
  return <div className={`avatar ${large ? 'large' : ''}`} />
}
