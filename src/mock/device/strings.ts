import type { PVString } from '@/types/device-detail'

/**
 * 光伏组串 Mock 数据
 */
export const mockPVStrings: PVString[] = [
  {
    id: 1,
    name: '组串 #1',
    panelCount: 20,
    panelPower: 550,
    voltage: 730,
    current: 7.1,
    power: 5.2,
    efficiency: 94,
    todayEnergy: 26.8,
    status: 'normal'
  },
  {
    id: 2,
    name: '组串 #2',
    panelCount: 20,
    panelPower: 550,
    voltage: 732,
    current: 7.2,
    power: 5.3,
    efficiency: 96,
    todayEnergy: 27.2,
    status: 'normal'
  },
  {
    id: 3,
    name: '组串 #3',
    panelCount: 20,
    panelPower: 550,
    voltage: 710,
    current: 5.8,
    power: 4.1,
    efficiency: 74,
    todayEnergy: 21.3,
    status: 'warning'
  },
  {
    id: 4,
    name: '组串 #4',
    panelCount: 20,
    panelPower: 550,
    voltage: 728,
    current: 7.0,
    power: 5.1,
    efficiency: 93,
    todayEnergy: 26.4,
    status: 'normal'
  },
  {
    id: 5,
    name: '组串 #5',
    panelCount: 20,
    panelPower: 550,
    voltage: 731,
    current: 7.15,
    power: 5.23,
    efficiency: 95,
    todayEnergy: 27.0,
    status: 'normal'
  },
  {
    id: 6,
    name: '组串 #6',
    panelCount: 20,
    panelPower: 550,
    voltage: 729,
    current: 7.05,
    power: 5.14,
    efficiency: 93,
    todayEnergy: 26.5,
    status: 'normal'
  },
  {
    id: 7,
    name: '组串 #7',
    panelCount: 20,
    panelPower: 550,
    voltage: 715,
    current: 6.0,
    power: 4.3,
    efficiency: 78,
    todayEnergy: 22.1,
    status: 'warning'
  },
  {
    id: 8,
    name: '组串 #8',
    panelCount: 20,
    panelPower: 550,
    voltage: 733,
    current: 7.25,
    power: 5.32,
    efficiency: 97,
    todayEnergy: 27.5,
    status: 'normal'
  },
  {
    id: 9,
    name: '组串 #9',
    panelCount: 20,
    panelPower: 550,
    voltage: 727,
    current: 6.95,
    power: 5.05,
    efficiency: 92,
    todayEnergy: 26.1,
    status: 'normal'
  },
  {
    id: 10,
    name: '组串 #10',
    panelCount: 20,
    panelPower: 550,
    voltage: 730,
    current: 7.08,
    power: 5.17,
    efficiency: 94,
    todayEnergy: 26.7,
    status: 'normal'
  },
  {
    id: 11,
    name: '组串 #11',
    panelCount: 20,
    panelPower: 550,
    voltage: 732,
    current: 7.18,
    power: 5.26,
    efficiency: 95,
    todayEnergy: 27.1,
    status: 'normal'
  },
  {
    id: 12,
    name: '组串 #12',
    panelCount: 20,
    panelPower: 550,
    voltage: 728,
    current: 7.02,
    power: 5.11,
    efficiency: 93,
    todayEnergy: 26.4,
    status: 'normal'
  },
  {
    id: 13,
    name: '组串 #13',
    panelCount: 20,
    panelPower: 550,
    voltage: 708,
    current: 5.5,
    power: 3.9,
    efficiency: 71,
    todayEnergy: 20.2,
    status: 'warning'
  },
  {
    id: 14,
    name: '组串 #14',
    panelCount: 20,
    panelPower: 550,
    voltage: 731,
    current: 7.12,
    power: 5.20,
    efficiency: 95,
    todayEnergy: 26.9,
    status: 'normal'
  },
  {
    id: 15,
    name: '组串 #15',
    panelCount: 20,
    panelPower: 550,
    voltage: 729,
    current: 7.06,
    power: 5.15,
    efficiency: 94,
    todayEnergy: 26.6,
    status: 'normal'
  },
  {
    id: 16,
    name: '组串 #16',
    panelCount: 20,
    panelPower: 550,
    voltage: 733,
    current: 7.22,
    power: 5.29,
    efficiency: 96,
    todayEnergy: 27.3,
    status: 'normal'
  },
  {
    id: 17,
    name: '组串 #17',
    panelCount: 20,
    panelPower: 550,
    voltage: 730,
    current: 7.10,
    power: 5.18,
    efficiency: 94,
    todayEnergy: 26.7,
    status: 'normal'
  },
  {
    id: 18,
    name: '组串 #18',
    panelCount: 20,
    panelPower: 550,
    voltage: 726,
    current: 6.98,
    power: 5.07,
    efficiency: 92,
    todayEnergy: 26.2,
    status: 'normal'
  },
  {
    id: 19,
    name: '组串 #19',
    panelCount: 20,
    panelPower: 550,
    voltage: 732,
    current: 7.16,
    power: 5.24,
    efficiency: 95,
    todayEnergy: 27.0,
    status: 'normal'
  },
  {
    id: 20,
    name: '组串 #20',
    panelCount: 20,
    panelPower: 550,
    voltage: 729,
    current: 7.04,
    power: 5.13,
    efficiency: 93,
    todayEnergy: 26.5,
    status: 'normal'
  }
]

/**
 * 模拟获取光伏组串列表
 */
export function getPVStrings(): Promise<PVString[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPVStrings)
    }, 300)
  })
}

/**
 * 计算组串统计信息
 */
export function getStringsStats() {
  const onlineCount = mockPVStrings.filter(s => s.status !== 'offline').length
  const totalPower = mockPVStrings.reduce((sum, s) => sum + s.power, 0).toFixed(1)
  const warningCount = mockPVStrings.filter(s => s.status === 'warning').length

  return {
    onlineCount,
    totalPower,
    warningCount,
    totalCount: mockPVStrings.length
  }
}
