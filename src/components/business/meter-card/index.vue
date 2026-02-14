<template>
  <view class="meter-card" :class="{ compact }">
    <view class="card-header">
      <view class="header-title">
        <text class="title-icon">⚡</text>
        <text class="title-text">实时用电</text>
      </view>
      <view class="header-status">
        <text class="status-dot"></text>
        <text class="status-text">运行中</text>
      </view>
    </view>

    <view class="card-body">
      <!-- 主要数据：实时功率 -->
      <view class="power-section">
        <view class="power-value">{{ formatNumber(data.power) }}</view>
        <view class="power-unit">kW</view>
      </view>

      <!-- 次要数据 -->
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">今日用电</text>
          <text class="stat-value">{{ formatNumber(data.todayConsumption) }} kWh</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">电压</text>
          <text class="stat-value">{{ formatNumber(data.voltage) }} V</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">电流</text>
          <text class="stat-value">{{ formatNumber(data.current) }} A</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">功率因数</text>
          <text class="stat-value">{{ data.powerFactor.toFixed(3) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">频率</text>
          <text class="stat-value">{{ formatNumber(data.frequency) }} Hz</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">累计用电</text>
          <text class="stat-value">{{ formatNumber(data.totalConsumption) }} kWh</text>
        </view>
      </view>
    </view>

    <view class="card-footer">
      <text class="update-time">更新时间：{{ formatTime(data.timestamp) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MeterRealtimeData } from '@/types/meter'
import dayjs from 'dayjs'

interface Props {
  data: MeterRealtimeData
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

// 格式化数字
function formatNumber(value: number): string {
  return value.toFixed(2)
}

// 格式化时间
function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('HH:mm:ss')
}
</script>

<style scoped lang="scss">
.meter-card {
  background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(255, 94, 98, 0.3);

  &.compact {
    padding: 24rpx;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-icon {
  font-size: 40rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 24rpx;
}

.card-body {
  margin-bottom: 24rpx;
}

.power-section {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 32rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.2);
}

.power-value {
  font-size: 96rpx;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.power-unit {
  font-size: 36rpx;
  font-weight: 500;
  margin-left: 12rpx;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  backdrop-filter: blur(10rpx);
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 16rpx;
  border-top: 2rpx solid rgba(255, 255, 255, 0.2);
}

.update-time {
  font-size: 24rpx;
  opacity: 0.7;
}
</style>
