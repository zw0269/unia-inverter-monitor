<template>
  <view class="revenue-card" :style="cardStyle">
    <view class="card-background"></view>
    <view class="card-content">
      <!-- 标题 -->
      <view class="card-header">
        <text class="card-title">今日收益</text>
        <view class="trend-badge" :class="trendClass">
          <text class="trend-icon">{{ trendIcon }}</text>
          <text class="trend-text">{{ changeText }}</text>
        </view>
      </view>

      <!-- 收益金额 -->
      <view class="revenue-amount">
        <text class="currency">¥</text>
        <text class="amount">{{ displayAmount }}</text>
      </view>

      <!-- 统计信息 -->
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-label">今日发电</text>
          <text class="stat-value">{{ formatEnergy(todayEnergy) }}</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-label">自用率</text>
          <text class="stat-value">{{ selfUseRate.toFixed(1) }}%</text>
        </view>
      </view>

      <!-- 详情按钮 -->
      <view class="detail-button" @click="handleDetail">
        <text class="detail-text">查看详情</text>
        <text class="detail-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RevenueTrend } from '@/types/revenue'
import { formatEnergy } from '@/utils/format'

interface Props {
  revenue: number
  todayEnergy: number
  selfUseRate: number
  trend?: RevenueTrend
  changeRate?: number
}

const props = withDefaults(defineProps<Props>(), {
  revenue: 0,
  todayEnergy: 0,
  selfUseRate: 0,
  trend: 'stable',
  changeRate: 0
})

const emit = defineEmits<{
  detail: []
}>()

// 卡片样式
const cardStyle = computed(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
}))

// 显示金额（带动画效果）
const displayAmount = computed(() => {
  return props.revenue.toFixed(2)
})

// 趋势样式类
const trendClass = computed(() => {
  return `trend-${props.trend}`
})

// 趋势图标
const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    default:
      return '→'
  }
})

// 变化文本
const changeText = computed(() => {
  const rate = Math.abs(props.changeRate || 0)
  if (rate === 0) return '持平'
  return `${rate.toFixed(1)}%`
})

// 处理详情点击
function handleDetail() {
  emit('detail')
}
</script>

<style lang="scss" scoped>
.revenue-card {
  position: relative;
  margin: 20rpx;
  padding: 40rpx;
  border-radius: 24rpx;
  overflow: hidden;

  .card-background {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    pointer-events: none;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .card-title {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .trend-badge {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10rpx);

      .trend-icon {
        font-size: 24rpx;
        margin-right: 6rpx;
      }

      .trend-text {
        font-size: 22rpx;
        font-weight: 500;
      }

      &.trend-up {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.2);
      }

      &.trend-down {
        color: #ff4d4f;
        background: rgba(255, 77, 79, 0.2);
      }

      &.trend-stable {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .revenue-amount {
    display: flex;
    align-items: baseline;
    margin-bottom: 32rpx;

    .currency {
      font-size: 48rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      margin-right: 8rpx;
    }

    .amount {
      font-size: 72rpx;
      color: #ffffff;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -2rpx;
    }
  }

  .stats-row {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .stat-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }

      .stat-value {
        font-size: 32rpx;
        color: #ffffff;
        font-weight: 600;
      }
    }

    .stat-divider {
      width: 2rpx;
      height: 60rpx;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 32rpx;
    }
  }

  .detail-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    backdrop-filter: blur(10rpx);
    transition: all 0.3s;

    &:active {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(0.98);
    }

    .detail-text {
      font-size: 28rpx;
      color: #ffffff;
      font-weight: 500;
      margin-right: 8rpx;
    }

    .detail-arrow {
      font-size: 32rpx;
      color: #ffffff;
      transition: transform 0.3s;
    }
  }
}
</style>
