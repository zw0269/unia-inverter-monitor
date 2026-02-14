<template>
  <view class="meter-page">
    <!-- 标题栏 -->
    <view class="page-header">
      <text class="page-title">电表监控</text>
      <view class="header-actions">
        <view class="refresh-btn" @click="handleRefresh">
          <text class="refresh-icon">🔄</text>
        </view>
      </view>
    </view>

    <!-- 实时数据卡片 -->
    <view class="section">
      <meter-card :data="meterStore.realtimeData" />
    </view>

    <!-- 今日用电统计 -->
    <view class="section">
      <view class="stats-card">
        <view class="card-header">
          <text class="card-title">今日用电统计</text>
          <text class="card-date">{{ currentDate }}</text>
        </view>

        <view class="stats-summary">
          <view class="summary-item">
            <text class="summary-label">今日用电</text>
            <text class="summary-value">{{ todayStats.totalConsumption.toFixed(2) }} kWh</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">今日电费</text>
            <text class="summary-value primary">¥{{ todayStats.totalCost.toFixed(2) }}</text>
          </view>
        </view>

        <!-- 峰谷平用电进度条 -->
        <view class="period-bars">
          <view class="period-item">
            <view class="period-header">
              <text class="period-label">峰时</text>
              <text class="period-value">{{ todayStats.peakConsumption.toFixed(2) }} kWh</text>
            </view>
            <view class="period-bar">
              <view
                class="period-fill peak"
                :style="{ width: `${(todayStats.peakConsumption / todayStats.totalConsumption) * 100}%` }"
              ></view>
            </view>
            <text class="period-cost">¥{{ todayStats.peakCost.toFixed(2) }}</text>
          </view>

          <view class="period-item">
            <view class="period-header">
              <text class="period-label">谷时</text>
              <text class="period-value">{{ todayStats.valleyConsumption.toFixed(2) }} kWh</text>
            </view>
            <view class="period-bar">
              <view
                class="period-fill valley"
                :style="{ width: `${(todayStats.valleyConsumption / todayStats.totalConsumption) * 100}%` }"
              ></view>
            </view>
            <text class="period-cost">¥{{ todayStats.valleyCost.toFixed(2) }}</text>
          </view>

          <view class="period-item">
            <view class="period-header">
              <text class="period-label">平时</text>
              <text class="period-value">{{ todayStats.flatConsumption.toFixed(2) }} kWh</text>
            </view>
            <view class="period-bar">
              <view
                class="period-fill flat"
                :style="{ width: `${(todayStats.flatConsumption / todayStats.totalConsumption) * 100}%` }"
              ></view>
            </view>
            <text class="period-cost">¥{{ todayStats.flatCost.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 能量平衡 -->
    <view class="section" v-if="meterStore.energyBalance">
      <energy-balance :balance="meterStore.energyBalance" />
    </view>

    <!-- 用电趋势图表 -->
    <view class="section">
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">用电趋势</text>
          <view class="period-tabs">
            <text
              v-for="p in periods"
              :key="p.value"
              class="period-tab"
              :class="{ active: selectedPeriod === p.value }"
              @click="handlePeriodChange(p.value)"
            >
              {{ p.label }}
            </text>
          </view>
        </view>

        <view class="chart-container">
          <l-echart ref="chartRef" :option="chartOption" height="300rpx" />
        </view>
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="section">
      <view class="quick-actions">
        <view class="action-btn" @click="goToAnalysis">
          <text class="action-icon">📊</text>
          <text class="action-text">用电分析</text>
        </view>
        <view class="action-btn" @click="goToBill">
          <text class="action-icon">📃</text>
          <text class="action-text">电费账单</text>
        </view>
        <view class="action-btn" @click="handleExport">
          <text class="action-icon">📤</text>
          <text class="action-text">数据导出</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMeterStore } from '@/store/modules/meter'
import { createLineChartOption } from '@/utils/chart'
import MeterCard from '@/components/business/meter-card/index.vue'
import EnergyBalance from '@/components/business/energy-balance/index.vue'
import dayjs from 'dayjs'

const meterStore = useMeterStore()
const chartRef = ref()

// 时间范围选项
const periods = [
  { label: '今日', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const selectedPeriod = ref<'day' | 'week' | 'month'>('day')

// 当前日期
const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日')
})

// 今日统计
const todayStats = computed(() => {
  return meterStore.todayStats
})

// 图表配置
const chartOption = computed(() => {
  meterStore.loadHistoryData(selectedPeriod.value)

  const historyData = meterStore.historyData
  const xAxisData: string[] = []
  const consumptionData: number[] = []
  const costData: number[] = []

  // 根据周期格式化数据
  if (selectedPeriod.value === 'day') {
    // 按小时分组
    const hourlyData = new Map<number, { consumption: number; cost: number }>()
    historyData.forEach(point => {
      const hour = new Date(point.timestamp).getHours()
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { consumption: 0, cost: 0 })
      }
      const data = hourlyData.get(hour)!
      data.consumption += point.consumption
      data.cost += point.cost
    })

    for (let h = 0; h < 24; h++) {
      xAxisData.push(`${h}:00`)
      const data = hourlyData.get(h) || { consumption: 0, cost: 0 }
      consumptionData.push(Number(data.consumption.toFixed(2)))
      costData.push(Number(data.cost.toFixed(2)))
    }
  } else {
    // 按天分组
    const dailyData = new Map<string, { consumption: number; cost: number }>()
    historyData.forEach(point => {
      const date = dayjs(point.timestamp).format('MM-DD')
      if (!dailyData.has(date)) {
        dailyData.set(date, { consumption: 0, cost: 0 })
      }
      const data = dailyData.get(date)!
      data.consumption += point.consumption
      data.cost += point.cost
    })

    dailyData.forEach((data, date) => {
      xAxisData.push(date)
      consumptionData.push(Number(data.consumption.toFixed(2)))
      costData.push(Number(data.cost.toFixed(2)))
    })
  }

  return createLineChartOption(
    {
      xAxisData,
      series: [
        { name: '用电量 (kWh)', data: consumptionData },
        { name: '电费 (元)', data: costData }
      ],
      legend: ['用电量 (kWh)', '电费 (元)']
    },
    {
      theme: 'orange',
      colors: ['#f97316', '#ef4444'],
      smooth: true,
      areaStyle: true,
      showGrid: true,
      showLegend: true
    }
  )
})

