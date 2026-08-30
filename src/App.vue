<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <AppFooter />
  <ToastHost />
</template>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.app-main > :deep(*) {
  width: 100%;
}
</style>
