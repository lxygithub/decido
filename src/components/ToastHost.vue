<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast-item">{{ t.text }}</div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  width: max-content;
  max-width: 88vw;
}

.toast-item {
  background: var(--text);
  color: var(--bg);
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: var(--shadow-lg);
  max-width: 100%;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.92);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.95);
}
</style>
