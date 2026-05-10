import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Auth service (Express): local `auth_back` or Docker map host :5000 */
  const authProxyTarget =
    env.DEV_PROXY_AUTH_TARGET || env.VITE_DEV_PROXY_AUTH || 'http://127.0.0.1:5000'
  /** Other /api/* services via nginx gateway (docker compose) */
  const gatewayProxyTarget =
    env.DEV_PROXY_GATEWAY_TARGET || env.VITE_DEV_PROXY_GATEWAY || 'http://127.0.0.1:80'

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
        '/api': {
          target: gatewayProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
