<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { t, tK } from '../i18n'
import { coinFlip } from '../utils/random'
import { sClack, sLow, sPop, sWin } from '../utils/sound'
import { confettiBurst } from '../utils/confetti'

type Face = 'ping' | 'tu' // ping = 平面(阳)朝上, tu = 凸面(阴)朝上
type ResultKey = 'sheng' | 'yin' | 'xiao'

const question = useLocalStorage<string>('decido.jiaobei.question', '')
const history = useLocalStorage<Array<{ r: string; at: number }>>('decido.jiaobei.history', [])

const faces = ref<[Face, Face]>(['ping', 'tu'])
const tossing = ref(false)
const landed = ref(true)
const streak = ref(0)
const totalThrows = useLocalStorage<number>('decido.jiaobei.throws', 0)

/** 结果元信息（文案走 i18n，兼容旧版中文 key 的历史记录） */
const RESULT_META: Record<ResultKey, { cls: 'good' | 'bad' | 'meh'; titleKey: string; textKey: string; nameKey: string }> = {
  sheng: { cls: 'good', titleKey: 'jiaobei.shengTitle', textKey: 'jiaobei.shengText', nameKey: 'jiaobei.nameSheng' },
  yin: { cls: 'bad', titleKey: 'jiaobei.yinTitle', textKey: 'jiaobei.yinText', nameKey: 'jiaobei.nameYin' },
  xiao: { cls: 'meh', titleKey: 'jiaobei.xiaoTitle', textKey: 'jiaobei.xiaoText', nameKey: 'jiaobei.nameXiao' },
}

/** 旧版本把中文结果名写入 localStorage，这里统一归一化 */
function normResult(r: string): ResultKey {
  if (r === '圣筊' || r === 'sheng') return 'sheng'
  if (r === '阴筊' || r === 'yin') return 'yin'
  return 'xiao'
}

function resultOf([a, b]: [Face, Face]): ResultKey {
  if (a !== b) return 'sheng'
  return a === 'tu' ? 'yin' : 'xiao'
}

const resultKey = computed<ResultKey | null>(() => {
  if (!landed.value || tossing.value) return null
  return resultOf(faces.value)
})

const info = computed(() => {
  if (!resultKey.value) return null
  const meta = RESULT_META[resultKey.value]
  return { ...meta, title: tK(meta.titleKey), text: tK(meta.textKey) }
})

const isTriple = computed(() => resultKey.value === 'sheng' && streak.value >= 3)

function throwBlocks() {
  if (tossing.value) return
  tossing.value = true
  landed.value = false
  // 加密随机决定每个筊杯的落面
  const next: [Face, Face] = [coinFlip() ? 'ping' : 'tu', coinFlip() ? 'ping' : 'tu']

  window.setTimeout(() => {
    faces.value = next
    tossing.value = false
    landed.value = true
    sClack()
    totalThrows.value++

    const name = resultOf(next)
    history.value = [{ r: name, at: Date.now() }, ...history.value].slice(0, 8)

    if (name === 'sheng') {
      streak.value++
      sWin()
      if (streak.value >= 3) confettiBurst(0.5, 0.4, 150)
    } else {
      streak.value = 0
      if (name === 'yin') sLow()
      else sPop()
    }
  }, 950)
}
</script>

