import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import './ConfirmationModal.css'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  isLoading = false
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 size={24} />
      case 'info':
        return <AlertTriangle size={24} />
      default:
        return <AlertTriangle size={24} />
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return '#ef4444'
      case 'info':
        return '#3b82f6'
      default:
        return '#f59e0b'
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-danger'
      case 'info':
        return 'btn-primary'
      default:
        return 'btn-warning'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="confirmation-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="confirmation-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirmation-modal-header">
            <div className="confirmation-icon" style={{ color: getIconColor() }}>
              {getIcon()}
            </div>
            <button 
              className="confirmation-close-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="confirmation-modal-content">
            <h3 className="confirmation-title">{title}</h3>
            <p className="confirmation-message">{message}</p>
          </div>

          <div className="confirmation-modal-actions">
            <button
              className="confirmation-btn confirmation-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              className={`confirmation-btn ${getButtonClass()}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfirmationModal
