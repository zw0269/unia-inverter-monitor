import type { DeviceDetail } from '@/types/device-detail'

/**
 * 设备详情 Mock 数据
 */
export const mockDeviceDetail: DeviceDetail = {
  // 基本信息
  name: '混合逆变器',
  model: 'HYD-125KTL-H1',
  serialNumber: '2024125KW0001',
  status: 'online',
  communicationStatus: 'connected',
  runningStatus: 'grid-connected',

  // 实时参数
  ratedPower: 125.0,
  activePower: 98.7,
  reactivePower: 2.3,
  efficiency: 98.2,

  // PV侧参数
  pvVoltage: 720.5,
  pvCurrent: 146.2,
  pvPower: 105.2,
  mpptEfficiency: 99.7,

  // 电网侧参数
  acVoltageA: 220.3,
  acVoltageB: 219.8,
  acVoltageC: 220.5,
  acFrequency: 50.02,
  powerFactor: 0.998,

  // 其他参数
  temperature: 42,
  heatsinkTemperature: 38,
  todayEnergy: 458.6,
  totalEnergy: 125687,
  runningDays: 365
}

/**
 * 模拟获取设备详情
 */
export function getDeviceDetail(): Promise<DeviceDetail> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDeviceDetail)
    }, 300)
  })
}
