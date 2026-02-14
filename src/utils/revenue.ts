/**
 * 收益计算工具函数
 */

import type {
  TariffConfig,
  TariffPeriod,
  RevenueStats,
  RevenuePoint,
  RevenuePeriod,
  RevenueOverview,
  RevenueTrend
} from '@/types/revenue'

/**
 * 默认电价配置
 */
export const DEFAULT_TARIFF_CONFIG: TariffConfig = {
  peakPrice: 0.8,
  valleyPrice: 0.3,
  flatPrice: 0.5,
  peakHours: ['08:00-11:00', '18:00-22:00'],
  valleyHours: ['00:00-06:00'],
  flatHours: ['06:00-08:00', '11:00-18:00', '22:00-24:00'],
  subsidyPrice: 0.42,
  gridPrice: 0.35
}

/**
 * 判断时间戳属于哪个电价时段
 */
export function getTariffPeriod(timestamp: number, config: TariffConfig): TariffPeriod {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const minute = date.getMinutes()
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  // 检查是否在峰时
  for (const range of config.peakHours) {
    if (isInTimeRange(timeStr, range)) {
      return 'peak'
    }
  }

  // 检查是否在谷时
  for (const range of config.valleyHours) {
    if (isInTimeRange(timeStr, range)) {
      return 'valley'
    }
  }

  // 其他时间为平时
  return 'flat'
}

/**
 * 判断时间是否在指定范围内
 */
function isInTimeRange(time: string, range: string): boolean {
  const [start, end] = range.split('-')
  const timeNum = timeToNumber(time)
  const startNum = timeToNumber(start)
  let endNum = timeToNumber(end)

  // 处理跨天情况（如 22:00-02:00）
  if (endNum <= startNum) {
    endNum += 2400
    if (timeNum < startNum) {
      return timeToNumber(time) + 2400 <= endNum
    }
  }

  return timeNum >= startNum && timeNum < endNum
}

/**
 * 将时间字符串转换为数字便于比较
 */
function timeToNumber(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 100 + minute
}

/**
 * 计算指定时段的电价
 */
export function calculateTariff(timestamp: number, config: TariffConfig): number {
  const period = getTariffPeriod(timestamp, config)

  switch (period) {
    case 'peak':
      return config.peakPrice
    case 'valley':
      return config.valleyPrice
    case 'flat':
      return config.flatPrice
    default:
      return config.flatPrice
  }
}

/**
 * 计算收益
 * @param energy 发电量 (kWh)
 * @param timestamp 时间戳
 * @param config 电价配置
 * @param selfUseRate 自发自用率 (0-1)
 */
export function calculateRevenue(
  energy: number,
  timestamp: number,
  config: TariffConfig,
  selfUseRate: number = 0.7
): number {
  if (energy <= 0) return 0

  const tariff = calculateTariff(timestamp, config)
  const selfUseEnergy = energy * selfUseRate
  const gridEnergy = energy * (1 - selfUseRate)

  // 自用收益 = 自用电量 × 电价
  const selfUseRevenue = selfUseEnergy * tariff

  // 上网收益 = 上网电量 × 上网电价
  const gridRevenue = gridEnergy * (config.gridPrice || 0.35)

  // 补贴收益 = 总发电量 × 补贴电价
  const subsidyRevenue = energy * (config.subsidyPrice || 0)

  return Number((selfUseRevenue + gridRevenue + subsidyRevenue).toFixed(2))
}

/**
 * 计算自发自用率
 * @param generation 发电量 (kWh)
 * @param consumption 用电量 (kWh)
 */
export function calculateSelfUseRate(generation: number, consumption: number): number {
  if (generation <= 0) return 0
  if (consumption <= 0) return 0

  const selfUse = Math.min(generation, consumption)
  return Number(((selfUse / generation) * 100).toFixed(2))
}

/**
 * 生成收益历史数据（用于图表）
 */
