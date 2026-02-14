/**
 * 设备详情相关类型定义
 */

// 通信状态
export type CommunicationStatus = 'connected' | 'disconnected'

// 运行状态
export type RunningStatus = 'grid-connected' | 'off-grid' | 'standby'

// 设备详情接口
export interface DeviceDetail {
  // 基本信息
  name: string
  model: string
  serialNumber: string
  status: 'online' | 'offline' | 'alarm'
  communicationStatus: CommunicationStatus
  runningStatus: RunningStatus

  // 实时参数
  ratedPower: number        // 额定功率 (kW)
  activePower: number       // 有功功率 (kW)
  reactivePower: number     // 无功功率 (kVar)
  efficiency: number        // 效率 (%)

  // PV侧参数
  pvVoltage: number         // PV电压 (V)
  pvCurrent: number         // PV电流 (A)
  pvPower: number           // PV功率 (kW)
  mpptEfficiency: number    // MPPT效率 (%)

  // 电网侧参数
  acVoltageA: number        // A相电压 (V)
  acVoltageB: number        // B相电压 (V)
  acVoltageC: number        // C相电压 (V)
  acFrequency: number       // 频率 (Hz)
  powerFactor: number       // 功率因数

  // 其他参数
  temperature: number           // 内部温度 (°C)
  heatsinkTemperature: number   // 散热器温度 (°C)
  todayEnergy: number          // 今日发电量 (kWh)
  totalEnergy: number          // 累计发电量 (kWh)
  runningDays: number          // 运行天数
}

// 光伏组串状态
export type PVStringStatus = 'normal' | 'warning' | 'offline'

// 光伏组串接口
export interface PVString {
  id: number
  name: string
  panelCount: number        // 组件数量
  panelPower: number        // 单块功率 (W)
  voltage: number           // 电压 (V)
  current: number           // 电流 (A)
  power: number             // 功率 (kW)
  efficiency: number        // 效率 (%)
  todayEnergy: number       // 今日发电量 (kWh)
  status: PVStringStatus
}
