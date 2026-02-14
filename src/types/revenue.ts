/**
 * 收益相关类型定义
 */

/**
 * 电价配置
 */
export interface TariffConfig {
  /** 峰时电价 (元/kWh) */
  peakPrice: number
  /** 谷时电价 (元/kWh) */
  valleyPrice: number
  /** 平时电价 (元/kWh) */
  flatPrice: number
  /** 峰时时段 (格式: HH:mm-HH:mm) */
  peakHours: string[]
  /** 谷时时段 (格式: HH:mm-HH:mm) */
  valleyHours: string[]
  /** 平时时段 (格式: HH:mm-HH:mm) */
  flatHours: string[]
  /** 光伏补贴 (元/kWh) */
  subsidyPrice?: number
  /** 上网电价 (元/kWh) */
  gridPrice?: number
}

/**
 * 时段类型
 */
export type TariffPeriod = 'peak' | 'valley' | 'flat'

/**
 * 收益统计周期
 */
export type RevenuePeriod = 'day' | 'week' | 'month' | 'year'

/**
 * 收益统计数据
 */
export interface RevenueStats {
  /** 统计周期 */
  period: RevenuePeriod
  /** 总发电量 (kWh) */
  totalEnergy: number
  /** 自用电量 (kWh) */
  selfUseEnergy: number
  /** 上网电量 (kWh) */
  gridEnergy: number
  /** 总收益 (元) */
  totalRevenue: number
  /** 自用收益 (元) */
  selfUseRevenue: number
  /** 上网收益 (元) */
  gridRevenue: number
  /** 补贴收益 (元) */
  subsidyRevenue: number
  /** 自发自用率 (%) */
  selfUseRate: number
}

/**
 * 收益数据点（用于图表）
 */
export interface RevenuePoint {
  /** 时间戳 */
  timestamp: number
  /** 发电量 (kWh) */
  energy: number
  /** 收益 (元) */
  revenue: number
  /** 自用电量 (kWh) */
  selfUseEnergy: number
  /** 上网电量 (kWh) */
  gridEnergy: number
  /** 时段类型 */
  period: TariffPeriod
}

/**
 * 收益趋势
 */
export type RevenueTrend = 'up' | 'down' | 'stable'

/**
 * 收益概览
 */
export interface RevenueOverview {
  /** 今日收益 (元) */
  todayRevenue: number
  /** 今日发电量 (kWh) */
  todayEnergy: number
  /** 自发自用率 (%) */
  selfUseRate: number
  /** 收益趋势 */
  trend: RevenueTrend
  /** 较昨日变化百分比 */
  changeRate: number
}

/**
 * 历史收益数据
 */
export interface RevenueHistory {
  /** 日期（格式：YYYY-MM-DD） */
  date: string
  /** 发电量 (kWh) */
  energy: number
  /** 收益 (元) */
  revenue: number
  /** 自用电量 (kWh) */
  selfUseEnergy: number
  /** 上网电量 (kWh) */
  gridEnergy: number
}

/**
 * 收益详情
 */
export interface RevenueDetail {
  /** 时间戳 */
  timestamp: number
  /** 时段类型 */
  period: TariffPeriod
  /** 发电量 (kWh) */
  energy: number
  /** 自用电量 (kWh) */
  selfUseEnergy: number
  /** 上网电量 (kWh) */
  gridEnergy: number
  /** 电价 (元/kWh) */
  tariff: number
  /** 收益 (元) */
  revenue: number
}
