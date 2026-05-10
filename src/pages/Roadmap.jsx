import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Target,
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  Clock,
  Layers,
  Star,
  RefreshCw,
  X,
  Trash2,
  PartyPopper,
  FolderKanban,
} from 'lucide-react'
import './Roadmap.css'
import roadmapService, {
  formatRoadmapApiError,
  validateRoadmapGoal,
} from '../services/roadmapService'
import authService from '../services/authService'
import recommendationService from '../services/recommendationService'
import mentorService from '../services/mentorService'
import ConfirmationModal from '../components/ConfirmationModal'
import TopicRefineModal from '../components/TopicRefineModal'
import RoadmapToast from '../components/RoadmapToast'
import { projectRecommendationUrl } from '../config/apiBase'

/** Remember which roadmap to show when the user returns to this page */
const ACTIVE_ROADMAP_ID_KEY = 'pathwise.activeRoadmapId'

/** Per-phase colors (CSS variables) — cycles for long roadmaps */
const PHASE_THEME_STYLES = [
  {
    ['--phase-zone-bg']: 'rgba(254, 252, 232, 0.72)',
    ['--phase-zone-border']: 'rgba(217, 119, 6, 0.22)',
    ['--phase-trunk-bg']: 'rgba(254, 243, 199, 0.55)',
    ['--phase-main-from']: '#fffbeb',
    ['--phase-main-mid']: '#fde047',
    ['--phase-main-to']: '#facc15',
    ['--phase-skill-from']: '#fff7ed',
    ['--phase-skill-to']: '#fdba74',
    ['--phase-spine']: '#ca8a04',
    ['--phase-spine-soft']: '#eab308',
    ['--phase-join']: '#ca8a04',
  },
  {
    ['--phase-zone-bg']: 'rgba(240, 253, 250, 0.72)',
    ['--phase-zone-border']: 'rgba(13, 148, 136, 0.22)',
    ['--phase-trunk-bg']: 'rgba(204, 251, 241, 0.5)',
    ['--phase-main-from']: '#f0fdfa',
    ['--phase-main-mid']: '#5eead4',
    ['--phase-main-to']: '#14b8a6',
    ['--phase-skill-from']: '#ecfeff',
    ['--phase-skill-to']: '#67e8f9',
    ['--phase-spine']: '#0d9488',
    ['--phase-spine-soft']: '#2dd4bf',
    ['--phase-join']: '#0f766e',
  },
  {
    ['--phase-zone-bg']: 'rgba(245, 243, 255, 0.72)',
    ['--phase-zone-border']: 'rgba(124, 58, 237, 0.2)',
    ['--phase-trunk-bg']: 'rgba(237, 233, 254, 0.55)',
    ['--phase-main-from']: '#faf5ff',
    ['--phase-main-mid']: '#c4b5fd',
    ['--phase-main-to']: '#8b5cf6',
    ['--phase-skill-from']: '#f3e8ff',
    ['--phase-skill-to']: '#d8b4fe',
    ['--phase-spine']: '#6d28d9',
    ['--phase-spine-soft']: '#a78bfa',
    ['--phase-join']: '#5b21b6',
  },
  {
    ['--phase-zone-bg']: 'rgba(255, 241, 242, 0.72)',
    ['--phase-zone-border']: 'rgba(225, 29, 72, 0.18)',
    ['--phase-trunk-bg']: 'rgba(255, 228, 230, 0.55)',
    ['--phase-main-from']: '#fff1f2',
    ['--phase-main-mid']: '#fda4af',
    ['--phase-main-to']: '#f43f5e',
    ['--phase-skill-from']: '#ffe4e6',
    ['--phase-skill-to']: '#fb7185',
    ['--phase-spine']: '#e11d48',
    ['--phase-spine-soft']: '#fb7185',
    ['--phase-join']: '#be123c',
  },
  {
    ['--phase-zone-bg']: 'rgba(236, 253, 245, 0.72)',
    ['--phase-zone-border']: 'rgba(5, 150, 105, 0.2)',
    ['--phase-trunk-bg']: 'rgba(209, 250, 229, 0.55)',
    ['--phase-main-from']: '#ecfdf5',
    ['--phase-main-mid']: '#6ee7b7',
    ['--phase-main-to']: '#10b981',
    ['--phase-skill-from']: '#d1fae5',
    ['--phase-skill-to']: '#34d399',
    ['--phase-spine']: '#059669',
    ['--phase-spine-soft']: '#34d399',
    ['--phase-join']: '#047857',
  },
  {
    ['--phase-zone-bg']: 'rgba(255, 247, 237, 0.72)',
    ['--phase-zone-border']: 'rgba(234, 88, 12, 0.2)',
    ['--phase-trunk-bg']: 'rgba(255, 237, 213, 0.55)',
    ['--phase-main-from']: '#fff7ed',
    ['--phase-main-mid']: '#fdba74',
    ['--phase-main-to']: '#f97316',
    ['--phase-skill-from']: '#ffedd5',
    ['--phase-skill-to']: '#fb923c',
    ['--phase-spine']: '#ea580c',
    ['--phase-spine-soft']: '#fb923c',
    ['--phase-join']: '#c2410c',
  },
]

const phaseThemeStyle = (stepIndex) => PHASE_THEME_STYLES[stepIndex % PHASE_THEME_STYLES.length]

const getUserId = (u) => {
  if (!u) return null
  const id = u.id ?? u._id
  return id != null ? String(id) : null
}

