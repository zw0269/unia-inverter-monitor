/**
 * 电表模拟数据生成
 */

import type { MeterRealtimeData, ConsumptionPoint, EnergyBalance, ConsumptionHistory } from '@/types/meter'
import type { TariffConfig } from '@/types/revenue'
import { getPeriodType, calculateElectricityCost, calculateEnergyBalance, calculatePeriodConsumption } from '@/utils/tariff'
import dayjs from 'dayjs'

/**
 * 生成实时电表数据
 */
export function generateMeterRealtimeData(): MeterRealtimeData {
  const now = Date.now()
  const hour = new Date(now).getHours()

  // 根据时段生成合理的用电功率
  let basePower = 0
  if (hour >= 0 && hour < 6) {
    // 凌晨：低功率（待机负载）
    basePower = 2 + Math.random() * 3 // 2-5 kW
  } else if (hour >= 6 && hour < 9) {
    // 早晨：中等功率
    basePower = 15 + Math.random() * 10 // 15-25 kW
  } else if (hour >= 9 && hour < 17) {
    // 白天：高功率（工作负载）
    basePower = 30 + Math.random() * 20 // 30-50 kW
  } else if (hour >= 17 && hour < 22) {
    // 傍晚：高功率（峰值）
    basePower = 40 + Math.random() * 30 // 40-70 kW
  } else {
    // 夜间：中等功率
    basePower = 10 + Math.random() * 10 // 10-20 kW
  }

  const power = Number(basePower.toFixed(2))
  const voltage = 220 + (Math.random() - 0.5) * 20 // 210-230V
  const current = power * 1000 / voltage // I = P/U
  const powerFactor = 0.95 + Math.random() * 0.05 // 0.95-1.0
  const frequency = 50 + (Math.random() - 0.5) * 0.4 // 49.8-50.2 Hz

  // 计算今日用电量（累计）
  const startOfDay = dayjs().startOf('day').valueOf()
  const elapsedHours = (now - startOfDay) / 3600000
  const avgPowerToday = 25 // 假设今日平均功率 25kW
  const todayConsumption = avgPowerToday * elapsedHours

  // 累计用电量（模拟）
  const totalConsumption = 125000 + todayConsumption

  return {
    timestamp: now,
    voltage: Number(voltage.toFixed(1)),
    current: Number(current.toFixed(2)),
    power,
    powerFactor: Number(powerFactor.toFixed(3)),
    frequency: Number(frequency.toFixed(2)),
    todayConsumption: Number(todayConsumption.toFixed(2)),
    totalConsumption: Number(totalConsumption.toFixed(2))
  }
}

/**
 * 生成历史用电数据点
 */
export function generateConsumptionHistory(
  days: number,
  tariffConfig: TariffConfig
): ConsumptionPoint[] {
  const points: ConsumptionPoint[] = []
  const now = Date.now()

  // 生成每小时的数据点
  for (let d = days - 1; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const timestamp = now - d * 86400000 - (23 - h) * 3600000

      // 根据时段生成用电量
      let consumption = 0
      if (h >= 0 && h < 6) {
        consumption = 2 + Math.random() * 2 // 2-4 kWh
      } else if (h >= 6 && h < 9) {
        consumption = 15 + Math.random() * 5 // 15-20 kWh
      } else if (h >= 9 && h < 17) {
        consumption = 30 + Math.random() * 10 // 30-40 kWh
      } else if (h >= 17 && h < 22) {
        consumption = 40 + Math.random() * 15 // 40-55 kWh
      } else {
        consumption = 10 + Math.random() * 5 // 10-15 kWh
      }

      const period = getPeriodType(timestamp, tariffConfig)
      const cost = calculateElectricityCost(consumption, timestamp, tariffConfig)

      points.push({
        timestamp,
        consumption: Number(consumption.toFixed(2)),
        cost,
        period
      })
    }
  }

  return points
}

/**
 * 生成每日用电历史
 */
export function generateDailyConsumptionHistory(
  days: number,
  tariffConfig: TariffConfig
): ConsumptionHistory[] {
  const history: ConsumptionHistory[] = []
  const today = dayjs()

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day')
    const startTime = date.startOf('day').valueOf()
    const endTime = date.endOf('day').valueOf()

    // 生成当天的小时数据
    const hourlyPoints: ConsumptionPoint[] = []
    for (let h = 0; h < 24; h++) {
      const timestamp = startTime + h * 3600000

      let consumption = 0
      if (h >= 0 && h < 6) {
        consumption = 2 + Math.random() * 2
      } else if (h >= 6 && h < 9) {
        consumption = 15 + Math.random() * 5
      } else if (h >= 9 && h < 17) {
        consumption = 30 + Math.random() * 10
      } else if (h >= 17 && h < 22) {
        consumption = 40 + Math.random() * 15
      } else {
        consumption = 10 + Math.random() * 5
      }

      const period = getPeriodType(timestamp, tariffConfig)
      const cost = calculateElectricityCost(consumption, timestamp, tariffConfig)

      hourlyPoints.push({
        timestamp,
        consumption: Number(consumption.toFixed(2)),
        cost,
        period
      })
    }

    // 计算峰谷平分时用电
    const periodConsumption = calculatePeriodConsumption(hourlyPoints, tariffConfig)

    // 计算总用电和总电费
    const totalConsumption = hourlyPoints.reduce((sum, p) => sum + p.consumption, 0)
    const totalCost = hourlyPoints.reduce((sum, p) => sum + p.cost, 0)

    history.push({
      date: date.format('YYYY-MM-DD'),
      consumption: Number(totalConsumption.toFixed(2)),
      cost: Number(totalCost.toFixed(2)),
      peakConsumption: periodConsumption.peak,
      valleyConsumption: periodConsumption.valley,
      flatConsumption: periodConsumption.flat
    })
  }

  return history
}

/**
 * 生成能量平衡数据
 */
export function generateEnergyBalance(
  generationData: number,
  consumptionData: number
): EnergyBalance {
  return calculateEnergyBalance(generationData, consumptionData)
}

/**
 * 生成模拟能量平衡数据（基于时段）
 */
export function generateMockEnergyBalance(timestamp: number = Date.now()): EnergyBalance {
  const hour = new Date(timestamp).getHours()

  let generation = 0
  let consumption = 0

  // 发电量（6:00-18:00）
  if (hour >= 6 && hour < 18) {
    const angle = ((hour - 6) / 12) * Math.PI
    generation = Math.sin(angle) * 80 + Math.random() * 10 // 0-90 kW
  }

  // 用电量（全天）
  if (hour >= 0 && hour < 6) {
    consumption = 2 + Math.random() * 3
  } else if (hour >= 6 && hour < 9) {
    consumption = 15 + Math.random() * 10
  } else if (hour >= 9 && hour < 17) {
    consumption = 30 + Math.random() * 20
  } else if (hour >= 17 && hour < 22) {
    consumption = 40 + Math.random() * 30
  } else {
    consumption = 10 + Math.random() * 10
  }

  return calculateEnergyBalance(generation, consumption, timestamp)
}

/**
 * 生成历史能量平衡数据
 */
export function generateEnergyBalanceHistory(days: number): EnergyBalance[] {
  const history: EnergyBalance[] = []
  const now = Date.now()

  for (let d = days - 1; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const timestamp = now - d * 86400000 - (23 - h) * 3600000
      const balance = generateMockEnergyBalance(timestamp)
      history.push(balance)
    }
  }

  return history
}
