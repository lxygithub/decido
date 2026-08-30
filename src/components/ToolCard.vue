<script setup lang="ts">
import type { ToolMeta } from '../tools'
import ToolIcon from './ToolIcon.vue'
import { t, tK } from '../i18n'

defineProps<{ tool: ToolMeta }>()
</script>

<template>
  <router-link :to="tool.path" class="tool-card">
    <span v-if="tool.tagKey" class="tool-tag">{{ tK(`${tool.key}.${tool.tagKey}`) }}</span>
    <span class="tool-icon"><ToolIcon :name="tool.icon" :size="26" /></span>
    <span class="tool-name">{{ tK(`${tool.key}.name`) }}</span>
    <span class="tool-desc">{{ tK(`${tool.key}.desc`) }}</span>
    <span class="tool-go" aria-hidden="true">{{ t('common.go') }}</span>
  </router-link>
</template>

<style scoped>
.tool-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 18px 16px;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
}

.tool-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease, border-color 0.2s ease;
}

.tool-card:hover .tool-icon {
  transform: scale(1.06);
  color: var(--accent);
  border-color: var(--accent);
}

.tool-name {
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-top: 2px;
}

.tool-desc {
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.55;
  flex: 1;
}

.tool-go {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.tool-card:hover .tool-go {
  opacity: 1;
  transform: translateX(0);
}
</style>
