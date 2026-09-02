import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sockjs-client가 참조하는 Node의 global 객체를 브라우저 환경에서 대신 채워준다.
  define: {
    global: 'globalThis',
  },
})
