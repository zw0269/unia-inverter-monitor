<template>
  <view class="tariff-pie">
    <view class="pie-header">
      <text class="header-title">电费占比分析</text>
      <view class="total-cost">
        <text class="cost-label">总电费</text>
        <text class="cost-value">¥{{ stats.totalCost.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 图表容器 -->
    <view class="chart-container">
      <l-echart ref="chartRef" :option="chartOption" :height="chartHeight" />
    </view>

    <!-- 数据详情 -->
    <view class="pie-details">
      <view class="detail-item peak">
        <view class="detail-header">
          <view class="detail-dot peak-dot"></view>
          <text class="detail-label">峰时电费</text>
        </view>
        <view class="detail-values">
          <text class="detail-amount">¥{{ stats.peakCost.toFixed(2) }}</text>
          <text class="detail-percent">{{ peakPercent.toFixed(1) }}%</text>
        </view>
        <text class="detail-consumption">{{ stats.peakConsumption.toFixed(2) }} kWh</text>
      </view>

      <view class="detail-item valley">
        <view class="detail-header">
          <view class="detail-dot valley-dot"></view>
          <text class="detail-label">谷时电费</text>
        </view>
        <view class="detail-values">
          <text class="detail-amount">¥{{ stats.valleyCost.toFixed(2) }}</text>
          <text class="detail-percent">{{ valleyPercent.toFixed(1) }}%</text>
        </view>
        <text class="detail-consumption">{{ stats.valleyConsumption.toFixed(2) }} kWh</text>
      </view>

      <view class="detail-item flat">
        <view class="detail-header">
          <view class="detail-dot flat-dot"></view>
          <text class="detail-label">平时电费</text>
        </view>
        <view class="detail-values">
          <text class="detail-amount">¥{{ stats.flatCost.toFixed(2) }}</text>
          <text class="detail-percent">{{ flatPercent.toFixed(1) }}%</text>
        </view>
        <text class="detail-consumption">{{ stats.flatConsumption.toFixed(2) }} kWh</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ElectricityStats } from '@/types/meter'
import { createPieChartOption } from '@/utils/chart'

interface Props {
  stats: ElectricityStats
}

const props = defineProps<Props>()

const chartRef = ref()
const chartHeight = ref('300rpx')

// 计算百分比
const peakPercent = computed(() => {
  if (props.stats.totalCost === 0) return 0
  return (props.stats.peakCost / props.stats.totalCost) * 100
})

const valleyPercent = computed(() => {
  if (props.stats.totalCost === 0) return 0
  return (props.stats.valleyCost / props.stats.totalCost) * 100
})

const flatPercent = computed(() => {
  if (props.stats.totalCost === 0) return 0
  return (props.stats.flatCost / props.stats.totalCost) * 100
})

// 图表配置
const chartOption = computed(() => {
  return createPieChartOption(
    {
      series: [
        {
          name: '电费',
          data: [
            { name: '峰时', value: props.stats.peakCost },
            { name: '谷时', value: props.stats.valleyCost },
            { name: '平时', value: props.stats.flatCost }
          ]
        }
      ]
    },
    {
      colors: ['#ef4444', '#3b82f6', '#10b981'],
      showLegend: false,
      showTooltip: true
    }
  )
})

// 监听数据变化更新图表
watch(
  () => props.stats,
  () => {
    if (chartRef.value) {
      chartRef.value.setOption(chartOption.value)
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.tariff-pie {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.pie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.total-cost {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.cost-label {
  font-size: 24rpx;
  color: #64748b;
}

.cost-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
}

.chart-container {
  margin-bottom: 32rpx;
}

.pie-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;

  &.peak {
    border-left: 6rpx solid #ef4444;
  }

  &.valley {
    border-left: 6rpx solid #3b82f6;
  }

  &.flat {
    border-left: 6rpx solid #10b981;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.detail-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;

  &.peak-dot {
    background: #ef4444;
  }

  &.valley-dot {
    background: #3b82f6;
  }

  &.flat-dot {
    background: #10b981;
  }
}

.detail-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
}

.detail-values {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.detail-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.detail-percent {
  font-size: 28rpx;
  font-weight: 500;
  color: #64748b;
}

.detail-consumption {
  font-size: 24rpx;
  color: #94a3b8;
}
</style>
