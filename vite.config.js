import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Auth service (Express): local `auth_back` or Docker map host :5000 */
  const authProxyTarget =
    env.DEV_PROXY_AUTH_TARGET || env.VITE_DEV_PROXY_AUTH || 'http://127.0.0.1:5000'
  /** FastAPI chatbot — local `python main.py` default uvicorn port */
  const chatbotProxyTarget =
    env.DEV_PROXY_CHATBOT_TARGET || env.VITE_DEV_PROXY_CHATBOT || 'http://127.0.0.1:8004'
  /** Roadmap FastAPI — default host port from roadmap_api/main.py */
  const roadmapProxyTarget =
    env.DEV_PROXY_ROADMAP_TARGET || env.VITE_DEV_PROXY_ROADMAP || 'http://127.0.0.1:8000'
  /** Other /api/* services via nginx gateway (docker compose) */
  const gatewayProxyTarget =
    env.DEV_PROXY_GATEWAY_TARGET || env.VITE_DEV_PROXY_GATEWAY || 'http://127.0.0.1:80'
  /** Flask project recommendation — Docker exposes host port 8003 (override via DEV_PROXY_PROJECTS_TARGET for local 5003 runs) */
  const projectsProxyTarget =
    env.DEV_PROXY_PROJECTS_TARGET ||
    env.VITE_DEV_PROXY_PROJECTS ||
    'http://127.0.0.1:8003'
  /** Mentor FastAPI — Docker publishes 8006 (override via DEV_PROXY_MENTORS_TARGET for local 8001 runs) */
  const mentorsProxyTarget =
    env.DEV_PROXY_MENTORS_TARGET ||
    env.VITE_DEV_PROXY_MENTORS ||
  'http://127.0.0.1:8006'
  /**
   * Resume FastAPI serves `/resumes`, `/parse`, … (no `/api/resume` prefix).
   * Nginx strips `/api/resume`; dev proxy must do the same. Default PORT from main.py=8005; Docker matches 8005.
   */
  const resumeProxyTarget =
    env.DEV_PROXY_RESUME_TARGET || env.VITE_DEV_PROXY_RESUME || 'http://127.0.0.1:8005'
  /** Gamified micro-learning FastAPI — Docker/host port 8008 */
  const microlearningProxyTarget =
    env.DEV_PROXY_MICROLEARNING_TARGET ||
    env.VITE_DEV_PROXY_MICROLEARNING ||
    'http://127.0.0.1:8008'
  /** Subscription / PayPal — host :8012 (8005 is resume_parser default locally) */
  const subscriptionProxyTarget =
    env.DEV_PROXY_SUBSCRIPTION_TARGET ||
    env.VITE_DEV_PROXY_SUBSCRIPTION ||
    'http://127.0.0.1:8012'

  return {
    plugins: [react()],
    server: {
      // Auth routes must hit Express directly when nginx isn't running (avoids empty responses / JSON parse errors).
      proxy: {
        '/api/auth': {
          target: authProxyTarget,
          changeOrigin: true,
        },
        '/api/discussions': {
          target: authProxyTarget,
          changeOrigin: true,
        },
        '/api/admin': {
          target: authProxyTarget,
          changeOrigin: true,
        },
        // Strip /api/chatbot prefix — FastAPI serves /health, /chat, … (same as nginx rewrite)
        '/api/chatbot': {
          target: chatbotProxyTarget,
          changeOrigin: true,
          rewrite: (path) => {
            const next = path.replace(/^\/api\/chatbot\/?/, '/')
            return next.startsWith('/') ? next : `/${next}`
          },
        },
        '/api/roadmap': {
          target: roadmapProxyTarget,
          changeOrigin: true,
        },
        // Project recommendation Flask — avoid requiring nginx on :80 during `vite` dev
        '/api/recommend': {
          target: projectsProxyTarget,
          changeOrigin: true,
        },
        '/api/project-stages': {
          target: projectsProxyTarget,
          changeOrigin: true,
        },
        '/api/projects': {
          target: projectsProxyTarget,
          changeOrigin: true,
        },
        '/api/mentors': {
          target: mentorsProxyTarget,
          changeOrigin: true,
        },
        '/api/resume': {
          target: resumeProxyTarget,
          changeOrigin: true,
          rewrite: (path) => {
            const next = path.replace(/^\/api\/resume\/?/, '/')
            return next.startsWith('/') ? next : `/${next}`
          },
        },
        // Must be before catch-all `/api` — service listens on /api/v1/microlearning/...
        '/api/v1/microlearning': {
          target: microlearningProxyTarget,
          changeOrigin: true,
        },
        '/api/subscription': {
          target: subscriptionProxyTarget,
          changeOrigin: true,
        },
        '/api': {
          target: gatewayProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
