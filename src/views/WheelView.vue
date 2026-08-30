<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PageHead from '../components/PageHead.vue'
import ResultModal from '../components/ResultModal.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useToast } from '../composables/useToast'
import { locale, t, tArr } from '../i18n'
import { mod2pi, randInt } from '../utils/random'
import { sPop, sTick, sWin } from '../utils/sound'
import { confettiBurst } from '../utils/confetti'

const options = useLocalStorage<string[]>('decido.wheel.options', tArr('wheel.defaults'))
const autoRemove = useLocalStorage<boolean>('decido.wheel.autoRemove', false)
const history = useLocalStorage<Array<{ t: string; at: number }>>('decido.wheel.history', [])

const newItem = ref('')
const spinning = ref(false)
const rotation = ref(0)
const showModal = ref(false)
const winner = ref('')
const canvasEl = ref<HTMLCanvasElement | null>(null)
const wrapEl = ref<HTMLDivElement | null>(null)

const { toast } = useToast()

interface PresetGroup {
  label: string
  items: string[]
}

const PRESETS = computed<PresetGroup[]>(() => [
  { label: t('wheel.presetEatLabel'), items: tArr('wheel.presetEat') },
  { label: t('wheel.presetGoLabel'), items: tArr('wheel.presetGo') },
  { label: t('wheel.presetDoLabel'), items: tArr('wheel.presetDo') },
])

const canSpin = computed(() => options.value.length >= 2 && !spinning.value)
const spinLabel = computed(() =>
  spinning.value ? t('wheel.spinning') : options.value.length < 2 ? t('wheel.needTwo') : t('wheel.spin'),
)

let rafId = 0
let ro: ResizeObserver | null = null
// 低饱和大地色板：与编辑风主题协调，扇区仍可区分
const PALETTE = ['#e8590c', '#2f9e77', '#3b6ea5', '#c2a03c', '#8a5a44', '#5c6f8a', '#b26e5c', '#4f7d68', '#a58a3a', '#6a5f8a', '#c98a2e', '#476b8a']

function segColor(i: number, n: number): string {
  let c = PALETTE[i % PALETTE.length]!
  if (i === n - 1 && n > 1 && c === PALETTE[0]) c = PALETTE[3]!
  return c
}

