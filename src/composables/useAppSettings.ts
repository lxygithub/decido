import { ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

/* ---------- 主题 ---------- */
type Theme = 'light' | 'dark'

function initTheme(): Theme {
  const saved = localStorage.getItem('decido.theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(initTheme())

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#121210' : '#f6f5f2')
}
applyTheme(theme.value)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('decido.theme', theme.value)
    applyTheme(theme.value)
  }
  return { theme, toggleTheme }
}

/* ---------- 音效开关 ---------- */
const soundEnabled = useLocalStorage<boolean>('decido.sound', true)

export function useSoundEnabled() {
  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    return soundEnabled.value
  }
  return { soundEnabled, toggleSound }
}
