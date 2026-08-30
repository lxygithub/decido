import { ref } from 'vue'

export interface ToastItem {
  id: number
  text: string
}

const toasts = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function toast(text: string, duration = 1800) {
    const id = ++seq
    toasts.value.push({ id, text })
    if (toasts.value.length > 3) toasts.value.shift()
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }
  return { toasts, toast }
}
