/**
 * Mock实时数据生成器
 * 模拟真实的光伏逆变器数据，包括光照曲线
 */

import type { RealtimeData } from '@/types/device'
import { DeviceStatus } from '@/types/device'

/**
 * 根据时间计算光照强度 (0-1)
 * 模拟一天中的光照变化曲线
 */
function calculateSolarIntensity(hour: number, minute: number): number {
  const timeInHours = hour + minute / 60

  // 早上6点开始发电，晚上18点结束
  if (timeInHours < 6 || timeInHours > 18) {
    return 0
  }

  // 正午12点光照最强
  const peakTime = 12
  const morningStart = 6
  const eveningEnd = 18

  if (timeInHours < peakTime) {
    // 上午：从0逐渐增加到1
    const progress = (timeInHours - morningStart) / (peakTime - morningStart)
    // 使用二次函数模拟更真实的上升曲线
    return Math.pow(progress, 0.8)
  } else {
    // 下午：从1逐渐减少到0
    const progress = (eveningEnd - timeInHours) / (eveningEnd - peakTime)
    // 使用二次函数模拟更真实的下降曲线
    return Math.pow(progress, 0.8)
  }
}

/**
 * 添加随机波动
 * 模拟云层遮挡等自然因素
 */
function addRandomFluctuation(value: number, fluctuationRate: number = 0.05): number {
  const fluctuation = (Math.random() - 0.5) * 2 * fluctuationRate
  return value * (1 + fluctuation)
}

/**
 * 生成Mock实时数据
 */
export function generateRealtimeData(): RealtimeData {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()

  // 计算光照强度 (0-1)
  const solarIntensity = calculateSolarIntensity(hour, minute)

  // 设备额定功率 125kW
  const ratedPower = 125

  // 直流侧数据（根据光照强度计算）
  const dcVoltage = addRandomFluctuation(800 + solarIntensity * 200, 0.02) // 800-1000V
  const dcPower = addRandomFluctuation(ratedPower * solarIntensity, 0.03)  // 0-125kW
  const dcCurrent = dcPower > 0 ? (dcPower * 1000) / dcVoltage : 0

  // 交流侧数据
  const efficiency = solarIntensity > 0.1 ? addRandomFluctuation(96.5, 0.01) : 0 // 效率96.5%左右
  const acPower = dcPower * (efficiency / 100)

  // 三相电压 (380V线电压)
  const acVoltageA = addRandomFluctuation(380, 0.01)
  const acVoltageB = addRandomFluctuation(380, 0.01)
  const acVoltageC = addRandomFluctuation(380, 0.01)

  // 三相电流（假设三相平衡）
  const totalCurrent = acPower > 0 ? (acPower * 1000) / (Math.sqrt(3) * 380) : 0
  const acCurrentA = addRandomFluctuation(totalCurrent, 0.02)
  const acCurrentB = addRandomFluctuation(totalCurrent, 0.02)
  const acCurrentC = addRandomFluctuation(totalCurrent, 0.02)

  // 电网频率
  const acFrequency = addRandomFluctuation(50, 0.001) // 50Hz

  // 温度（根据功率计算，运行时温度更高）
  const ambientTemp = 25 // 环境温度
  const tempRise = (dcPower / ratedPower) * 35 // 满载时温升35度
  const temperature = addRandomFluctuation(ambientTemp + tempRise, 0.05)

  // 今日发电量（累加计算，这里简化为根据时间估算）
  const todayEnergy = calculateTodayEnergy(hour, minute)

  // 累计发电量（模拟运行了一段时间）
  const totalEnergy = 125000 + todayEnergy // 假设已经发了125MWh

  // 设备状态
  let status = DeviceStatus.OFFLINE
  if (solarIntensity > 0.05) {
    status = DeviceStatus.RUNNING
  } else if (hour >= 6 && hour < 18) {
    status = DeviceStatus.STANDBY
  }

  return {
    timestamp: Date.now(),

    // 直流侧
    dcVoltage: Number(dcVoltage.toFixed(1)),
    dcCurrent: Number(dcCurrent.toFixed(2)),
    dcPower: Number(dcPower.toFixed(2)),

    // 交流侧
    acVoltageA: Number(acVoltageA.toFixed(1)),
    acVoltageB: Number(acVoltageB.toFixed(1)),
    acVoltageC: Number(acVoltageC.toFixed(1)),
    acCurrentA: Number(acCurrentA.toFixed(2)),
    acCurrentB: Number(acCurrentB.toFixed(2)),
    acCurrentC: Number(acCurrentC.toFixed(2)),
    acPower: Number(acPower.toFixed(2)),
    acFrequency: Number(acFrequency.toFixed(2)),

    // 效率与温度
    efficiency: Number(efficiency.toFixed(2)),
    temperature: Number(temperature.toFixed(1)),

    // 发电量
    todayEnergy: Number(todayEnergy.toFixed(2)),
    totalEnergy: Number(totalEnergy.toFixed(2)),

    // 状态
    status
  }
}

/**
 * 计算今日发电量
 * 根据当前时间估算（简化计算）
 */
function calculateTodayEnergy(hour: number, minute: number): number {
  let totalEnergy = 0

  // 从6点开始计算
  for (let h = 6; h < hour; h++) {
    for (let m = 0; m < 60; m += 5) { // 每5分钟一个采样点
      const intensity = calculateSolarIntensity(h, m / 60)
      const power = 125 * intensity // kW
      const energy = (power * 5) / 60 // kWh (5分钟的发电量)
      totalEnergy += energy
    }
  }

  // 加上当前小时的部分
  for (let m = 0; m < minute; m += 5) {
    const intensity = calculateSolarIntensity(hour, m / 60)
    const power = 125 * intensity
    const energy = (power * 5) / 60
    totalEnergy += energy
  }

  return totalEnergy
}

/**
 * 生成历史数据点（用于图表）
 * @param hours 要生成的小时数
 * @param interval 采样间隔（分钟）
 */
export function generateHistoryData(hours: number = 24, interval: number = 30) {
  const data = []
  const now = new Date()
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000)

  for (let i = 0; i < (hours * 60) / interval; i++) {
    const time = new Date(startTime.getTime() + i * interval * 60 * 1000)
    const intensity = calculateSolarIntensity(time.getHours(), time.getMinutes())
    const power = addRandomFluctuation(125 * intensity, 0.03)

    data.push({
      timestamp: time.getTime(),
      power: Number(power.toFixed(2)),
      energy: Number((power * interval / 60).toFixed(2))
    })
  }

  return data
}
