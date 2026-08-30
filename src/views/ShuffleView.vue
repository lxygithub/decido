<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useToast } from '../composables/useToast'
import { t, tArr } from '../i18n'
import { shuffleArray } from '../utils/random'
import { sPop, sSlot } from '../utils/sound'

interface Item {
  id: number
  text: string
}

const raw = useLocalStorage<string>('decido.shuffle.raw', t('shuffle.defaults'))
const items = ref<Item[]>([])
const shuffling = ref(false)
let idSeq = 0

const { toast } = useToast()

const placeholderText = computed(() => `${t('shuffle.phLine1')}\n${tArr('shuffle.sample').join('\n')}`)

function parse() {
  const lines = raw.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  items.value = lines.map((text) => ({ id: ++idSeq, text }))
}

watch(raw, parse, { immediate: true })

const validCount = computed(() => items.value.length)

function shuffle() {
  if (shuffling.value || validCount.value < 2) return
  shuffling.value = true
  sPop()
  // 短暂的滚动音效，增加"洗牌感"
  let ticks = 0
  const tickTimer = window.setInterval(() => {
    sSlot()
    if (++ticks >= 6) window.clearInterval(tickTimer)
  }, 110)

  window.setTimeout(() => {
    items.value = shuffleArray(items.value)
    shuffling.value = false
  }, 720)
}

async function copyResult() {
  const text = items.value.map((it, i) => `${i + 1}. ${it.text}`).join('\n')
  try {
    await navigator.clipboard.writeText(text)
    toast(t('shuffle.copiedToast'))
  } catch {
    toast(t('common.copyFail'))
  }
}
</script>

<template>
  <div class="page container">
    <PageHead icon="shuffle" :title="t('tools.shuffle.name')" :desc="t('page.shuffle.desc')" />

    <div class="shuffle-layout">
      <section class="card">
        <div class="card-title">
          <span>{{ t('shuffle.inputTitle') }}</span> <span class="count tnum">{{ t('shuffle.countItems', { n: validCount }) }}</span>
        </div>
        <textarea
          v-model="raw"
          class="input"
          rows="10"
          :placeholder="placeholderText"
          spellcheck="false"
        ></textarea>
        <div class="actions">
          <button class="btn btn-primary" :disabled="shuffling || validCount < 2" @click="shuffle">
            {{ shuffling ? t('shuffle.shuffling') : t('shuffle.btn') }}
          </button>
          <button class="btn btn-outline" :disabled="!validCount" @click="copyResult">{{ t('shuffle.copyBtn') }}</button>
        </div>
        <p v-if="validCount < 2" class="warn-tip">{{ t('shuffle.warn') }}</p>
      </section>

      <section class="card">
        <div class="card-title"><span>{{ t('shuffle.resultTitle') }}</span></div>
        <div v-if="items.length" class="result-list">
          <transition-group name="row" tag="ol" class="ol">
            <li v-for="(it, i) in items" :key="it.id" class="row" :class="{ top: i === 0 }">
              <span class="rank tnum">{{ i + 1 }}</span>
              <span class="row-text">{{ it.text }}</span>
            </li>
          </transition-group>
        </div>
        <div v-else class="placeholder">
          <p>{{ t('shuffle.emptyHint') }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.shuffle-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 760px) {
  .shuffle-layout {
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

textarea {
  font-size: 14.5px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.actions .btn {
  flex: 1;
  min-width: 130px;
}

.warn-tip {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--warning);
}

.ol {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: border-color 0.25s ease, background-color 0.25s ease;
}

.row.top {
  background: var(--primary-soft);
  border-color: transparent;
}

.row.top .rank {
  background: var(--primary);
  color: var(--primary-contrast);
}

.rank {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 12.5px;
  font-weight: 800;
  background: var(--surface-3);
  color: var(--text-2);
  flex-shrink: 0;
}

.row-text {
  font-size: 14.5px;
  font-weight: 600;
  word-break: break-all;
}

/* FLIP 重排动画 */
.row-move {
  transition: transform 0.65s cubic-bezier(0.22, 0.9, 0.26, 1.02);
}

.row-leave-active {
  display: none;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-3);
  padding: 40px 0;
}

.placeholder p {
  font-size: 13.5px;
}
</style>
