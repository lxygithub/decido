/**
 * WebAudio 轻量音效引擎 —— 无音频文件，全部由振荡器实时合成。
 * 首次用户交互时才创建 AudioContext（符合浏览器自动播放策略）。
 */

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

type Wave = OscillatorType

function beep(freq: number, duration: number, opts: { type?: Wave; gain?: number; delay?: number; sweepTo?: number } = {}) {
  const c = ac()
  if (!c) return
  const { type = 'sine', gain = 0.12, delay = 0, sweepTo } = opts
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + duration)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** 短促滴答（轮盘划过格子） */
export function sTick() {
  beep(1750, 0.03, { type: 'square', gain: 0.045 })
}

/** 轻快泡泡（按钮 / 结果确认） */
export function sPop() {
  beep(520, 0.09, { type: 'sine', gain: 0.1, sweepTo: 940 })
}

/** 抛硬币的"嗖"声 */
export function sWhoosh() {
  beep(240, 0.28, { type: 'triangle', gain: 0.09, sweepTo: 780 })
}

/** 骰子撞击（三次短促低频） */
export function sDice() {
  beep(190, 0.05, { type: 'square', gain: 0.09 })
  beep(230, 0.05, { type: 'square', gain: 0.08, delay: 0.09 })
  beep(170, 0.06, { type: 'square', gain: 0.08, delay: 0.19 })
}

/** 筊杯落地"咔嗒"（两声清脆木头声） */
export function sClack() {
  beep(1100, 0.035, { type: 'square', gain: 0.11 })
  beep(720, 0.05, { type: 'square', gain: 0.09, delay: 0.07 })
}

/** 抽签滚动时的滴答 */
export function sSlot() {
  beep(950, 0.025, { type: 'square', gain: 0.04 })
}

/** 胜利小琶音 */
export function sWin() {
  const seq: Array<[number, number]> = [
    [523.25, 0],
    [659.25, 0.09],
    [783.99, 0.18],
    [1046.5, 0.27],
  ]
  for (const [f, d] of seq) beep(f, 0.22, { type: 'triangle', gain: 0.1, delay: d })
}

/** 提示双音 */
export function sDing() {
  beep(880, 0.18, { type: 'sine', gain: 0.1 })
  beep(1318.5, 0.3, { type: 'sine', gain: 0.09, delay: 0.1 })
}

/** 计时结束警报（三轮双频） */
export function sAlarm() {
  for (let i = 0; i < 3; i++) {
    beep(880, 0.14, { type: 'square', gain: 0.1, delay: i * 0.42 })
    beep(622, 0.14, { type: 'square', gain: 0.1, delay: i * 0.42 + 0.18 })
  }
}

/** 深沉低音（阴筊 / 失败） */
export function sLow() {
  beep(330, 0.3, { type: 'sine', gain: 0.11, sweepTo: 196 })
}
