/**
 * 收益历史数据 Mock
 */

import type { RevenueHistory, TariffConfig } from '@/types/revenue'
import { calculateRevenue, DEFAULT_TARIFF_CONFIG } from '@/utils/revenue'
import dayjs from 'dayjs'

/**
 * 生成模拟收益历史数据
 * @param days 天数
 * @param config 电价配置
 */
export function generateRevenueHistoryMock(
  days: number = 30,
  config: TariffConfig = DEFAULT_TARIFF_CONFIG
): RevenueHistory[] {
  const history: RevenueHistory[] = []
  const today = dayjs()

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')

    // 模拟日发电量（800-1200 kWh）
    // 考虑季节因素：夏季多，冬季少
    const month = date.month() + 1
    let basePower = 1000
    if (month >= 6 && month <= 8) {
      // 夏季发电量高
      basePower = 1100
    } else if (month >= 12 || month <= 2) {
      // 冬季发电量低
      basePower = 800
    }

    // 添加随机波动
    const energy = basePower + (Math.random() - 0.5) * 200

    // 自用率 70%-90%
    const selfUseRate = 0.7 + Math.random() * 0.2
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy

    // 计算收益
    const timestamp = date.startOf('day').valueOf()
    const revenue = calculateRevenue(energy, timestamp, config, selfUseRate)

    history.push({
      date: dateStr,
      energy: Number(energy.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2))
    })
  }

  return history
}

/**
 * 生成模拟日内收益数据（按小时）
 * @param date 日期
 * @param config 电价配置
 */
export function generateDailyRevenueDetailMock(
  date: dayjs.Dayjs = dayjs(),
  config: TariffConfig = DEFAULT_TARIFF_CONFIG
): RevenueHistory[] {
  const details: RevenueHistory[] = []

  // 每小时数据
  for (let hour = 0; hour < 24; hour++) {
    const hourDate = date.hour(hour).minute(0).second(0)
    const dateStr = hourDate.format('YYYY-MM-DD HH:mm')

    let energy = 0

    // 6:00-18:00 有发电
    if (hour >= 6 && hour < 18) {
      // 使用正弦曲线模拟日照变化
      const angle = ((hour - 6) / 12) * Math.PI
      energy = Math.sin(angle) * 100 + Math.random() * 20
    }

    const selfUseRate = 0.7 + Math.random() * 0.2
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy

    const timestamp = hourDate.valueOf()
    const revenue = calculateRevenue(energy, timestamp, config, selfUseRate)

    details.push({
      date: dateStr,
      energy: Number(energy.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2))
    })
  }

  return details
}

/**
 * 生成模拟周收益数据（按天）
 * @param config 电价配置
 */
export function generateWeeklyRevenueDetailMock(
  config: TariffConfig = DEFAULT_TARIFF_CONFIG
): RevenueHistory[] {
  const today = dayjs()
  const weekStart = today.startOf('week')

  return Array.from({ length: 7 }, (_, i) => {
    const date = weekStart.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')

    const energy = 900 + Math.random() * 300
    const selfUseRate = 0.7 + Math.random() * 0.2
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy

    const timestamp = date.valueOf()
    const revenue = calculateRevenue(energy, timestamp, config, selfUseRate)

    return {
      date: dateStr,
      energy: Number(energy.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2))
    }
  })
}

/**
 * 生成模拟月收益数据（按天）
 * @param config 电价配置
 */
export function generateMonthlyRevenueDetailMock(
  config: TariffConfig = DEFAULT_TARIFF_CONFIG
): RevenueHistory[] {
  const today = dayjs()
  const monthStart = today.startOf('month')
  const daysInMonth = today.daysInMonth()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = monthStart.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')

    const energy = 900 + Math.random() * 300
    const selfUseRate = 0.7 + Math.random() * 0.2
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy

    const timestamp = date.valueOf()
    const revenue = calculateRevenue(energy, timestamp, config, selfUseRate)

    return {
      date: dateStr,
      energy: Number(energy.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2))
    }
  })
}

/**
 * 生成模拟年收益数据（按月）
 * @param config 电价配置
 */
export function generateYearlyRevenueDetailMock(
  config: TariffConfig = DEFAULT_TARIFF_CONFIG
): RevenueHistory[] {
  const today = dayjs()
  const yearStart = today.startOf('year')

  return Array.from({ length: 12 }, (_, i) => {
    const date = yearStart.add(i, 'month')
    const dateStr = date.format('YYYY-MM')

    // 季节影响：夏季多，冬季少
    let baseEnergy = 30000 // 月均 30000 kWh
    if (i >= 5 && i <= 7) {
      // 夏季
      baseEnergy = 35000
    } else if (i === 11 || i === 0 || i === 1) {
      // 冬季
      baseEnergy = 25000
    }

    const energy = baseEnergy + (Math.random() - 0.5) * 5000
    const selfUseRate = 0.7 + Math.random() * 0.2
    const selfUseEnergy = energy * selfUseRate
    const gridEnergy = energy - selfUseEnergy

    const timestamp = date.valueOf()
    const revenue = calculateRevenue(energy, timestamp, config, selfUseRate)

    return {
      date: dateStr,
      energy: Number(energy.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2))
    }
  })
}
