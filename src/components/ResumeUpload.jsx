import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react'
import resumeService from '../services/resumeService'
import './ResumeUpload.css'

const ResumeUpload = ({ onResumeParsed, onError, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', null
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [rejectedFile, setRejectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const supportedTypes = resumeService.getSupportedFileTypes()
  const acceptedTypes = supportedTypes.map(type => type.type).join(',')

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return

    // Validate file type
    if (!supportedTypes.some(type => type.type === file.type)) {
      const error = 'Please select a PDF, DOCX, or TXT file'
      setUploadStatus('error')
      onError?.(error)
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      const error = 'File size must be less than 10MB'
      setUploadStatus('error')
      onError?.(error)
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadStatus(null)

    try {
      const result = await resumeService.parseResume(file, userId)
      setUploadStatus('success')
      onResumeParsed?.(result.data)
    } catch (error) {
      console.error('Resume parsing error:', error)
      setUploadStatus('error')
      
      // Handle validation errors with modal option
      if (error.message.includes('does not appear to be a resume')) {
        setRejectedFile(file)
        setShowValidationModal(true)
        return // Don't show error message yet, let user decide
      }
      
      // Provide more specific error messages for other errors
      let errorMessage = error.message
      if (error.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to resume parser service. Please try again later.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again with a smaller file or check your internet connection.'
      }
      
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [supportedTypes, onResumeParsed, onError, userId])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }, [isUploading])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
    setUploadStatus(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleForceUpload = useCallback(async () => {
    if (!rejectedFile) return
    
    setShowValidationModal(false)
    setUploadedFile(rejectedFile)
    setIsUploading(true)
    setUploadStatus(null)

    try {
      const result = await resumeService.parseResume(rejectedFile, userId, true) // Force upload
      setUploadStatus('success')
      onResumeParsed?.(result.data)
    } catch (error) {
      console.error('Force upload error:', error)
      setUploadStatus('error')
      onError?.(error.message || 'Failed to process resume')
    } finally {
      setIsUploading(false)
      setRejectedFile(null)
    }
  }, [rejectedFile, userId, onResumeParsed, onError])

  const handleCancelUpload = useCallback(() => {
    setShowValidationModal(false)
    setRejectedFile(null)
    setUploadedFile(null)
    setUploadStatus(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="resume-upload-container">
      {/* Validation Override Modal */}
      {showValidationModal && (
        <div className="validation-modal-overlay">
          <div className="validation-modal">
            <div className="modal-header">
              <AlertTriangle className="modal-icon" />
              <h3>Resume Validation Failed</h3>
            </div>
            <div className="modal-body">
              <p>
                Our system couldn't detect typical resume content in your file <strong>"{rejectedFile?.name}"</strong>.
              </p>
              <p>
                This might happen if your resume has an unusual format or if our detection is too strict.
              </p>
              <div className="modal-options">
                <p><strong>What would you like to do?</strong></p>
                <ul>
                  <li>Upload a different file with standard resume content</li>
                  <li>Force upload this file if you're sure it's a resume</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-secondary"
                onClick={handleCancelUpload}
              >
                Try Another File
              </button>
              <button 
                className="modal-btn modal-btn-primary"
                onClick={handleForceUpload}
              >
                Force Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`resume-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="upload-content">
            <Loader2 className="upload-icon spinning" />
            <h3>Processing Resume...</h3>
            <p>Please wait while we extract information from your resume</p>
          </div>
        ) : uploadedFile ? (
          <div className="upload-content">
            {uploadStatus === 'success' ? (
              <CheckCircle className="upload-icon success" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="upload-icon error" />
            ) : (
              <FileText className="upload-icon" />
            )}
            <div className="file-info">
              <h3>{uploadedFile.name}</h3>
              <p>{formatFileSize(uploadedFile.size)}</p>
              {uploadStatus === 'success' && (
                <p className="success-message">Resume parsed successfully!</p>
              )}
              {uploadStatus === 'error' && (
                <p className="error-message">Failed to parse resume</p>
              )}
            </div>
            <button
              type="button"
              className="remove-file-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveFile()
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="upload-content">
            <Upload className="upload-icon" />
            <h3>Upload Your Resume</h3>
            <p>Drag and drop your resume here, or click to browse</p>
            <div className="supported-formats">
              <p>Supported formats: PDF, DOCX, TXT</p>
              <p>Max file size: 10MB</p>
              <div className="resume-requirements">
                <p><strong>Resume Requirements:</strong></p>
                <ul>
                  <li>Must contain professional information</li>
                  <li>Include work experience or education</li>
                  <li>Have contact details (email/phone)</li>
                  <li>Use resume-related filename (recommended)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeUpload
