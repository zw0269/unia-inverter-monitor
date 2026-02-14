<template>
  <view class="energy-monitor-page">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="station-info">
        <text class="station-name">工业园区1号站</text>
        <text class="station-spec">125kW · 并网运行</text>
      </view>
      <StatusBadge status="running" :pulse="true" size="small" />
    </view>

    <!-- 实时功率卡片 -->
    <GradientCard theme="blue" padding="40rpx" radius="32rpx" class="power-card">
      <view class="power-display">
        <text class="power-label">实时功率</text>
        <text class="power-value">{{ formatPower(currentPower) }}</text>
        <text class="power-unit">kW</text>
      </view>

      <view class="power-grid">
        <view class="power-item">
          <text class="power-item-value">{{ formatPower(energyData.solarPower) }}</text>
          <text class="power-item-label">光伏</text>
        </view>
        <view class="power-item">
          <text class="power-item-value" :class="batteryClass">
            {{ formatBatteryPower(energyData.batteryPower) }}
          </text>
          <text class="power-item-label">储能</text>
        </view>
        <view class="power-item">
          <text class="power-item-value">{{ formatPower(energyData.gridPower) }}</text>
          <text class="power-item-label">电网</text>
        </view>
      </view>

      <!-- 快速统计 -->
      <view class="quick-stats">
        <view class="stat-item">
          <text class="stat-value">458.6</text>
          <text class="stat-label">今日发电 kWh</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">¥229</text>
          <text class="stat-label">今日收益</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">94%</text>
          <text class="stat-label">自用率</text>
        </view>
      </view>
    </GradientCard>

    <!-- 能量流可视化 -->
    <view class="energy-flow-section">
      <view class="section-header">
        <text class="section-title">实时能量流</text>
        <view class="realtime-indicator">
          <view class="pulse-dot"></view>
          <text class="realtime-text">实时</text>
        </view>
      </view>

      <EnergyFlow
        :solar-power="energyData.solarPower"
        :battery-power="energyData.batteryPower"
        :load-power="energyData.loadPower"
        :grid-power="energyData.gridPower"
        :battery-soc="energyData.batterySoc"
      />
    </view>

    <!-- 设备状态卡片 -->
    <view class="device-status-section">
      <!-- 逆变器 -->
      <view class="card device-card">
        <view class="device-header">
          <view class="device-icon-wrapper" style="background: #EFF6FF;">
            <text class="device-icon">⚡</text>
          </view>
          <view class="device-info">
            <text class="device-name">逆变器</text>
            <text class="device-model">HYD-125KTL</text>
          </view>
          <StatusBadge status="running" size="small" />
        </view>

        <view class="device-metrics">
          <view class="metric">
            <text class="metric-label">有功功率</text>
            <text class="metric-value text-primary">98.7kW</text>
          </view>
          <view class="metric">
            <text class="metric-label">效率</text>
            <text class="metric-value text-success">98.2%</text>
          </view>
          <view class="metric">
            <text class="metric-label">温度</text>
            <text class="metric-value text-warning">42°C</text>
          </view>
        </view>
      </view>

      <!-- 储能电池 -->
      <view class="card device-card">
        <view class="device-header">
          <view class="device-icon-wrapper" style="background: #F0FDF4;">
            <text class="device-icon">🔋</text>
          </view>
          <view class="device-info">
            <text class="device-name">储能电池</text>
            <text class="device-model">200kWh LiFePO4</text>
          </view>
          <StatusBadge status="charging" size="small" />
        </view>

        <view class="battery-soc">
          <ProgressBar
            :percentage="energyData.batterySoc"
            theme="green"
            label="电量 (SOC)"
            :show-label="true"
            :animated="true"
            height="20rpx"
          />
        </view>

        <view class="device-metrics">
          <view class="metric">
            <text class="metric-label">充电功率</text>
            <text class="metric-value text-success">6.5kW</text>
          </view>
          <view class="metric">
            <text class="metric-label">健康度</text>
            <text class="metric-value text-primary">98%</text>
          </view>
          <view class="metric">
            <text class="metric-label">温度</text>
            <text class="metric-value text-warning">28°C</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 系统状态提示 -->
    <view class="alert-success">
      <text class="alert-icon">✓</text>
      <text class="alert-text">系统运行正常</text>
      <text class="alert-link" @click="goToAlarms">详情 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EnergyFlow from '@/components/business/energy-flow/index.vue'
