<template>
  <view class="revenue-page">
    <!-- 时间范围选择 -->
    <view class="card time-selector">
      <view class="selector-tabs">
        <view
          v-for="tab in timeTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentPeriod === tab.value }"
          @click="handlePeriodChange(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <!-- 收益概览 -->
    <view class="card revenue-overview">
      <view class="overview-main">
        <text class="overview-label">总收益</text>
        <text class="overview-amount">¥{{ revenueStats.totalRevenue.toFixed(2) }}</text>
      </view>
      <view class="overview-grid">
        <view class="overview-item">
          <text class="item-label">自用收益</text>
          <text class="item-value">¥{{ revenueStats.selfUseRevenue.toFixed(2) }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">上网收益</text>
          <text class="item-value">¥{{ revenueStats.gridRevenue.toFixed(2) }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">补贴收益</text>
          <text class="item-value">¥{{ revenueStats.subsidyRevenue.toFixed(2) }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">自用率</text>
          <text class="item-value">{{ revenueStats.selfUseRate.toFixed(1) }}%</text>
        </view>
      </view>
    </view>

    <!-- 收益趋势图表 -->
    <view class="card">
      <view class="card-title">收益趋势</view>
      <view class="chart-container">
        <line-chart :option="revenueChartOption" height="400rpx" @finished="onChartFinished" />
      </view>
    </view>

    <!-- 发电量对比 -->
    <view class="card">
      <view class="card-title">发电量对比</view>
      <view class="chart-container">
        <bar-chart :option="energyChartOption" height="400rpx" @finished="onChartFinished" />
      </view>
    </view>

    <!-- 收益明细列表 -->
    <view class="card">
      <view class="card-title">收益明细</view>
      <view class="revenue-list">
        <view v-for="item in revenueList" :key="item.date" class="revenue-item">
          <view class="item-left">
            <text class="item-date">{{ formatDate(item.date) }}</text>
            <text class="item-energy">{{ item.energy.toFixed(1) }} kWh</text>
          </view>
          <view class="item-right">
            <text class="item-revenue">¥{{ item.revenue.toFixed(2) }}</text>
          </view>
        </view>
        <view v-if="revenueList.length === 0" class="empty-state">
          <text class="empty-text">暂无收益记录</text>
        </view>
      </view>
    </view>

    <!-- 电价配置入口 -->
    <view class="config-entry" @click="handleConfigClick">
      <text class="config-icon">⚙️</text>
      <text class="config-text">电价配置</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRevenueStore } from '@/store/modules/revenue'
import type { RevenuePeriod } from '@/types/revenue'
import LineChart from '@/components/charts/line-chart/index.vue'
import BarChart from '@/components/charts/bar-chart/index.vue'
import { createLineChartOption, createBarChartOption } from '@/utils/chart'
import dayjs from 'dayjs'

const revenueStore = useRevenueStore()

// 时间范围选项
const timeTabs = [
  { label: '今日', value: 'day' as RevenuePeriod },
  { label: '本周', value: 'week' as RevenuePeriod },
  { label: '本月', value: 'month' as RevenuePeriod },
  { label: '本年', value: 'year' as RevenuePeriod }
]

const currentPeriod = ref<RevenuePeriod>('day')

// 收益统计数据
const revenueStats = computed(() => {
  return revenueStore.getRevenueStats(currentPeriod.value)
})

// 收益列表
const revenueList = computed(() => {
  return revenueStore.getRevenueHistoryList(currentPeriod.value)
})

// 收益趋势图表配置
const revenueChartOption = computed(() => {
  const trendData = revenueStore.getRevenueTrendData(currentPeriod.value)

  return createLineChartOption(
    {
      xAxisData: trendData.map(d => {
        const date = dayjs(d.timestamp)
        return currentPeriod.value === 'day'
          ? date.format('HH:mm')
          : date.format('MM-DD')
      }),
      series: [
        {
          name: '收益',
          data: trendData.map(d => d.revenue)
        }
      ]
    },
    {
      theme: 'blue',
      yAxisLabel: '收益（元）',
      smooth: true,
      areaStyle: true,
      showGrid: true
    }
  )
})

// 发电量图表配置
const energyChartOption = computed(() => {
  const trendData = revenueStore.getRevenueTrendData(currentPeriod.value)

  return createBarChartOption(
    {
      xAxisData: trendData.map(d => {
        const date = dayjs(d.timestamp)
        return currentPeriod.value === 'day'
          ? date.format('HH:mm')
          : date.format('MM-DD')
      }),
      series: [
        {
          name: '自用电量',
          data: trendData.map(d => d.selfUseEnergy)
        },
        {
          name: '上网电量',
          data: trendData.map(d => d.gridEnergy)
        }
      ],
      legend: ['自用电量', '上网电量']
    },
    {
      theme: 'green',
      yAxisLabel: '电量（kWh）',
      stack: true,
      showLegend: true
    }
  )
})

// 处理周期切换
function handlePeriodChange(period: RevenuePeriod) {
  currentPeriod.value = period
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = dayjs(dateStr)
  const today = dayjs()

  if (date.isSame(today, 'day')) {
    return '今天'
  } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
    return '昨天'
  } else {
    return date.format('MM月DD日')
  }
}

// 图表渲染完成
function onChartFinished() {
  console.log('图表渲染完成')
}

// 跳转到配置页面
function handleConfigClick() {
  uni.navigateTo({
    url: '/pages/revenue/config'
  })
}

onMounted(() => {
  revenueStore.init()
})
</script>

<style lang="scss" scoped>
.revenue-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

// 时间选择器
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
        color: #667eea;
        font-weight: bold;
        border-bottom-color: #667eea;
      }

      &:active {
        background-color: #f8f8f8;
      }
    }
  }
}

// 收益概览
.revenue-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;

  .overview-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx 0;
    border-bottom: 2rpx solid rgba(255, 255, 255, 0.2);
    margin-bottom: 32rpx;

    .overview-label {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 16rpx;
    }

    .overview-amount {
      font-size: 64rpx;
      font-weight: bold;
    }
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .overview-item {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .item-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }

      .item-value {
        font-size: 32rpx;
        font-weight: bold;
      }
    }
  }
}

// 图表容器
.chart-container {
  width: 100%;
  margin-top: 20rpx;
}

// 收益明细列表
.revenue-list {
  .revenue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .item-left {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .item-date {
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
      }

      .item-energy {
        font-size: 24rpx;
        color: #999999;
      }
    }

    .item-right {
      .item-revenue {
        font-size: 32rpx;
        font-weight: bold;
        color: #667eea;
      }
    }
  }

  .empty-state {
    padding: 80rpx 0;
    text-align: center;

    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

// 配置入口
.config-entry {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  .config-icon {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }

  .config-text {
    font-size: 20rpx;
    color: #ffffff;
  }
}
</style>
