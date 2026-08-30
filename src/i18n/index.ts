import { ref, watch } from 'vue'
import { en, type MessageKey } from './messages.en'
import { zh } from './messages.zh'

export type Locale = 'en' | 'zh'
export type { MessageKey }

type Dict = Record<MessageKey, string>

const DICTS: Record<Locale, Dict> = { en, zh }

const STORAGE_KEY = 'decido.locale'

function loadSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    /* localStorage 不可用时静默降级 */
  }
  return 'en' // 默认英文
}

/** 当前语言（模块级共享状态） */
export const locale = ref<Locale>(loadSavedLocale())

export function setLocale(l: Locale) {
  locale.value = l
}

/** Header 一键切换按钮使用 */
export function toggleLocale() {
  locale.value = locale.value === 'en' ? 'zh' : 'en'
}

function interpolate(tpl: string, params?: Record<string, string | number>): string {
  if (!params) return tpl
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => (params[k] !== undefined ? String(params[k]) : `{${k}}`))
}

/**
 * 取词：t('dice.rolled', { n: 3 })
 * 在模板/computed 中调用即可获得响应式（内部读取 locale）。
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  return interpolate(DICTS[locale.value][key] ?? en[key], params)
}

/** 取管道分隔的列表值：tArr('wheel.presetEat') -> string[] */
export function tArr(key: MessageKey): string[] {
  return (DICTS[locale.value][key] ?? en[key]).split('|')
}

/** 动态拼接 key 时使用（如 tool.key + '.name'），绕开字面量类型检查 */
export function tK(key: string, params?: Record<string, string | number>): string {
  return t(key as MessageKey, params)
}

function applyDocument(l: Locale) {
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  document.title = DICTS[l]['app.title']
}

// 应用初始语言 + 持久化跟随
applyDocument(locale.value)
watch(locale, (l) => {
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    /* ignore */
  }
  applyDocument(l)
})
