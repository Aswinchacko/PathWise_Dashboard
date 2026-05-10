/**
 * Unified API origin for Docker/nginx (port 80) or production HTTPS.
 * Leave VITE_PUBLIC_API_URL unset for same-origin / relative URLs (works with Vite dev proxy → nginx).
 */
export function getPublicApiOrigin() {
  const raw = import.meta.env.VITE_PUBLIC_API_URL
  if (raw === undefined || raw === null || String(raw).trim() === '') return ''
  return String(raw).replace(/\/$/, '')
}

/** Absolute or root-relative path for fetch/axios. */
export function apiUrl(path = '/') {
  const base = getPublicApiOrigin()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/** Same as apiUrl unless `VITE_*` override is set (full origin for an external project service). */
export function projectRecommendationUrl(path = '/') {
  const raw = import.meta.env.VITE_PROJECT_RECOMMENDATION_URL
  const p = path.startsWith('/') ? path : `/${path}`
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return `${String(raw).replace(/\/$/, '')}${p}`
  }
  return apiUrl(p)
}
