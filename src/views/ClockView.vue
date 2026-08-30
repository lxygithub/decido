<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { locale, t, tArr } from '../i18n'

const now = ref(new Date())
const hour12 = useLocalStorage<boolean>('decido.clock.h12', false)
const showSec = useLocalStorage<boolean>('decido.clock.sec', true)

let timer = 0

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 100)
})

onBeforeUnmount(() => clearInterval(timer))

const h24 = computed(() => now.value.getHours())
const hourDisplay = computed(() => {
  const h = h24.value
  if (!hour12.value) return String(h).padStart(2, '0')
  const h12 = h % 12 === 0 ? 12 : h % 12
  return String(h12).padStart(2, '0')
})
const meridiem = computed(() => (h24.value < 12 ? t('clock.meridiemAM') : t('clock.meridiemPM')))
const minute = computed(() => String(now.value.getMinutes()).padStart(2, '0'))
const second = computed(() => String(now.value.getSeconds()).padStart(2, '0'))

const dateText = computed(() => {
  const y = now.value.getFullYear()
  const m = now.value.getMonth() + 1
  const d = now.value.getDate()
  if (locale.value === 'zh') return t('clock.dateZh', { y, m, d })
  return t('clock.dateEn', { month: tArr('clock.months')[m - 1], d, y })
})
const weekText = computed(() => tArr('clock.weekdays')[now.value.getDay()])

const greeting = computed(() => {
  const h = h24.value
  if (h < 5) return t('clock.g1')
  if (h < 8) return t('clock.g2')
  if (h < 11) return t('clock.g3')
  if (h < 13) return t('clock.g4')
  if (h < 17) return t('clock.g5')
  if (h < 19) return t('clock.g6')
  if (h < 23) return t('clock.g7')
  return t('clock.g8')
})

const secProgress = computed(() => (now.value.getSeconds() + now.value.getMilliseconds() / 1000) / 60)
</script>

<template>
  <div class="page container">
    <PageHead icon="clock" :title="t('tools.clock.name')" :desc="t('page.clock.desc')" />

    <div class="card clock-card">
      <p class="greeting">{{ greeting }}</p>

      <div class="time-row tnum" role="timer" :aria-label="t('clock.nowAria')">
        <template v-if="hour12"><span class="meridiem">{{ meridiem }}</span></template>
        <span class="big">{{ hourDisplay }}</span>
        <span class="colon">:</span>
        <span class="big">{{ minute }}</span>
        <template v-if="showSec">
          <span class="colon">:</span>
          <span class="big sec">{{ second }}</span>
        </template>
      </div>

      <div class="sec-bar" aria-hidden="true">
        <div class="sec-fill" :style="{ width: (secProgress * 100).toFixed(2) + '%' }"></div>
      </div>

      <p class="date">{{ dateText }} · {{ weekText }}</p>

      <div class="opts">
        <label class="switch">
          <input v-model="hour12" type="checkbox" />
          <span class="track"></span>
          {{ t('clock.h12') }}
        </label>
        <label class="switch">
          <input v-model="showSec" type="checkbox" />
          <span class="track"></span>
          {{ t('clock.showSec') }}
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-card {
  max-width: 720px;
  margin: 0 auto;
  padding: 52px 24px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  overflow: hidden;
  position: relative;
}

.greeting {
  font-size: 15px;
  color: var(--text-2);
  font-weight: 600;
}

.time-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  line-height: 1;
}

.meridiem {
  font-size: clamp(16px, 3vw, 22px);
  font-weight: 700;
  color: var(--text-2);
  margin-right: 6px;
  align-self: center;
}

.big {
  font-size: clamp(64px, 17vw, 124px);
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--text);
}

.big.sec {
  font-size: clamp(34px, 8vw, 60px);
  align-self: center;
  color: var(--text-2);
}

.colon {
  font-size: clamp(40px, 10vw, 80px);
  font-weight: 900;
  color: var(--text-3);
  transform: translateY(-4px);
  animation: colonBlink 1s steps(1) infinite;
}

@keyframes colonBlink {
  0%,
  60% {
    opacity: 1;
  }
  61%,
  100% {
    opacity: 0.35;
  }
}

.sec-bar {
  width: min(100%, 380px);
  height: 6px;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.sec-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
}

.date {
  font-size: 15px;
  color: var(--text-2);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.opts {
  display: flex;
  gap: 22px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