import GradientCard from '@/components/common/gradient-card/index.vue'
import StatusBadge from '@/components/common/status-badge/index.vue'
import ProgressBar from '@/components/common/progress-bar/index.vue'

/**
 * 能量数据
 */
const energyData = ref({
  solarPower: 105.2,
  batteryPower: 6.5,
  loadPower: 98.7,
  gridPower: 0,
  batterySoc: 85
})

/**
 * 当前总功率
 */
const currentPower = computed(() => {
  return energyData.value.solarPower
})

/**
 * 电池状态样式类
 */
const batteryClass = computed(() => {
  if (energyData.value.batteryPower > 0) return 'text-success'
  if (energyData.value.batteryPower < 0) return 'text-warning'
  return ''
})

/**
 * 格式化功率显示
 */
const formatPower = (power: number): string => {
  return Math.abs(power).toFixed(1)
}

/**
 * 格式化储能功率
 */
const formatBatteryPower = (power: number): string => {
  if (power === 0) return '0.0'
  const sign = power > 0 ? '+' : '-'
  return `${sign}${Math.abs(power).toFixed(1)}`
}

/**
 * 模拟数据更新
 */
let updateInterval: number | null = null

const startDataUpdate = () => {
  updateInterval = setInterval(() => {
    // 模拟光伏功率波动
    energyData.value.solarPower = 105.2 + (Math.random() - 0.5) * 10
    // 模拟储能功率变化
    energyData.value.batteryPower = 6.5 + (Math.random() - 0.5) * 2
    // 模拟负载功率波动
    energyData.value.loadPower = 98.7 + (Math.random() - 0.5) * 5
    // 模拟SOC缓慢变化
    if (energyData.value.batteryPower > 0 && energyData.value.batterySoc < 100) {
      energyData.value.batterySoc += 0.1
    }
  }, 2000) as unknown as number
}

const stopDataUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

/**
 * 跳转到告警页面
 */
const goToAlarms = () => {
  uni.navigateTo({
    url: '/pages/alarm/list'
  })
}

onMounted(() => {
  startDataUpdate()
})

onUnmounted(() => {
  stopDataUpdate()
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.energy-monitor-page {
  min-height: 100vh;
  padding: 32rpx;
  padding-bottom: 120rpx;
  background: linear-gradient(180deg, #F0F9FF 0%, #F5F5F5 50%);
}

/* 状态栏 */
.status-bar {
  @include flex-between;
  margin-bottom: 32rpx;
}

.station-info {
  flex: 1;
}

.station-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.station-spec {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

/* 功率卡片 */
.power-card {
  margin-bottom: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(59, 130, 246, 0.2);
}

.power-display {
  text-align: center;
  margin-bottom: 32rpx;
}

.power-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
}

.power-value {
  display: block;
  font-size: 96rpx;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 8rpx;
}

.power-unit {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.power-grid {
  @include grid-3;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.power-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
}

.power-item-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.power-item-label {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 快速统计 */
.quick-stats {
  @include grid-3;
  gap: 16rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 能量流区域 */
.energy-flow-section {
  margin-bottom: 32rpx;
}

.section-header {
  @include flex-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

.realtime-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.realtime-text {
  font-size: 24rpx;
  color: #3B82F6;
}

/* 设备状态区域 */
.device-status-section {
  margin-bottom: 32rpx;
}

.device-card {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.device-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  @include flex-center;
  margin-right: 24rpx;
}

.device-icon {
  font-size: 40rpx;
}

.device-info {
  flex: 1;
}

.device-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4rpx;
}

.device-model {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

.battery-soc {
  margin-bottom: 24rpx;
}

.device-metrics {
  @include grid-3;
  gap: 16rpx;
}

.metric {
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 20rpx;
  color: #6B7280;
  margin-bottom: 8rpx;
}

.metric-value {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1F2937;
}

/* 告警提示 */
.alert-success {
  @include card;
  @include flex-between;
  background: #F0FDF4;
  border-left: 6rpx solid #10B981;
}

.alert-icon {
  font-size: 32rpx;
  color: #10B981;
  margin-right: 16rpx;
}

.alert-text {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
}

.alert-link {
  font-size: 28rpx;
  color: #10B981;
  font-weight: 600;
}
</style>
