import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Brain } from 'lucide-react'
import resumeService from '../services/resumeService'
import groqService from '../services/groqService'
import './ResumeUpload.css'

const ResumeUpload = ({ onResumeParsed, onError, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', 'validating', null
  const [validationResult, setValidationResult] = useState(null)
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
    setIsValidating(true)
    setUploadStatus('validating')
    setValidationResult(null)

    try {
      // First, validate with Groq AI for all file types
      let validationPassed = true
      
      if (file.type === 'text/plain') {
        // For text files, read content and validate directly
        const textContent = await readFileAsText(file)
        const validation = await groqService.validateResumeContent(textContent)
        setValidationResult(validation)
        
        if (!validation.success) {
          validationPassed = false
          setUploadStatus('error')
          onError?.(validation.error || 'Failed to validate resume content')
          return
        }
        
        if (!validation.isResume || validation.confidence < 60) {
          validationPassed = false
          setUploadStatus('error')
          const errorMessage = `This doesn't appear to be a resume. ${validation.reasoning}${validation.suggestions.length > 0 ? ' Suggestions: ' + validation.suggestions.join(', ') : ''}`
          onError?.(errorMessage)
          return
        }
      } else {
        // For PDF and DOCX files, validate filename first
        const filenameValidation = validateResumeFilename(file.name)
        if (!filenameValidation.isValid) {
          validationPassed = false
          setUploadStatus('error')
          onError?.(`This doesn't appear to be a resume file. ${filenameValidation.reasoning} Please upload a file with a resume-related name (e.g., "resume.pdf", "cv.docx").`)
          return
        }
        
        // For PDF/DOCX files with valid names, proceed with basic validation
        // We'll rely on the backend parsing to catch non-resume content
        try {
          // Set a basic validation result for PDF/DOCX files
          setValidationResult({
            success: true,
            isResume: true,
            confidence: 85, // Higher confidence for files with resume-like names
            reasoning: 'Filename suggests resume content - will be validated during parsing',
            missingElements: [],
            suggestions: []
          })
        } catch (error) {
          // If validation fails, reject the file
          console.error('PDF/DOCX validation error:', error)
          validationPassed = false
          setUploadStatus('error')
          onError?.('Failed to validate file content. Please ensure this is a valid resume document.')
          return
        }
      }

      if (validationPassed) {
        setIsValidating(false)
        setIsUploading(true)
        setUploadStatus(null)

        const result = await resumeService.parseResume(file, userId)
        setUploadStatus('success')
        onResumeParsed?.(result.data)
      }
    } catch (error) {
      console.error('Resume processing error:', error)
      setUploadStatus('error')
      
      // Provide more specific error messages
      let errorMessage = error.message
      if (error.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to resume parser service. Please try again later.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again with a smaller file or check your internet connection.'
      } else if (error.message.includes('validation')) {
        errorMessage = 'Resume validation failed. Please ensure your file contains professional resume content.'
      }
      
      onError?.(errorMessage)
    } finally {
      setIsValidating(false)
      setIsUploading(false)
    }
  }, [supportedTypes, onResumeParsed, onError, userId])

  // Helper function to read text file content
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Helper function to validate resume filename
  const validateResumeFilename = (filename) => {
    const resumeFilenamePatterns = [
      /resume/i, /cv/i, /curriculum/i, /vitae/i,
      /profile/i, /bio/i, /background/i,
      /john/i, /jane/i, /smith/i, /doe/i, // Common names
      /engineer/i, /developer/i, /manager/i, /analyst/i, // Job titles
      /2024/i, /2023/i, /2022/i, /2021/i, /2020/i // Years
    ]
    
    const hasResumePattern = resumeFilenamePatterns.some(pattern => pattern.test(filename))
    
    if (hasResumePattern) {
      return {
        isValid: true,
        reasoning: 'Filename contains resume-related keywords'
      }
    }
    
    // Check if filename is too generic
    const genericPatterns = [
      /^document/i, /^file/i, /^untitled/i, /^new/i,
      /^scan/i, /^image/i, /^photo/i, /^picture/i
    ]
    
    const isGeneric = genericPatterns.some(pattern => pattern.test(filename))
    
    if (isGeneric) {
      return {
        isValid: false,
        reasoning: 'Filename is too generic and doesn\'t suggest resume content'
      }
    }
    
    // Check filename length and structure
    if (filename.length < 8) { // Increased from 5 to 8 to be more strict
      return {
        isValid: false,
        reasoning: 'Filename is too short to be descriptive'
      }
    }
    
    // If it passes basic checks but doesn't have obvious resume keywords, give a warning
    return {
      isValid: true,
      reasoning: 'Filename doesn\'t clearly indicate resume content but may be valid'
    }
  }

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


  const handleCancelUpload = useCallback(() => {
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

        {isValidating ? (
          <div className="upload-content">
            <Brain className="upload-icon spinning" />
            <h3>Validating Resume...</h3>
            <p>{uploadedFile?.type === 'text/plain' ? 'AI is analyzing content for resume structure' : 'Validating filename and file type'}</p>
          </div>
        ) : isUploading ? (
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
              {validationResult && validationResult.success && (
                <div className="validation-info">
                  <p className="validation-confidence">
                    AI Confidence: {validationResult.confidence}%
                  </p>
                  <p className="validation-reasoning">
                    {validationResult.reasoning}
                  </p>
                </div>
              )}
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
                  <li><strong>Use resume-related filename (required for PDF/DOCX)</strong></li>
                  <li><strong>AI validates TXT content, filename validates PDF/DOCX</strong></li>
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
