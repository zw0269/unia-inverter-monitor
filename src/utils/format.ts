/**
 * 数据格式化工具函数
 */

/**
 * 格式化数字，保留指定小数位
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * 格式化功率 (kW)
 */
export function formatPower(power: number): string {
  if (power >= 1000) {
    return `${formatNumber(power / 1000, 2)} MW`
  }
  return `${formatNumber(power, 2)} kW`
}

/**
 * 格式化电量 (kWh)
 */
export function formatEnergy(energy: number): string {
  if (energy >= 1000) {
    return `${formatNumber(energy / 1000, 2)} MWh`
  }
  return `${formatNumber(energy, 2)} kWh`
}

/**
 * 格式化电压 (V)
 */
export function formatVoltage(voltage: number): string {
  return `${formatNumber(voltage, 1)} V`
}

/**
 * 格式化电流 (A)
 */
export function formatCurrent(current: number): string {
  return `${formatNumber(current, 2)} A`
}

/**
 * 格式化温度 (℃)
 */
export function formatTemperature(temp: number): string {
  return `${formatNumber(temp, 1)} ℃`
}

/**
 * 格式化频率 (Hz)
 */
export function formatFrequency(freq: number): string {
  return `${formatNumber(freq, 2)} Hz`
}

/**
 * 格式化效率 (%)
 */
export function formatEfficiency(efficiency: number): string {
  return `${formatNumber(efficiency, 2)} %`
}

/**
 * 格式化时间戳为日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化时间戳为时间
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化时间戳为日期
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

/**
 * 格式化设备状态
 */
export function formatDeviceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    offline: '离线',
    standby: '待机',
    running: '运行中',
    fault: '故障',
    maintenance: '维护中'
  }
  return statusMap[status] || status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    offline: '#909399',
    standby: '#E6A23C',
    running: '#67C23A',
    fault: '#F56C6C',
    maintenance: '#409EFF'
  }
  return colorMap[status] || '#909399'
}
