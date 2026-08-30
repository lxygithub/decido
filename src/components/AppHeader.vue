<script setup lang="ts">
import { useTheme, useSoundEnabled } from '../composables/useAppSettings'
import ToolIcon from './ToolIcon.vue'
import { locale, setLocale, t } from '../i18n'
import { sPop } from '../utils/sound'

const { theme, toggleTheme } = useTheme()
const { soundEnabled, toggleSound } = useSoundEnabled()

function onToggleSound() {
  const on = toggleSound()
  if (on) sPop()
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <router-link to="/" class="brand" :aria-label="t('nav.home')">
        <span class="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="22" height="22">
            <path d="M32 10 A22 22 0 0 1 54 32 L32 32 Z" fill="var(--primary-contrast)" opacity=".32" />
            <path d="M32 54 A22 22 0 0 1 10 32 L32 32 Z" fill="var(--primary-contrast)" opacity=".32" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="var(--primary-contrast)" stroke-width="2.5" opacity=".6" />
            <circle cx="32" cy="32" r="5.5" fill="var(--primary-contrast)" />
          </svg>
        </span>
        <span class="brand-text">
          <strong>{{ t('app.brand') }}</strong>
          <em>{{ t('app.tagline') }}</em>
        </span>
      </router-link>

      <nav class="header-actions" aria-label="Global settings">
        <div class="lang-seg" role="group" :aria-label="t('nav.lang')">
          <button
            class="lang-item"
            :class="{ active: locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
          >
            EN
          </button>
          <button
            class="lang-item"
            :class="{ active: locale === 'zh' }"
            :aria-pressed="locale === 'zh'"
            @click="setLocale('zh')"
          >
            中文
          </button>
        </div>
        <button
          class="btn-icon"
          :aria-label="soundEnabled ? t('nav.soundOff') : t('nav.soundOn')"
          :title="soundEnabled ? t('nav.soundOff') : t('nav.soundOn')"
          @click="onToggleSound"
        >
          <ToolIcon :name="soundEnabled ? 'sound-on' : 'sound-off'" :size="19" />
        </button>
        <button
          class="btn-icon"
          :aria-label="theme === 'dark' ? t('nav.toLight') : t('nav.toDark')"
          :title="theme === 'dark' ? t('nav.light') : t('nav.dark')"
          @click="toggleTheme"
        >
          <ToolIcon :name="theme === 'dark' ? 'sun' : 'moon-dark'" :size="19" />
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary);
  display: grid;
  place-items: center;
  transition: transform 0.3s ease;
}

.brand:hover .brand-logo {
  transform: rotate(90deg) scale(1.05);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text strong {
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.brand-text em {
  font-style: normal;
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: 0.06em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 语言切换器 */
.lang-seg {
  display: flex;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px;
  margin-right: 6px;
}

.lang-item {
  appearance: none;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-3);
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.2;
}

.lang-item:hover {
  color: var(--text);
}

.lang-item.active {
  background: var(--primary);
  color: var(--primary-contrast);
}

@media (max-width: 420px) {
  .lang-item {
    padding: 4px 8px;
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .brand-text em {
    display: none;
  }
}
</style>
