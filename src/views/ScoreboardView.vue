<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHead from '../components/PageHead.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useToast } from '../composables/useToast'
import { t } from '../i18n'
import { sPop, sWin } from '../utils/sound'

interface Player {
  id: number
  name: string
  score: number
  color: string
}

const players = useLocalStorage<Player[]>('decido.score.players', [
  { id: 1, name: t('sb.teamRed'), score: 0, color: '#d6453d' },
  { id: 2, name: t('sb.teamBlue'), score: 0, color: '#2f9e77' },
])

const newName = ref('')
const undoStack = ref<Array<{ id: number; delta: number }>>([])
let seq = 100

const { toast } = useToast()

const COLORS = ['#d6453d', '#2f9e77', '#3b6ea5', '#c2a03c', '#e8590c', '#5c6f8a', '#8a5a44', '#6a5f8a']

const leader = computed(() => {
  const max = Math.max(...players.value.map((p) => p.score), 0)
  if (max <= 0 || players.value.filter((p) => p.score === max).length > 1) return null
  return players.value.find((p) => p.score === max) ?? null
})

function addPlayer() {
  const name = newName.value.trim()
  if (!name) {
    toast(t('sb.needName'))
    return
  }
  if (players.value.length >= 12) {
    toast(t('sb.maxTeams'))
    return
  }
  players.value.push({
    id: ++seq,
    name,
    score: 0,
    color: COLORS[players.value.length % COLORS.length]!,
  })
  newName.value = ''
  sPop()
}

function add(id: number, delta: number) {
  const p = players.value.find((x) => x.id === id)
  if (!p) return
  p.score += delta
  undoStack.value.push({ id, delta })
  if (delta > 0) sPop()
  if (p.score > 0 && leader.value?.id === id) sWin()
}

function undo() {
  const op = undoStack.value.pop()
  if (!op) {
    toast(t('sb.noUndo'))
    return
  }
  const p = players.value.find((x) => x.id === op.id)
  if (p) p.score -= op.delta
}

function removePlayer(id: number) {
  players.value = players.value.filter((p) => p.id !== id)
  undoStack.value = undoStack.value.filter((op) => op.id !== id)
}

function resetScores() {
  for (const p of players.value) p.score = 0
  undoStack.value = []
  sPop()
}
</script>

<template>
  <div class="page container">
    <PageHead icon="trophy" :title="t('tools.scoreboard.name')" :desc="t('page.scoreboard.desc')" />

    <div class="add-bar card">
      <input
        v-model="newName"
        class="input"
        :placeholder="t('sb.addPh')"
        maxlength="10"
        @keydown.enter="addPlayer"
      />
      <button class="btn btn-primary" @click="addPlayer">{{ t('sb.add') }}</button>
      <div class="ops">
        <button class="btn btn-ghost btn-sm" :disabled="!undoStack.length" @click="undo">{{ t('sb.undo') }}</button>
        <button class="btn btn-danger btn-sm" :disabled="!players.some((p) => p.score !== 0)" @click="resetScores">{{ t('sb.reset') }}</button>
      </div>
    </div>

    <p v-if="leader" class="lead-banner">
      {{ t('sb.leading', { name: leader.name, score: leader.score }) }}
    </p>
    <div v-if="players.length" class="player-grid">
      <div
        v-for="p in players"
        :key="p.id"
        class="player card"
        :class="{ leading: leader?.id === p.id }"
        :style="{ '--pc': p.color }"
      >
        <div class="p-head">
          <span class="p-dot" :style="{ background: p.color }" aria-hidden="true"></span>
          <span class="p-name">{{ p.name }}</span>
          <button class="chip-x" :aria-label="t('sb.removeAria', { name: p.name })" @click="removePlayer(p.id)">✕</button>
        </div>
        <div class="p-score tnum" :class="{ neg: p.score < 0 }">{{ p.score }}</div>
        <div class="p-btns">
          <button class="pb" @click="add(p.id, -5)">−5</button>
          <button class="pb" @click="add(p.id, -1)">−1</button>
          <button class="pb plus" @click="add(p.id, 1)">+1</button>
          <button class="pb plus" @click="add(p.id, 5)">+5</button>
        </div>
      </div>
    </div>

    <div v-else class="card empty-card">
      <p>{{ t('sb.empty') }}</p>
    </div>
  </div>
</template>

<style scoped>
.add-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.add-bar .input {
  flex: 1;
  min-width: 180px;
}

.ops {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.lead-banner {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-2);
  background: var(--warning-soft);
  border-radius: 12px;
  padding: 10px;
}

.lead-banner b {
  color: var(--warning);
  font-weight: 800;
}

.player-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.player {
  position: relative;
  padding: 18px 16px 16px;
  border-top: 3px solid var(--pc);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.player.leading {
  box-shadow: 0 0 0 2px var(--accent-soft), var(--shadow-md);
  border-top-color: var(--accent);
}

.p-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.p-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.p-name {
  font-size: 15px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p-head .chip-x {
  margin-left: auto;
}

.p-score {
  font-size: 46px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  margin: 8px 0 12px;
  color: var(--text);
}

.p-score.neg {
  color: var(--danger);
}

.p-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.pb {
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-2);
  border-radius: 10px;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  font-variant-numeric: tabular-nums;
}

.pb:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.pb.plus:hover {
  border-color: var(--success);
  color: var(--success);
}

.pb:active {
  transform: scale(0.92);
}

.empty-card {
  margin-top: 16px;
  text-align: center;
  color: var(--text-3);
  padding: 44px 0;
}
</style>
