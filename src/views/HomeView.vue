<script setup lang="ts">
import { useRouter } from 'vue-router'
import { tools } from '../tools'
import ToolCard from '../components/ToolCard.vue'
import { t } from '../i18n'
import { sPop } from '../utils/sound'

const router = useRouter()

function lucky() {
  sPop()
  const pick = tools[Math.floor(Math.random() * tools.length)]!
  router.push(pick.path)
}
</script>

<template>
  <div class="page home">
    <section class="hero container">
      <span class="hero-badge">
        <span class="pulse-dot" aria-hidden="true"></span>
        {{ t('home.badge') }}
      </span>
      <h1 class="hero-title">
        {{ t('home.heroTitle1') }}<br />
        {{ t('home.heroPre') }}<em>{{ t('home.heroEm') }}</em>{{ t('home.heroPost') }}
      </h1>
      <p class="hero-sub">{{ t('home.heroSub') }}</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" @click="lucky">{{ t('home.cta1') }}</button>
        <a class="btn btn-outline btn-lg" href="#toolbox">{{ t('home.cta2') }}</a>
      </div>
    </section>

    <section id="toolbox" class="container toolbox">
      <div class="section-head">
        <h2>{{ t('home.toolboxTitle') }}</h2>
        <p>{{ t('home.toolboxSub') }}</p>
      </div>
      <div class="tool-grid">
        <ToolCard v-for="tool in tools" :key="tool.path" :tool="tool" />
      </div>
    </section>

    <section class="container beliefs">
      <div class="belief">
        <span class="belief-no tnum" aria-hidden="true">01</span>
        <div>
          <h3>{{ t('home.b1Title') }}</h3>
          <p>{{ t('home.b1Text') }}</p>
        </div>
      </div>
      <div class="belief">
        <span class="belief-no tnum" aria-hidden="true">02</span>
        <div>
          <h3>{{ t('home.b2Title') }}</h3>
          <p>{{ t('home.b2Text') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: block;
}

/* ---------- Hero ---------- */
.hero {
  text-align: center;
  padding: 58px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 7px 16px;
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  animation: fadeUp 0.5s ease both;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 0 var(--success-soft);
  animation: pulseDot 1.8s ease-out infinite;
}

@keyframes pulseDot {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
  }
  70% {
    box-shadow: 0 0 0 9px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.hero-title {
  font-size: clamp(34px, 7vw, 58px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.18;
  margin: 22px 0 16px;
  animation: fadeUp 0.55s 0.05s ease both;
}

.hero-title em {
  font-style: normal;
  color: var(--accent);
  padding-right: 2px;
}

.hero-sub {
  font-size: clamp(14.5px, 2.4vw, 17px);
  color: var(--text-2);
  max-width: 520px;
  animation: fadeUp 0.6s 0.1s ease both;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeUp 0.65s 0.16s ease both;
}

/* ---------- 工具网格 ---------- */
.toolbox {
  padding-top: 26px;
}

.section-head {
  text-align: center;
  margin-bottom: 22px;
}

.section-head h2 {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-head p {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 3px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  scroll-margin-top: calc(var(--header-h) + 16px);
}

@media (min-width: 720px) {
  .tool-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1020px) {
  .tool-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* ---------- 三大主张（现保留两条，编号排版） ---------- */
.beliefs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  padding-top: 40px;
  padding-bottom: 10px;
  border-top: 1px solid var(--border);
}

@media (min-width: 720px) {
  .beliefs {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

.belief {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 18px 0 6px;
}

.belief-no {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 3px 8px;
  line-height: 1.4;
  flex-shrink: 0;
  margin-top: 2px;
}

.belief h3 {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 5px;
}

.belief p {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.7;
}
</style>
