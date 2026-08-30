/**
 * 加密级随机工具 —— 所有随机结果均基于 crypto.getRandomValues，
 * 比Math.random 更均匀、不可预测，让"命运"更公平。
 */

/** [min, max] 闭区间内的均匀随机整数（含负数与零） */
export function randInt(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return min
  if (max < min) [min, max] = [max, min]
  const range = max - min + 1
  if (range <= 1) return Math.round(min)
  // 拒绝采样，避免取模偏差
  const maxUint = 0xffffffff
  const limit = maxUint - (maxUint + 1) % range
  const buf = new Uint32Array(1)
  let v: number
  do {
    crypto.getRandomValues(buf)
    v = buf[0]!
  } while (v > limit)
  return min + (v % range)
}

/** 抛硬币：true = 正面 */
export function coinFlip(): boolean {
  return randInt(0, 1) === 1
}

/** Fisher–Yates 洗牌（返回新数组，不修改原数组） */
export function shuffleArray<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** 从数组中随机取出 count 个（不重复） */
export function pickUnique<T>(arr: readonly T[], count: number): T[] {
  return shuffleArray(arr).slice(0, Math.max(0, Math.min(count, arr.length)))
}

/** 生成 [min, max] 内 count 个随机数，unique 时去重 */
export function randomNumbers(min: number, max: number, count: number, unique: boolean): number[] {
  if (unique) {
    const pool: number[] = []
    for (let i = min; i <= max; i++) pool.push(i)
    return pickUnique(pool, count)
  }
  return Array.from({ length: count }, () => randInt(min, max))
}

/** 把角度规范到 [0, 2π) */
export function mod2pi(a: number): number {
  return ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
}