// 刷新数据
function handleRefresh() {
  meterStore.updateRealtimeData()
  meterStore.updateEnergyBalance()
  uni.showToast({ title: '已刷新', icon: 'success' })
}

// 切换时间周期
function handlePeriodChange(period: 'day' | 'week' | 'month') {
  selectedPeriod.value = period
}

// 前往用电分析
function goToAnalysis() {
  uni.navigateTo({ url: '/pages/meter/analysis' })
}

// 前往电费账单
function goToBill() {
  uni.navigateTo({ url: '/pages/meter/bill' })
}

// 导出数据
function handleExport() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

onMounted(() => {
  meterStore.init()
  meterStore.calculateStats('day')
})
</script>

<style scoped lang="scss">
.meter-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 12rpx;
}

.refresh-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.refresh-icon {
  font-size: 32rpx;
}

.section {
  margin-bottom: 24rpx;
}

.stats-card,
.chart-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.card-date {
  font-size: 24rpx;
  color: #64748b;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #64748b;
}

.summary-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;

  &.primary {
    color: #f97316;
  }
}

.period-bars {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.period-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #475569;
}

.period-value {
  font-size: 26rpx;
  color: #64748b;
}

.period-bar {
  height: 16rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
  overflow: hidden;
}

.period-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;

  &.peak {
    background: linear-gradient(90deg, #ef4444, #f87171);
  }

  &.valley {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
  }

  &.flat {
    background: linear-gradient(90deg, #10b981, #34d399);
  }
}

.period-cost {
  font-size: 24rpx;
  color: #64748b;
  text-align: right;
}

.period-tabs {
  display: flex;
  gap: 8rpx;
  padding: 4rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
}

.period-tab {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #64748b;
  border-radius: 6rpx;
  transition: all 0.2s;

  &.active {
    background: #ffffff;
    color: #f97316;
    font-weight: 500;
  }
}

.chart-container {
  margin-top: 24rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 32rpx 16rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 48rpx;
}

.action-text {
  font-size: 24rpx;
  color: #475569;
}
</style>
