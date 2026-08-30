<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useToast } from '../composables/useToast'
import { locale, t, tArr } from '../i18n'
import { sSlot, sWin } from '../utils/sound'
import { confettiBurst } from '../utils/confetti'

const raw = useLocalStorage<string>('decido.lottery.raw', t('lottery.defaults'))
const removeAfterDraw = useLocalStorage<boolean>('decido.lottery.remove', false)
const drawCount = useLocalStorage<number>('decido.lottery.count', 1)
const history = useLocalStorage<Array<{ t: string[]; at: number }>>('decido.lottery.history', [])

const names = computed(() =>
  raw.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean),
)

const maxDraw = computed(() => Math.max(1, removeAfterDraw.value ? names.value.length : Math.min(10, names.value.length)))

const drawing = ref(false)
const current = ref('')
const winners = ref<string[]>([])
const { toast } = useToast()

const placeholderText = computed(() => `${t('lottery.phLine1')}\n${tArr('lottery.sample').join('\n')}`)
/** 中文顿号、英文逗号分隔 */
const joinSep = computed(() => (locale.value === 'zh' ? '、' : ', '))

let rafId = 0

watch(maxDraw, (m) => {
  if (drawCount.value > m) drawCount.value = m
})

function draw() {
  const pool = names.value
  if (drawing.value) return
  if (pool.length === 0) {
    toast(t('lottery.needPeople'))
    return
  }
  if (drawCount.value > pool.length) {
    toast(t('lottery.notEnough', { n: pool.length, k: drawCount.value }))
    return
  }

  drawing.value = true
  winners.value = []

  // 减速滚动：间隔从 55ms 指数增长到 320ms，总时长约 2.4s
  const start = performance.now()
  const total = 2400
  let nextSwap = 0

  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / total)
    if (now >= nextSwap) {
      current.value = pool[Math.floor(Math.random() * pool.length)]!
      sSlot()
      nextSwap = now + 55 + Math.pow(p, 3) * 270
    }
    if (p < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      settle()
    }
  }
  rafId = requestAnimationFrame(frame)
}

function settle() {
  // 部分洗牌抽出不重复获奖者
  const pool = [...names.value]
  const k = Math.min(drawCount.value, pool.length)
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  const result = pool.slice(0, k)
  winners.value = result
  current.value = ''
  drawing.value = false
  history.value = [{ t: result, at: Date.now() }, ...history.value].slice(0, 8)
  sWin()
  confettiBurst(0.5, 0.42, 130)

  if (removeAfterDraw.value) {
    const lines = raw.value.split('\n').filter((l) => {
      const t = l.trim()
      return t && !result.includes(t)
    })
    raw.value = lines.join('\n')
  }
}

async function copyWinners() {
  if (!winners.value.length) return
  try {
    await navigator.clipboard.writeText(winners.value.join(joinSep.value))
    toast(t('lottery.copiedToast'))
  } catch {
    toast(t('common.copyFail'))
  }
}

function clearHistory() {
  history.value = []
}

onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<template>
  <div class="page container">
    <PageHead icon="lottery" :title="t('tools.lottery.name')" :desc="t('page.lottery.desc')" />

    <div class="lottery-layout">
      <section class="card">
        <div class="card-title">
          <span>{{ t('lottery.candidates') }}</span> <span class="count tnum">{{ t('lottery.countEntries', { n: names.length }) }}</span>
        </div>
        <textarea
          v-model="raw"
          class="input"
          rows="9"
          :placeholder="placeholderText"
          spellcheck="false"
          :disabled="drawing"
        ></textarea>

        <div class="opts">
          <div class="opt-block">
            <span class="field-label">{{ t('lottery.drawCount') }}</span>
            <div class="seg" role="group" :aria-label="t('lottery.drawCount')">
              <button
                v-for="n in Math.min(5, maxDraw)"
                :key="n"
                class="seg-item"
                :class="{ active: drawCount === n }"
                :disabled="drawing"
                @click="drawCount = n"
              >
                {{ n }}
              </button>
            </div>
          </div>
          <label class="switch">
            <input v-model="removeAfterDraw" type="checkbox" :disabled="drawing" />
            <span class="track"></span>
            {{ t('lottery.removeAfter') }}
          </label>
        </div>

        <button class="btn btn-primary btn-lg draw-btn" :disabled="drawing || !names.length" @click="draw">
          {{ drawing ? t('lottery.drawing') : t('lottery.draw') }}
        </button>
      </section>

      <section class="card result-card">
        <div class="card-title">
          <span>{{ t('random.result') }}</span>
          <button v-if="winners.length && !drawing" class="btn btn-sm btn-ghost" style="margin-left: auto" @click="copyWinners">
            {{ t('random.copy') }}
          </button>
        </div>

        <div class="reveal">
          <div v-if="drawing" class="cycling tnum">{{ current }}</div>

          <div v-else-if="winners.length" class="winners">
            <div
              v-for="(w, i) in winners"
              :key="w + i"
              class="winner pop-in"
              :style="{ animationDelay: `${i * 140}ms` }"
            >
              <span v-if="winners.length > 1" class="winner-rank tnum" aria-hidden="true">{{ i + 1 }}</span>
              <span class="winner-name">{{ w }}</span>
            </div>
            <p class="lucky-note">{{ winners.length > 1 ? t('lottery.multiWin', { n: winners.length }) : t('lottery.singleWin') }}</p>
          </div>

          <div v-else class="placeholder">
            <p>{{ t('lottery.emptyHint') }}</p>
          </div>
        </div>

        <div v-if="history.length" class="history">
          <div class="history-head">
            <span>{{ t('lottery.past') }}</span>
            <button class="chip-x" :aria-label="t('lottery.clearAria')" @click="clearHistory">✕</button>
          </div>
          <div class="history-list">
            <span v-for="h in history" :key="h.at" class="chip">{{ h.t.join(joinSep) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lottery-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 760px) {
  .lottery-layout {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
}

.opts {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.opt-block .field-label {
  margin-bottom: 8px;
}

.draw-btn {
  width: 100%;
  margin-top: 18px;
}

.result-card {
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.reveal {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 16px 0;
}

.cycling {
  font-size: clamp(30px, 7vw, 44px);
  font-weight: 900;
  color: var(--text-2);
  letter-spacing: 0.04em;
  animation: blink 0.12s ease infinite alternate;
}

@keyframes blink {
  from {
    opacity: 0.75;
  }
  to {
    opacity: 1;
  }
}

.winners {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.winner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--primary-soft);
  border-radius: 16px;
  padding: 12px 26px;
}

.winner-rank {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 800;
  background: var(--primary);
  color: var(--primary-contrast);
  flex-shrink: 0;
}

.winner-name {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 900;
  color: var(--primary);
  letter-spacing: 0.02em;
}

.lucky-note {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 4px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-3);
}

.placeholder p {
  font-size: 13.5px;
}

.history {
  border-top: 1px dashed var(--border);
  padding-top: 14px;
  margin-top: 12px;
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
</style>
