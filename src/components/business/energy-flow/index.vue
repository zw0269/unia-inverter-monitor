<template>
  <view class="energy-flow-container">
    <view class="energy-flow-header">
      <text class="header-title">实时能量流</text>
      <view class="status-indicator">
        <view class="pulse-dot"></view>
        <text class="status-text">实时</text>
      </view>
    </view>

    <view class="svg-wrapper">
      <svg viewBox="0 0 640 360" class="energy-flow-svg">
        <!-- 光伏节点 (Solar) -->
        <g transform="translate(40, 40)">
          <!-- 外圈光晕 -->
          <circle cx="60" cy="60" r="56" :fill="solarColor" opacity="0.2"/>
          <!-- 主圆 -->
          <circle cx="60" cy="60" r="40" :fill="solarColor"/>
          <!-- Icon -->
          <text x="60" y="70" text-anchor="middle" fill="white" font-size="32">☀️</text>
          <!-- 标签 -->
          <text x="60" y="140" text-anchor="middle" fill="#666" font-size="20">光伏</text>
          <!-- 功率值 -->
          <text x="60" y="170" text-anchor="middle" :fill="solarColor" font-size="24" font-weight="bold">
            {{ formatPower(solarPower) }}
          </text>
          <!-- 脉冲环动画 -->
          <circle
            v-if="solarPower > 0"
            cx="60"
            cy="60"
            r="56"
            fill="none"
            :stroke="solarColor"
            stroke-width="3"
            class="pulse-ring"
          />
        </g>

        <!-- 储能节点 (Battery) -->
        <g transform="translate(260, 40)">
          <!-- 电池外壳 -->
          <rect x="20" y="20" width="80" height="120" rx="10" :fill="batteryColor" opacity="0.2"/>
          <rect x="30" y="30" width="60" height="86" rx="6" :fill="batteryColor"/>
          <!-- 电池头 -->
          <rect x="44" y="16" width="32" height="8" rx="4" :fill="batteryColor"/>
          <!-- SOC 百分比 -->
          <text x="60" y="80" text-anchor="middle" fill="white" font-size="28" font-weight="bold">
            {{ batterySoc }}%
          </text>
          <!-- 标签 -->
          <text x="60" y="170" text-anchor="middle" fill="#666" font-size="20">储能</text>
          <!-- 功率值 (充电/放电) -->
          <text
            x="60"
            y="200"
            text-anchor="middle"
            :fill="batteryPower > 0 ? '#10B981' : batteryPower < 0 ? '#F59E0B' : '#999'"
            font-size="22"
            font-weight="bold"
          >
            {{ formatBatteryPower(batteryPower) }}
          </text>
        </g>

        <!-- 负载节点 (Load) -->
        <g transform="translate(480, 40)">
          <!-- 外圈光晕 -->
          <circle cx="60" cy="60" r="56" :fill="loadColor" opacity="0.2"/>
          <!-- 主圆 -->
          <circle cx="60" cy="60" r="40" :fill="loadColor"/>
          <!-- Icon -->
          <text x="60" y="70" text-anchor="middle" fill="white" font-size="32">🏠</text>
          <!-- 标签 -->
          <text x="60" y="140" text-anchor="middle" fill="#666" font-size="20">负载</text>
          <!-- 功率值 -->
          <text x="60" y="170" text-anchor="middle" :fill="loadColor" font-size="24" font-weight="bold">
            {{ formatPower(loadPower) }}
          </text>
          <!-- 脉冲环动画 -->
          <circle
            v-if="loadPower > 0"
            cx="60"
            cy="60"
            r="56"
            fill="none"
            :stroke="loadColor"
            stroke-width="3"
            class="pulse-ring"
          />
        </g>

        <!-- 电网节点 (Grid) - 底部居中 -->
        <g transform="translate(260, 260)">
          <!-- 主圆 -->
          <circle cx="60" cy="30" r="24" :fill="gridColor"/>
          <!-- Icon -->
          <text x="60" y="38" text-anchor="middle" fill="white" font-size="24">⚡</text>
          <!-- 标签 -->
          <text x="60" y="70" text-anchor="middle" fill="#666" font-size="18">电网</text>
          <!-- 功率值 -->
          <text
            x="60"
            y="94"
            text-anchor="middle"
            :fill="gridPower > 0 ? '#3B82F6' : gridPower < 0 ? '#F59E0B' : '#999'"
            font-size="20"
            font-weight="bold"
          >
            {{ formatGridPower(gridPower) }}
          </text>
        </g>

        <!-- 能量流动线条 -->
        <!-- 光伏 -> 储能 -->
        <line
          v-if="solarPower > 0 && batteryPower > 0"
          x1="140"
          y1="100"
          x2="280"
          y2="100"
          :stroke="solarColor"
          stroke-width="6"
          class="energy-flow-line"
        />
        <polygon
          v-if="solarPower > 0 && batteryPower > 0"
          points="276,94 286,100 276,106"
          :fill="solarColor"
        />

        <!-- 光伏 -> 负载 (直连路径,弧线) -->
        <path
          v-if="solarPower > 0 && batteryPower <= 0"
          d="M 140 100 Q 320 50, 500 100"
          fill="none"
          :stroke="solarColor"
          stroke-width="6"
          class="energy-flow-line"
        />
        <polygon
          v-if="solarPower > 0 && batteryPower <= 0"
          points="494,94 504,100 494,106"
          :fill="solarColor"
        />

        <!-- 储能 -> 负载 -->
        <line
          v-if="batteryPower < 0"
          x1="380"
          y1="100"
          x2="500"
          y2="100"
          stroke="#F59E0B"
          stroke-width="6"
          class="energy-flow-line"
        />
        <polygon
          v-if="batteryPower < 0"
          points="494,94 504,100 494,106"
          fill="#F59E0B"
        />

        <!-- 电网连接线 (虚线,无方向) -->
        <line
          x1="320"
          y1="180"
          x2="320"
          y2="260"
          stroke="#CCC"
          stroke-width="4"
          stroke-dasharray="6,6"
        />
      </svg>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 能量流组件Props
 */
