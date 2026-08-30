<script setup lang="ts">
import ToolIcon from './ToolIcon.vue'
import { t } from '../i18n'

defineProps<{
  icon: string
  title: string
  desc: string
}>()
</script>

<template>
  <div class="page-head-wrap">
    <router-link to="/" class="back-link" :aria-label="t('nav.home')">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" />
      </svg>
      <span>{{ t('nav.backToTools') }}</span>
    </router-link>

    <div class="page-head">
      <span class="icon-tile"><ToolIcon :name="icon" :size="26" /></span>
      <div>
        <h1>{{ title }}</h1>
        <p>{{ desc }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 14px;
  padding: 5px 12px 5px 9px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-3);
  background: var(--surface);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.back-link svg {
  transition: transform 0.2s ease;
}

.back-link:hover {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
}

.back-link:hover svg {
  transform: translateX(-2px);
}

.back-link:active {
  transform: scale(0.97);
}

.back-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
