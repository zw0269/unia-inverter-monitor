/**
 * 设备类型定义
 */

// 设备状态枚举
export enum DeviceStatus {
  OFFLINE = 'offline',      // 离线
  STANDBY = 'standby',      // 待机
  RUNNING = 'running',      // 运行中
  FAULT = 'fault',          // 故障
  MAINTENANCE = 'maintenance' // 维护
}

// 设备类型
export enum DeviceType {
  INVERTER = 'inverter',    // 逆变器
  DATA_STICK = 'dataStick'  // 数据棒
}

// 设备基本信息
export interface DeviceInfo {
  id: string
  name: string
  type: DeviceType
  model: string
  serialNumber: string
  firmwareVersion: string
  status: DeviceStatus
  lastUpdateTime: number
}

// 实时数据
export interface RealtimeData {
  timestamp: number

  // 直流侧数据
  dcVoltage: number          // 直流电压 (V)
  dcCurrent: number          // 直流电流 (A)
  dcPower: number            // 直流功率 (kW)

  // 交流侧数据
  acVoltageA: number         // A相电压 (V)
  acVoltageB: number         // B相电压 (V)
  acVoltageC: number         // C相电压 (V)
  acCurrentA: number         // A相电流 (A)
  acCurrentB: number         // B相电流 (A)
  acCurrentC: number         // C相电流 (A)
  acPower: number            // 交流功率 (kW)
  acFrequency: number        // 电网频率 (Hz)

  // 效率与温度
  efficiency: number         // 转换效率 (%)
  temperature: number        // 设备温度 (℃)

  // 发电量
  todayEnergy: number        // 今日发电量 (kWh)
  totalEnergy: number        // 累计发电量 (kWh)

  // 状态
  status: DeviceStatus
}

// 历史数据点
export interface HistoryDataPoint {
  timestamp: number
  power: number              // 功率 (kW)
  energy: number             // 发电量 (kWh)
}

// 报警信息
export interface AlarmInfo {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'critical'
  code: string
  message: string
  resolved: boolean
  resolvedTime?: number
}

// 统计数据
export interface StatisticsData {
  period: 'day' | 'week' | 'month' | 'year'
  startTime: number
  endTime: number

  // 发电量统计
  totalEnergy: number        // 总发电量 (kWh)
  avgPower: number           // 平均功率 (kW)
  maxPower: number           // 最大功率 (kW)

  // 效率统计
  avgEfficiency: number      // 平均效率 (%)

  // 运行时间
  runningHours: number       // 运行时长 (小时)

  // 曲线数据
  powerCurve: HistoryDataPoint[]
  energyCurve: HistoryDataPoint[]
}
