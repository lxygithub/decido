/**
 * 极简 Canvas 彩带特效 —— 零依赖，用于中奖 / 大吉时刻。
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
  maxLife: number
}

const COLORS = ['#e8590c', '#2f9e77', '#3b6ea5', '#c2a03c', '#8a5a44', '#1b1b18', '#b26e5c', '#5c6f8a']

let canvas: HTMLCanvasElement | null = null
let particles: Particle[] = []
let rafId = 0

function ensureCanvas(): HTMLCanvasElement {
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;'
    document.body.appendChild(canvas)
  }
  canvas.width = window.innerWidth * (window.devicePixelRatio || 1)
  canvas.height = window.innerHeight * (window.devicePixelRatio || 1)
  return canvas
}

/**
 * 在指定位置喷发彩带
 * @param originX 0~1 视口横向比例，默认 0.5
 * @param originY 0~1 视口纵向比例，默认 0.4
 * @param count 粒子数量
 */
export function confettiBurst(originX = 0.5, originY = 0.4, count = 110) {
  const cv = ensureCanvas()
  const dpr = window.devicePixelRatio || 1
  const cx = cv.width * originX
  const cy = cv.height * originY

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = (4 + Math.random() * 9) * dpr
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5 * dpr,
      w: (5 + Math.random() * 6) * dpr,
      h: (8 + Math.random() * 8) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      life: 0,
      maxLife: 90 + Math.random() * 60,
    })
  }

  if (!rafId) rafId = requestAnimationFrame(step)
}

function step() {
  const cv = canvas
  if (!cv) return
  const c = cv.getContext('2d')
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  c.clearRect(0, 0, cv.width, cv.height)

  particles = particles.filter((p) => p.life < p.maxLife && p.y < cv.height + 40)
  for (const p of particles) {
    p.life++
    p.vy += 0.16 * dpr
    p.vx *= 0.985
    p.vy *= 0.992
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vr

    const alpha = p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30 : 1
    c.save()
    c.globalAlpha = Math.max(0, alpha)
    c.translate(p.x, p.y)
    c.rotate(p.rot)
    c.fillStyle = p.color
    // 模拟纸片翻面
    const squash = Math.sin(p.rot * 2)
    c.fillRect((-p.w / 2) * Math.abs(squash) - p.w * 0.1, -p.h / 2, p.w * Math.abs(squash) + p.w * 0.2, p.h)
    c.restore()
  }

  if (particles.length > 0) {
    rafId = requestAnimationFrame(step)
  } else {
    c.clearRect(0, 0, cv.width, cv.height)
    rafId = 0
  }
}