interface EnergyFlowProps {
  solarPower: number      // 光伏功率 (kW)
  batteryPower: number    // 储能功率 (kW, 正为充电, 负为放电)
  loadPower: number       // 负载功率 (kW)
  gridPower: number       // 电网功率 (kW, 正为上网, 负为用电)
  batterySoc: number      // 储能SOC百分比
}

const props = withDefaults(defineProps<EnergyFlowProps>(), {
  solarPower: 0,
  batteryPower: 0,
  loadPower: 0,
  gridPower: 0,
  batterySoc: 0
})

// 颜色定义
const solarColor = '#FFA500'    // 橙色 - 光伏
const batteryColor = '#10B981'  // 绿色 - 储能
const loadColor = '#8B5CF6'     // 紫色 - 负载
const gridColor = '#3B82F6'     // 蓝色 - 电网

/**
 * 格式化功率显示
 */
const formatPower = (power: number): string => {
  if (power === 0) return '0kW'
  if (power >= 1000) {
    return `${(power / 1000).toFixed(1)}MW`
  }
  return `${power.toFixed(1)}kW`
}

/**
 * 格式化储能功率显示
 */
const formatBatteryPower = (power: number): string => {
  if (power === 0) return '待机'
  if (power > 0) {
    return `充电 ${formatPower(power)}`
  }
  return `放电 ${formatPower(Math.abs(power))}`
}

/**
 * 格式化电网功率显示
 */
const formatGridPower = (power: number): string => {
  if (power === 0) return '0kW'
  if (power > 0) {
    return `上网 ${formatPower(power)}`
  }
  return `用电 ${formatPower(Math.abs(power))}`
}
</script>

<style lang="scss" scoped>
.energy-flow-container {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.energy-flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.pulse-dot {
  width: 12rpx;
  height: 12rpx;
  background: #3B82F6;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

.status-text {
  font-size: 24rpx;
  color: #3B82F6;
}

.svg-wrapper {
  width: 100%;
  overflow: hidden;
}

.energy-flow-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* 脉冲环动画 */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

/* 能量流动线条动画 */
.energy-flow-line {
  stroke-dasharray: 10, 10;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}

/* 点脉冲动画 */
@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
