/**
 * 图表相关类型定义
 */

import type { EChartsOption } from 'echarts'

/**
 * 图表类型
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar'

/**
 * 图表主题色
 */
export type ChartTheme = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gradient'

/**
 * 图表配置选项
 */
export interface ChartOptions {
  /** 图表标题 */
  title?: string
  /** 图表主题 */
  theme?: ChartTheme
  /** X 轴标签 */
  xAxisLabel?: string
  /** Y 轴标签 */
  yAxisLabel?: string
  /** 是否显示网格线 */
  showGrid?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示工具提示 */
  showTooltip?: boolean
  /** 是否平滑曲线（仅折线图） */
  smooth?: boolean
  /** 是否显示区域填充（仅折线图） */
  areaStyle?: boolean
  /** 柱状图宽度百分比 */
  barWidth?: string
  /** 是否堆叠显示 */
  stack?: boolean
  /** 自定义颜色 */
  colors?: string[]
  /** 图表高度 (rpx) */
  height?: number
  /** 动画时长 (ms) */
  animationDuration?: number
}

/**
 * 图表数据项
 */
export interface ChartDataItem {
  /** 名称/标签 */
  name: string
  /** 数值 */
  value: number
  /** 额外数据 */
  [key: string]: any
}

/**
 * 系列数据
 */
export interface ChartSeries {
  /** 系列名称 */
  name: string
  /** 数据 */
  data: number[] | ChartDataItem[]
  /** 系列类型（可选，默认跟随图表类型） */
  type?: ChartType
  /** 自定义配置 */
  [key: string]: any
}

/**
 * 图表数据结构
 */
export interface ChartData {
  /** X 轴数据（类目轴） */
  xAxisData?: string[]
  /** 系列数据 */
  series: ChartSeries[]
  /** 图例数据 */
  legend?: string[]
}

/**
 * 响应式图表尺寸
 */
export interface ChartSize {
  /** 宽度 (rpx) */
  width: number
  /** 高度 (rpx) */
  height: number
}

/**
 * 图表事件回调
 */
export interface ChartEvents {
  /** 点击事件 */
  onClick?: (params: any) => void
  /** 图表渲染完成 */
  onFinished?: () => void
  /** 图表初始化失败 */
  onError?: (error: Error) => void
}

/**
 * 扩展 ECharts 配置选项
 */
export type ExtendedEChartsOption = EChartsOption

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色 */
  primary: string
  /** 渐变色起始 */
  gradientStart?: string
  /** 渐变色结束 */
  gradientEnd?: string
  /** 透明度 */
  opacity?: number
}

/**
 * 主题色配置映射
 */
export const CHART_THEME_COLORS: Record<ChartTheme, ColorConfig> = {
  blue: {
    primary: '#1296db',
    gradientStart: '#1296db',
    gradientEnd: '#4db8ff'
  },
  green: {
    primary: '#52c41a',
    gradientStart: '#52c41a',
    gradientEnd: '#95de64'
  },
  orange: {
    primary: '#fa8c16',
    gradientStart: '#fa8c16',
    gradientEnd: '#ffc069'
  },
  red: {
    primary: '#f5222d',
    gradientStart: '#f5222d',
    gradientEnd: '#ff7875'
  },
  purple: {
    primary: '#722ed1',
    gradientStart: '#722ed1',
    gradientEnd: '#b37feb'
  },
  gradient: {
    primary: '#1296db',
    gradientStart: '#1296db',
    gradientEnd: '#52c41a'
  }
}
