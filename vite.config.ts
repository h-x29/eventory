import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      __KAKAO_API_KEY__: JSON.stringify(env.VITE_KAKAO_MAP_API_KEY)
    },
    // Transform index.html to replace environment variables
    transformIndexHtml: {
      enforce: 'pre',
      transform(html) {
        return html.replace(
          '%VITE_KAKAO_MAP_API_KEY%',
          env.VITE_KAKAO_MAP_API_KEY || ''
        )
      }
    }
  }
})
