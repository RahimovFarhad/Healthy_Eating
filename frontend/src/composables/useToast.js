import { reactive } from 'vue'

let nextId = 0
const toasts = reactive([])

const DEFAULT_DURATION = { success: 4000, info: 4000, warning: 6000, error: 0 }

export function useToast() {
  function addToast(message, { type = 'success', duration } = {}) {
    const id = ++nextId
    const ms = duration ?? DEFAULT_DURATION[type] ?? 4000
    const toast = { id, message, type, paused: false, remaining: ms, startedAt: null, timerId: null }
    if (ms > 0) {
      toast.startedAt = Date.now()
      toast.timerId = setTimeout(() => removeToast(id), ms)
    }
    toasts.push(toast)
    return id
  }

  function removeToast(id) {
    const i = toasts.findIndex(t => t.id === id)
    if (i !== -1) {
      clearTimeout(toasts[i].timerId)
      toasts.splice(i, 1)
    }
  }

  function pauseToast(id) {
    const t = toasts.find(t => t.id === id)
    if (!t || t.paused || t.remaining <= 0 || !t.timerId) return
    clearTimeout(t.timerId)
    t.timerId = null
    t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt))
    t.paused = true
  }

  function resumeToast(id) {
    const t = toasts.find(t => t.id === id)
    if (!t || !t.paused || t.remaining <= 0) return
    t.paused = false
    t.startedAt = Date.now()
    t.timerId = setTimeout(() => removeToast(id), t.remaining)
  }

  return { toasts, addToast, removeToast, pauseToast, resumeToast }
}