export function generateRevenueHistory(
  startTime: number,
  endTime: number,
  config: TariffConfig,
  interval: number = 3600000 // 默认1小时
): RevenuePoint[] {
  const points: RevenuePoint[] = []
  let currentTime = startTime

  while (currentTime <= endTime) {
    // 模拟发电量（根据时间段）
    const hour = new Date(currentTime).getHours()
    let energy = 0

    // 6:00-18:00 有发电量
    if (hour >= 6 && hour < 18) {
      // 正弦曲线模拟日照变化
      const angle = ((hour - 6) / 12) * Math.PI
      energy = Math.sin(angle) * 100 + Math.random() * 20
    }

    const period = getTariffPeriod(currentTime, config)
    const selfUseRate = 0.7 + Math.random() * 0.2 // 70%-90%
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy
    const revenue = calculateRevenue(energy, currentTime, config, selfUseRate)

    points.push({
      timestamp: currentTime,
      energy: Number(energy.toFixed(2)),
      revenue,
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2)),
      period
    })

    currentTime += interval
  }

  return points
}

/**
 * 计算收益统计数据
 */
export function calculateRevenueStats(
  points: RevenuePoint[],
  period: RevenuePeriod,
  config: TariffConfig
): RevenueStats {
  if (points.length === 0) {
    return {
      period,
      totalEnergy: 0,
      selfUseEnergy: 0,
      gridEnergy: 0,
      totalRevenue: 0,
      selfUseRevenue: 0,
      gridRevenue: 0,
      subsidyRevenue: 0,
      selfUseRate: 0
    }
  }

  const totalEnergy = points.reduce((sum, p) => sum + p.energy, 0)
  const selfUseEnergy = points.reduce((sum, p) => sum + p.selfUseEnergy, 0)
  const gridEnergy = points.reduce((sum, p) => sum + p.gridEnergy, 0)

  // 计算各项收益
  let selfUseRevenue = 0
  let gridRevenue = 0
  let subsidyRevenue = 0

  points.forEach(p => {
    const tariff = calculateTariff(p.timestamp, config)
    selfUseRevenue += p.selfUseEnergy * tariff
    gridRevenue += p.gridEnergy * (config.gridPrice || 0.35)
    subsidyRevenue += p.energy * (config.subsidyPrice || 0)
  })

  const totalRevenue = selfUseRevenue + gridRevenue + subsidyRevenue
  const selfUseRate = totalEnergy > 0 ? (selfUseEnergy / totalEnergy) * 100 : 0

  return {
    period,
    totalEnergy: Number(totalEnergy.toFixed(2)),
    selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
    gridEnergy: Number(gridEnergy.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    selfUseRevenue: Number(selfUseRevenue.toFixed(2)),
    gridRevenue: Number(gridRevenue.toFixed(2)),
    subsidyRevenue: Number(subsidyRevenue.toFixed(2)),
    selfUseRate: Number(selfUseRate.toFixed(2))
  }
}

/**
 * 判断收益趋势
 */
export function getRevenueTrend(current: number, previous: number): RevenueTrend {
  const change = ((current - previous) / previous) * 100

  if (change > 5) return 'up'
  if (change < -5) return 'down'
  return 'stable'
}

/**
 * 获取收益概览
 */
export function getRevenueOverview(
  todayPoints: RevenuePoint[],
  yesterdayPoints: RevenuePoint[],
  config: TariffConfig
): RevenueOverview {
  const todayStats = calculateRevenueStats(todayPoints, 'day', config)
  const yesterdayStats = calculateRevenueStats(yesterdayPoints, 'day', config)

  const changeRate = yesterdayStats.totalRevenue > 0
    ? ((todayStats.totalRevenue - yesterdayStats.totalRevenue) / yesterdayStats.totalRevenue) * 100
    : 0

  const trend = getRevenueTrend(todayStats.totalRevenue, yesterdayStats.totalRevenue)

  return {
    todayRevenue: todayStats.totalRevenue,
    todayEnergy: todayStats.totalEnergy,
    selfUseRate: todayStats.selfUseRate,
    trend,
    changeRate: Number(changeRate.toFixed(2))
  }
}

/**
 * 格式化收益金额
 */
export function formatRevenue(revenue: number): string {
  return `¥${revenue.toFixed(2)}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
