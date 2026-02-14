<template>
  <view class="monitor-page">
    <!-- 设备状态卡片 -->
    <view class="card device-status-card">
      <view class="status-header">
        <view class="device-name">{{ deviceStore.deviceInfo.name }}</view>
        <view
          class="status-badge"
          :class="`status-${deviceStore.deviceStatus}`"
        >
          {{ formatDeviceStatus(deviceStore.deviceStatus) }}
        </view>
      </view>

      <view class="status-info">
        <view class="info-item">
          <text class="label">型号</text>
          <text class="value">{{ deviceStore.deviceInfo.model }}</text>
        </view>
        <view class="info-item">
          <text class="label">序列号</text>
          <text class="value">{{ deviceStore.deviceInfo.serialNumber }}</text>
        </view>
        <view class="info-item">
          <text class="label">固件版本</text>
          <text class="value">{{ deviceStore.deviceInfo.firmwareVersion }}</text>
        </view>
      </view>

      <!-- 蓝牙连接状态 -->
      <view class="bluetooth-status">
        <view v-if="bluetoothStore.isConnected" class="connected">
          <text class="icon">●</text>
          <text>已连接: {{ bluetoothStore.connectedDevice?.name }}</text>
        </view>
        <view v-else class="disconnected">
          <text class="icon">○</text>
          <text>未连接</text>
          <button class="connect-btn" @click="goToScan">连接设备</button>
        </view>
      </view>
    </view>

    <!-- Hero Section - 渐变背景区域 -->
    <view v-if="bluetoothStore.isConnected && realtimeData" class="hero-section">
      <!-- 装饰性背景圆 -->
      <view class="bg-circle-1"></view>
      <view class="bg-circle-2"></view>

      <view class="hero-content">
        <!-- 电站信息 -->
        <view class="station-info">
          <view class="station-main">
            <text class="station-label">当前电站</text>
            <text class="station-name">工业园区1号站</text>
            <text class="station-desc">125kW · 并网运行</text>
          </view>
          <view class="status-badge success">
            <view class="dot pulse"></view>
            <text>正常</text>
          </view>
        </view>

        <!-- 实时功率大卡片 - 毛玻璃效果 -->
        <view class="power-card glass">
          <view class="power-display">
            <text class="power-label">实时功率</text>
            <view class="power-value-wrapper">
              <text class="power-value">{{ formatPower(realtimeData.acPower) }}</text>
            </view>
            <text class="power-unit">kW</text>
          </view>

          <!-- 三列快速统计 -->
          <view class="quick-stats">
            <view class="stat-item">
              <text class="stat-value">{{ formatPower(realtimeData.dcPower) }}</text>
              <text class="stat-label">光伏</text>
            </view>
            <view class="stat-item">
              <text class="stat-value success">-6.5kW</text>
              <text class="stat-label">储能充电</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">0kW</text>
              <text class="stat-label">电网</text>
            </view>
          </view>
        </view>

        <!-- 三列关键指标 -->
        <view class="key-metrics-hero">
          <view class="metric-item">
            <text class="metric-value">{{ formatEnergy(realtimeData.todayEnergy) }}</text>
            <text class="metric-label">今日发电 kWh</text>
          </view>
          <view class="metric-item">
            <text class="metric-value">{{ meterStore.todayConsumption.toFixed(1) }}</text>
            <text class="metric-label">今日用电 kWh</text>
          </view>
          <view class="metric-item" @click="goToMeterPage">
            <text class="metric-value">{{ meterStore.currentPower.toFixed(1) }}</text>
            <text class="metric-label">实时用电 kW</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 如果未连接设备，显示提示 -->
    <view v-if="!bluetoothStore.isConnected" class="card connect-tip">
      <view class="tip-icon">📱</view>
      <view class="tip-text">请先连接设备以查看实时数据</view>
      <button class="btn btn-primary" @click="goToScan">扫描设备</button>
    </view>

    <!-- 收益卡片 -->
    <revenue-card
      v-if="bluetoothStore.isConnected && realtimeData"
      :revenue="revenueStore.todayRevenue"
      :today-energy="revenueStore.todayEnergy"
      :self-use-rate="revenueStore.selfUseRate"
      :trend="revenueStore.revenueTrend"
      :change-rate="revenueStore.revenueOverview.changeRate"
      @detail="goToRevenuePage"
    />

    <!-- 实时数据显示 -->
    <template v-if="bluetoothStore.isConnected && realtimeData">
      <!-- 能量流可视化区域 -->
      <view class="energy-flow-section">
        <view class="section-header">
          <text class="section-title">实时能量流</text>
          <view class="live-indicator">
            <view class="dot pulse"></view>
            <text>实时</text>
          </view>
        </view>

        <!-- 能量流示意图 -->
        <view class="energy-flow-diagram">
          <view class="energy-node solar">
            <view class="node-icon">☀️</view>
            <text class="node-value">{{ formatPower(realtimeData.dcPower) }}</text>
            <text class="node-label">光伏</text>
          </view>

          <view class="energy-node battery">
            <view class="node-icon">🔋</view>
            <text class="node-value">6.5kW</text>
            <text class="node-label">储能充电</text>
          </view>

          <view class="energy-node load">
            <view class="node-icon">⚡</view>
            <text class="node-value">{{ formatPower(realtimeData.acPower) }}</text>
            <text class="node-label">负载</text>
          </view>

          <view class="energy-node grid">
            <view class="node-icon">🔌</view>
            <text class="node-value">0kW</text>
            <text class="node-label">电网</text>
          </view>
        </view>
      </view>

      <view class="content-wrapper">
      <!-- 关键指标 -->
      <view class="card key-metrics">
        <view class="metric-grid">
          <view class="metric-item highlight">
            <view class="metric-value">{{ formatPower(realtimeData.acPower) }}</view>
            <view class="metric-label">当前功率</view>
          </view>
          <view class="metric-item">
            <view class="metric-value">{{ formatEnergy(realtimeData.todayEnergy) }}</view>
            <view class="metric-label">今日发电</view>
          </view>
          <view class="metric-item">
            <view class="metric-value">{{ formatEfficiency(realtimeData.efficiency) }}</view>
            <view class="metric-label">运行效率</view>
          </view>
          <view class="metric-item">
            <view class="metric-value">{{ formatTemperature(realtimeData.temperature) }}</view>
            <view class="metric-label">设备温度</view>
          </view>
        </view>
      </view>

      <!-- 直流侧数据 -->
      <view class="card">
        <view class="card-title">直流侧数据</view>
        <view class="data-list">
          <view class="data-item">
            <text class="data-label">直流电压</text>
            <text class="data-value">{{ formatVoltage(realtimeData.dcVoltage) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">直流电流</text>
            <text class="data-value">{{ formatCurrent(realtimeData.dcCurrent) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">直流功率</text>
            <text class="data-value">{{ formatPower(realtimeData.dcPower) }}</text>
          </view>
        </view>
      </view>

      <!-- 交流侧数据 -->
      <view class="card">
        <view class="card-title">交流侧数据</view>
        <view class="data-list">
          <view class="data-item">
            <text class="data-label">A相电压</text>
            <text class="data-value">{{ formatVoltage(realtimeData.acVoltageA) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">A相电流</text>
            <text class="data-value">{{ formatCurrent(realtimeData.acCurrentA) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">B相电压</text>
            <text class="data-value">{{ formatVoltage(realtimeData.acVoltageB) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">B相电流</text>
            <text class="data-value">{{ formatCurrent(realtimeData.acCurrentB) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">C相电压</text>
            <text class="data-value">{{ formatVoltage(realtimeData.acVoltageC) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">C相电流</text>
            <text class="data-value">{{ formatCurrent(realtimeData.acCurrentC) }}</text>
          </view>
          <view class="data-item">
            <text class="data-label">电网频率</text>
            <text class="data-value">{{ formatFrequency(realtimeData.acFrequency) }}</text>
          </view>
        </view>
      </view>

      <!-- 累计发电量 -->
      <view class="card">
        <view class="card-title">发电统计</view>
        <view class="energy-stats">
          <view class="energy-item">
            <view class="energy-label">今日发电</view>
            <view class="energy-value primary">{{ formatEnergy(realtimeData.todayEnergy) }}</view>
          </view>
          <view class="energy-item">
            <view class="energy-label">累计发电</view>
            <view class="energy-value">{{ formatEnergy(realtimeData.totalEnergy) }}</view>
          </view>
        </view>
      </view>

      <!-- 快速访问 -->
      <view class="card quick-access">
        <view class="card-title">快速访问</view>
        <view class="access-grid">
          <view class="access-item" @click="goToDeviceDetail">
            <view class="access-icon">📱</view>
            <text class="access-label">设备详情</text>
            <text class="access-arrow">›</text>
          </view>
          <view class="access-item" @click="goToPVStrings">
            <view class="access-icon">☀️</view>
            <text class="access-label">组串监控</text>
            <text class="access-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 功率曲线 -->
      <view class="card">
        <view class="card-title">功率曲线（最近12小时）</view>
        <view class="chart-placeholder">
          <view class="placeholder-icon">📊</view>
          <view class="placeholder-text">图表功能开发中</view>
          <view class="placeholder-tip">稍后将提供完整的功率曲线展示</view>
        </view>
        <!-- 图表组件暂时禁用（需要lime-echart依赖）
        <view class="chart-container">
          <l-echart ref="chartRef" @finished="initChart"></l-echart>
        </view>
        -->
      </view>

      <!-- 更新时间 -->
      <view class="update-time">
        <text>更新时间: {{ formatDateTime(realtimeData.timestamp) }}</text>
      </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'
import { useRevenueStore } from '@/store/modules/revenue'
import { useMeterStore } from '@/store/modules/meter'
import RevenueCard from '@/components/business/revenue-card/index.vue'
import {
  formatPower,
  formatEnergy,
  formatVoltage,
  formatCurrent,
  formatTemperature,
  formatFrequency,
  formatEfficiency,
  formatDeviceStatus,
  formatDateTime
} from '@/utils/format'

// 常量定义
const METER_UPDATE_INTERVAL_MS = 5000

const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()
const revenueStore = useRevenueStore()
const meterStore = useMeterStore()

// 实时数据
const realtimeData = computed(() => deviceStore.realtimeData)

// 定时器引用
let meterUpdateInterval: number | null = null

/**
 * 跳转到设备详情页
 */
function goToDeviceDetail() {
  uni.navigateTo({
    url: '/pages/device/detail',
    fail: (err) => {
      console.error('Navigation to device detail failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

/**
 * 跳转到光伏组串监控页
 */
function goToPVStrings() {
  uni.navigateTo({
    url: '/pages/device/pv-strings',
    fail: (err) => {
      console.error('Navigation to PV strings failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

/**
 * 跳转到扫描页面
 */
function goToScan() {
  uni.navigateTo({
    url: '/pages/bluetooth/scan',
    fail: (err) => {
      console.error('Navigation to scan failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

/**
 * 跳转到收益页面
 */
function goToRevenuePage() {
  uni.navigateTo({
    url: '/pages/revenue/index',
    fail: (err) => {
      console.error('Navigation to revenue failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

/**
 * 前往电表监控页面
 */
function goToMeterPage() {
  uni.navigateTo({
    url: '/pages/meter/index',
    fail: (err) => {
      console.error('Navigation to meter failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

/**
 * 清理定时器和资源
 */
function cleanup() {
  if (meterUpdateInterval !== null) {
    clearInterval(meterUpdateInterval)
    meterUpdateInterval = null
  }
}

// 初始化收益数据
onMounted(() => {
  // 先清理旧的定时器（防止重复挂载）
  cleanup()
  
  revenueStore.init()
  meterStore.init()
  
  // 定时更新电表数据
  meterUpdateInterval = setInterval(() => {
    meterStore.updateRealtimeData()
    meterStore.updateEnergyBalance()
  }, METER_UPDATE_INTERVAL_MS) as unknown as number
})

// 使用 onBeforeUnmount 确保一定执行
onBeforeUnmount(() => {
  cleanup()
})
</script>

<style lang="scss" scoped>
.monitor-page {
  padding: 0;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

/* 设备状态卡片 */
.device-status-card {
  margin: 20rpx;
  margin-bottom: 0;
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }

  .device-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
  }

  .status-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 16rpx 0;
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
      }
    }
  }

  .bluetooth-status {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;

    .connected,
    .disconnected {
      display: flex;
      align-items: center;
      font-size: 28rpx;

      .icon {
        margin-right: 12rpx;
      }
    }

    .connected {
      color: #67C23A;
    }

    .disconnected {
      color: #909399;

      .connect-btn {
        margin-left: auto;
        padding: 8rpx 24rpx;
        background-color: #1296db;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 24rpx;
      }
    }
  }
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #6366f1 100%);
  padding: 32rpx;
  padding-bottom: 160rpx;
  overflow: hidden;

  /* 装饰性背景圆 */
  .bg-circle-1 {
    position: absolute;
    top: -100rpx;
    right: -120rpx;
    width: 400rpx;
    height: 400rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  .bg-circle-2 {
    position: absolute;
    bottom: -80rpx;
    left: -80rpx;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }
}

/* 电站信息 */
.station-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48rpx;

  .station-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 8rpx;
  }

  .station-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    display: block;
    margin-bottom: 8rpx;
  }

  .station-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20rpx);
  border-radius: 48rpx;
  font-size: 24rpx;
  color: #ffffff;

  .dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #10b981;

    &.pulse {
      animation: pulse 2s ease-in-out infinite;
    }
  }
}

/* 实时功率卡片 - 毛玻璃 */
.power-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;

  .power-display {
    text-align: center;
    margin-bottom: 32rpx;
  }

  .power-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 16rpx;
  }

  .power-value {
    font-size: 120rpx;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
  }

  .power-unit {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    display: block;
    margin-top: 8rpx;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;

    .stat-item {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16rpx;
      padding: 16rpx;
      text-align: center;

      .stat-value {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 4rpx;

        &.success {
          color: #10b981;
        }
      }

      .stat-label {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

/* 关键指标 Hero */
.key-metrics-hero {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .metric-item {
    text-align: center;

    .metric-value {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 8rpx;
    }

    .metric-label {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 能量流可视化区域 */
.energy-flow-section {
  padding: 32rpx 20rpx;
  background: #ffffff;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: #10b981;

      .dot {
        width: 10rpx;
        height: 10rpx;
        border-radius: 50%;
        background: #10b981;

        &.pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      }
    }
  }

  .energy-flow-diagram {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .energy-node {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 20rpx;
      padding: 32rpx;
      text-align: center;
      position: relative;

      &.solar {
        background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
      }

      &.battery {
        background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
      }

      &.load {
        background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%);
      }

      &.grid {
        background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
      }

      .node-icon {
        font-size: 60rpx;
        margin-bottom: 16rpx;
      }

      .node-value {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }

      .node-label {
        display: block;
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}

/* 内容包裹器 */
.content-wrapper {
  padding: 0 20rpx;
}

/* 连接提示 */
.connect-tip {
  text-align: center;
  padding: 60rpx 40rpx;
  margin: 20rpx;

  .tip-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .tip-text {
    font-size: 28rpx;
    color: #666666;
    margin-bottom: 40rpx;
  }

  .btn {
    width: 60%;
    margin: 0 auto;
  }
}

/* 关键指标 */
.key-metrics {
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }

  .metric-item {
    text-align: center;
    padding: 30rpx 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;

    &.highlight {
      background: linear-gradient(135deg, #1296db, #4db8ff);
      color: #ffffff;

      .metric-label {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .metric-value {
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .metric-label {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 数据列表 */
.data-list {
  .data-item {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .data-label {
      color: #666666;
      font-size: 28rpx;
    }

    .data-value {
      color: #333333;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
}

/* 发电统计 */
.energy-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .energy-item {
    text-align: center;
    padding: 30rpx 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;

    .energy-label {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 12rpx;
    }

    .energy-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;

      &.primary {
        color: #1296db;
      }
    }
  }
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 500rpx;
}

/* 更新时间 */
.update-time {
  text-align: center;
  padding: 20rpx;
  color: #999999;
  font-size: 24rpx;
}

/* 图表占位符 */
.chart-placeholder {
  text-align: center;
  padding: 100rpx 40rpx;

  .placeholder-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .placeholder-text {
    font-size: 32rpx;
    color: #666666;
    margin-bottom: 10rpx;
    font-weight: bold;
  }

  .placeholder-tip {
    font-size: 24rpx;
    color: #999999;
  }
}

/* 快速访问 */
.quick-access {
  .access-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .access-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32rpx 20rpx;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 16rpx;
    position: relative;
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
      background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    }

    .access-icon {
      font-size: 56rpx;
      margin-bottom: 12rpx;
    }

    .access-label {
      font-size: 28rpx;
      color: #333333;
      font-weight: 500;
    }

    .access-arrow {
      position: absolute;
      top: 12rpx;
      right: 16rpx;
      font-size: 32rpx;
      color: #2563eb;
    }
  }
}
</style>
