import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, message, title = "Success!" }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <motion.div 
        className="success-modal"
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-modal-header">
          <div className="success-icon">
            <CheckCircle size={24} />
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="success-modal-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        
        <div className="success-modal-footer">
          <button className="success-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessModal;
