<script setup lang="ts">
import { t } from '../i18n'

withDefaults(
  defineProps<{
    show: boolean
    emoji?: string
    title?: string
    subtitle?: string
    confirmText?: string
    showCancel?: boolean
    cancelText?: string
  }>(),
  {
    emoji: '',
    title: '',
    subtitle: '',
    confirmText: '',
    showCancel: false,
    cancelText: '',
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-mask" @click.self="emit('cancel')">
        <div class="modal-box card" role="dialog" aria-modal="true" :aria-label="title || t('random.result')">
          <div v-if="emoji" class="modal-emoji pop-in" aria-hidden="true">{{ emoji }}</div>
          <div class="modal-rule" aria-hidden="true"></div>
          <div v-if="title" class="modal-title">{{ title }}</div>
          <div v-if="subtitle" class="modal-subtitle">{{ subtitle }}</div>
          <div v-if="$slots.default" class="modal-body">
            <slot />
          </div>
          <div class="modal-actions">
            <button v-if="showCancel" class="btn btn-outline" @click="emit('cancel')">{{ cancelText || t('modal.cancel') }}</button>
            <button class="btn btn-primary" @click="emit('confirm')">{{ confirmText || t('modal.ok') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(12, 12, 20, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal-box {
  width: min(400px, 100%);
  padding: 30px 26px 24px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  border: none;
}

.modal-emoji {
  font-size: 58px;
  line-height: 1;
  margin-bottom: 14px;
}

.modal-rule {
  width: 34px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
  margin: 0 auto 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
  word-break: break-all;
}
.modal-subtitle {
  font-size: 14px;
  color: var(--text-2);
}

.modal-body {
  margin-top: 12px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 22px;
}

.modal-actions .btn {
  min-width: 120px;
}
</style>
