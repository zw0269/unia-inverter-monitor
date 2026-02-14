<template>
  <view class="analysis-page">
    <!-- 标题栏 -->
    <view class="page-header">
      <text class="page-title">用电分析</text>
      <view class="period-selector">
        <picker mode="selector" :range="periodOptions" range-key="label" @change="handlePeriodChange">
          <view class="selector-value">
            <text>{{ currentPeriodLabel }}</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 用电统计概览 -->
    <view class="section">
      <view class="overview-card">
        <text class="section-title">用电统计</text>
        <view class="overview-grid">
          <view class="overview-item total">
            <text class="item-label">总用电量</text>
            <text class="item-value">{{ currentStats.totalConsumption.toFixed(2) }}</text>
            <text class="item-unit">kWh</text>
          </view>
          <view class="overview-item peak">
            <text class="item-label">峰时用电</text>
            <text class="item-value">{{ currentStats.peakConsumption.toFixed(2) }}</text>
            <text class="item-unit">kWh ({{ peakPercent.toFixed(1) }}%)</text>
          </view>
          <view class="overview-item valley">
            <text class="item-label">谷时用电</text>
            <text class="item-value">{{ currentStats.valleyConsumption.toFixed(2) }}</text>
            <text class="item-unit">kWh ({{ valleyPercent.toFixed(1) }}%)</text>
          </view>
          <view class="overview-item flat">
            <text class="item-label">平时用电</text>
            <text class="item-value">{{ currentStats.flatConsumption.toFixed(2) }}</text>
            <text class="item-unit">kWh ({{ flatPercent.toFixed(1) }}%)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 电费统计概览 -->
    <view class="section">
      <view class="overview-card">
        <text class="section-title">电费统计</text>
        <view class="overview-grid">
          <view class="overview-item total cost">
            <text class="item-label">总电费</text>
            <text class="item-value">¥{{ currentStats.totalCost.toFixed(2) }}</text>
            <text class="item-unit">平均 ¥{{ avgPrice.toFixed(3) }}/kWh</text>
          </view>
          <view class="overview-item peak cost">
            <text class="item-label">峰时电费</text>
            <text class="item-value">¥{{ currentStats.peakCost.toFixed(2) }}</text>
            <text class="item-unit">{{ peakCostPercent.toFixed(1) }}%</text>
          </view>
          <view class="overview-item valley cost">
            <text class="item-label">谷时电费</text>
            <text class="item-value">¥{{ currentStats.valleyCost.toFixed(2) }}</text>
            <text class="item-unit">{{ valleyCostPercent.toFixed(1) }}%</text>
          </view>
          <view class="overview-item flat cost">
            <text class="item-label">平时电费</text>
            <text class="item-value">¥{{ currentStats.flatCost.toFixed(2) }}</text>
            <text class="item-unit">{{ flatCostPercent.toFixed(1) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 电费占比饼图 -->
    <view class="section">
      <tariff-pie :stats="currentStats" />
    </view>

    <!-- 峰谷平用电趋势 -->
    <view class="section">
      <view class="chart-card">
        <text class="card-title">峰谷平用电趋势</text>
        <view class="chart-container">
          <l-echart ref="stackChartRef" :option="stackChartOption" height="350rpx" />
        </view>
      </view>
    </view>

    <!-- 自发自用分析 -->
    <view class="section" v-if="energyBalance">
      <view class="self-use-card">
        <text class="section-title">自发自用分析</text>

        <!-- 自发自用率 -->
        <view class="self-use-rate">
          <view class="rate-circle">
            <text class="rate-value">{{ energyBalance.selfUseRate.toFixed(1) }}%</text>
            <text class="rate-label">自发自用率</text>
          </view>
        </view>

        <!-- 对比数据 -->
        <view class="compare-data">
          <view class="compare-item">
            <text class="compare-label">自用电量</text>
            <view class="compare-bar">
              <view
                class="compare-fill self-use"
                :style="{ width: `${(energyBalance.selfUse / energyBalance.consumption) * 100}%` }"
              ></view>
            </view>
            <text class="compare-value">{{ energyBalance.selfUse.toFixed(2) }} kWh</text>
          </view>
          <view class="compare-item">
            <text class="compare-label">总用电量</text>
            <view class="compare-bar">
              <view class="compare-fill total" style="width: 100%"></view>
            </view>
            <text class="compare-value">{{ energyBalance.consumption.toFixed(2) }} kWh</text>
          </view>
        </view>

        <!-- 节省电费 -->
        <view class="saving-info">
          <text class="saving-label">节省电费</text>
          <text class="saving-value">¥{{ calculateSaving().toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 用电建议 -->
    <view class="section">
      <view class="suggestions-card">
        <text class="section-title">用电建议</text>
        <view class="suggestions-list">
          <view v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
            <view class="suggestion-icon">{{ suggestion.icon }}</view>
            <view class="suggestion-content">
              <text class="suggestion-title">{{ suggestion.title }}</text>
              <text class="suggestion-desc">{{ suggestion.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMeterStore } from '@/store/modules/meter'
import { useRevenueStore } from '@/store/modules/revenue'
import { createBarChartOption } from '@/utils/chart'
import TariffPie from '@/components/business/tariff-pie/index.vue'

const meterStore = useMeterStore()
const revenueStore = useRevenueStore()

const stackChartRef = ref()

// 周期选项
const periodOptions = [
  { label: '今日', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

const selectedPeriodIndex = ref(0)
const selectedPeriod = computed(() => periodOptions[selectedPeriodIndex.value].value as any)
const currentPeriodLabel = computed(() => periodOptions[selectedPeriodIndex.value].label)

// 当前统计数据
const currentStats = computed(() => {
  return meterStore.calculateStats(selectedPeriod.value)
})

// 能量平衡
const energyBalance = computed(() => meterStore.energyBalance)

// 计算百分比
const peakPercent = computed(() => {
  if (currentStats.value.totalConsumption === 0) return 0
  return (currentStats.value.peakConsumption / currentStats.value.totalConsumption) * 100
})

const valleyPercent = computed(() => {
  if (currentStats.value.totalConsumption === 0) return 0
  return (currentStats.value.valleyConsumption / currentStats.value.totalConsumption) * 100
})

const flatPercent = computed(() => {
  if (currentStats.value.totalConsumption === 0) return 0
  return (currentStats.value.flatConsumption / currentStats.value.totalConsumption) * 100
})

const peakCostPercent = computed(() => {
  if (currentStats.value.totalCost === 0) return 0
  return (currentStats.value.peakCost / currentStats.value.totalCost) * 100
})

const valleyCostPercent = computed(() => {
  if (currentStats.value.totalCost === 0) return 0
  return (currentStats.value.valleyCost / currentStats.value.totalCost) * 100
})

const flatCostPercent = computed(() => {
  if (currentStats.value.totalCost === 0) return 0
  return (currentStats.value.flatCost / currentStats.value.totalCost) * 100
})

const avgPrice = computed(() => {
  if (currentStats.value.totalConsumption === 0) return 0
  return currentStats.value.totalCost / currentStats.value.totalConsumption
})

// 堆叠柱状图配置
const stackChartOption = computed(() => {
  meterStore.loadHistoryData(selectedPeriod.value)

  const historyData = meterStore.historyData
  const xAxisData: string[] = []
  const peakData: number[] = []
  const valleyData: number[] = []
  const flatData: number[] = []

  // 按天分组
  const dailyData = new Map<string, { peak: number; valley: number; flat: number }>()
  historyData.forEach(point => {
    const date = new Date(point.timestamp).toLocaleDateString()
    if (!dailyData.has(date)) {
      dailyData.set(date, { peak: 0, valley: 0, flat: 0 })
    }
    const data = dailyData.get(date)!
    if (point.period === 'peak') data.peak += point.consumption
    else if (point.period === 'valley') data.valley += point.consumption
    else data.flat += point.consumption
  })

  dailyData.forEach((data, date) => {
    xAxisData.push(date)
    peakData.push(Number(data.peak.toFixed(2)))
    valleyData.push(Number(data.valley.toFixed(2)))
    flatData.push(Number(data.flat.toFixed(2)))
  })

  return createBarChartOption(
    {
      xAxisData,
      series: [
        { name: '峰时', data: peakData },
        { name: '谷时', data: valleyData },
        { name: '平时', data: flatData }
      ],
      legend: ['峰时', '谷时', '平时']
    },
    {
      colors: ['#ef4444', '#3b82f6', '#10b981'],
      stack: true,
      showLegend: true
    }
  )
})

// 计算节省电费
function calculateSaving() {
  if (!energyBalance.value) return 0
  const tariffConfig = revenueStore.tariffConfig
  // 使用平均电价估算
  const avgPrice = (tariffConfig.peakPrice + tariffConfig.valleyPrice + tariffConfig.flatPrice) / 3
  return energyBalance.value.selfUse * avgPrice
}

// 生成用电建议
const suggestions = computed(() => {
  const result = []

  // 峰时用电建议
  if (peakPercent.value > 40) {
    result.push({
      icon: '⚠️',
      title: '峰时用电占比过高',
      desc: `峰时用电占比 ${peakPercent.value.toFixed(1)}%，建议将部分负载转移到谷时或平时`
    })
  }

  // 谷时用电建议
  if (valleyPercent.value < 20) {
    result.push({
      icon: '💡',
      title: '增加谷时用电',
      desc: '谷时电价最低，建议在夜间（00:00-06:00）使用高功率设备'
    })
  }

  // 自发自用率建议
  if (energyBalance.value && energyBalance.value.selfUseRate < 60) {
    result.push({
      icon: '🔋',
      title: '提高自发自用率',
      desc: `当前自发自用率 ${energyBalance.value.selfUseRate.toFixed(1)}%，建议在光伏发电时段增加用电`
    })
  }

  // 如果没有特别建议
  if (result.length === 0) {
    result.push({
      icon: '✅',
      title: '用电模式良好',
      desc: '当前用电模式合理，继续保持'
    })
  }

  return result
})

// 切换周期
function handlePeriodChange(e: any) {
  selectedPeriodIndex.value = e.detail.value
}

onMounted(() => {
  meterStore.init()
})
</script>

<style scoped lang="scss">
.analysis-page {
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

.period-selector {
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.selector-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #1e293b;
}

.selector-arrow {
  font-size: 20rpx;
  color: #64748b;
}

.section {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
}

.overview-card,
.chart-card,
.self-use-card,
.suggestions-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 6rpx solid;

  &.total {
    border-color: #8b5cf6;
    background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
  }

  &.peak {
    border-color: #ef4444;
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
  }

  &.valley {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  }

  &.flat {
    border-color: #10b981;
    background: linear-gradient(135deg, #d1fae5 0%, #f0fdf4 100%);
  }

  &.cost {
    background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
  }
}

.item-label {
  font-size: 24rpx;
  color: #64748b;
}

.item-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
}

.item-unit {
  font-size: 22rpx;
  color: #94a3b8;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
}

.chart-container {
  margin-top: 24rpx;
}

.self-use-rate {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.rate-circle {
  width: 240rpx;
  height: 240rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.rate-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #ffffff;
}

.rate-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
}

.compare-data {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.compare-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.compare-label {
  font-size: 26rpx;
  color: #64748b;
}

.compare-bar {
  height: 32rpx;
  background: #f1f5f9;
  border-radius: 16rpx;
  overflow: hidden;
}

.compare-fill {
  height: 100%;
  border-radius: 16rpx;
  transition: width 0.3s ease;

  &.self-use {
    background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  }

  &.total {
    background: linear-gradient(90deg, #f97316, #fb923c);
  }
}

.compare-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

.saving-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border-radius: 12rpx;
  border: 2rpx solid #10b981;
}

.saving-label {
  font-size: 28rpx;
  color: #059669;
  font-weight: 500;
}

.saving-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #10b981;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.suggestion-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.suggestion-icon {
  font-size: 40rpx;
  line-height: 1;
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.suggestion-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
}

.suggestion-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.5;
}
</style>
