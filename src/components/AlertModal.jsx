import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import './AlertModal.css'

const AlertModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'OK',
  onConfirm 
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />
      case 'warning':
        return <AlertTriangle size={24} />
      case 'error':
        return <XCircle size={24} />
      default:
        return <Info size={24} />
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <motion.div 
        className={`alert-modal ${type}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="alert-modal-header">
          <div className="alert-icon">
            {getIcon()}
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="alert-modal-body">
          {title && <h3 className="alert-title">{title}</h3>}
          <p className="alert-message">{message}</p>
        </div>
        
        <div className="alert-modal-actions">
          <button 
            className={`alert-btn alert-btn-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AlertModal
