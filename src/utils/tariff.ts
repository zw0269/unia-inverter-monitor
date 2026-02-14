/**
 * 电价计算工具函数
 */

import type { TariffConfig, TariffPeriod } from '@/types/revenue'
import type { ConsumptionPoint, EnergyBalance } from '@/types/meter'

/**
 * 获取时段类型（峰/谷/平）
 */
export function getPeriodType(timestamp: number, tariffConfig: TariffConfig): TariffPeriod {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const minute = date.getMinutes()
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  // 检查是否在峰时
  for (const range of tariffConfig.peakHours) {
    if (isInTimeRange(timeStr, range)) {
      return 'peak'
    }
  }

  // 检查是否在谷时
  for (const range of tariffConfig.valleyHours) {
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

  // 处理跨天情况（如 22:00-24:00）
  if (end === '24:00') {
    endNum = 2400
  }

  // 处理跨天情况（如 22:00-02:00）
  if (endNum <= startNum && end !== '24:00') {
    endNum += 2400
    if (timeNum < startNum) {
      return timeToNumber(time) + 2400 < endNum
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
 * 获取时段电价
 */
export function getPeriodPrice(timestamp: number, tariffConfig: TariffConfig): number {
  const period = getPeriodType(timestamp, tariffConfig)

  switch (period) {
    case 'peak':
      return tariffConfig.peakPrice
    case 'valley':
      return tariffConfig.valleyPrice
    case 'flat':
      return tariffConfig.flatPrice
    default:
      return tariffConfig.flatPrice
  }
}

/**
 * 计算电费
 */
export function calculateElectricityCost(
  consumption: number,
  timestamp: number,
  tariffConfig: TariffConfig
): number {
  if (consumption <= 0) return 0

  const price = getPeriodPrice(timestamp, tariffConfig)
  return Number((consumption * price).toFixed(2))
}

/**
 * 计算峰谷平分时用电
 */
export function calculatePeriodConsumption(
  data: ConsumptionPoint[],
  tariffConfig: TariffConfig
): {
  peak: number
  valley: number
  flat: number
} {
  const result = {
    peak: 0,
    valley: 0,
    flat: 0
  }

  data.forEach(point => {
    const period = getPeriodType(point.timestamp, tariffConfig)
    result[period] += point.consumption
  })

  return {
    peak: Number(result.peak.toFixed(2)),
    valley: Number(result.valley.toFixed(2)),
    flat: Number(result.flat.toFixed(2))
  }
}

/**
 * 计算自发自用率
 */
export function calculateSelfUseRate(generation: number, consumption: number): number {
  if (generation <= 0) return 0
  if (consumption <= 0) return 0

  const selfUse = Math.min(generation, consumption)
  return Number(((selfUse / generation) * 100).toFixed(2))
}

/**
 * 计算能量平衡
 */
export function calculateEnergyBalance(
  generation: number,
  consumption: number,
  timestamp: number = Date.now()
): EnergyBalance {
  // 自用量 = min(发电量, 用电量)
  const selfUse = Math.min(generation, consumption)

  // 上网量 = max(0, 发电量 - 用电量)
  const gridFeed = Math.max(0, generation - consumption)

  // 取电量 = max(0, 用电量 - 发电量)
  const gridDraw = Math.max(0, consumption - generation)

  // 自发自用率
  const selfUseRate = calculateSelfUseRate(generation, consumption)

  return {
    timestamp,
    generation: Number(generation.toFixed(2)),
    consumption: Number(consumption.toFixed(2)),
    selfUse: Number(selfUse.toFixed(2)),
    gridFeed: Number(gridFeed.toFixed(2)),
    gridDraw: Number(gridDraw.toFixed(2)),
    selfUseRate
  }
}

/**
 * 计算峰谷平电费
 */
export function calculatePeriodCost(
  peakConsumption: number,
  valleyConsumption: number,
  flatConsumption: number,
  tariffConfig: TariffConfig
): {
  peakCost: number
  valleyCost: number
  flatCost: number
  totalCost: number
} {
  const peakCost = Number((peakConsumption * tariffConfig.peakPrice).toFixed(2))
  const valleyCost = Number((valleyConsumption * tariffConfig.valleyPrice).toFixed(2))
  const flatCost = Number((flatConsumption * tariffConfig.flatPrice).toFixed(2))
  const totalCost = Number((peakCost + valleyCost + flatCost).toFixed(2))

  return {
    peakCost,
    valleyCost,
    flatCost,
    totalCost
  }
}

/**
 * 计算自用节省的电费
 */
export function calculateSelfUseSaving(
  selfUseEnergy: number,
  timestamp: number,
  tariffConfig: TariffConfig
): number {
  if (selfUseEnergy <= 0) return 0

  const price = getPeriodPrice(timestamp, tariffConfig)
  return Number((selfUseEnergy * price).toFixed(2))
}

/**
 * 计算平均电价
 */
export function calculateAvgPrice(totalCost: number, totalConsumption: number): number {
  if (totalConsumption <= 0) return 0
  return Number((totalCost / totalConsumption).toFixed(3))
}
