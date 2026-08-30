import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/wheel', name: 'wheel', component: () => import('../views/WheelView.vue') },
    { path: '/dice', name: 'dice', component: () => import('../views/DiceView.vue') },
    { path: '/random', name: 'random', component: () => import('../views/RandomView.vue') },
    { path: '/coin', name: 'coin', component: () => import('../views/CoinView.vue') },
    { path: '/shuffle', name: 'shuffle', component: () => import('../views/ShuffleView.vue') },
    { path: '/lottery', name: 'lottery', component: () => import('../views/LotteryView.vue') },
    { path: '/jiaobei', name: 'jiaobei', component: () => import('../views/JiaobeiView.vue') },
    { path: '/timer', name: 'timer', component: () => import('../views/TimerView.vue') },
    { path: '/clock', name: 'clock', component: () => import('../views/ClockView.vue') },
    { path: '/scoreboard', name: 'scoreboard', component: () => import('../views/ScoreboardView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
