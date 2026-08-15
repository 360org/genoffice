import React from 'react'
import { createRoot } from 'react-dom/client'
import { htmlLang, type Lang } from '@genoffice/i18n'
import { App } from './App'
import { AudienceView } from './components/AudienceView'
import { LocaleProvider, setModuleLang } from './i18n/locale'
import './styles.css'

// Canvas fillText never triggers @font-face downloads, so the bundled document fonts
// (Carlito ↔ Calibri) must be loaded explicitly or Konva silently draws the fallback face.
for (const variant of ['', 'bold ', 'italic ', 'italic bold ']) {
  document.fonts?.load?.(`${variant}16px Carlito`).catch(() => {})
  document.fonts?.load?.(`${variant}16px 'Carlito GO'`).catch(() => {})
}

// ?mode=audience: the presenter view's external-screen audience show window (created by the main process)
const mode = new URLSearchParams(window.location.search).get('mode')

// macOS windows are created with vibrancy; let the thumbnail pane show it
// (the audience show window stays fully opaque)
if (mode !== 'audience' && navigator.platform.toLowerCase().includes('mac'))
  document.body.classList.add('vib')

async function bootstrap(): Promise<void> {
  let lang: Lang = 'zh'
  try {
    lang = await window.slidesApi.getLanguage()
  } catch {
    /* dev renderer without the preload handler */
  }
  setModuleLang(lang)
  document.documentElement.lang = htmlLang(lang)
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <LocaleProvider initial={lang}>
        {mode === 'audience' ? <AudienceView /> : <App />}
      </LocaleProvider>
    </React.StrictMode>,
  )
}

void bootstrap()
