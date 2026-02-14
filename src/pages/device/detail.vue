<template>
  <view class="device-detail-page">
    <!-- Header区域 - 渐变背景 -->
    <view class="header-section">
      <view class="nav-bar">
        <button class="nav-btn" @click="goBack">←</button>
        <text class="nav-title">{{ deviceDetail?.name || '设备详情' }}</text>
        <button class="nav-btn">⋯</button>
      </view>

      <view class="status-cards">
        <view class="status-card">
          <text class="label">通信状态</text>
          <view class="status">
            <view class="dot pulse" :class="{ active: deviceDetail?.communicationStatus === 'connected' }"></view>
            <text>{{ formatCommunicationStatus(deviceDetail?.communicationStatus) }}</text>
          </view>
        </view>
        <view class="status-card">
          <text class="label">运行状态</text>
          <view class="status">
            <view class="dot pulse" :class="{ active: deviceDetail?.runningStatus === 'grid-connected' }"></view>
            <text>{{ formatRunningStatus(deviceDetail?.runningStatus) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 实时参数卡片 -->
    <view class="params-card">
      <text class="card-title">实时参数</text>
      <view class="params-grid">
        <view class="param-item">
          <text class="label">额定功率</text>
          <text class="value">{{ deviceDetail?.ratedPower || 0 }}</text>
          <text class="unit">kW</text>
        </view>
        <view class="param-item">
          <text class="label">有功功率</text>
          <text class="value">{{ deviceDetail?.activePower || 0 }}</text>
          <text class="unit">kW</text>
        </view>
        <view class="param-item">
          <text class="label">无功功率</text>
          <text class="value">{{ deviceDetail?.reactivePower || 0 }}</text>
          <text class="unit">kVar</text>
        </view>
        <view class="param-item">
          <text class="label">效率</text>
          <text class="value">{{ deviceDetail?.efficiency || 0 }}</text>
          <text class="unit">%</text>
        </view>
      </view>
    </view>

    <!-- PV侧参数 -->
    <view class="params-card">
      <text class="card-title">光伏侧参数</text>
      <view class="param-list">
        <view class="param-row">
          <text class="label">PV电压</text>
          <text class="value">{{ deviceDetail?.pvVoltage || 0 }} V</text>
        </view>
        <view class="param-row">
          <text class="label">PV电流</text>
          <text class="value">{{ deviceDetail?.pvCurrent || 0 }} A</text>
        </view>
        <view class="param-row">
          <text class="label">PV功率</text>
          <text class="value highlight">{{ deviceDetail?.pvPower || 0 }} kW</text>
        </view>
        <view class="param-row">
          <text class="label">MPPT效率</text>
          <text class="value success">{{ deviceDetail?.mpptEfficiency || 0 }}%</text>
        </view>
      </view>
    </view>

    <!-- 电网侧参数 -->
    <view class="params-card">
      <text class="card-title">电网侧参数</text>
      <view class="param-list">
        <view class="param-row">
          <text class="label">A相电压</text>
          <text class="value">{{ deviceDetail?.acVoltageA || 0 }} V</text>
        </view>
        <view class="param-row">
          <text class="label">B相电压</text>
          <text class="value">{{ deviceDetail?.acVoltageB || 0 }} V</text>
        </view>
        <view class="param-row">
          <text class="label">C相电压</text>
          <text class="value">{{ deviceDetail?.acVoltageC || 0 }} V</text>
        </view>
        <view class="param-row">
          <text class="label">频率</text>
          <text class="value primary">{{ deviceDetail?.acFrequency || 0 }} Hz</text>
        </view>
        <view class="param-row">
          <text class="label">功率因数</text>
          <text class="value success">{{ deviceDetail?.powerFactor || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 其他参数 -->
    <view class="params-card">
      <text class="card-title">其他参数</text>
      <view class="param-list">
        <view class="param-row">
          <text class="label">内部温度</text>
          <text class="value" :class="{ warning: (deviceDetail?.temperature || 0) > 40 }">
            {{ deviceDetail?.temperature || 0 }}°C
          </text>
        </view>
        <view class="param-row">
          <text class="label">散热器温度</text>
          <text class="value" :class="{ warning: (deviceDetail?.heatsinkTemperature || 0) > 35 }">
            {{ deviceDetail?.heatsinkTemperature || 0 }}°C
          </text>
        </view>
        <view class="param-row">
          <text class="label">今日发电量</text>
          <text class="value success">{{ deviceDetail?.todayEnergy || 0 }} kWh</text>
        </view>
        <view class="param-row">
          <text class="label">累计发电量</text>
          <text class="value primary">{{ formatNumber(deviceDetail?.totalEnergy || 0) }} kWh</text>
        </view>
        <view class="param-row">
          <text class="label">运行时间</text>
          <text class="value">{{ deviceDetail?.runningDays || 0 }} 天</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn-primary" @click="handleSettings">⚙️ 参数设置</button>
      <button class="btn-secondary" @click="handleViewLogs">📋 查看日志</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DeviceDetail } from '@/types/device-detail'
import { getDeviceDetail } from '@/mock/device/detail'

// 设备详情数据
const deviceDetail = ref<DeviceDetail | null>(null)

// 格式化通信状态
function formatCommunicationStatus(status?: string): string {
  const map: Record<string, string> = {
    connected: '连接成功',
    disconnected: '连接断开'
  }
  return map[status || ''] || '未知'
}

// 格式化运行状态
function formatRunningStatus(status?: string): string {
  const map: Record<string, string> = {
    'grid-connected': '并网运行',
    'off-grid': '离网运行',
    'standby': '待机'
  }
  return map[status || ''] || '未知'
}

// 格式化数字(添加千分位)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 参数设置
function handleSettings() {
  uni.showToast({
    title: '参数设置功能开发中',
    icon: 'none'
  })
}

// 查看日志
function handleViewLogs() {
  uni.showToast({
    title: '日志功能开发中',
    icon: 'none'
  })
}

// 加载设备详情
async function loadDeviceDetail() {
  try {
    uni.showLoading({ title: '加载中...' })
    deviceDetail.value = await getDeviceDetail()
  } catch (error) {
    console.error('加载设备详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadDeviceDetail()
})
</script>

<style lang="scss" scoped>
.device-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* Header区域 */
.header-section {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  padding: 20rpx 32rpx 40rpx;
  border-radius: 0 0 48rpx 48rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  margin-bottom: 32rpx;

  .nav-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: #ffffff;
    font-size: 40rpx;
    line-height: 1;
    padding: 0;
    margin: 0;

    &:active {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &::after {
      border: none;
    }
  }

  .nav-title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.status-cards {
  display: flex;
  gap: 24rpx;
}

.status-card {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 24rpx;
  border-radius: 24rpx;

  .label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16rpx;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #ffffff;
  }

  .dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);

    &.pulse.active {
      background-color: #52c41a;
      animation: pulse 2s infinite;
    }
  }
}

/* 参数卡片 */
.params-card {
  background-color: #ffffff;
  margin: 24rpx 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .card-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 24rpx;
  }
}

/* 参数网格 */
.params-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.param-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .label {
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 12rpx;
  }

  .value {
    font-size: 48rpx;
    font-weight: bold;
    color: #333333;
    line-height: 1.2;
  }

  .unit {
    font-size: 24rpx;
    color: #666666;
    margin-top: 4rpx;
  }
}

/* 参数列表 */
.param-list {
  .param-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 28rpx;
      color: #666666;
    }

    .value {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;

      &.primary {
        color: #2563eb;
      }

      &.success {
        color: #52c41a;
      }

      &.warning {
        color: #faad14;
      }

      &.highlight {
        color: #4f46e5;
        font-weight: bold;
      }
    }
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx;
  margin-top: 24rpx;

  button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 16rpx;
    font-size: 28rpx;
    font-weight: 500;

    &::after {
      border: none;
    }
  }

  .btn-primary {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #ffffff;

    &:active {
      opacity: 0.8;
    }
  }

  .btn-secondary {
    background-color: #ffffff;
    color: #333333;
    border: 2rpx solid #e0e0e0;

    &:active {
      background-color: #f5f5f5;
    }
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}
</style>
