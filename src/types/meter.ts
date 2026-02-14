/**
 * 电表相关类型定义
 */

/**
 * 电表实时数据
 */
export interface MeterRealtimeData {
  /** 时间戳 */
  timestamp: number
  /** 电压 (V) */
  voltage: number
  /** 电流 (A) */
  current: number
  /** 功率 (kW) */
  power: number
  /** 功率因数 */
  powerFactor: number
  /** 频率 (Hz) */
  frequency: number
  /** 今日用电 (kWh) */
  todayConsumption: number
  /** 累计用电 (kWh) */
  totalConsumption: number
}

/**
 * 用电统计
 */
export interface ElectricityStats {
  /** 统计周期 */
  period: 'day' | 'week' | 'month' | 'year'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 峰时用电 (kWh) */
  peakConsumption: number
  /** 谷时用电 (kWh) */
  valleyConsumption: number
  /** 平时用电 (kWh) */
  flatConsumption: number
  /** 总用电 (kWh) */
  totalConsumption: number
  /** 峰时电费 (元) */
  peakCost: number
  /** 谷时电费 (元) */
  valleyCost: number
  /** 平时电费 (元) */
  flatCost: number
  /** 总电费 (元) */
  totalCost: number
}

/**
 * 能量平衡
 */
export interface EnergyBalance {
  /** 时间戳 */
  timestamp: number
  /** 发电量 (kWh) */
  generation: number
  /** 用电量 (kWh) */
  consumption: number
  /** 自用量 (kWh) */
  selfUse: number
  /** 上网量 (kWh) */
  gridFeed: number
  /** 取电量 (kWh) */
  gridDraw: number
  /** 自发自用率 (%) */
  selfUseRate: number
}

/**
 * 用电历史点
 */
export interface ConsumptionPoint {
  /** 时间戳 */
  timestamp: number
  /** 用电量 (kWh) */
  consumption: number
  /** 电费 (元) */
  cost: number
  /** 时段类型 */
  period: 'peak' | 'valley' | 'flat'
}

/**
 * 用电历史数据
 */
export interface ConsumptionHistory {
  /** 日期（格式：YYYY-MM-DD） */
  date: string
  /** 用电量 (kWh) */
  consumption: number
  /** 电费 (元) */
  cost: number
  /** 峰时用电 (kWh) */
  peakConsumption: number
  /** 谷时用电 (kWh) */
  valleyConsumption: number
  /** 平时用电 (kWh) */
  flatConsumption: number
}

/**
 * 电费账单
 */
export interface ElectricityBill {
  /** 账单ID */
  id: string
  /** 账单周期（格式：YYYY-MM） */
  period: string
  /** 开始日期 */
  startDate: string
  /** 结束日期 */
  endDate: string
  /** 总用电量 (kWh) */
  totalConsumption: number
  /** 峰时用电 (kWh) */
  peakConsumption: number
  /** 谷时用电 (kWh) */
  valleyConsumption: number
  /** 平时用电 (kWh) */
  flatConsumption: number
  /** 总电费 (元) */
  totalCost: number
  /** 峰时电费 (元) */
  peakCost: number
  /** 谷时电费 (元) */
  valleyCost: number
  /** 平时电费 (元) */
  flatCost: number
  /** 平均电价 (元/kWh) */
  avgPrice: number
  /** 自用电量 (kWh) */
  selfUseEnergy: number
  /** 自用节省 (元) */
  selfUseSaving: number
  /** 上网收益 (元) */
  gridRevenue: number
  /** 实际应缴费用 (元) */
  actualCost: number
  /** 状态 */
  status: 'pending' | 'paid' | 'overdue'
}
