/**
 * 设备过滤和排序工具
 */

import type { BluetoothDevice } from '@/types/bluetooth'

/**
 * 过滤设备（按名称关键词）
 * @param devices 设备列表
 * @param keywords 关键词数组
 * @returns 过滤后的设备列表
 */
export function filterDevicesByName(
  devices: BluetoothDevice[],
  keywords: string[]
): BluetoothDevice[] {
  if (!keywords || keywords.length === 0) {
    return devices
  }

  return devices.filter(device => {
    const name = device.name || device.localName || ''
    return keywords.some(keyword =>
      name.toLowerCase().includes(keyword.toLowerCase())
    )
  })
}

/**
 * 按信号强度排序（从强到弱）
 * @param devices 设备列表
 * @returns 排序后的设备列表
 */
export function sortDevicesByRSSI(devices: BluetoothDevice[]): BluetoothDevice[] {
  return [...devices].sort((a, b) => b.RSSI - a.RSSI)
}

/**
 * 推荐的设备过滤器（光伏逆变器相关关键词）
 * @returns 关键词数组
 */
export function getRecommendedKeywords(): string[] {
  return ['Inverter', 'Solar', 'PV', 'BLE', '125kW', '125K', 'HN', '华能']
}

/**
 * 检查设备是否匹配推荐关键词
 * @param device 设备信息
 * @returns 是否匹配
 */
export function isRecommendedDevice(device: BluetoothDevice): boolean {
  const keywords = getRecommendedKeywords()
  const name = device.name || device.localName || ''
  return keywords.some(keyword =>
    name.toLowerCase().includes(keyword.toLowerCase())
  )
}

/**
 * 获取设备信号强度级别
 * @param rssi 信号强度值
 * @returns 级别描述
 */
export function getSignalLevel(rssi: number): 'strong' | 'medium' | 'weak' {
  if (rssi >= -50) return 'strong'
  if (rssi >= -70) return 'medium'
  return 'weak'
}

/**
 * 获取信号强度百分比（用于显示信号条）
 * @param rssi 信号强度值
 * @returns 百分比 (0-100)
 */
export function getSignalPercentage(rssi: number): number {
  // RSSI 范围通常是 -100 到 0
  // 我们映射到 0% 到 100%
  const minRSSI = -100
  const maxRSSI = -30
  const percentage = ((rssi - minRSSI) / (maxRSSI - minRSSI)) * 100
  return Math.max(0, Math.min(100, percentage))
}