/** roadmap.sh-style skill leaf (used in flow layout) */
function FlowSkillNode({
  skill,
  skillIndex,
  step,
  stepIndex,
  completedIds,
  processingSkill,
  isCoreTopic,
  toggleCompleted,
  highlightText,
  searchTerm,
  user,
  loadedRoadmapId,
  openTopicEdit,
}) {
  const done = completedIds.has(skill.id)
  const core = isCoreTopic(skill.title, skillIndex)
  return (
    <div
      className={`roadmap-flow-skill ${done ? 'roadmap-flow-skill--done' : ''} ${core ? 'roadmap-flow-skill--core' : ''} ${processingSkill === skill.id ? 'roadmap-flow-skill--busy' : ''}`}
    >
      {core && (
        <span className="roadmap-flow-skill__pin" title="Key topic">
          <Star size={10} strokeWidth={2.5} aria-hidden />
        </span>
      )}
      {done && (
        <span className="roadmap-flow-skill__done-badge" aria-hidden>
          <CheckCircle2 size={14} strokeWidth={2.5} />
        </span>
      )}
      <button
        type="button"
        className="roadmap-flow-skill__check"
        onClick={(e) => toggleCompleted(e, skill.id, skill.title, skillIndex, step, stepIndex)}
        disabled={processingSkill === skill.id}
        aria-label={`Mark ${skill.title} as ${done ? 'incomplete' : 'complete'}`}
      >
        {processingSkill === skill.id ? (
          <Loader2 size={16} className="spinning" />
        ) : done ? (
          <CheckCircle2 size={16} strokeWidth={2} />
        ) : (
          <Circle size={16} strokeWidth={2} />
        )}
      </button>
      <div className="roadmap-flow-skill__body">
        <span className="roadmap-flow-skill__title">{highlightText(skill.title, searchTerm)}</span>
        <span className="roadmap-flow-skill__level">
          {skillIndex < 2 ? 'Beginner' : skillIndex < 4 ? 'Intermediate' : 'Advanced'}
        </span>
      </div>
      <button
        type="button"
        className="roadmap-flow-skill__edit"
        disabled={!getUserId(user) || !loadedRoadmapId}
        title={
          !getUserId(user)
            ? 'Sign in to edit with AI'
            : !loadedRoadmapId
              ? 'Load a saved roadmap for AI edits'
              : 'Edit with AI'
        }
        onClick={(e) => {
          e.stopPropagation()
          openTopicEdit(step, stepIndex, skill, skillIndex)
        }}
      >
        <Pencil size={14} aria-hidden />
      </button>
    </div>
  )
}

