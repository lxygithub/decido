<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { t } from '../i18n'
import { sAlarm, sPop, sTick } from '../utils/sound'

const totalSec = ref(180)
const remainMs = ref(180000)
const running = ref(false)
const done = ref(false)
const customMin = ref(3)
const customSec = ref(0)
const customDraft = useLocalStorage('decido.timer.custom', { m: 3, s: 0 })

let endAt = 0
let rafId = 0
let lastTickSec = -1

const PRESETS = computed(() => [
  { label: t('timer.p30'), sec: 30 },
  { label: t('timer.p1'), sec: 60 },
  { label: t('timer.p3'), sec: 180 },
  { label: t('timer.p5'), sec: 300 },
  { label: t('timer.p10'), sec: 600 },
])

const RING_R = 118
const CIRC = computed(() => 2 * Math.PI * RING_R)

const progress = computed(() => (totalSec.value > 0 ? remainMs.value / (totalSec.value * 1000) : 0))
const urgent = computed(() => running.value && remainMs.value <= 10500)

const displayText = computed(() => {
  const s = Math.ceil(remainMs.value / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

const stateText = computed(() => {
  if (done.value) return t('timer.stateDone')
  if (running.value) return t('timer.stateRunning')
  if (remainMs.value < totalSec.value * 1000) return t('timer.statePaused')
  return t('timer.stateReady')
})

function applyPreset(sec: number) {
  stopAll()
  totalSec.value = sec
  remainMs.value = sec * 1000
  done.value = false
  customMin.value = Math.floor(sec / 60)
  customSec.value = sec % 60
  sPop()
}

function applyCustom() {
  const m = Math.min(99, Math.max(0, Math.floor(customMin.value || 0)))
  const s = Math.min(59, Math.max(0, Math.floor(customSec.value || 0)))
  const sec = m * 60 + s
  if (sec <= 0) return
  customDraft.value = { m, s }
  applyPreset(sec)
}

function start() {
  if (running.value || done.value || remainMs.value <= 0) return
  running.value = true
  endAt = Date.now() + remainMs.value
  lastTickSec = Math.ceil(remainMs.value / 1000)
  sPop()
  loop()
}

function pause() {
  running.value = false
  cancelAnimationFrame(rafId)
  sPop()
}

function reset() {
  stopAll()
  remainMs.value = totalSec.value * 1000
  done.value = false
}

function stopAll() {
  running.value = false
  cancelAnimationFrame(rafId)
}

function loop() {
  rafId = requestAnimationFrame(() => {
    remainMs.value = Math.max(0, endAt - Date.now())
    const s = Math.ceil(remainMs.value / 1000)
    if (s !== lastTickSec) {
      lastTickSec = s
      if (running.value && s > 0 && s <= 5) sTick()
      document.title = t('timer.docTitle', { time: `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` })
    }
    if (remainMs.value <= 0) {
      finish()
      return
    }
    if (running.value) loop()
  })
}

function finish() {
  stopAll()
  done.value = true
  remainMs.value = 0
  sAlarm()
  document.title = t('timer.docDone')
}

watch(customDraft, (v) => {
  customMin.value = v.m
  customSec.value = v.s
}, { immediate: true })

onBeforeUnmount(() => {
  stopAll()
  document.title = t('app.title')
})
</script>

<template>
  <div class="page container">
    <PageHead icon="timer" :title="t('tools.timer.name')" :desc="t('page.timer.desc')" />

    <div class="timer-layout">
      <section class="card stage" :class="{ flash: done }">
        <div class="ring-wrap">
          <svg viewBox="0 0 280 280" class="ring" aria-hidden="true">
            <circle cx="140" cy="140" :r="RING_R" fill="none" stroke="var(--surface-3)" stroke-width="14" />
            <circle
              cx="140"
              cy="140"
              :r="RING_R"
              fill="none"
              :stroke="urgent || done ? 'var(--danger)' : 'var(--accent)'"
              stroke-width="14"
              stroke-linecap="round"
              :stroke-dasharray="CIRC"
              :stroke-dashoffset="CIRC * (1 - progress)"
              :transform="'rotate(-90 140 140)'"
              class="ring-fg"
            />
          </svg>
          <div class="ring-center">
            <span class="time tnum" :class="{ urgent, done }">{{ displayText }}</span>
            <span class="state">{{ stateText }}</span>
          </div>
        </div>

        <div class="controls">
          <button v-if="!running" class="btn btn-primary" :disabled="done || remainMs <= 0" @click="start">{{ t('timer.start') }}</button>
          <button v-else class="btn btn-outline" @click="pause">{{ t('timer.pause') }}</button>
          <button class="btn btn-ghost" :disabled="!running && remainMs === totalSec * 1000 && !done" @click="reset">{{ t('timer.reset') }}</button>
        </div>
      </section>

      <section class="side">
        <div class="card">
          <div class="card-title"><span>{{ t('timer.quick') }}</span></div>
          <div class="presets">
            <button
              v-for="p in PRESETS"
              :key="p.sec"
              class="btn btn-sm"
              :class="totalSec === p.sec ? 'btn-primary' : 'btn-outline'"
              @click="applyPreset(p.sec)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span>{{ t('timer.custom') }}</span></div>
          <div class="custom-row">
            <div class="field">
              <label class="field-label" for="tmin">{{ t('timer.minutes') }}</label>
              <input id="tmin" v-model.number="customMin" class="input tnum" type="number" min="0" max="99" />
            </div>
            <span class="colon">:</span>
            <div class="field">
              <label class="field-label" for="tsec">{{ t('timer.seconds') }}</label>
              <input id="tsec" v-model.number="customSec" class="input tnum" type="number" min="0" max="59" />
            </div>
            <button class="btn btn-soft" @click="applyCustom">{{ t('timer.apply') }}</button>
          </div>
          <p class="tip">{{ t('timer.tip') }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.timer-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 760px) {
  .timer-layout {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 34px 20px;
}

.stage.flash {
  animation: flashAlert 0.7s ease infinite;
}

.ring-wrap {
  position: relative;
  width: min(72vw, 300px);
}

.ring {
  width: 100%;
  height: auto;
  display: block;
}

.ring-fg {
  transition: stroke-dashoffset 0.2s linear, stroke 0.3s ease;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time {
  font-size: clamp(44px, 12vw, 62px);
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1;
}

.time.urgent {
  color: var(--danger);
  animation: blinkUrgent 0.5s ease infinite alternate;
}

.time.done {
  color: var(--danger);
}

@keyframes blinkUrgent {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.55;
  }
}

.state {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 12px;
}

.controls .btn {
  min-width: 110px;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.custom-row .field {
  flex: 1;
}

.colon {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-3);
  padding-bottom: 11px;
}

.tip {
  margin-top: 14px;
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 1.7;
}
</style>
