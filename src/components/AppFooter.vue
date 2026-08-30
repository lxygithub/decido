<script setup lang="ts">
import { onMounted } from 'vue'
import { t } from '../i18n'

onMounted(() => {
  const el = document.getElementById('site-views')
  fetch('/api/views')
    .then((r) => r.json())
    .then((d) => {
      if (el && d && d.views != null) el.textContent = Number(d.views).toLocaleString()
    })
    .catch(() => {
      if (el) el.textContent = '—'
    })
})
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <p class="foot-brand">{{ t('footer.brand') }}</p>
      <p class="foot-note">{{ t('footer.note') }}</p>
      <p class="foot-note">
        {{ t('footer.visits') }}: <span id="site-views">0</span>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding: 22px 0 calc(22px + env(safe-area-inset-bottom, 0px));
  background: var(--surface);
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;
}

.foot-brand {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-2);
}

.foot-brand .dot {
  color: var(--text-3);
  margin: 0 2px;
}

.foot-note {
  font-size: 12px;
  color: var(--text-3);
}
</style>
