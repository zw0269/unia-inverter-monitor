/**
 * 电表管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  MeterRealtimeData,
  ConsumptionPoint,
  ElectricityStats,
  EnergyBalance,
  ConsumptionHistory,
  ElectricityBill
} from '@/types/meter'
import type { TariffConfig } from '@/types/revenue'
import {
  generateMeterRealtimeData,
  generateConsumptionHistory,
  generateDailyConsumptionHistory,
  generateMockEnergyBalance
} from '@/mock/meter/realtime'
import {
  getPeriodType,
  calculateElectricityCost,
  calculatePeriodConsumption,
  calculatePeriodCost,
  calculateEnergyBalance,
  calculateAvgPrice
} from '@/utils/tariff'
import { useRevenueStore } from './revenue'
import { useDeviceStore } from './device'
import dayjs from 'dayjs'

const STORAGE_KEY_CONSUMPTION_HISTORY = 'consumption_history'
const STORAGE_KEY_BILLS = 'electricity_bills'

export const useMeterStore = defineStore('meter', () => {
  const revenueStore = useRevenueStore()
  const deviceStore = useDeviceStore()

  // 状态
  const realtimeData = ref<MeterRealtimeData>({
    timestamp: Date.now(),
    voltage: 220,
    current: 0,
    power: 0,
    powerFactor: 1,
    frequency: 50,
    todayConsumption: 0,
    totalConsumption: 0
  })

  const historyData = ref<ConsumptionPoint[]>([])
  const dailyHistory = ref<ConsumptionHistory[]>([])
  const currentStats = ref<ElectricityStats | null>(null)
  const energyBalance = ref<EnergyBalance | null>(null)
  const bills = ref<ElectricityBill[]>([])

  // 计算属性
  const todayConsumption = computed(() => realtimeData.value.todayConsumption)
  const totalConsumption = computed(() => realtimeData.value.totalConsumption)
  const currentPower = computed(() => realtimeData.value.power)
  const voltage = computed(() => realtimeData.value.voltage)
  const current = computed(() => realtimeData.value.current)
  const powerFactor = computed(() => realtimeData.value.powerFactor)
  const frequency = computed(() => realtimeData.value.frequency)

  /**
   * 初始化
   */
  function init() {
    loadConsumptionHistory()
    loadBills()
    updateRealtimeData()
    updateEnergyBalance()
  }

  /**
   * 更新实时数据
   */
  function updateRealtimeData(data?: MeterRealtimeData) {
    if (data) {
      realtimeData.value = data
    } else {
      // 生成模拟数据
      realtimeData.value = generateMeterRealtimeData()
    }
  }

  /**
   * 加载历史用电数据
   */
  function loadHistoryData(period: 'day' | 'week' | 'month' | 'year') {
    const tariffConfig = revenueStore.tariffConfig

    let days = 1
    switch (period) {
      case 'day':
        days = 1
        break
      case 'week':
        days = 7
        break
      case 'month':
        days = 30
        break
      case 'year':
        days = 365
        break
    }

    historyData.value = generateConsumptionHistory(days, tariffConfig)
  }

  /**
   * 加载每日历史数据
   */
  function loadConsumptionHistory() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY_CONSUMPTION_HISTORY)
      if (stored) {
        dailyHistory.value = JSON.parse(stored)
      } else {
        // 生成模拟数据
        generateMockDailyHistory()
      }
    } catch (error) {
      console.error('加载用电历史失败:', error)
      generateMockDailyHistory()
    }
  }

  /**
   * 生成模拟每日历史
   */
  function generateMockDailyHistory() {
    const tariffConfig = revenueStore.tariffConfig
    dailyHistory.value = generateDailyConsumptionHistory(30, tariffConfig)
    saveConsumptionHistory()
  }

  /**
   * 保存用电历史
   */
  function saveConsumptionHistory() {
    try {
      uni.setStorageSync(STORAGE_KEY_CONSUMPTION_HISTORY, JSON.stringify(dailyHistory.value))
    } catch (error) {
      console.error('保存用电历史失败:', error)
    }
  }

  /**
   * 计算统计数据
   */
  function calculateStats(period: 'day' | 'week' | 'month' | 'year'): ElectricityStats {
    const tariffConfig = revenueStore.tariffConfig

    let startDate: dayjs.Dayjs
    const endDate = dayjs()

    switch (period) {
      case 'day':
        startDate = dayjs().startOf('day')
        break
      case 'week':
        startDate = dayjs().startOf('week')
        break
      case 'month':
        startDate = dayjs().startOf('month')
        break
      case 'year':
        startDate = dayjs().startOf('year')
        break
    }

    // 加载历史数据
    loadHistoryData(period)

    // 过滤时间范围内的数据
    const periodData = historyData.value.filter(
      p => p.timestamp >= startDate.valueOf() && p.timestamp <= endDate.valueOf()
    )

    // 计算峰谷平分时用电
    const periodConsumption = calculatePeriodConsumption(periodData, tariffConfig)

    // 计算总用电
    const totalConsumption = periodData.reduce((sum, p) => sum + p.consumption, 0)

    // 计算峰谷平电费
    const costs = calculatePeriodCost(
      periodConsumption.peak,
      periodConsumption.valley,
      periodConsumption.flat,
      tariffConfig
    )

    const stats: ElectricityStats = {
      period,
      startTime: startDate.valueOf(),
      endTime: endDate.valueOf(),
      peakConsumption: periodConsumption.peak,
      valleyConsumption: periodConsumption.valley,
      flatConsumption: periodConsumption.flat,
      totalConsumption: Number(totalConsumption.toFixed(2)),
      peakCost: costs.peakCost,
      valleyCost: costs.valleyCost,
      flatCost: costs.flatCost,
      totalCost: costs.totalCost
    }

    currentStats.value = stats
    return stats
  }

  /**
   * 更新能量平衡
   */
  function updateEnergyBalance() {
    // 获取发电数据
    const generation = deviceStore.realtimeData?.todayEnergy || 0

    // 获取用电数据
    const consumption = realtimeData.value.todayConsumption

    // 计算能量平衡
    energyBalance.value = calculateEnergyBalance(generation, consumption)
  }

  /**
   * 加载账单
   */
  function loadBills() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY_BILLS)
      if (stored) {
        bills.value = JSON.parse(stored)
      } else {
        generateMockBills()
      }
    } catch (error) {
      console.error('加载账单失败:', error)
      generateMockBills()
    }
  }

  /**
   * 生成模拟账单
   */
  function generateMockBills() {
    const tariffConfig = revenueStore.tariffConfig
    const mockBills: ElectricityBill[] = []

    // 生成最近6个月的账单
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month')
      const startDate = month.startOf('month')
      const endDate = month.endOf('month')

      // 过滤当月的用电数据
      const monthData = dailyHistory.value.filter(h => {
        const date = dayjs(h.date)
        return date.isSame(startDate, 'month')
      })

      if (monthData.length === 0) continue

      // 计算月度统计
      const totalConsumption = monthData.reduce((sum, h) => sum + h.consumption, 0)
      const peakConsumption = monthData.reduce((sum, h) => sum + h.peakConsumption, 0)
      const valleyConsumption = monthData.reduce((sum, h) => sum + h.valleyConsumption, 0)
      const flatConsumption = monthData.reduce((sum, h) => sum + h.flatConsumption, 0)
      const totalCost = monthData.reduce((sum, h) => sum + h.cost, 0)

      const costs = calculatePeriodCost(
        peakConsumption,
        valleyConsumption,
        flatConsumption,
        tariffConfig
      )

      // 模拟自用电量和收益
      const selfUseEnergy = totalConsumption * 0.7 // 假设70%自用
      const selfUseSaving = selfUseEnergy * 0.6 // 节省电费
      const gridRevenue = (totalConsumption - selfUseEnergy) * 0.35 // 上网收益

      const bill: ElectricityBill = {
        id: `bill-${month.format('YYYY-MM')}`,
        period: month.format('YYYY-MM'),
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        totalConsumption: Number(totalConsumption.toFixed(2)),
        peakConsumption: Number(peakConsumption.toFixed(2)),
        valleyConsumption: Number(valleyConsumption.toFixed(2)),
        flatConsumption: Number(flatConsumption.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        peakCost: costs.peakCost,
        valleyCost: costs.valleyCost,
        flatCost: costs.flatCost,
        avgPrice: calculateAvgPrice(totalCost, totalConsumption),
        selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
        selfUseSaving: Number(selfUseSaving.toFixed(2)),
        gridRevenue: Number(gridRevenue.toFixed(2)),
        actualCost: Number((totalCost - selfUseSaving - gridRevenue).toFixed(2)),
        status: i === 0 ? 'pending' : 'paid'
      }

      mockBills.push(bill)
    }

    bills.value = mockBills
    saveBills()
  }

  /**
   * 保存账单
   */
  function saveBills() {
    try {
      uni.setStorageSync(STORAGE_KEY_BILLS, JSON.stringify(bills.value))
    } catch (error) {
      console.error('保存账单失败:', error)
    }
  }

  /**
   * 获取指定周期的账单
   */
  function getBills(period: 'month' | 'quarter' | 'half' | 'year'): ElectricityBill[] {
    let months = 1
    switch (period) {
      case 'month':
        months = 1
        break
      case 'quarter':
        months = 3
        break
      case 'half':
        months = 6
        break
      case 'year':
        months = 12
        break
    }

    const startDate = dayjs().subtract(months, 'month')
    return bills.value.filter(b => dayjs(b.period).isAfter(startDate))
  }

  /**
   * 获取今日统计
   */
  const todayStats = computed(() => {
    if (!currentStats.value || currentStats.value.period !== 'day') {
      return calculateStats('day')
    }
    return currentStats.value
  })

  return {
    // 状态
    realtimeData,
    historyData,
    dailyHistory,
    currentStats,
    energyBalance,
    bills,

    // 计算属性
    todayConsumption,
    totalConsumption,
    currentPower,
    voltage,
    current,
    powerFactor,
    frequency,
    todayStats,

    // 方法
    init,
    updateRealtimeData,
    loadHistoryData,
    calculateStats,
    updateEnergyBalance,
    getBills,
    generateMockBills
  }
})
