import { createIpcTransport, type AgentTransport } from '@genoffice/agent-core'

export function createMailTransport(getSettings: () => any): AgentTransport {
  return createIpcTransport<any>({
    onStream: (listener) => {
      if (window.vuaMail?.onAiStream) {
        return window.vuaMail.onAiStream(listener)
      }
      return () => {}
    },
    start: async (request) => {
      if (window.vuaMail?.aiStream) {
        await window.vuaMail.aiStream(request)
      }
    },
    cancel: async (requestId) => {
      if (window.vuaMail?.aiStreamCancel) {
        await window.vuaMail.aiStreamCancel(requestId)
      }
    },
    getSettings,
    unknownErrorText: () => 'Đã có lỗi không xác định từ AI Gateway.',
    timeoutErrorText: () => 'Yêu cầu tới AI đã hết thời gian phản hồi.',
    creditsErrorText: () => 'Hạn mức token hoặc credit AI đã hết.',
    networkErrorText: () => 'Lỗi kết nối mạng tới AI Provider.',
  })
}
