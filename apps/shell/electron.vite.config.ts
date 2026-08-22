import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'

const localAlias = {
  '@genoffice/mail-engine': resolve(__dirname, '../../packages/mail-engine/src/index.ts'),
  '@genoffice/mail-engine/eml': resolve(__dirname, '../../packages/mail-engine/src/eml/index.ts'),
  '@genoffice/mail-engine/pst': resolve(__dirname, '../../packages/mail-engine/src/pst/index.ts'),
  '@genoffice/mail-engine/threading': resolve(__dirname, '../../packages/mail-engine/src/threading/index.ts'),
  '@genoffice/mail-engine/rules': resolve(__dirname, '../../packages/mail-engine/src/rules/index.ts'),
}

export default defineConfig({
  // Bundle everything into the shell main (same policy as apps/docs): the
  // imported docs/sheets main modules are TS source with no build artifacts,
  // so externalizing them would break Node ESM resolution at runtime.
  main: {
    resolve: { alias: localAlias },
  },
  preload: {
    resolve: { alias: localAlias },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          // dedicated preload for the auto-update window
          update: resolve(__dirname, 'src/preload/update.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: { alias: localAlias },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          // strong-guidance update window (see src/main/update-window.ts)
          update: resolve(__dirname, 'src/renderer/update.html'),
        },
      },
    },
    server: {
      port: Number(process.env.SHELL_DEV_PORT) || 5199,
      strictPort: Boolean(process.env.SHELL_DEV_PORT),
    },
  },
})
