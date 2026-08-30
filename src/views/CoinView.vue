<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { t, tArr } from '../i18n'
import { coinFlip } from '../utils/random'
import { sLow, sWhoosh, sWin } from '../utils/sound'

const stats = useLocalStorage('decido.coin.stats', { heads: 0, tails: 0 })
const result = ref<'heads' | 'tails' | null>(null)
const flipping = ref(false)
const baseRot = ref(0) // 静止时的累计角度（只可能是 0 或 180）
const targetRot = ref(1800)

const total = computed(() => stats.value.heads + stats.value.tails)
const headsPct = computed(() => (total.value ? Math.round((stats.value.heads / total.value) * 100) : 50))

const coinStyle = computed(() => {
  if (flipping.value) {
    return { '--from': `${baseRot.value}deg`, '--target': `${targetRot.value}deg` }
  }
  // 静止时保留落定角度，确保显示正确的面
  return { transform: `rotateY(${baseRot.value}deg)` }
})
const phrase = ref('')

const PHRASES = computed<Record<'heads' | 'tails', string[]>>(() => ({
  heads: tArr('coin.phraseHeads'),
  tails: tArr('coin.phraseTails'),
}))

function flip() {
  if (flipping.value) return
  flipping.value = true
  result.value = null
  sWhoosh()

  const isHeads = coinFlip()
  // 从当前角度出发，转 5~7 整圈后精确停在目标面
  const desired = isHeads ? 0 : 180
  let t = baseRot.value + 360 * (5 + Math.floor(Math.random() * 3))
  t += (((desired - (t % 360)) % 360) + 360) % 360
  targetRot.value = t
  phrase.value = ''

  window.setTimeout(() => {
    baseRot.value = desired
    flipping.value = false
    result.value = isHeads ? 'heads' : 'tails'
    if (isHeads) stats.value.heads++
    else stats.value.tails++
    const arr = PHRASES.value[isHeads ? 'heads' : 'tails']!
    phrase.value = arr[Math.floor(Math.random() * arr.length)]!
    if (isHeads) sWin()
    else sLow()
  }, 1650)
}

function resetStats() {
  stats.value = { heads: 0, tails: 0 }
  result.value = null
}
</script>

<template>
  <div class="page container">
    <PageHead icon="coin" :title="t('tools.coin.name')" :desc="t('page.coin.desc')" />

    <div class="card stage">
      <div class="coin-scene">
        <div
          class="coin"
          :class="{ flipping }"
          :style="coinStyle"
        >
          <div class="coin-face front" aria-hidden="true">
            <span class="coin-inner">{{ t('coin.headsChar') }}</span>
          </div>
          <div class="coin-face back" aria-hidden="true">
            <span class="coin-inner">{{ t('coin.tailsChar') }}</span>
          </div>
        </div>
      </div>

      <div class="result-area" aria-live="polite">
        <transition name="pop" mode="out-in">
          <div v-if="result" :key="result + total" class="verdict pop-in">
            <span class="verdict-text" :class="result">{{ result === 'heads' ? t('coin.heads') : t('coin.tails') }}</span>
            <span class="verdict-phrase">{{ phrase }}</span>
          </div>
          <p v-else class="hint">{{ flipping ? t('coin.hintFly') : t('coin.hintIdle') }}</p>
        </transition>
      </div>

      <button class="btn btn-primary btn-lg flip-btn" :disabled="flipping" @click="flip">
        {{ flipping ? t('coin.flipping') : t('coin.flip') }}
      </button>

      <div v-if="total > 0" class="stats">
        <div class="bar" role="img" :aria-label="t('coin.statsAria', { h: headsPct, t: 100 - headsPct })">
          <div class="bar-heads" :style="{ width: headsPct + '%' }"></div>
        </div>
        <div class="stats-row tnum">
          <span>{{ t('coin.headsStat', { n: stats.heads, p: headsPct }) }}</span>
          <button class="chip-x" :aria-label="t('coin.clearAria')" :title="t('coin.clearAria')" @click="resetStats">✕</button>
          <span>{{ t('coin.tailsStat', { n: stats.tails, p: 100 - headsPct }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 36px 20px;
  max-width: 560px;
  margin: 0 auto;
}

.coin-scene {
  perspective: 1000px;
  padding: 10px 0;
}

.coin {
  --size: min(54vw, 210px);
  width: var(--size);
  height: var(--size);
  position: relative;
  transform-style: preserve-3d;
}

.coin.flipping {
  animation: coinToss 1.6s cubic-bezier(0.24, 0.7, 0.34, 1) forwards;
}

@keyframes coinToss {
  0% {
    transform: translateY(0) rotateX(0deg) rotateY(var(--from));
  }
  42% {
    transform: translateY(-96px) rotateX(18deg) rotateY(calc(var(--from) + (var(--target) - var(--from)) * 0.52));
  }
  100% {
    transform: translateY(0) rotateX(0deg) rotateY(var(--target));
  }
}

.coin-face {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow:
    inset 0 0 0 10px rgba(255, 255, 255, 0.28),
    inset 0 0 0 12px rgba(146, 64, 14, 0.18),
    0 14px 34px rgba(180, 120, 20, 0.35);
}

.front {
  background: radial-gradient(circle at 34% 30%, #ffe28a 0%, #f5b73c 46%, #d98f14 100%);
}

.back {
  background: radial-gradient(circle at 34% 30%, #ffd977 0%, #eda621 48%, #c07f0d 100%);
  transform: rotateY(180deg);
}

.coin-inner {
  width: 72%;
  height: 72%;
  border-radius: 50%;
  border: 2.5px dashed rgba(120, 66, 8, 0.5);
  display: grid;
  place-items: center;
  font-size: calc(var(--size) * 0.34);
  font-weight: 900;
  color: #9a5b06;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* 结果 */
.result-area {
  min-height: 76px;
  display: grid;
  place-items: center;
  text-align: center;
}

.verdict {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.verdict-text {
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.verdict-text.heads {
  color: var(--accent);
}

.verdict-text.tails {
  color: var(--primary);
}

.verdict-phrase {
  font-size: 14px;
  color: var(--text-2);
}

.hint {
  font-size: 14px;
  color: var(--text-3);
}

.pop-enter-active {
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-leave-active {
  transition: opacity 0.15s ease;
}
.pop-leave-to {
  opacity: 0;
}

.flip-btn {
  min-width: 220px;
}

/* 统计 */
.stats {
  width: min(100%, 380px);
}

.bar {
  height: 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  overflow: hidden;
  display: flex;
}

.bar-heads {
  height: 100%;
  background: var(--accent);
  border-radius: 999px 0 0 999px;
  transition: width 0.5s ease;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 9px;
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
}
</style>
