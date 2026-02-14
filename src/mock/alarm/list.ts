/**
 * Mock告警数据
 * 提供不同级别的告警示例数据
 */

export interface MockAlarm {
  id: string
  level: 'critical' | 'warning' | 'info'
  title: string
  deviceName: string
  message: string
  timestamp: number
  confirmed: boolean
}

/**
 * Mock告警数据列表
 */
export const mockAlarms: MockAlarm[] = [
  {
    id: '1',
    level: 'warning',
    title: '电池温度偏高',
    deviceName: '电池组 BAT200K0001',
    message: '电池温度达到35°C，建议检查散热系统',
    timestamp: Date.now() - 600000, // 10分钟前
    confirmed: false
  },
  {
    id: '2',
    level: 'info',
    title: '峰谷套利模式启动',
    deviceName: '储能系统',
    message: '系统已自动切换至峰谷套利模式，开始充电',
    timestamp: Date.now() - 1800000, // 30分钟前
    confirmed: false
  },
  {
    id: '3',
    level: 'info',
    title: '今日发电量突破400kWh',
    deviceName: '光伏系统',
    message: '今日光伏发电量已达400kWh，创本月新高',
    timestamp: Date.now() - 3600000, // 1小时前
    confirmed: true
  },
  {
    id: '4',
    level: 'critical',
    title: '逆变器通讯中断',
    deviceName: '逆变器 INV125K0002',
    message: '逆变器与监控系统通讯中断，请立即检查网络连接',
    timestamp: Date.now() - 7200000, // 2小时前
    confirmed: false
  },
  {
    id: '5',
    level: 'warning',
    title: '电网电压波动',
    deviceName: '电网监测',
    message: '电网电压波动较大，当前电压390V，超出正常范围',
    timestamp: Date.now() - 10800000, // 3小时前
    confirmed: false
  },
  {
    id: '6',
    level: 'info',
    title: '定时充电任务启动',
    deviceName: '储能系统',
    message: '根据设定时间，储能系统开始谷时充电',
    timestamp: Date.now() - 14400000, // 4小时前
    confirmed: true
  },
  {
    id: '7',
    level: 'warning',
    title: 'SOC过低保护',
    deviceName: '电池组 BAT200K0001',
    message: '电池SOC降至15%，已触发过低保护，停止放电',
    timestamp: Date.now() - 18000000, // 5小时前
    confirmed: true
  },
  {
    id: '8',
    level: 'critical',
    title: '直流母线电压异常',
    deviceName: '逆变器 INV125K0001',
    message: '直流母线电压检测到异常波动，设备已自动停机保护',
    timestamp: Date.now() - 21600000, // 6小时前
    confirmed: true
  },
  {
    id: '9',
    level: 'info',
    title: '系统自检完成',
    deviceName: '光储一体机',
    message: '系统日常自检已完成，所有参数正常',
    timestamp: Date.now() - 86400000, // 1天前
    confirmed: true
  },
  {
    id: '10',
    level: 'warning',
    title: '组串电流不平衡',
    deviceName: '光伏阵列',
    message: '组串1和组串2电流差异超过10%，建议检查组件',
    timestamp: Date.now() - 172800000, // 2天前
    confirmed: true
  }
]

/**
 * 根据级别筛选告警
 */
export function getAlarmsByLevel(level: 'critical' | 'warning' | 'info'): MockAlarm[] {
  return mockAlarms.filter(alarm => alarm.level === level)
}

/**
 * 获取未确认的告警
 */
export function getUnconfirmedAlarms(): MockAlarm[] {
  return mockAlarms.filter(alarm => !alarm.confirmed)
}

/**
 * 获取已确认的告警
 */
export function getConfirmedAlarms(): MockAlarm[] {
  return mockAlarms.filter(alarm => alarm.confirmed)
}

/**
 * 统计各级别告警数量
 */
export function getAlarmStats() {
  return {
    critical: mockAlarms.filter(a => a.level === 'critical' && !a.confirmed).length,
    warning: mockAlarms.filter(a => a.level === 'warning' && !a.confirmed).length,
    info: mockAlarms.filter(a => a.level === 'info' && !a.confirmed).length,
    total: mockAlarms.filter(a => !a.confirmed).length
  }
}