<template>
  <div class="page container">
    <PageHead icon="moon" :title="t('tools.jiaobei.name')" :desc="t('page.jiaobei.desc')" />

    <div class="jiaobei-layout">
      <section class="card stage">
        <input
          v-model="question"
          class="input q-input"
          :placeholder="t('jiaobei.questionPh')"
          maxlength="30"
          :disabled="tossing"
        />

        <div class="altar">
          <div class="blocks">
            <div v-for="i in 2" :key="i" class="slot">
              <div class="block-wrap" :class="{ tossing: tossing, d2: i === 2 }">
                <div class="block" :class="[faces[i - 1], { landed: landed && !tossing }]"></div>
              </div>
              <span class="face-tag" :class="faces[i - 1]">
                {{ faces[i - 1] === 'ping' ? t('jiaobei.ping') : t('jiaobei.tu') }}
              </span>
            </div>
          </div>
          <div class="ground" aria-hidden="true"></div>
        </div>

        <button class="btn btn-primary btn-lg throw-btn" :disabled="tossing" @click="throwBlocks">
          {{ tossing ? t('jiaobei.tossing') : t('jiaobei.throw') }}
        </button>

        <div v-if="streak > 0" class="streak" aria-live="polite">
          <span v-for="i in 3" :key="i" class="streak-dot" :class="{ on: i <= Math.min(streak, 3) }"></span>
          <span class="streak-text tnum">{{ t('jiaobei.streak', { n: Math.min(streak, 3) }) }}</span>
        </div>
      </section>

      <section class="side">
        <div class="card" :class="'r-' + (info?.cls ?? 'none')" aria-live="polite">
          <div v-if="info" :key="info.title + totalThrows" class="verdict pop-in">
            <span class="v-dot" aria-hidden="true"></span>
            <div>
              <div class="v-title">{{ info.title }}</div>
              <p class="v-text">{{ info.text }}</p>
              <p v-if="question.trim()" class="v-q">{{ t('jiaobei.about', { q: question.trim() }) }}</p>
              <p v-if="isTriple" class="v-triple">{{ t('jiaobei.triple') }}</p>
            </div>
          </div>
          <div v-else class="v-empty">
            <p>{{ t('jiaobei.empty1') }}<br />{{ t('jiaobei.empty2') }}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span>{{ t('jiaobei.knowledge') }}</span></div>
          <ul class="rules">
            <li><b>{{ t('jiaobei.nameSheng') }}</b>{{ t('common.colon') }}{{ t('jiaobei.rule1') }}</li>
            <li><b>{{ t('jiaobei.nameYin') }}</b>{{ t('common.colon') }}{{ t('jiaobei.rule2') }}</li>
            <li><b>{{ t('jiaobei.nameXiao') }}</b>{{ t('common.colon') }}{{ t('jiaobei.rule3') }}</li>
          </ul>
          <p class="rule-note">{{ t('jiaobei.note') }}</p>
        </div>

        <div v-if="history.length" class="card">
          <div class="card-title"><span>{{ t('jiaobei.history') }}</span> <span class="tnum" style="margin-left: auto; font-size: 12px; color: var(--text-3)">{{ t('jiaobei.throws', { n: totalThrows }) }}</span></div>
          <div class="h-list">
            <span
              v-for="h in history"
              :key="h.at"
              class="chip"
              :class="'chip-' + RESULT_META[normResult(h.r)].cls"
            >
              <span class="h-dot" aria-hidden="true"></span>{{ tK(RESULT_META[normResult(h.r)].nameKey) }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.jiaobei-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 820px) {
  .jiaobei-layout {
    grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
    align-items: start;
  }
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.q-input {
  text-align: center;
}

/* ---------- 祭坛 ---------- */
.altar {
  position: relative;
  width: 100%;
  padding: 34px 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blocks {
  display: flex;
  gap: 38px;
  align-items: flex-end;
  min-height: 110px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.block-wrap {
  transform-origin: 50% 100%;
}

.block-wrap.tossing {
  animation: tossUp 0.9s cubic-bezier(0.3, 0.5, 0.4, 1) both;
}

.block-wrap.tossing.d2 {
  animation-delay: 0.12s;
}

@keyframes tossUp {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  38% {
    transform: translateY(-120px) rotate(-14deg);
  }
  70% {
    transform: translateY(-30px) rotate(7deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

/* 筊杯：半圆体 */
.block {
  width: 92px;
  height: 46px;
  border-radius: 92px 92px 0 0;
  position: relative;
  transition: background 0.12s ease;
}

/* 凸面（阴）朝上：穹顶感 */
.block.tu {
  background: radial-gradient(130% 170% at 50% -8%, #ff8f85 0%, #e0392f 52%, #a31515 100%);
  box-shadow:
    inset -6px -8px 12px rgba(90, 8, 8, 0.45),
    0 8px 16px rgba(120, 20, 20, 0.28);
}

.block.tu::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  filter: blur(1px);
}

/* 平面（阳）朝上：平整切面 */
.block.ping {
  background: linear-gradient(180deg, #f0605a 0%, #d02c22 100%);
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.22),
    inset 0 10px 14px rgba(255, 255, 255, 0.14),
    inset 0 -5px 8px rgba(110, 10, 10, 0.3),
    0 6px 12px rgba(120, 20, 20, 0.22);
}

.block.ping::after {
  content: '';
  position: absolute;
  inset: 7px 7px 0;
  border-radius: 80px 80px 0 0;
  border: 1.5px dashed rgba(255, 255, 255, 0.3);
  border-bottom: none;
}

.block.landed {
  animation: landBounce 0.32s ease;
}

@keyframes landBounce {
  0% {
    transform: scaleY(1.06) scaleX(0.94);
  }
  60% {
    transform: scaleY(0.94) scaleX(1.04);
  }
  100% {
    transform: scale(1);
  }
}

.face-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-2);
  border: 1px solid var(--border);
}

.face-tag.ping {
  color: #c0392b;
  background: rgba(239, 68, 68, 0.09);
  border-color: transparent;
}

.face-tag.tu {
  color: #7f1d1d;
  background: rgba(127, 29, 29, 0.12);
  border-color: transparent;
}

html.dark .face-tag.tu {
  color: #fca5a5;
}

.ground {
  width: 240px;
  height: 10px;
  margin-top: 4px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.16), transparent);
}

.throw-btn {
  min-width: 240px;
}

/* 连击 */
.streak {
  display: flex;
  align-items: center;
  gap: 7px;
}

.streak-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--surface-3);
  transition: all 0.25s ease;
}

.streak-dot.on {
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.streak-text {
  font-size: 12.5px;
  color: var(--text-2);
  font-weight: 600;
  margin-left: 4px;
}

/* ---------- 侧栏 ---------- */
.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.verdict {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  text-align: left;
}

.v-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
  background: var(--text-3);
}

.r-good .v-dot {
  background: var(--success);
}

.r-bad .v-dot {
  background: var(--danger);
}

.r-meh .v-dot {
  background: var(--warning);
}

.v-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 5px;
}

.v-text {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.75;
}

.v-q {
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--text-3);
}

.v-triple {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 800;
  color: var(--warning);
}

.r-good .v-title {
  color: var(--success);
}

.r-bad .v-title {
  color: var(--danger);
}

.r-meh .v-title {
  color: var(--warning);
}

.v-empty {
  text-align: center;
  color: var(--text-3);
  padding: 12px 0;
}

.v-empty p {
  font-size: 13.5px;
  line-height: 1.8;
}

.rules {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 13.5px;
  color: var(--text-2);
}

.rules b {
  color: var(--text);
  margin-right: 4px;
}

.rule-note {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px dashed var(--border);
  padding-top: 10px;
}

.h-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.h-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}

.chip-good {
  background: var(--success-soft);
  border-color: transparent;
  color: var(--success);
  font-weight: 700;
}

.chip-bad {
  background: var(--danger-soft);
  border-color: transparent;
  color: var(--danger);
  font-weight: 700;
}

.chip-meh {
  background: var(--warning-soft);
  border-color: transparent;
  color: var(--warning);
  font-weight: 700;
}
</style>
