import { memo, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Wand2,
  X,
  Minimize2,
  ListTree,
  Waypoints,
} from 'lucide-react'

const PRESETS = [
  {
    id: 'simplify',
    label: 'Simpler',
    hint: 'Easier wording, fewer items',
    Icon: Minimize2,
  },
  {
    id: 'expand',
    label: 'More detail',
    hint: 'Concrete sub-skills & checkpoints',
    Icon: ListTree,
  },
  {
    id: 'diverge',
    label: 'Divergent paths',
    hint: 'Branches & related options',
    Icon: Waypoints,
  },
]

/**
 * Isolated modal state so typing / preset toggles do not re-render the whole Roadmap tree.
 */
function TopicRefineModal({ topicEdit, onClose, onRefine }) {
  const [instruction, setInstruction] = useState('')
  const [preset, setPreset] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setInstruction('')
    setPreset(null)
    setError(null)
  }, [topicEdit?.stepIndex, topicEdit?.skillIndex, topicEdit?.skillTitle])

  const togglePreset = useCallback((id) => {
    setPreset((cur) => (cur === id ? null : id))
  }, [])

  const handleApply = useCallback(async () => {
    if (!preset && !instruction.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onRefine({ instruction: instruction.trim(), preset })
      onClose()
    } catch (e) {
      setError(e?.message || 'Something went wrong')
      setLoading(false)
    }
  }, [instruction, preset, onRefine, onClose])

  if (!topicEdit) return null

  const modal = (
    <div className="topic-refine-overlay" onClick={onClose} role="presentation">
      <div
        className="topic-refine-shell"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-refine-title"
      >
        <header className="topic-refine-header">
          <div className="topic-refine-header__brand">
            <span className="topic-refine-header__icon" aria-hidden>
              <Wand2 size={22} strokeWidth={2} />
            </span>
            <div className="topic-refine-header__titles">
              <p className="topic-refine-header__eyebrow">PathWise · AI assist</p>
              <h2 id="topic-refine-title">Refine this topic</h2>
              <p className="topic-refine-header__sub">
                Adjust wording or depth. Updates save to your roadmap.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="topic-refine-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className="topic-refine-body">
          <div className="topic-refine-target" aria-label="Selected topic">
            <span className="topic-refine-target__phase">{topicEdit.phaseTitle}</span>
            <span className="topic-refine-target__chev" aria-hidden>
              /
            </span>
            <span className="topic-refine-target__skill">{topicEdit.skillTitle}</span>
          </div>

          <div className="topic-refine-section">
            <span className="topic-refine-section__label">Style</span>
            <div className="topic-refine-presets" role="group" aria-label="Refinement style">
              {PRESETS.map((p) => {
                const active = preset === p.id
                const { Icon } = p
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`topic-refine-preset ${active ? 'topic-refine-preset--active' : ''}`}
                    onClick={() => togglePreset(p.id)}
                    aria-pressed={active}
                  >
                    <span className="topic-refine-preset__icon" aria-hidden>
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <span className="topic-refine-preset__text">
                      <span className="topic-refine-preset__label">{p.label}</span>
                      <span className="topic-refine-preset__hint">{p.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="topic-refine-section">
            <label className="topic-refine-section__label" htmlFor="refine-instruction">
              Extra instructions
              <span className="topic-refine-section__optional">optional</span>
            </label>
            <textarea
              id="refine-instruction"
              className="topic-refine-textarea"
              rows={4}
              placeholder="e.g. Assume I already know Bash basics, focus on automation for DevOps…"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </div>

          {error && (
            <div className="topic-refine-error" role="alert">
              <AlertCircle size={18} strokeWidth={2} aria-hidden />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="topic-refine-footer">
          <button
            type="button"
            className="topic-refine-btn topic-refine-btn--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="topic-refine-btn topic-refine-btn--primary"
            disabled={loading || (!preset && !instruction.trim())}
            onClick={handleApply}
            title={
              !preset && !instruction.trim()
                ? 'Choose a style or add instructions'
                : undefined
            }
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinning" aria-hidden />
                Applying…
              </>
            ) : (
              <>
                <Sparkles size={18} aria-hidden />
                Apply changes
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default memo(TopicRefineModal)