/* ---------------- 绘制 ---------------- */
function draw() {
  const cv = canvasEl.value
  const wrap = wrapEl.value
  if (!cv || !wrap) return
  const dpr = window.devicePixelRatio || 1
  const side = wrap.clientWidth
  if (cv.width !== side * dpr) {
    cv.width = side * dpr
    cv.height = side * dpr
  }
  const c = cv.getContext('2d')
  if (!c) return
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.clearRect(0, 0, side, side)

  const cx = side / 2
  const cy = side / 2
  const R = side / 2 - 10
  const n = options.value.length
  const isDark = document.documentElement.classList.contains('dark')

  // 底盘
  c.beginPath()
  c.arc(cx, cy, R + 6, 0, Math.PI * 2)
  c.fillStyle = isDark ? '#26262f' : '#e9e9f0'
  c.fill()

  if (n === 0) {
    c.beginPath()
    c.arc(cx, cy, R, 0, Math.PI * 2)
    c.fillStyle = isDark ? '#1f1f28' : '#f4f4f8'
    c.fill()
    c.fillStyle = isDark ? '#6e6e7c' : '#a0a0ac'
    c.font = `600 ${Math.max(13, side * 0.04)}px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(t('wheel.canvasEmpty'), cx, cy)
    drawHub(c, cx, cy, side)
    return
  }

  const seg = (Math.PI * 2) / n
  for (let i = 0; i < n; i++) {
    const start = rotation.value + i * seg
    c.beginPath()
    c.moveTo(cx, cy)
    c.arc(cx, cy, R, start, start + seg)
    c.closePath()
    c.fillStyle = segColor(i, n)
    c.fill()
    c.strokeStyle = 'rgba(255,255,255,.85)'
    c.lineWidth = 1.5
    c.stroke()
  }

  // 文字
  c.textAlign = 'right'
  c.textBaseline = 'middle'
  const fs = Math.max(11, Math.min(21, (R * 1.9) / Math.max(n, 4)))
  c.font = `700 ${fs}px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif`
  c.fillStyle = '#fff'
  c.shadowColor = 'rgba(0,0,0,.28)'
  c.shadowBlur = 3
  const maxWidth = R - 46
  for (let i = 0; i < n; i++) {
    const mid = rotation.value + i * seg + seg / 2
    c.save()
    c.translate(cx, cy)
    c.rotate(mid)
    c.fillText(fitText(c, options.value[i]!, maxWidth), R - 18, 0)
    c.restore()
  }
  c.shadowBlur = 0

  drawHub(c, cx, cy, side)
}

function drawHub(c: CanvasRenderingContext2D, cx: number, cy: number, side: number) {
  const hr = Math.max(22, side * 0.075)
  c.beginPath()
  c.arc(cx, cy, hr, 0, Math.PI * 2)
  c.fillStyle = '#fffefb'
  c.fill()
  c.lineWidth = 4
  c.strokeStyle = '#191b20'
  c.stroke()
  // 中心橙色圆点（替代 emoji）
  c.beginPath()
  c.arc(cx, cy, hr * 0.34, 0, Math.PI * 2)
  c.fillStyle = '#e8590c'
  c.fill()
}

function fitText(c: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (c.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && c.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

/* ---------------- 旋转 ---------------- */
function spin() {
  if (!canSpin.value) return
  const n = options.value.length
  const seg = (Math.PI * 2) / n
  const w = randInt(0, n - 1) // 先用加密随机决定赢家
  const jitter = seg * (0.16 + Math.random() * 0.68)
  const base = mod2pi(-Math.PI / 2 - (w * seg + jitter))
  const start = rotation.value
  const minFinal = start + (5 + randInt(0, 2)) * Math.PI * 2
  const k = Math.ceil((minFinal - base) / (Math.PI * 2))
  const final = base + k * Math.PI * 2

  spinning.value = true
  sPop()
  const duration = 4200 + Math.random() * 900
  const t0 = performance.now()
  let lastIndex = -1

  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

  const frame = (now: number) => {
    const p = Math.min(1, (now - t0) / duration)
    rotation.value = start + (final - start) * easeOutQuart(p)

    const idx = Math.floor(mod2pi(-Math.PI / 2 - rotation.value) / seg)
    if (idx !== lastIndex) {
      lastIndex = idx
      sTick()
    }
    draw()

    if (p < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      rotation.value = mod2pi(final)
      spinning.value = false
      announce(w)
    }
  }
  rafId = requestAnimationFrame(frame)
}

function announce(idx: number) {
  const text = options.value[idx] ?? ''
  winner.value = text
  history.value = [{ t: text, at: Date.now() }, ...history.value].slice(0, 8)
  showModal.value = true
  sWin()
  confettiBurst(0.5, 0.38)
}

function onConfirm() {
  showModal.value = false
  if (autoRemove.value) {
    const i = options.value.indexOf(winner.value)
    if (i >= 0) options.value.splice(i, 1)
  }
}

function onAgain() {
  showModal.value = false
  if (autoRemove.value) {
    const i = options.value.indexOf(winner.value)
    if (i >= 0) options.value.splice(i, 1)
  }
  window.setTimeout(() => spin(), 260)
}

/* ---------------- 编辑 ---------------- */
function addItem() {
  const v = newItem.value.trim()
  if (!v) return
  if (spinning.value) return
  if (options.value.includes(v)) {
    toast(t('wheel.dupToast'))
    return
  }
  if (options.value.length >= 16) {
    toast(t('wheel.maxToast'))
    return
  }
  options.value.push(v)
  newItem.value = ''
  sPop()
}

function removeItem(i: number) {
  if (spinning.value) return
  options.value.splice(i, 1)
}

function applyPreset(group: PresetGroup) {
  if (spinning.value) return
  options.value = [...group.items]
  sPop()
}

function clearAll() {
  if (spinning.value) return
  options.value = []
}

function clearHistory() {
  history.value = []
}

/* ---------------- 生命周期 ---------------- */
watch(options, () => draw(), { deep: true })
// 语言切换时重绘画布内的提示文字
watch(locale, () => draw())

onMounted(() => {
  draw()
  ro = new ResizeObserver(() => draw())
  if (wrapEl.value) ro.observe(wrapEl.value)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>

<template>
  <div class="page container">
    <PageHead icon="wheel" :title="t('tools.wheel.name')" :desc="t('page.wheel.desc')" />

    <div class="wheel-layout">
      <section class="wheel-side">
        <div class="wheel-stage card">
          <div ref="wrapEl" class="wheel-wrap">
            <canvas ref="canvasEl" class="wheel-canvas" :aria-label="t('wheel.canvasAria')"></canvas>
            <div class="wheel-pointer" aria-hidden="true"></div>
          </div>

          <button class="btn btn-primary btn-lg spin-btn" :disabled="!canSpin" @click="spin">
            {{ spinLabel }}
          </button>

          <div v-if="history.length" class="history">
            <div class="history-head">
              <span>{{ t('wheel.recent') }}</span>
              <button class="chip-x" :aria-label="t('wheel.clearHistoryAria')" @click="clearHistory">✕</button>
            </div>
            <div class="history-list">
              <span v-for="(h, i) in history" :key="h.at + '-' + i" class="chip" :class="{ first: i === 0 }">{{ h.t }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="editor-side">
        <div class="card">
          <div class="card-title"><span>{{ t('wheel.editTitle') }}</span> <span class="count">{{ options.length }}/16</span></div>

          <div class="add-row">
            <input
              v-model="newItem"
              class="input"
              :placeholder="t('wheel.inputPh')"
              maxlength="12"
              :disabled="spinning"
              @keydown.enter="addItem"
            />
            <button class="btn btn-soft" :disabled="spinning" @click="addItem">{{ t('wheel.add') }}</button>
          </div>

          <div v-if="options.length" class="chips">
            <transition-group name="chip">
              <span v-for="(o, i) in options" :key="o" class="chip opt-chip">
                <span class="opt-dot" :style="{ background: segColor(i, options.length) }"></span>
                {{ o }}
                <button class="chip-x" :aria-label="t('wheel.deleteAria', { name: o })" @click="removeItem(i)">✕</button>
              </span>
            </transition-group>
          </div>
          <p v-else class="empty-tip">{{ t('wheel.emptyTip') }}</p>

          <div class="presets">
            <button v-for="p in PRESETS" :key="p.label" class="btn btn-sm btn-outline" :disabled="spinning" @click="applyPreset(p)">
              {{ p.label }}
            </button>
            <button class="btn btn-sm btn-danger" :disabled="spinning || !options.length" @click="clearAll">{{ t('wheel.clear') }}</button>
          </div>

          <label class="switch" style="margin-top: 16px">
            <input v-model="autoRemove" type="checkbox" />
            <span class="track"></span>
            {{ t('wheel.autoRemove') }}
          </label>
        </div>

        <div class="card tip-card">
          <div class="card-title"><span>{{ t('wheel.tipsTitle') }}</span></div>
          <p>{{ t('wheel.tip') }}</p>
        </div>
      </section>
    </div>

    <ResultModal
      :show="showModal"
      :title="winner"
      :subtitle="t('wheel.modalSub')"
      :confirm-text="t('wheel.confirm')"
      show-cancel
      :cancel-text="t('wheel.again')"
      @confirm="onConfirm"
      @cancel="onAgain"
    />
  </div>
</template>

<style scoped>
.wheel-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 860px) {
  .wheel-layout {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }
}

.wheel-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.wheel-wrap {
  position: relative;
  width: min(100%, 420px);
  aspect-ratio: 1 / 1;
}

.wheel-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.wheel-pointer {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 26px solid var(--accent);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
  z-index: 2;
}

.spin-btn {
  width: min(100%, 420px);
}

/* 历史 */
.history {
  width: min(100%, 420px);
  border-top: 1px dashed var(--border);
  padding-top: 14px;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-2);
  margin-bottom: 9px;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.history .chip.first {
  background: var(--primary-soft);
  border-color: transparent;
  color: var(--primary);
  font-weight: 700;
}

/* 编辑器 */
.editor-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
}

.add-row {
  display: flex;
  gap: 8px;
}

.add-row .input {
  flex: 1;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.opt-chip {
  font-size: 14px;
  padding: 6px 10px 6px 12px;
  color: var(--text);
  font-weight: 600;
}

.opt-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-enter-active,
.chip-leave-active {
  transition: all 0.25s ease;
}
.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.empty-tip {
  margin-top: 14px;
  font-size: 13.5px;
  color: var(--text-3);
  text-align: center;
  padding: 14px 0;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tip-card p {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.75;
}
</style>
