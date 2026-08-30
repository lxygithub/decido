<script setup lang="ts">
/**
 * 线性 SVG 图标集（24×24 viewBox，stroke 继承 currentColor）
 * 取代 emoji：风格统一、可随主题变色、无跨平台渲染差异。
 * 图形参考通用线性图标范式自绘，stroke-width 1.8 保证小尺寸可读。
 */
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 22 })

const ICONS: Record<string, string> = {
  // 幸运轮盘：外圈 + 三根分隔骨 + 中心点
  wheel:
    '<circle cx="12" cy="12" r="9"/><path d="M12 12V3M12 12l-7.8 4.5M12 12l7.8 4.5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>',
  // 骰子：圆角方 + 对角三点
  dice:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.6" cy="8.6" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.4" cy="15.4" r="1.15" fill="currentColor" stroke="none"/>',
  // 随机数：井号
  random: '<path d="M9.5 4 7.5 20M16.5 4l-2 16M4.5 9h15.5M4 15h15.5"/>',
  // 硬币：双同心圆
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/>',
  // 随机排序：两条交叉流线 + 双箭头
  shuffle:
    '<path d="M3 7h3.5c5.5 0 6.5 10 11 10H21"/><path d="M3 17h3.5c2.7 0 4.2-2 5.5-4.2M13 11.2C14.3 9 15.8 7 18.5 7H21"/><path d="m18.5 4.5 2.5 2.5-2.5 2.5"/><path d="m18.5 14.5 2.5 2.5-2.5 2.5"/>',
  // 抽签：票据
  lottery:
    '<path d="M3 9V7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V9a3 3 0 0 0 0 6v1.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V15a3 3 0 0 0 0-6Z"/><path d="M14 6.8v10.4" stroke-dasharray="2.4 2.6"/>',
  // 掷筊：月牙
  moon: '<path d="M20.6 13.1A8.2 8.2 0 1 1 10.9 3.4a6.4 6.4 0 0 0 9.7 9.7Z"/>',
  // 决断计时：秒表
  timer:
    '<circle cx="12" cy="14" r="7.5"/><path d="M12 14.2 15 11.4"/><path d="M10 2.5h4"/><path d="M12 2.5V6"/>',
  // 静心时钟
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/>',
  // 记分板：奖杯
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M6 2h12v7a6 6 0 0 1-12 0V2Z"/><path d="M4 21.5h16"/><path d="M10 14.8V17c0 .9-1.8 1.9-2.6 4.5M14 14.8V17c0 .9 1.8 1.9 2.6 4.5"/>',
  // 音效开
  'sound-on':
    '<path d="M11 5 6.6 9H3.5v6H6.6L11 19V5Z"/><path d="M15.2 8.7a4.7 4.7 0 0 1 0 6.6"/><path d="M18.2 5.8a8.8 8.8 0 0 1 0 12.4"/>',
  // 音效关
  'sound-off': '<path d="M11 5 6.6 9H3.5v6H6.6L11 19V5Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  // 主题：太阳 / 月亮
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/>',
  'moon-dark': '<path d="M20.6 13.1A8.2 8.2 0 1 1 10.9 3.4a6.4 6.4 0 0 0 9.7 9.7Z"/>',
}

const inner = ICONS[props.name] ?? ''
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="inner"
  />
</template>
