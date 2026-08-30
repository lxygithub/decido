import { ref, watch, type Ref } from 'vue'

const cache = new Map<string, Ref<unknown>>()

/**
 * localStorage 持久化响应式状态（模块级缓存，多处调用共享同一份）
 */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const existed = cache.get(key)
  if (existed) return existed as Ref<T>

  const data = ref(load()) as Ref<T>

  function load(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed = JSON.parse(raw)
      // 基础类型直接返回；对象则与默认值浅合并，兼容字段升级
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && initial && typeof initial === 'object' && !Array.isArray(initial)) {
        return { ...(initial as object), ...(parsed as object) } as T
      }
      return parsed as T
    } catch {
      return initial
    }
  }

  watch(
    data,
    (v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v))
      } catch {
        /* 存储已满或被禁用时静默降级 */
      }
    },
    { deep: true },
  )

  cache.set(key, data as Ref<unknown>)
  return data
}
