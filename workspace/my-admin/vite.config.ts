import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const define: Record<string, any> = {
    'process.env.SUPABASE_URL': env.SUPABASE_URL,
    'process.env.SUPABASE_ANON_KEY': env.SUPABASE_ANON_KEY,
    // 'process.env.SUPABASE_SERVICE_ROLE_KEY': env.SUPABASE_SERVICE_ROLE_KEY,
  }
  Object.entries(define).map(([k, v]) => define[k] = JSON.stringify(v))
  
  return {
    plugins: [react()],
    base: '/my-admin/',
    define: define,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
