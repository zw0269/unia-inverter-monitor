<template>
  <view class="energy-balance">
    <view class="balance-title">能量平衡</view>

    <!-- SVG 能量流动图 -->
    <view class="balance-diagram">
      <svg viewBox="0 0 400 300" class="balance-svg">
        <!-- 背景 -->
        <defs>
          <linearGradient id="genGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="consGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- 中心圆：自发自用率 -->
        <circle cx="200" cy="150" r="50" fill="url(#genGradient)" opacity="0.2" />
        <circle cx="200" cy="150" r="40" fill="none" stroke="url(#genGradient)" stroke-width="6" />
        <text x="200" y="145" text-anchor="middle" fill="#3b82f6" font-size="32" font-weight="bold">
          {{ balance.selfUseRate.toFixed(1) }}%
        </text>
        <text x="200" y="165" text-anchor="middle" fill="#64748b" font-size="14">
          自发自用率
        </text>

        <!-- 左侧：发电量 -->
        <rect x="20" y="120" width="80" height="60" rx="8" fill="url(#genGradient)" opacity="0.9" />
        <text x="60" y="145" text-anchor="middle" fill="#ffffff" font-size="14">发电</text>
        <text x="60" y="165" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">
          {{ balance.generation.toFixed(1) }}
        </text>

        <!-- 右侧:用电量 -->
        <rect x="300" y="120" width="80" height="60" rx="8" fill="url(#consGradient)" opacity="0.9" />
        <text x="340" y="145" text-anchor="middle" fill="#ffffff" font-size="14">用电</text>
        <text x="340" y="165" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">
          {{ balance.consumption.toFixed(1) }}
        </text>

        <!-- 上方：上网量 -->
        <g v-if="balance.gridFeed > 0">
          <rect x="160" y="20" width="80" height="50" rx="8" fill="#10b981" opacity="0.9" />
          <text x="200" y="40" text-anchor="middle" fill="#ffffff" font-size="14">上网</text>
          <text x="200" y="60" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold">
            {{ balance.gridFeed.toFixed(1) }}
          </text>
          <!-- 发电到上网的流动线 -->
          <path d="M 100 120 Q 150 90 200 70" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6" stroke-dasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
          </path>
        </g>

        <!-- 下方：取电量 -->
        <g v-if="balance.gridDraw > 0">
          <rect x="160" y="230" width="80" height="50" rx="8" fill="#ef4444" opacity="0.9" />
          <text x="200" y="250" text-anchor="middle" fill="#ffffff" font-size="14">取电</text>
          <text x="200" y="270" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold">
            {{ balance.gridDraw.toFixed(1) }}
          </text>
          <!-- 取电到用电的流动线 -->
          <path d="M 200 230 Q 250 200 300 180" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.6" stroke-dasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
          </path>
        </g>

        <!-- 自用电流动线 -->
        <g v-if="balance.selfUse > 0">
          <!-- 发电到中心 -->
          <path d="M 100 150 L 150 150" fill="none" stroke="#3b82f6" stroke-width="3" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="0.8s" repeatCount="indefinite" />
          </path>
          <!-- 中心到用电 -->
          <path d="M 250 150 L 300 150" fill="none" stroke="#f97316" stroke-width="3" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="0.8s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </view>

    <!-- 数据详情 -->
    <view class="balance-details">
      <view class="detail-item">
        <view class="detail-label">发电量</view>
        <view class="detail-value" style="color: #3b82f6;">{{ balance.generation.toFixed(2) }} kWh</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">用电量</view>
        <view class="detail-value" style="color: #f97316;">{{ balance.consumption.toFixed(2) }} kWh</view>
      </view>
      <view class="detail-item">
        <view class="detail-label">自用量</view>
        <view class="detail-value" style="color: #8b5cf6;">{{ balance.selfUse.toFixed(2) }} kWh</view>
      </view>
      <view class="detail-item" v-if="balance.gridFeed > 0">
        <view class="detail-label">上网量</view>
        <view class="detail-value" style="color: #10b981;">{{ balance.gridFeed.toFixed(2) }} kWh</view>
      </view>
      <view class="detail-item" v-if="balance.gridDraw > 0">
        <view class="detail-label">取电量</view>
        <view class="detail-value" style="color: #ef4444;">{{ balance.gridDraw.toFixed(2) }} kWh</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { EnergyBalance } from '@/types/meter'

interface Props {
  balance: EnergyBalance
}

const props = defineProps<Props>()
</script>

<style scoped lang="scss">
.energy-balance {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.balance-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
  text-align: center;
}

.balance-diagram {
  width: 100%;
  height: 400rpx;
  margin-bottom: 32rpx;
}

.balance-svg {
  width: 100%;
  height: 100%;
}

.balance-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #64748b;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 600;
}
</style>
