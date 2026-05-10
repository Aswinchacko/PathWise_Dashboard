import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import './RoadmapToast.css'

/**
 * In-app toast for Roadmap (replaces window.alert for save / errors).
 */
export default function RoadmapToast({ toast, onDismiss }) {
  if (!toast?.message) return null

  const { type = 'success', message } = toast
  const Icon = type === 'error' ? AlertCircle : type === 'info' ? Info : CheckCircle2

  return createPortal(
    <div
      className={`roadmap-toast roadmap-toast--${type}`}
      role="status"
      aria-live="polite"
    >
      <div className="roadmap-toast__glow" aria-hidden />
      <div className="roadmap-toast__icon">
        <Icon size={22} strokeWidth={2.25} />
      </div>
      <p className="roadmap-toast__message">{message}</p>
      <button
        type="button"
        className="roadmap-toast__close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </div>,
    document.body,
  )
}
