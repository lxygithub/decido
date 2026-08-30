<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { t } from '../i18n'
import { randInt } from '../utils/random'
import { sDice, sPop } from '../utils/sound'

const count = useLocalStorage<number>('decido.dice.count', 2)
const rolls = useLocalStorage<number>('decido.dice.rolls', 0)
const values = ref<number[]>([1, 1])
const poses = ref<Array<{ rx: number; ry: number }>>([])
const rolling = ref(false)
const rollId = ref(0)

const total = computed(() => values.value.reduce((a, b) => a + b, 0))

/** 每个点数朝前时立方体的基础姿态 [rotateX, rotateY] */
const FACE_POSE: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
}

/** 每个面骰点分布（3×3 网格位） */
const FACE_PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 4, 7, 3, 6, 9],
}

const FACE_TRANSFORM: Record<number, string> = {
  1: 'translateZ(calc(var(--die) / 2))',
  2: 'rotateY(90deg) translateZ(calc(var(--die) / 2))',
  3: 'rotateX(90deg) translateZ(calc(var(--die) / 2))',
  4: 'rotateX(-90deg) translateZ(calc(var(--die) / 2))',
  5: 'rotateY(-90deg) translateZ(calc(var(--die) / 2))',
  6: 'rotateY(180deg) translateZ(calc(var(--die) / 2))',
}

function roll() {
  if (rolling.value) return
  rolling.value = true
  sDice()
  const n = count.value
  const next = Array.from({ length: n }, () => randInt(1, 6))
  values.value = next
  poses.value = next.map((f) => {
    const [brx, bry] = FACE_POSE[f]!
    const turns = 360 * randInt(2, 4)
    const dir = Math.random() < 0.5 ? -1 : 1
    return {
      // 落定后带一点随机倾斜，更像真实骰子
      rx: brx + dir * turns + (Math.random() * 14 - 7),
      ry: bry + dir * turns + (Math.random() * 14 - 7),
    }
  })
  rollId.value++
  window.setTimeout(() => {
    rolling.value = false
    rolls.value++
    sPop()
  }, 1150)
}

function setCount(n: number) {
  if (rolling.value) return
  count.value = n
  values.value = Array.from({ length: n }, () => randInt(1, 6))
  poses.value = values.value.map((f) => {
    const [brx, bry] = FACE_POSE[f]!
    return { rx: brx, ry: bry }
  })
}
</script>

<template>
  <div class="page container">
    <PageHead icon="dice" :title="t('tools.dice.name')" :desc="t('page.dice.desc')" />

    <div class="card stage">
      <div class="seg" role="group" :aria-label="t('dice.countAria')">
        <button
          v-for="n in 6"
          :key="n"
          class="seg-item"
          :class="{ active: count === n }"
          @click="setCount(n)"
        >
          {{ t('dice.countN', { n }) }}
        </button>
      </div>

      <div class="dice-area">
        <div v-for="(v, i) in values" :key="i" class="die" :aria-label="t('dice.dieAria', { i: i + 1, v })">
          <div
            class="cube"
            :style="{ transform: `rotateX(${poses[i]?.rx ?? 0}deg) rotateY(${poses[i]?.ry ?? 0}deg)` }"
          >
            <div v-for="f in 6" :key="f" class="face" :style="{ transform: FACE_TRANSFORM[f] }">
              <span
                v-for="p in FACE_PIPS[f]"
                :key="p"
                class="pip"
                :class="'p' + p"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <transition name="pop" mode="out-in">
        <div v-if="rolls > 0" :key="rollId" class="sum">
          <span class="sum-label">{{ t('dice.total') }}</span>
          <span class="sum-value tnum">{{ total }}</span>
          <span v-if="count > 1" class="sum-detail">（{{ values.join(' + ') }}）</span>
        </div>
      </transition>

      <button class="btn btn-primary btn-lg roll-btn" :disabled="rolling" @click="roll">
        {{ rolling ? t('dice.rolling') : t('dice.roll') }}
      </button>

      <p v-if="rolls > 0" class="rolls-meta tnum">{{ t('dice.rolled', { n: rolls }) }}</p>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 30px 20px;
}

.dice-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px;
  min-height: calc(var(--die) + 20px);
  align-items: center;
  perspective: 900px;
  padding: 10px 0;
}

.die {
  --die: clamp(58px, 15vw, 84px);
  width: var(--die);
  height: var(--die);
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1.1s cubic-bezier(0.18, 0.86, 0.28, 1.04);
}

.face {
  position: absolute;
  inset: 0;
  border-radius: 16%;
  background: linear-gradient(150deg, #ffffff 0%, #eceef4 100%);
  border: 1px solid rgba(30, 30, 45, 0.12);
  box-shadow: inset 0 0 calc(var(--die) * 0.14) rgba(70, 70, 110, 0.16);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 12%;
  backface-visibility: hidden;
}

html.dark .face {
  background: linear-gradient(150deg, #2c2c38 0%, #1d1d26 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.pip {
  width: 68%;
  height: 68%;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 30%, #3d3d52, #17171f);
  align-self: center;
  justify-self: center;
}

html.dark .pip {
  background: radial-gradient(circle at 32% 30%, #d6d6e4, #8f8fa8);
}

.p1 { grid-area: 1 / 1; }
.p2 { grid-area: 1 / 2; }
.p3 { grid-area: 1 / 3; }
.p4 { grid-area: 2 / 1; }
.p5 { grid-area: 2 / 2; }
.p6 { grid-area: 2 / 3; }
.p7 { grid-area: 3 / 1; }
.p8 { grid-area: 3 / 2; }
.p9 { grid-area: 3 / 3; }

/* 点数 2、3 的对角摆放微调 */
.face .p1 { justify-self: start; align-self: start; }
.face .p3 { justify-self: end; align-self: start; }
.face .p7 { justify-self: start; align-self: end; }
.face .p9 { justify-self: end; align-self: end; }

.sum {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.sum-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  letter-spacing: 0.1em;
}

.sum-value {
  font-size: 46px;
  font-weight: 900;
  line-height: 1;
  color: var(--text);
}

.sum-detail {
  font-size: 13px;
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

.roll-btn {
  min-width: 220px;
}

.rolls-meta {
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
