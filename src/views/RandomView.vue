<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useToast } from '../composables/useToast'
import { t } from '../i18n'
import { randInt } from '../utils/random'
import { sSlot, sWin } from '../utils/sound'

const cfg = useLocalStorage('decido.random.cfg', { min: 1, max: 100, count: 1, unique: false })

const display = ref<number[]>([])
const finals = ref<number[]>([])
const rolling = ref(false)
const rollId = ref(0)
const { toast } = useToast()

let timer = 0

const rangeSize = computed(() => Math.max(0, cfg.value.max - cfg.value.min + 1))
const invalid = computed(() => cfg.value.min > cfg.value.max)
const uniqueImpossible = computed(() => cfg.value.unique && rangeSize.value < cfg.value.count)

function roll() {
  if (rolling.value) return
  if (invalid.value) {
    toast(t('random.minMaxToast'))
    return
  }
  if (uniqueImpossible.value) {
    toast(t('random.notEnoughToast', { n: rangeSize.value, k: cfg.value.count }))
    return
  }
  rolling.value = true
  rollId.value++
  const { min, max, count, unique } = cfg.value

  const pool: number[] = []
  if (unique) for (let i = min; i <= max; i++) pool.push(i)

  // 滚动动画：先疯狂跳变，再落定
  const start = performance.now()
  const duration = 1150
  let lastSlot = 0
  const frame = (now: number) => {
    if (now - lastSlot > 65) {
      lastSlot = now
      display.value = Array.from({ length: count }, () => randInt(min, max))
      sSlot()
    }
    if (now - start < duration) {
      timer = requestAnimationFrame(frame)
    } else {
      let result: number[]
      if (unique) {
        // 部分洗牌取前 count 个
        for (let i = 0; i < count; i++) {
          const j = randInt(i, pool.length - 1)
          ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
        }
        result = pool.slice(0, count)
      } else {
        result = Array.from({ length: count }, () => randInt(min, max))
      }
      finals.value = result
      display.value = result
      rolling.value = false
      sWin()
    }
  }
  timer = requestAnimationFrame(frame)
}

async function copy() {
  if (!finals.value.length) return
  try {
    await navigator.clipboard.writeText(finals.value.join(', '))
    toast(t('common.copied'))
  } catch {
    toast(t('common.copyFail'))
  }
}

onBeforeUnmount(() => cancelAnimationFrame(timer))
</script>

<template>
  <div class="page container">
    <PageHead icon="random" :title="t('tools.random.name')" :desc="t('page.random.desc')" />

    <div class="random-layout">
      <section class="card">
        <div class="card-title"><span>{{ t('random.settings') }}</span></div>

        <div class="range-row">
          <div class="field">
            <label class="field-label" for="rmin">{{ t('random.min') }}</label>
            <input id="rmin" v-model.number="cfg.min" class="input tnum" type="number" :disabled="rolling" />
          </div>
          <span class="tilde" aria-hidden="true">~</span>
          <div class="field">
            <label class="field-label" for="rmax">{{ t('random.max') }}</label>
            <input id="rmax" v-model.number="cfg.max" class="input tnum" type="number" :disabled="rolling" />
          </div>
        </div>

        <div class="field">
          <label class="field-label">{{ t('random.countLabel', { n: cfg.count }) }}</label>
          <input v-model.number="cfg.count" class="slider" type="range" min="1" max="10" step="1" :disabled="rolling" />
        </div>

        <label class="switch">
          <input v-model="cfg.unique" type="checkbox" :disabled="rolling" />
          <span class="track"></span>
          {{ t('random.unique') }}
        </label>

        <button class="btn btn-primary btn-lg gen-btn" :disabled="rolling" @click="roll">
          {{ rolling ? t('random.generating') : t('random.generate') }}
        </button>
      </section>

      <section class="card result-card">
        <div class="card-title">
          <span>{{ t('random.result') }}</span>
          <button v-if="finals.length && !rolling" class="btn btn-sm btn-ghost" style="margin-left: auto" @click="copy">
            {{ t('random.copy') }}
          </button>
        </div>

        <div v-if="display.length" class="nums">
          <transition-group name="num">
            <span
              v-for="(n, i) in display"
              :key="`${rollId}-${i}-${rolling ? 'r' : 'f'}-${n}`"
              class="num tnum"
              :class="{ final: !rolling }"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              {{ n }}
            </span>
          </transition-group>
        </div>
        <div v-else class="placeholder">
          <p>{{ t('random.placeholder') }}</p>
        </div>

        <p v-if="finals.length && !rolling" class="meta tnum">
          {{ t('random.meta', { n: finals.length, min: cfg.min, max: cfg.max }) }}{{ cfg.unique ? t('random.metaUnique') : '' }}
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.random-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 760px) {
  .random-layout {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    align-items: start;
  }
}

.range-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;
}

.range-row .field {
  flex: 1;
}

.tilde {
  font-size: 18px;
  color: var(--text-3);
  padding-bottom: 11px;
}

.field {
  margin-bottom: 16px;
}

.field:last-of-type {
  margin-bottom: 6px;
}

.slider {
  width: 100%;
  accent-color: var(--primary);
  height: 28px;
  cursor: pointer;
}

.gen-btn {
  width: 100%;
  margin-top: 20px;
}

.result-card {
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.result-card .card-title {
  width: 100%;
}

.nums {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-content: center;
  justify-content: center;
  padding: 18px 0;
}

.num {
  display: grid;
  place-items: center;
  min-width: 64px;
  height: 64px;
  padding: 0 14px;
  border-radius: 16px;
  font-size: 27px;
  font-weight: 800;
  background: var(--surface-2);
  border: 1.5px solid var(--border-strong);
  color: var(--text);
}

.num.final {
  background: var(--primary);
  border: none;
  color: var(--primary-contrast);
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.num-enter-active {
  transition: all 0.12s ease;
}

.num-leave-active {
  display: none;
}

.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-3);
}

.placeholder p {
  font-size: 13.5px;
}

.meta {
  text-align: center;
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
