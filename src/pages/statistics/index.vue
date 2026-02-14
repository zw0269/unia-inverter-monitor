<template>
  <view class="statistics-page">
    <!-- 时间范围选择 -->
    <view class="card time-selector">
      <view class="selector-tabs">
        <view
          v-for="tab in timeTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="card statistics-overview">
      <view class="card-title">统计概览</view>
      <view class="overview-grid">
        <view class="overview-item">
          <view class="item-label">总发电量</view>
          <view class="item-value">{{ formatEnergy(statisticsData.totalEnergy) }}</view>
        </view>
        <view class="overview-item">
          <view class="item-label">平均功率</view>
          <view class="item-value">{{ formatPower(statisticsData.avgPower) }}</view>
        </view>
        <view class="overview-item">
          <view class="item-label">最大功率</view>
          <view class="item-value">{{ formatPower(statisticsData.maxPower) }}</view>
        </view>
        <view class="overview-item">
          <view class="item-label">平均效率</view>
          <view class="item-value">{{ formatEfficiency(statisticsData.avgEfficiency) }}</view>
        </view>
        <view class="overview-item">
          <view class="item-label">运行时长</view>
          <view class="item-value">{{ statisticsData.runningHours.toFixed(1) }} h</view>
        </view>
        <view class="overview-item">
          <view class="item-label">等效满载时长</view>
          <view class="item-value">{{ equivalentHours.toFixed(1) }} h</view>
        </view>
      </view>
    </view>

    <!-- 发电量趋势图表 -->
    <view class="card">
      <view class="card-title">发电量趋势</view>
      <view class="chart-container">
        <bar-chart :option="energyChartOption" height="400rpx" @finished="onChartFinished" />
      </view>
    </view>

    <!-- 功率曲线图表 -->
    <view class="card">
      <view class="card-title">功率曲线</view>
      <view class="chart-container">
        <line-chart :option="powerChartOption" height="400rpx" @finished="onChartFinished" />
      </view>
    </view>

    <!-- 效率分析 -->
    <view class="card">
      <view class="card-title">效率分析</view>
      <view class="chart-container">
        <line-chart :option="efficiencyChartOption" height="300rpx" @finished="onChartFinished" />
      </view>
      <view class="efficiency-info">
        <view class="info-item">
          <text class="label">平均效率</text>
          <text class="value">{{ formatEfficiency(statisticsData.avgEfficiency) }}</text>
        </view>
        <view class="info-item">
          <text class="label">最优效率</text>
          <text class="value">{{ formatEfficiency(97.2) }}</text>
        </view>
        <view class="info-item">
          <text class="label">效率损失</text>
          <text class="value">{{ (97.2 - statisticsData.avgEfficiency).toFixed(2) }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeviceStore } from '@/store/modules/device'
import { formatPower, formatEnergy, formatEfficiency } from '@/utils/format'
import { generateHistoryData } from '@/mock/device/realtime'
import LineChart from '@/components/charts/line-chart/index.vue'
import BarChart from '@/components/charts/bar-chart/index.vue'
import { createLineChartOption, createBarChartOption } from '@/utils/chart'
import dayjs from 'dayjs'

const deviceStore = useDeviceStore()

// 时间范围选项
const timeTabs = [
  { label: '今日', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

const currentTab = ref('day')

// 模拟统计数据
const statisticsData = computed(() => {
  const historyData = deviceStore.historyData

  if (historyData.length === 0) {
    return {
      totalEnergy: 0,
      avgPower: 0,
      maxPower: 0,
      avgEfficiency: 0,
      runningHours: 0
    }
  }

  const totalEnergy = historyData.reduce((sum, d) => sum + d.energy, 0)
  const avgPower = historyData.reduce((sum, d) => sum + d.power, 0) / historyData.length
  const maxPower = Math.max(...historyData.map(d => d.power))
  const avgEfficiency = 96.5
  const runningHours = historyData.filter(d => d.power > 0).length * 0.5 // 假设30分钟间隔

  return {
    totalEnergy,
    avgPower,
    maxPower,
    avgEfficiency,
    runningHours
  }
})

// 等效满载时长
const equivalentHours = computed(() => {
  return statisticsData.value.totalEnergy / 125 // 125kW额定功率
})

// 发电量图表配置
const energyChartOption = computed(() => {
  const historyData = deviceStore.historyData

  return createBarChartOption(
    {
      xAxisData: historyData.map(d => {
        const date = dayjs(d.timestamp)
        return date.format('HH:mm')
      }),
      series: [
        {
          name: '发电量',
          data: historyData.map(d => d.energy)
        }
      ]
    },
    {
      theme: 'blue',
      yAxisLabel: '发电量（kWh）',
      showGrid: true
    }
  )
})

// 功率曲线图表配置
const powerChartOption = computed(() => {
  const historyData = deviceStore.historyData

  return createLineChartOption(
    {
      xAxisData: historyData.map(d => {
        const date = dayjs(d.timestamp)
        return date.format('HH:mm')
      }),
      series: [
        {
          name: '功率',
          data: historyData.map(d => d.power)
        }
      ]
    },
    {
      theme: 'green',
      yAxisLabel: '功率（kW）',
      smooth: true,
      areaStyle: true,
      showGrid: true
    }
  )
})

// 效率分析图表配置
const efficiencyChartOption = computed(() => {
  const historyData = deviceStore.historyData

  // 模拟效率数据（实际应该从设备数据中计算）
  const efficiencyData = historyData.map(() => {
    // 效率在 95-98% 之间波动
    return 95 + Math.random() * 3
  })

  return createLineChartOption(
    {
      xAxisData: historyData.map(d => {
        const date = dayjs(d.timestamp)
        return date.format('HH:mm')
      }),
      series: [
        {
          name: '效率',
          data: efficiencyData
        }
      ]
    },
    {
      theme: 'orange',
      yAxisLabel: '效率（%）',
      smooth: true,
      showGrid: true
    }
  )
})

// 图表渲染完成
function onChartFinished() {
  console.log('图表渲染完成')
}

// 监听标签切换
watch(currentTab, () => {
  // 这里可以根据不同的时间范围加载不同的数据
  console.log('切换到:', currentTab.value)
})
</script>

<style lang="scss" scoped>
.statistics-page {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

/* 时间选择器 */
.time-selector {
  padding: 0;

  .selector-tabs {
    display: flex;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 24rpx;
      font-size: 28rpx;
      color: #666666;
      border-bottom: 4rpx solid transparent;
      transition: all 0.3s;

      &.active {
        color: #1296db;
        font-weight: bold;
        border-bottom-color: #1296db;
      }

      &:active {
        background-color: #f8f8f8;
      }
    }
  }
}

/* 统计概览 */
.statistics-overview {
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }

  .overview-item {
    padding: 30rpx 20rpx;
    background: linear-gradient(135deg, #f8f8f8, #ffffff);
    border-radius: 12rpx;
    text-align: center;

    .item-label {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 12rpx;
    }

    .item-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #1296db;
    }
  }
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 500rpx;
  margin-top: 20rpx;
}

/* 效率信息 */
.efficiency-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #666666;
      font-size: 28rpx;
    }

    .value {
      color: #333333;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
}
</style>
