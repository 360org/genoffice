import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@genoffice/i18n', '@genoffice/electron-utils', '@genoffice/ai-provider'],
      }),
    ],
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@genoffice/i18n'] })],
  },
  renderer: {
    plugins: [react()],
    server: {
      port: Number(process.env.MAIL_DEV_PORT) || 5178,
      strictPort: Boolean(process.env.MAIL_DEV_PORT),
    },
  },
})
