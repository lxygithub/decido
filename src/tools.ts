export interface ToolMeta {
  path: string
  /** ToolIcon 图标名（线性 SVG，非 emoji） */
  icon: string
  /** i18n key prefix, e.g. 'tools.wheel' → name/desc/tag */
  key: string
  /** optional tag key suffix, e.g. 'tag' → tools.wheel.tag */
  tagKey?: string
}

/** 十大决策神器 */
export const tools: ToolMeta[] = [
  {
    path: '/wheel',
    icon: 'wheel',
    key: 'tools.wheel',
    tagKey: 'tag',
  },
  {
    path: '/dice',
    icon: 'dice',
    key: 'tools.dice',
  },
  {
    path: '/random',
    icon: 'random',
    key: 'tools.random',
  },
  {
    path: '/coin',
    icon: 'coin',
    key: 'tools.coin',
  },
  {
    path: '/shuffle',
    icon: 'shuffle',
    key: 'tools.shuffle',
  },
  {
    path: '/lottery',
    icon: 'lottery',
    key: 'tools.lottery',
  },
  {
    path: '/jiaobei',
    icon: 'moon',
    key: 'tools.jiaobei',
    tagKey: 'tag',
  },
  {
    path: '/timer',
    icon: 'timer',
    key: 'tools.timer',
  },
  {
    path: '/clock',
    icon: 'clock',
    key: 'tools.clock',
  },
  {
    path: '/scoreboard',
    icon: 'trophy',
    key: 'tools.scoreboard',
  },
]
