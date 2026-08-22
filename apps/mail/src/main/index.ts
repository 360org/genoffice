export {
  configureMailRuntime,
  initMailBackend,
  createMailView,
  startMailStandalone,
} from './mail-main'

import { startMailStandalone } from './mail-main'

if (process.env.MAIL_STANDALONE === 'true') {
  startMailStandalone()
}