/** Expanded phase: hub SVG lines from main card ↔ each skill; main card vertically centered in spine */
function RoadmapPhaseExpandedContent({
  step,
  stepIndex,
  leftBranches,
  rightBranches,
  completedIds,
  processingSkill,
  isCoreTopic,
  toggleCompleted,
  highlightText,
  searchTerm,
  user,
  loadedRoadmapId,
  openTopicEdit,
  toggleCollapsed,
}) {
  const wrapRef = useRef(null)
  const [hubLines, setHubLines] = useState(null)

  const revision = `${completedIds.size}-${step.children?.length ?? 0}`

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const compute = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 820) {
        setHubLines(null)
        return
      }
      const phase = wrap.closest('.roadmap-flow-phase')
      const main = wrap.querySelector('.roadmap-flow-main-node')
      if (!phase || !main) {
        setHubLines(null)
        return
      }

      const wRect = wrap.getBoundingClientRect()
      const mRect = main.getBoundingClientRect()
      if (wRect.width < 40 || wRect.height < 40) {
        setHubLines(null)
        return
      }

      const stroke =
        getComputedStyle(phase).getPropertyValue('--phase-join').trim() || '#ca8a04'

      const mxL = mRect.left - wRect.left
      const mxR = mRect.right - wRect.left
      const my = mRect.top - wRect.top + mRect.height / 2

      const paths = []
      wrap.querySelectorAll('.roadmap-flow-branch--left .roadmap-flow-skill').forEach((sk) => {
        const r = sk.getBoundingClientRect()
        const sx = r.right - wRect.left
        const sy = r.top - wRect.top + r.height / 2
        const midx = (sx + mxL) / 2
        paths.push(`M ${sx} ${sy} Q ${midx} ${sy} ${mxL} ${my}`)
      })
      wrap.querySelectorAll('.roadmap-flow-branch--right .roadmap-flow-skill').forEach((sk) => {
        const r = sk.getBoundingClientRect()
        const sx = r.left - wRect.left
        const sy = r.top - wRect.top + r.height / 2
        const midx = (sx + mxR) / 2
        paths.push(`M ${mxR} ${my} Q ${midx} ${sy} ${sx} ${sy}`)
      })

      setHubLines({
        w: Math.max(1, wRect.width),
        h: Math.max(1, wRect.height),
        paths,
        stroke,
      })
    }

    compute()
    const ro = new ResizeObserver(() => requestAnimationFrame(compute))
    ro.observe(wrap)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [revision, step.id])

  return (
    <div className="roadmap-flow-phase-grid-wrap" ref={wrapRef}>
      {hubLines && hubLines.paths.length > 0 && (
        <svg
          className="roadmap-flow-hub-svg"
          width={hubLines.w}
          height={hubLines.h}
          aria-hidden
        >
          {hubLines.paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={hubLines.stroke}
              strokeWidth={2.25}
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}
      <div className="roadmap-flow-columns">
        <div className="roadmap-flow-side roadmap-flow-side--left">
          {leftBranches.map(({ skill, skillIndex }) => (
            <div key={skillIndex} className="roadmap-flow-branch roadmap-flow-branch--left">
              <FlowSkillNode
                skill={skill}
                skillIndex={skillIndex}
                step={step}
                stepIndex={stepIndex}
                completedIds={completedIds}
                processingSkill={processingSkill}
                isCoreTopic={isCoreTopic}
                toggleCompleted={toggleCompleted}
                highlightText={highlightText}
                searchTerm={searchTerm}
                user={user}
                loadedRoadmapId={loadedRoadmapId}
                openTopicEdit={openTopicEdit}
              />
            </div>
          ))}
        </div>

        <div className="roadmap-flow-spine-column">
          <div className="roadmap-flow-main-wrap">
            <button
              type="button"
              className="roadmap-flow-main-node"
              onClick={() => toggleCollapsed(step.id)}
            >
              <span className="roadmap-flow-main-node__chev">
                <ChevronDown size={18} />
              </span>
              <span className="roadmap-flow-main-node__num">{stepIndex + 1}</span>
              <h3 className="roadmap-flow-main-node__title">{step.title}</h3>
              <span className="roadmap-flow-main-node__tag">Topic</span>
            </button>
          </div>
        </div>

        <div className="roadmap-flow-side roadmap-flow-side--right">
          {rightBranches.map(({ skill, skillIndex }) => (
            <div key={skillIndex} className="roadmap-flow-branch roadmap-flow-branch--right">
              <FlowSkillNode
                skill={skill}
                skillIndex={skillIndex}
                step={step}
                stepIndex={stepIndex}
                completedIds={completedIds}
                processingSkill={processingSkill}
                isCoreTopic={isCoreTopic}
                toggleCompleted={toggleCompleted}
                highlightText={highlightText}
                searchTerm={searchTerm}
                user={user}
                loadedRoadmapId={loadedRoadmapId}
                openTopicEdit={openTopicEdit}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Roadmap = () => {
  // State for ML-generated roadmaps
  const [roadmapData, setRoadmapData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [goal, setGoal] = useState('')
  const [user, setUser] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [showSavedRoadmaps, setShowSavedRoadmaps] = useState(false)
  const [processingSkill, setProcessingSkill] = useState(null)
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true)
  
  // Project recommendation states
  const [currentDomain, setCurrentDomain] = useState('')
  const [recommendationServiceAvailable, setRecommendationServiceAvailable] = useState(false)
  
  // Phase completion notification states
  const [phaseNotification, setPhaseNotification] = useState(null)
  const [phaseRecommendations, setPhaseRecommendations] = useState([])
  const [saveToast, setSaveToast] = useState(null)
  const [savingProjectKey, setSavingProjectKey] = useState(null)
  
  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roadmapToDelete, setRoadmapToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /** Mongo `roadmap_id` for the roadmap currently shown (required to persist AI edits). */
  const [loadedRoadmapId, setLoadedRoadmapId] = useState(null)
  const [topicEdit, setTopicEdit] = useState(null)
  const [refineSuccessToast, setRefineSuccessToast] = useState(null)

  useEffect(() => {
    if (!refineSuccessToast) return
    const t = setTimeout(() => setRefineSuccessToast(null), 4500)
    return () => clearTimeout(t)
  }, [refineSuccessToast])

  useEffect(() => {
    if (!saveToast) return
    const t = setTimeout(() => setSaveToast(null), 5200)
    return () => clearTimeout(t)
  }, [saveToast])

  // Load user and domains on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }

    const checkRecommendationService = async () => {
      try {
        console.log('🔍 Checking recommendation service availability...')
        const isAvailable = await recommendationService.checkHealth()
        console.log('📡 Recommendation service available:', isAvailable)
        setRecommendationServiceAvailable(isAvailable)
      } catch (error) {
        console.error('❌ Recommendation service not available:', error)
        setRecommendationServiceAvailable(false)
      }
    }


    loadUser()
    checkRecommendationService()
    // Don't load latest roadmap automatically - let user choose
  }, [])

  const loadSavedRoadmaps = useCallback(async () => {
    const uid = getUserId(user)
    setIsLoadingRoadmaps(true)
    if (!uid) {
      setSavedRoadmaps([])
      setIsLoadingRoadmaps(false)
      return
    }
    try {
      const response = await roadmapService.getUserRoadmaps(uid)
      setSavedRoadmaps(response.roadmaps || [])
    } catch (error) {
      console.error('Error loading saved roadmaps:', error)
      setSavedRoadmaps([])
    } finally {
      setIsLoadingRoadmaps(false)
    }
  }, [user])

  // Load saved roadmaps whenever user identity is known (or guest clears list)
  useEffect(() => {
    loadSavedRoadmaps()
  }, [loadSavedRoadmaps])

  // Refresh list when chatbot (or elsewhere) adds a roadmap
  useEffect(() => {
    if (!getUserId(user)) return
    const onRoadmapChanged = () => loadSavedRoadmaps()
    window.addEventListener('roadmapChanged', onRoadmapChanged)
    return () => window.removeEventListener('roadmapChanged', onRoadmapChanged)
  }, [user, loadSavedRoadmaps])

  const loadLatestRoadmap = useCallback(() => {
    try {
      if (!savedRoadmaps.length) {
        setRoadmapData([])
        setCurrentDomain('')
        setLoadedRoadmapId(null)
        return
      }

      let preferredId = null
      try {
        preferredId = localStorage.getItem(ACTIVE_ROADMAP_ID_KEY)
        if (!preferredId) {
          const g = localStorage.getItem('current_goal')
          if (g) preferredId = JSON.parse(g).roadmapId ?? null
        }
      } catch (_) {
        preferredId = null
      }
      if (preferredId != null) preferredId = String(preferredId)

      const match = preferredId
        ? savedRoadmaps.find(
            (r) => String(r.id ?? '') === preferredId || String(r._id ?? '') === preferredId
          )
        : null

      const roadmap = match || savedRoadmaps[0]
      const convertedData = roadmapService.convertToRoadmapData(roadmap)
      setRoadmapData(convertedData)
      setCurrentDomain(roadmap.domain || '')
      setLoadedRoadmapId(roadmap.id || null)
      if (roadmap.id) {
        localStorage.setItem(ACTIVE_ROADMAP_ID_KEY, String(roadmap.id))
      }
    } catch (error) {
      console.error('Error loading roadmap into view:', error)
    }
  }, [savedRoadmaps])

  // Show the right roadmap whenever the saved list updates
  useEffect(() => {
    loadLatestRoadmap()
  }, [loadLatestRoadmap])


  const generateRoadmap = async () => {
    const goalErr = validateRoadmapGoal(goal)
    if (goalErr) {
      setError(goalErr)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await roadmapService.generateRoadmap(
        goal,
        null, // No domain - let AI find the best match
        getUserId(user)
      )

      const convertedData = roadmapService.convertToRoadmapData(response)
      setRoadmapData(convertedData)
      setCurrentDomain(response.domain)
      const newId = response.id || response.roadmap_id || null
      setLoadedRoadmapId(newId)
      if (newId) localStorage.setItem(ACTIVE_ROADMAP_ID_KEY, String(newId))
      setShowGenerator(false)
      
      // Save current roadmap goal for mentor recommendations
      mentorService.saveCurrentRoadmapGoal(goal, response.domain)
      
      // Save goal separately in localStorage
      const goalData = {
        goal: goal,
        domain: response.domain,
        createdAt: new Date().toISOString(),
        roadmapId: response.id
      }
      localStorage.setItem('current_goal', JSON.stringify(goalData))
      
      // Save for job recommendations
      const roadmapData = {
        goal: goal,
        domain: response.domain,
        title: goal,
        name: goal
      }
      localStorage.setItem('selectedRoadmap', JSON.stringify(roadmapData))
      
      // Notify other components (like Jobs page) that roadmap changed
      window.dispatchEvent(new CustomEvent('roadmapChanged', { detail: roadmapData }))
      console.log('🔄 New roadmap generated, notifying Jobs page...', goal)
      
      // Clear completion state for new roadmap
      setCompletedIds(new Set())
      localStorage.removeItem('roadmap.completed')
      
      // Refresh saved roadmaps immediately and with delay
      if (user) {
        console.log('🔄 Refreshing saved roadmaps after generation...')
        
        // Immediate refresh
        await loadSavedRoadmaps()
        console.log('✅ Immediate refresh completed')
        
        // Delayed refresh to ensure backend has processed
        setTimeout(async () => {
          console.log('🔄 Delayed refresh of saved roadmaps...')
          await loadSavedRoadmaps()
          console.log('✅ Delayed refresh completed, count:', savedRoadmaps.length)
        }, 2000)
      }
    } catch (error) {
      const detail = formatRoadmapApiError(error)
      setError(
        detail
          ? `${detail}${error?.response?.status ? ` (HTTP ${error.response.status})` : ''}`
          : 'Failed to generate roadmap. Please try again.',
      )
      console.error('Error generating roadmap:', error?.response?.data || error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSavedRoadmap = (roadmap) => {
    const convertedData = roadmapService.convertToRoadmapData(roadmap)
    setRoadmapData(convertedData)
    setCurrentDomain(roadmap.domain)
    const rid = roadmap.id || null
    setLoadedRoadmapId(rid)
    if (rid) localStorage.setItem(ACTIVE_ROADMAP_ID_KEY, String(rid))
    setShowSavedRoadmaps(false)
    
    // Save current roadmap for job recommendations
    const roadmapData = {
      goal: roadmap.goal,
      domain: roadmap.domain,
      title: roadmap.goal,
      name: roadmap.goal
    }
    localStorage.setItem('selectedRoadmap', JSON.stringify(roadmapData))
    
    // Save current roadmap goal for mentor recommendations
    mentorService.saveCurrentRoadmapGoal(roadmap.goal, roadmap.domain)
    
    // Notify other components (like Jobs page) that roadmap changed
    window.dispatchEvent(new CustomEvent('roadmapChanged', { detail: roadmapData }))
    console.log('🔄 Roadmap changed, notifying Jobs page...', roadmap.goal)

    // Keep Micro-Learning and other features aligned with the roadmap open on this page
    if (roadmap.id) {
      localStorage.setItem(
        'current_goal',
        JSON.stringify({
          goal: roadmap.goal,
          domain: roadmap.domain,
          createdAt: roadmap.created_at || new Date().toISOString(),
          roadmapId: roadmap.id,
        })
      )
    }

    // Clear completion state when loading a different roadmap
    setCompletedIds(new Set())
    localStorage.removeItem('roadmap.completed')
  }

  const handleDeleteClick = (roadmap) => {
    setRoadmapToDelete(roadmap)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!user || !roadmapToDelete) return

    setIsDeleting(true)
    try {
      await roadmapService.deleteRoadmap(roadmapToDelete.id, getUserId(user))
      loadSavedRoadmaps()
      console.log('Roadmap deleted successfully')
      
      // Close modal
      setShowDeleteModal(false)
      setRoadmapToDelete(null)
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      setSaveToast({
        type: 'error',
        message: 'Failed to delete roadmap. Please try again.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRoadmapToDelete(null)
  }

  const [collapsedIds, setCollapsedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmap.collapsed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmap.completed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    localStorage.setItem('roadmap.collapsed', JSON.stringify(Array.from(collapsedIds)))
  }, [collapsedIds])

  useEffect(() => {
    localStorage.setItem('roadmap.completed', JSON.stringify(Array.from(completedIds)))
  }, [completedIds])

  const matchesTerm = useCallback((title, term) => {
    if (!term) return false
    return title.toLowerCase().includes(term.toLowerCase())
  }, [])

  const filterTreeBySearch = useCallback((node, term) => {
    if (!term) return { node, hasMatchInSubtree: false }
    const selfMatches = matchesTerm(node.title, term)
    const children = node.children || []
    const filteredChildren = []
    let descendantMatches = false
    for (const child of children) {
      const result = filterTreeBySearch(child, term)
      if (result) {
        const { node: filteredChild, hasMatchInSubtree } = result
        if (filteredChild) filteredChildren.push(filteredChild)
        if (hasMatchInSubtree) descendantMatches = true
      }
    }
    const keep = selfMatches || descendantMatches
    if (!keep) return null
    return {
      node: { ...node, children: filteredChildren },
      hasMatchInSubtree: true,
    }
  }, [matchesTerm])

  const visibleData = useMemo(() => {
    if (!searchTerm) return roadmapData
    const out = []
    for (const n of roadmapData) {
      const res = filterTreeBySearch(n, searchTerm)
      if (res && res.node) out.push(res.node)
    }
    return out
  }, [roadmapData, searchTerm, filterTreeBySearch])

  const isNodeCollapsed = useCallback(
    (id) => collapsedIds.has(id),
    [collapsedIds]
  )

  const toggleCollapsed = useCallback((id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Define core topics that should trigger project recommendations
  const isCoreTopic = useCallback((skillTitle, skillIndex) => {
    // Only trigger for advanced skills (index 2+) OR specific core technologies
    const isAdvancedSkill = skillIndex >= 2
    
    // Very specific core technologies that should trigger recommendations
    const coreTechnologies = [
      'javascript', 'react', 'vue', 'angular', 'node.js', 'express', 'python', 'django', 'flask',
      'html5', 'css3', 'sql', 'mongodb', 'postgresql', 'api', 'rest', 'graphql', 'docker',
      'kubernetes', 'aws', 'azure', 'typescript', 'redux', 'next.js', 'vue.js',
      'machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
      'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'java', 'spring',
      'php', 'laravel', 'ruby', 'rails', 'go', 'rust', 'c++', 'c#', '.net'
    ]
    
    const skillLower = skillTitle.toLowerCase()
    const isCoreTechnology = coreTechnologies.some(tech => 
      skillLower.includes(tech.toLowerCase()) || 
      skillLower === tech.toLowerCase()
    )
    
    // Also check for specific patterns that indicate core skills
    const corePatterns = [
      'framework', 'library', 'database', 'server', 'backend', 'frontend',
      'full-stack', 'devops', 'deployment', 'testing', 'debugging',
      'authentication', 'authorization', 'security', 'performance',
      'scalability', 'microservices', 'containerization'
    ]
    
    const hasCorePattern = corePatterns.some(pattern => 
      skillLower.includes(pattern)
    )
    
    return isAdvancedSkill || isCoreTechnology || hasCorePattern
  }, [])

  const checkPhaseCompletion = useCallback((step, stepIndex, completedIds) => {
    if (!step.children || step.children.length === 0) return false
    
    const totalSkills = step.children.length
    const completedSkills = step.children.filter(skill => completedIds.has(skill.id)).length
    
    return completedSkills === totalSkills
  }, [])

  const getPhaseRecommendations = useCallback(async (phaseName) => {
    console.log(`🔍 Phase recommendation check:`, {
      phaseName,
      recommendationServiceAvailable,
      phaseNotification: phaseNotification
    })
    
    if (!recommendationServiceAvailable) {
      console.log(`❌ Recommendation service not available`)
      return
    }
    
    try {
      console.log(`🎉 Phase completed: "${phaseName}" - Getting phase-based recommendations...`)
      
      const response = await fetch(`${projectRecommendationUrl('/api/recommend/phase')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase: phaseName,
          limit: 3
        })
      })
      
      console.log(`📡 API Response status:`, response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Phase recommendations received:`, data)
        
        // Show notification with phase-based projects
        if (data.recommendations && data.recommendations.length > 0) {
          console.log(`🎨 Setting phase notification with ${data.recommendations.length} projects`)
          setPhaseRecommendations(data.recommendations)
          setPhaseNotification({
            phase: phaseName,
            count: data.recommendations.length,
            method: data.method
          })
          
          // Auto-hide notification after 8 seconds
          setTimeout(() => {
            console.log(`⏰ Auto-hiding phase notification`)
            setPhaseNotification(null)
          }, 8000)
        } else {
          console.log(`⚠️ No recommendations received`)
        }
      } else {
        console.error('Failed to get phase recommendations:', response.statusText)
      }
    } catch (error) {
      console.error('Error getting phase recommendations:', error)
    }
  }, [recommendationServiceAvailable, phaseNotification])

  const handleProjectClick = useCallback(async (project) => {
    const key = project.project_id ?? project.id ?? project.title ?? 'project'
    try {
      console.log(`🎯 Project clicked: ${project.title}`)
      setSavingProjectKey(key)

      const response = await fetch(`${projectRecommendationUrl('/api/projects/save')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Project saved to database with ID: ${data.id}`)
        setSaveToast({
          type: 'success',
          message: `"${project.title}" was added to your projects.`,
        })
        setPhaseNotification(null)
      } else {
        console.error('Failed to save project:', response.statusText)
        setSaveToast({
          type: 'error',
          message: 'Could not save this project. Check that the projects service is running.',
        })
      }
    } catch (error) {
      console.error('Error saving project:', error)
      const isNetwork =
        error?.message === 'Failed to fetch' || error?.name === 'TypeError'
      setSaveToast({
        type: 'error',
        message: isNetwork
          ? `Cannot reach projects API (${projectRecommendationUrl('/api/projects')}). Start docker compose / nginx and try again.`
          : `Something went wrong: ${error.message}`,
      })
    } finally {
      setSavingProjectKey(null)
    }
  }, [])

  const handleViewAllProjects = useCallback(() => {
    console.log(`📋 Viewing all ${phaseRecommendations.length} recommended projects`)
    
    // Save all projects to database
    const saveAllProjects = async () => {
      try {
        const savePromises = phaseRecommendations.map((project) =>
          fetch(`${projectRecommendationUrl('/api/projects/save')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
          }),
        )

        const responses = await Promise.all(savePromises)
        const ok = responses.filter((r) => r.ok).length
        const failed = responses.length - ok

        if (failed === 0) {
          await Promise.all(responses.map((r) => r.json()))
          console.log(`✅ All ${ok} projects saved to database`)
          setSaveToast({
            type: 'success',
            message: `Saved ${ok} recommended projects to your list.`,
          })
          setPhaseNotification(null)
        } else {
          setSaveToast({
            type: 'error',
            message: `${ok} saved, ${failed} failed. Check the projects service and try again.`,
          })
        }
      } catch (error) {
        console.error('Error saving all projects:', error)
        setSaveToast({
          type: 'error',
          message:
            error?.message === 'Failed to fetch'
              ? `Cannot reach projects API (${projectRecommendationUrl('/api/projects')}).`
              : `Error saving projects: ${error.message}`,
        })
      }
    }
    
    saveAllProjects()
  }, [phaseRecommendations])

  const toggleCompleted = useCallback((e, id, skillTitle, skillIndex, step, stepIndex) => {
    // Prevent event bubbling to avoid accidental triggers
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent double-clicks by checking if already processing
    if (processingSkill === id) return
    
    setProcessingSkill(id)
    
    setCompletedIds((prev) => {
      const next = new Set(prev)
      const wasCompleted = next.has(id)
      
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        
        // Check if entire phase is now completed
        if (step && stepIndex !== undefined) {
          const isPhaseComplete = checkPhaseCompletion(step, stepIndex, next)
          console.log(`🔍 Phase completion check:`, {
            phaseTitle: step.title,
            stepIndex,
            totalSkills: step.children?.length || 0,
            completedSkills: step.children?.filter(skill => next.has(skill.id)).length || 0,
            isPhaseComplete
          })
          
          if (isPhaseComplete) {
            console.log(`🎉 Phase "${step.title}" completed!`)
            // Get phase-based recommendations
            getPhaseRecommendations(step.title)
          }
        }
        
        // Phase-based recommendations only - no individual topic recommendations
        console.log(`📝 Topic completed: "${skillTitle}" (index: ${skillIndex}) - Phase-based recommendations only`)
      }
      return next
    })
    
    // Clear processing state after animation
    setTimeout(() => {
      setProcessingSkill(null)
    }, 300)
  }, [recommendationServiceAvailable, isCoreTopic, processingSkill, checkPhaseCompletion, getPhaseRecommendations])

  const highlightText = useCallback((text, term) => {
    if (!term) return text
    const idx = text.toLowerCase().indexOf(term.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + term.length)
    const after = text.slice(idx + term.length)
    return (
      <>
        {before}
        <mark className="highlight">{match}</mark>
        {after}
      </>
    )
  }, [])

  const openTopicEdit = useCallback((step, stepIndex, skill, skillIndex) => {
    setTopicEdit({
      stepIndex,
      skillIndex,
      skillTitle: skill.title,
      phaseTitle: step.title,
    })
  }, [])

  const closeTopicEdit = useCallback(() => {
    setTopicEdit(null)
  }, [])

  const handleRefineFromModal = useCallback(
    async ({ instruction, preset }) => {
      const userId = user?.id ?? user?._id
      if (!userId || !loadedRoadmapId || !topicEdit) {
        throw new Error('Sign in and load a saved roadmap before applying AI edits.')
      }
      try {
        const data = await roadmapService.refineTopic({
          roadmapId: loadedRoadmapId,
          userId: String(userId),
          stepIndex: topicEdit.stepIndex,
          skillIndex: topicEdit.skillIndex,
          instruction,
          preset,
        })
        const converted = roadmapService.convertToRoadmapData(data)
        setRoadmapData(converted)
        const prefix = `step_${topicEdit.stepIndex}_skill_`
        setCompletedIds((prev) => {
          const next = new Set(prev)
          for (const id of prev) {
            if (String(id).startsWith(prefix)) next.delete(id)
          }
          return next
        })
        window.dispatchEvent(
          new CustomEvent('roadmapChanged', {
            detail: {
              goal: data.goal,
              domain: data.domain,
              title: data.goal,
              name: data.goal,
            },
          })
        )
        void loadSavedRoadmaps()
        setRefineSuccessToast({
          title: 'Changes made',
          detail: (data.message && String(data.message).trim()) || 'Your roadmap topic was updated.',
        })
      } catch (err) {
        const status = err.response?.status
        const detail = err.response?.data?.detail
        let msg = err.message || 'Refine failed'
        if (typeof detail === 'string') msg = detail
        else if (Array.isArray(detail))
          msg = detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
        if (status === 404 && (msg === 'Not Found' || msg.includes('Not Found'))) {
          msg =
            'Roadmap API returned 404. Restart the roadmap service (port 8000) so it runs the latest code with POST /api/roadmap/refine-topic, and confirm VITE_API_BASE_URL matches that server.'
        }
        throw new Error(msg)
      }
    },
    [user, loadedRoadmapId, topicEdit, loadSavedRoadmaps]
  )

  // Simple layout - no complex positioning needed

  return (
    <div className="roadmap-page">
      {refineSuccessToast &&
        createPortal(
          <div className="refine-success-toast" role="status" aria-live="polite">
            <div className="refine-success-toast-inner">
              <CheckCircle2 className="refine-success-toast-icon" size={22} aria-hidden />
              <div className="refine-success-toast-text">
                <strong>{refineSuccessToast.title}</strong>
                <p>{refineSuccessToast.detail}</p>
              </div>
              <button
                type="button"
                className="refine-success-toast-dismiss"
                onClick={() => setRefineSuccessToast(null)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>,
          document.body
        )}

      <RoadmapToast toast={saveToast} onDismiss={() => setSaveToast(null)} />

      {/* Simple Header */}
      <div className="simple-header">
        <h1>Career Roadmap Generator</h1>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowGenerator(true)}
          >
            <Sparkles size={16} />
            Generate Roadmap
          </button>
          {user && (
            <button 
              className="btn-secondary" 
              onClick={() => setShowSavedRoadmaps(true)}
            >
              <BookOpen size={16} />
              Saved Roadmaps
            </button>
          )}
        </div>
      </div>

      {/* Phase completion — project picks (modern card, full titles) */}
      {phaseNotification && (
        <div className="phase-notification phase-notification--modern">
          <div className="phase-notification__shell">
            <button
              type="button"
              className="phase-notification__close"
              onClick={() => setPhaseNotification(null)}
              aria-label="Dismiss recommendations"
            >
              <X size={18} strokeWidth={2.25} />
            </button>
            <div className="phase-notification__accent" aria-hidden />
            <div className="phase-notification__header">
              <div className="phase-notification__icon-wrap">
                <PartyPopper size={26} strokeWidth={2} aria-hidden />
              </div>
              <div className="phase-notification__headlines">
                <span className="phase-notification__eyebrow">Milestone</span>
                <h4 className="phase-notification__title">Phase complete</h4>
                <p className="phase-notification__subtitle">
                  <strong>{phaseNotification.phase}</strong> is done. We found{' '}
                  {phaseRecommendations.length} project
                  {phaseRecommendations.length === 1 ? '' : 's'} for you — tap to save to
                  your list.
                </p>
              </div>
            </div>
            <div className="phase-notification__projects" role="list">
              {phaseRecommendations.slice(0, 2).map((project, index) => {
                const pk = project.project_id ?? project.id ?? project.title ?? index
                const busy = savingProjectKey === pk
                return (
                  <button
                    key={String(pk)}
                    type="button"
                    role="listitem"
                    className="phase-notification__project-btn"
                    onClick={() => handleProjectClick(project)}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 size={18} className="spinning" aria-hidden />
                    ) : (
                      <FolderKanban size={18} strokeWidth={2} aria-hidden />
                    )}
                    <span className="phase-notification__project-title">{project.title}</span>
                  </button>
                )
              })}
              {phaseRecommendations.length > 2 && (
                <button
                  type="button"
                  className="phase-notification__project-btn phase-notification__project-btn--secondary"
                  onClick={() => handleViewAllProjects()}
                >
                  <Sparkles size={18} aria-hidden />
                  <span>
                    Save all {phaseRecommendations.length} recommendations
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple Search */}
      <div className="search-section">
        <div className="search-box">
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="Search roadmap items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Simple Roadmap Display */}
      <div className="roadmap-content">
        {roadmapData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {isLoadingRoadmaps ? (
                <Loader2 size={48} className="spinning" />
              ) : (
                <Target size={48} />
              )}
            </div>
            <h3>
              {isLoadingRoadmaps 
                ? 'Loading Roadmaps...' 
                : savedRoadmaps.length === 0 
                  ? 'No Roadmap Available' 
                  : 'No Roadmap Loaded'
              }
            </h3>
            <p>
              {isLoadingRoadmaps 
                ? 'Checking for saved roadmaps...' 
                : savedRoadmaps.length === 0 
                  ? 'No roadmaps found. Click "Generate Roadmap" to create your first one.'
                  : 'You have saved roadmaps. Click "Saved Roadmaps" to load one or generate a new one.'
              }
            </p>
            {!isLoadingRoadmaps && (
              <div className="empty-actions">
                {savedRoadmaps.length > 0 && (
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowSavedRoadmaps(true)}
                  >
                    <BookOpen size={16} />
                    Load Saved Roadmap
                  </button>
                )}
                <button 
                  className="btn-primary"
                  onClick={() => setShowGenerator(true)}
                >
                  <Sparkles size={16} />
                  Generate New Roadmap
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="roadmap-container">
            {visibleData.map((root, rootIndex) => (
              <div key={rootIndex} className="roadmap-root">
                <div className="roadmap-header">
                  <div className="roadmap-title-section">
                    <h2 className="roadmap-title">{root.title}</h2>
                    {root.metadata && (
                      <div className="roadmap-metadata">
                        <span className={`difficulty-badge ${root.metadata.difficulty?.toLowerCase()}`}>
                          {root.metadata.difficulty || 'Intermediate'}
                        </span>
                        <span className="hours-badge">
                          <Clock size={14} strokeWidth={2} aria-hidden />
                          {root.metadata.estimatedHours || 300}h estimated
                        </span>
                        <span className="domain-badge">
                          <Layers size={14} strokeWidth={2} aria-hidden />
                          {root.metadata.domain}
                        </span>
                        {root.metadata.matchScore > 0 && (
                          <span className="match-badge">
                            <Sparkles size={14} strokeWidth={2} aria-hidden />
                            {Math.round(root.metadata.matchScore * 100)}% match
                          </span>
                        )}
                      </div>
                    )}
                    {root.metadata && (root.metadata.prerequisites || root.metadata.learningOutcomes) && (
                      <div className="roadmap-details">
                        {root.metadata.prerequisites && (
                          <details className="metadata-section">
                            <summary>📋 Prerequisites</summary>
                            <p>{root.metadata.prerequisites}</p>
                          </details>
                        )}
                        {root.metadata.learningOutcomes && (
                          <details className="metadata-section">
                            <summary>🎯 Learning Outcomes</summary>
                            <p>{root.metadata.learningOutcomes}</p>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="roadmap-progress roadmap-progress-card">
                    <span className="roadmap-progress-label">Your progress</span>
                    <div className="progress-ring-meta">
                      <span className="progress-stat">
                        <strong>{completedIds.size}</strong>
                        <span className="progress-stat-sub">done</span>
                      </span>
                      <span className="progress-stat-div">/</span>
                      <span className="progress-stat">
                        <strong>
                          {root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 0}
                        </strong>
                        <span className="progress-stat-sub">skills</span>
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(completedIds.size / (root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      <span className="progress-percentage">
                        {Math.round(
                          (completedIds.size /
                            (root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 1)) *
                            100
                        )}
                        % complete
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="roadmap-flow" aria-label="Learning path">
                  {root.children?.map((step, stepIndex) => {
                    const phaseKey = step.id ?? `phase_${stepIndex}`
                    const leftBranches = []
                    const rightBranches = []
                    step.children?.forEach((skill, i) => {
                      const pair = { skill, skillIndex: i }
                      if (i % 2 === 0) leftBranches.push(pair)
                      else rightBranches.push(pair)
                    })
                    const collapsed = isNodeCollapsed(step.id)

                    return (
                      <div
                        key={phaseKey}
                        className="roadmap-flow-phase"
                        style={phaseThemeStyle(stepIndex)}
                      >
                        {stepIndex > 0 && (
                          <div className="roadmap-flow-spine-gap-row" aria-hidden>
                            <div className="roadmap-flow-spine-gap" />
                          </div>
                        )}
                        <div
                          className={`roadmap-flow-phase-body ${collapsed ? 'roadmap-flow-phase-body--collapsed' : ''}`}
                        >
                          {!collapsed ? (
                            <RoadmapPhaseExpandedContent
                              step={step}
                              stepIndex={stepIndex}
                              leftBranches={leftBranches}
                              rightBranches={rightBranches}
                              completedIds={completedIds}
                              processingSkill={processingSkill}
                              isCoreTopic={isCoreTopic}
                              toggleCompleted={toggleCompleted}
                              highlightText={highlightText}
                              searchTerm={searchTerm}
                              user={user}
                              loadedRoadmapId={loadedRoadmapId}
                              openTopicEdit={openTopicEdit}
                              toggleCollapsed={toggleCollapsed}
                            />
                          ) : (
                            <div className="roadmap-flow-collapsed">
                              <div className="roadmap-flow-spine-column roadmap-flow-spine-column--collapsed">
                                <button
                                  type="button"
                                  className="roadmap-flow-main-node roadmap-flow-main-node--collapsed"
                                  onClick={() => toggleCollapsed(step.id)}
                                >
                                  <span className="roadmap-flow-main-node__chev">
                                    <ChevronRight size={18} />
                                  </span>
                                  <span className="roadmap-flow-main-node__num">{stepIndex + 1}</span>
                                  <h3 className="roadmap-flow-main-node__title">{step.title}</h3>
                                  <span className="roadmap-flow-main-node__count">
                                    {step.children?.length ?? 0} skills
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Generator Modal */}
      {showGenerator && (
        <div className="modal-overlay">
          <div className="simple-modal">
            <div className="modal-header">
              <h2>Generate Roadmap</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowGenerator(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div className="error-msg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <div className="input-group">
                <label>Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Marathon in 6 months, conversational Japanese, AWS Solutions Architect, sourdough baking"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      generateRoadmap()
                    }
                  }}
                />
                <small style={{ color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
                  Any domain — career, hobby, sport, language, craft, certification. Groq builds a tailored path.
                </small>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowGenerator(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={generateRoadmap}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Roadmaps — teal / slate modal */}
      {showSavedRoadmaps && (
        <div
          className="modal-overlay saved-roadmaps-overlay"
          role="presentation"
          onClick={() => setShowSavedRoadmaps(false)}
        >
          <div
            className="simple-modal saved-roadmaps-modal"
            role="dialog"
            aria-labelledby="saved-roadmaps-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="saved-roadmaps-modal__header">
              <div className="saved-roadmaps-modal__head-main">
                <div className="saved-roadmaps-modal__icon" aria-hidden>
                  <BookOpen size={22} strokeWidth={2} />
                </div>
                <div>
                  <h2 id="saved-roadmaps-title">Saved roadmaps</h2>
                  <p className="saved-roadmaps-modal__subtitle">Continue where you left off</p>
                </div>
              </div>
              <div className="saved-roadmaps-modal__toolbar">
                <button
                  type="button"
                  className="saved-roadmaps-modal__icon-btn"
                  onClick={() => {
                    loadSavedRoadmaps()
                  }}
                  title="Refresh list"
                  aria-label="Refresh saved roadmaps"
                >
                  <RefreshCw size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="saved-roadmaps-modal__icon-btn saved-roadmaps-modal__icon-btn--close"
                  onClick={() => setShowSavedRoadmaps(false)}
                  title="Close"
                  aria-label="Close"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </header>

            <div className="saved-roadmaps-modal__body">
              {savedRoadmaps.length === 0 ? (
                <div className="saved-roadmaps-empty">
                  <div className="saved-roadmaps-empty__illu" aria-hidden>
                    <BookOpen size={40} strokeWidth={1.5} />
                  </div>
                  <p className="saved-roadmaps-empty__title">No saved roadmaps yet</p>
                  <p className="saved-roadmaps-empty__hint">
                    Generate a path and it&apos;ll show up here automatically.
                  </p>
                  <div className="saved-roadmaps-empty__actions">
                    <button
                      type="button"
                      className="saved-roadmaps-btn saved-roadmaps-btn--primary"
                      onClick={() => {
                        setShowSavedRoadmaps(false)
                        setShowGenerator(true)
                      }}
                    >
                      <Sparkles size={16} />
                      Generate roadmap
                    </button>
                    <button
                      type="button"
                      className="saved-roadmaps-btn saved-roadmaps-btn--ghost"
                      onClick={() => loadSavedRoadmaps()}
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="saved-roadmaps-list">
                  {savedRoadmaps.map((roadmap) => (
                    <li key={roadmap._id} className="saved-roadmaps-card">
                      <div className="saved-roadmaps-card__text">
                        <h3 className="saved-roadmaps-card__title">{roadmap.goal}</h3>
                        <div className="saved-roadmaps-card__meta">
                          {roadmap.domain ? (
                            <span className="saved-roadmaps-card__pill">{roadmap.domain}</span>
                          ) : null}
                          <time dateTime={roadmap.created_at}>
                            {new Date(roadmap.created_at).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                      <div className="saved-roadmaps-card__actions">
                        <button
                          type="button"
                          className="saved-roadmaps-card__load"
                          onClick={() => loadSavedRoadmap(roadmap)}
                        >
                          Load
                          <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="saved-roadmaps-card__delete"
                          onClick={() => handleDeleteClick(roadmap)}
                          title="Delete roadmap"
                          aria-label={`Delete ${roadmap.goal}`}
                        >
                          <Trash2 size={17} strokeWidth={2} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {topicEdit && (
        <TopicRefineModal
          topicEdit={topicEdit}
          onClose={closeTopicEdit}
          onRefine={handleRefineFromModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Roadmap"
        message={`Are you sure you want to delete "${roadmapToDelete?.goal}"? This action cannot be undone and all progress will be lost.`}
        confirmText="Delete Roadmap"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

    </div>
  )
}

export default Roadmap