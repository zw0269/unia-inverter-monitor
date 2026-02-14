/**
 * 收益管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TariffConfig,
  RevenueStats,
  RevenuePoint,
  RevenuePeriod,
  RevenueOverview,
  RevenueHistory
} from '@/types/revenue'
import {
  DEFAULT_TARIFF_CONFIG,
  calculateRevenue,
  calculateRevenueStats,
  getRevenueOverview,
  generateRevenueHistory,
  calculateSelfUseRate as calcSelfUseRate
} from '@/utils/revenue'
import { calculateEnergyBalance } from '@/utils/tariff'
import dayjs from 'dayjs'

const STORAGE_KEY_TARIFF = 'tariff_config'
const STORAGE_KEY_REVENUE_HISTORY = 'revenue_history'

export const useRevenueStore = defineStore('revenue', () => {
  // 电价配置
  const tariffConfig = ref<TariffConfig>({ ...DEFAULT_TARIFF_CONFIG })

  // 历史收益数据
  const revenueHistory = ref<RevenueHistory[]>([])

  // 当前统计周期
  const currentPeriod = ref<RevenuePeriod>('day')

  // 实时收益概览
  const revenueOverview = ref<RevenueOverview>({
    todayRevenue: 0,
    todayEnergy: 0,
    selfUseRate: 70,
    trend: 'stable',
    changeRate: 0
  })

  /**
   * 初始化 - 从本地存储加载数据
   */
  function init() {
    loadTariffConfig()
    loadRevenueHistory()
    updateRevenueOverview()
  }

  /**
   * 加载电价配置
   */
  function loadTariffConfig() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY_TARIFF)
      if (stored) {
        tariffConfig.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载电价配置失败:', error)
      tariffConfig.value = { ...DEFAULT_TARIFF_CONFIG }
    }
  }

  /**
   * 保存电价配置
   */
  function saveTariffConfig(config: TariffConfig) {
    tariffConfig.value = config
    try {
      uni.setStorageSync(STORAGE_KEY_TARIFF, JSON.stringify(config))
    } catch (error) {
      console.error('保存电价配置失败:', error)
    }
  }

  /**
   * 重置电价配置
   */
  function resetTariffConfig() {
    saveTariffConfig({ ...DEFAULT_TARIFF_CONFIG })
  }

  /**
   * 加载历史收益数据
   */
  function loadRevenueHistory() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY_REVENUE_HISTORY)
      if (stored) {
        revenueHistory.value = JSON.parse(stored)
      } else {
        // 生成模拟数据
        generateMockHistory()
      }
    } catch (error) {
      console.error('加载历史收益失败:', error)
      generateMockHistory()
    }
  }

  /**
   * 保存历史收益数据
   */
  function saveRevenueHistory() {
    try {
      uni.setStorageSync(STORAGE_KEY_REVENUE_HISTORY, JSON.stringify(revenueHistory.value))
    } catch (error) {
      console.error('保存历史收益失败:', error)
    }
  }

  /**
   * 生成模拟历史数据
   */
  function generateMockHistory() {
    const history: RevenueHistory[] = []
    const today = dayjs()

    // 生成最近30天的数据
    for (let i = 29; i >= 0; i--) {
      const date = today.subtract(i, 'day')
      const startTime = date.startOf('day').valueOf()
      const endTime = date.endOf('day').valueOf()

      // 生成当天的收益数据点
      const points = generateRevenueHistory(startTime, endTime, tariffConfig.value, 3600000)
      const stats = calculateRevenueStats(points, 'day', tariffConfig.value)

      history.push({
        date: date.format('YYYY-MM-DD'),
        energy: stats.totalEnergy,
        revenue: stats.totalRevenue,
        selfUseEnergy: stats.selfUseEnergy,
        gridEnergy: stats.gridEnergy
      })
    }

    revenueHistory.value = history
    saveRevenueHistory()
  }

  /**
   * 添加今日收益数据
   */
  function addTodayRevenue(energy: number, selfUseEnergy: number, gridEnergy: number) {
    const today = dayjs().format('YYYY-MM-DD')
    const existingIndex = revenueHistory.value.findIndex(h => h.date === today)

    const revenue = calculateRevenue(
      energy,
      Date.now(),
      tariffConfig.value,
      selfUseEnergy / energy
    )

    const historyItem: RevenueHistory = {
      date: today,
      energy,
      revenue,
      selfUseEnergy,
      gridEnergy
    }

    if (existingIndex >= 0) {
      revenueHistory.value[existingIndex] = historyItem
    } else {
      revenueHistory.value.push(historyItem)
    }

    saveRevenueHistory()
    updateRevenueOverview()
  }

  /**
   * 更新收益概览
   */
  function updateRevenueOverview() {
    const today = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

    const todayData = revenueHistory.value.find(h => h.date === today)
    const yesterdayData = revenueHistory.value.find(h => h.date === yesterday)

    if (todayData) {
      const todayStartTime = dayjs().startOf('day').valueOf()
      const todayEndTime = dayjs().endOf('day').valueOf()
      const todayPoints = generateRevenueHistory(
        todayStartTime,
        todayEndTime,
        tariffConfig.value
      )

      const yesterdayStartTime = dayjs().subtract(1, 'day').startOf('day').valueOf()
      const yesterdayEndTime = dayjs().subtract(1, 'day').endOf('day').valueOf()
      const yesterdayPoints = generateRevenueHistory(
        yesterdayStartTime,
        yesterdayEndTime,
        tariffConfig.value
      )

      revenueOverview.value = getRevenueOverview(todayPoints, yesterdayPoints, tariffConfig.value)
    } else {
      // 如果没有今日数据，使用默认值
      revenueOverview.value = {
        todayRevenue: 0,
        todayEnergy: 0,
        selfUseRate: 70,
        trend: 'stable',
        changeRate: 0
      }
    }
  }

  /**
   * 获取指定周期的收益统计（整合电表数据）
   */
  function getRevenueStats(period: RevenuePeriod, consumptionData?: number): RevenueStats {
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
      default:
        startDate = dayjs().startOf('day')
    }

    // 过滤指定周期内的数据
    const periodHistory = revenueHistory.value.filter(h => {
      const date = dayjs(h.date)
      return date.isAfter(startDate) || date.isSame(startDate)
    })

    // 计算统计数据
    const totalEnergy = periodHistory.reduce((sum, h) => sum + h.energy, 0)
    let selfUseEnergy = periodHistory.reduce((sum, h) => sum + h.selfUseEnergy, 0)
    let gridEnergy = periodHistory.reduce((sum, h) => sum + h.gridEnergy, 0)

    // 如果提供了用电数据，重新计算能量平衡
    if (consumptionData !== undefined && consumptionData > 0) {
      const balance = calculateEnergyBalance(totalEnergy, consumptionData)
      selfUseEnergy = balance.selfUse
      gridEnergy = balance.gridFeed
    }

    // 计算各项收益
    const selfUseRate = totalEnergy > 0 ? (selfUseEnergy / totalEnergy) * 100 : 0

    // 自用收益 = 自用电量 × 平均电价（使用实际电价）
    const avgTariff = (tariffConfig.value.peakPrice + tariffConfig.value.valleyPrice + tariffConfig.value.flatPrice) / 3
    const selfUseRevenue = selfUseEnergy * avgTariff

    // 上网收益 = 上网电量 × 上网电价
    const gridRevenue = gridEnergy * (tariffConfig.value.gridPrice || 0.35)

    // 补贴收益 = 总发电量 × 补贴电价
    const subsidyRevenue = totalEnergy * (tariffConfig.value.subsidyPrice || 0)

    const totalRevenue = selfUseRevenue + gridRevenue + subsidyRevenue

    return {
      period,
      totalEnergy: Number(totalEnergy.toFixed(2)),
      selfUseEnergy: Number(selfUseEnergy.toFixed(2)),
      gridEnergy: Number(gridEnergy.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      selfUseRevenue: Number(selfUseRevenue.toFixed(2)),
      gridRevenue: Number(gridRevenue.toFixed(2)),
      subsidyRevenue: Number(subsidyRevenue.toFixed(2)),
      selfUseRate: Number(selfUseRate.toFixed(2))
    }
  }

  /**
   * 获取收益趋势数据（用于图表）
   */
  function getRevenueTrendData(period: RevenuePeriod): RevenuePoint[] {
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
      default:
        startDate = dayjs().startOf('day')
    }

    return generateRevenueHistory(
      startDate.valueOf(),
      endDate.valueOf(),
      tariffConfig.value,
      period === 'day' ? 3600000 : 86400000 // 天：1小时间隔，其他：1天间隔
    )
  }

  /**
   * 获取历史收益列表
   */
  function getRevenueHistoryList(period: RevenuePeriod): RevenueHistory[] {
    let startDate: dayjs.Dayjs

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
      default:
        startDate = dayjs().startOf('day')
    }

    return revenueHistory.value
      .filter(h => {
        const date = dayjs(h.date)
        return date.isAfter(startDate) || date.isSame(startDate)
      })
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }

  // 计算属性
  const todayRevenue = computed(() => revenueOverview.value.todayRevenue)
  const todayEnergy = computed(() => revenueOverview.value.todayEnergy)
  const selfUseRate = computed(() => revenueOverview.value.selfUseRate)
  const revenueTrend = computed(() => revenueOverview.value.trend)

  return {
    // 状态
    tariffConfig,
    revenueHistory,
    currentPeriod,
    revenueOverview,

    // 计算属性
    todayRevenue,
    todayEnergy,
    selfUseRate,
    revenueTrend,

    // 方法
    init,
    saveTariffConfig,
    resetTariffConfig,
    addTodayRevenue,
    updateRevenueOverview,
    getRevenueStats,
    getRevenueTrendData,
    getRevenueHistoryList
  }
})
