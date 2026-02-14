<template>
  <view class="scan-page">
    <!-- 扫描控制 -->
    <view class="card scan-control">
      <view class="control-header">
        <text class="title">蓝牙设备扫描</text>
        <text v-if="bluetoothStore.discovering" class="scanning-tip">扫描中...</text>
      </view>

      <view class="control-buttons">
        <button
          v-if="!bluetoothStore.discovering"
          class="btn btn-primary"
          @click="startScan"
        >
          开始扫描
        </button>
        <button
          v-else
          class="btn btn-secondary"
          @click="stopScan"
        >
          停止扫描
        </button>
      </view>

      <view class="scan-tip">
        <text>请确保设备蓝牙已开启，数据棒处于可连接状态</text>
      </view>
    </view>

    <!-- 过滤和排序 -->
    <view class="card filter-section">
      <view class="filter-header">
        <text class="filter-title">智能过滤</text>
        <switch
          :checked="filterEnabled"
          @change="handleFilterChange"
          color="#1296db"
        />
      </view>
      <view v-if="filterEnabled" class="filter-info">
        <text class="filter-tip">仅显示逆变器相关设备</text>
        <text class="filter-count">已过滤: {{ filteredCount }} 台</text>
      </view>

      <view class="sort-buttons">
        <button
          class="btn-sort"
          :class="{ active: sortBy === 'rssi' }"
          @click="handleSort('rssi')"
        >
          按信号排序
        </button>
        <button
          class="btn-sort"
          :class="{ active: sortBy === 'name' }"
          @click="handleSort('name')"
        >
          按名称排序
        </button>
      </view>
    </view>

    <!-- 当前连接的设备 -->
    <view v-if="bluetoothStore.isConnected" class="card connected-device">
      <view class="card-title">当前连接</view>
      <view class="device-item connected">
        <view class="device-info">
          <view class="device-name">{{ bluetoothStore.connectedDevice?.name }}</view>
          <view class="device-id">{{ bluetoothStore.connectedDevice?.deviceId }}</view>
        </view>
        <view class="device-actions">
          <button class="btn-disconnect" @click="disconnect">断开</button>
        </view>
      </view>
    </view>

    <!-- 设备列表 -->
    <view class="card device-list">
      <view class="card-title">
        可用设备
        <text class="device-count">({{ displayDevices.length }})</text>
      </view>

      <view v-if="bluetoothStore.discoveredDevices.length === 0" class="empty-tip">
        <view class="empty-icon">📡</view>
        <view class="empty-text">
          {{ bluetoothStore.discovering ? '正在扫描设备...' : '暂无设备，请点击扫描' }}
        </view>
      </view>

      <view
        v-for="device in displayDevices"
        :key="device.deviceId"
        class="device-item"
        :class="{ recommended: isRecommended(device) }"
        @click="connectDevice(device)"
      >
        <view class="device-icon">
          {{ getDeviceIcon(device) }}
        </view>
        <view class="device-info">
          <view class="device-header">
            <view class="device-name">{{ device.name || '未知设备' }}</view>
            <view v-if="isRecommended(device)" class="recommend-badge">推荐</view>
          </view>
          <view class="device-id">{{ device.deviceId }}</view>
          <view class="device-meta">
            <view class="signal-bars">
              <view
                v-for="i in 4"
                :key="i"
                class="signal-bar"
                :class="{ active: i <= getSignalBars(device.RSSI) }"
              ></view>
            </view>
            <text class="rssi">{{ device.RSSI }} dBm ({{ getSignalStrength(device.RSSI) }})</text>
          </view>
        </view>
        <view class="device-actions">
          <view
            v-if="connectingDeviceId === device.deviceId"
            class="connecting-badge"
          >
            连接中...
          </view>
          <view v-else class="connect-icon">›</view>
        </view>
      </view>
    </view>

    <!-- 使用说明 */-->
    <view class="card help-section">
      <view class="card-title">使用说明</view>
      <view class="help-list">
        <view class="help-item">
          <text class="help-number">1</text>
          <text class="help-text">确保设备蓝牙已开启</text>
        </view>
        <view class="help-item">
          <text class="help-number">2</text>
          <text class="help-text">点击"开始扫描"搜索附近的设备</text>
        </view>
        <view class="help-item">
          <text class="help-number">3</text>
          <text class="help-text">选择要连接的设备，点击进行连接</text>
        </view>
        <view class="help-item">
          <text class="help-number">4</text>
          <text class="help-text">连接成功后返回首页查看实时数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import type { BluetoothDevice } from '@/types/bluetooth'
import { getRecommendedKeywords, isRecommendedDevice, getSignalPercentage } from '@/utils/device-filter'

const bluetoothStore = useBluetoothStore()
const connectingDeviceId = ref<string>('')
const filterEnabled = ref(false)
const sortBy = ref<'rssi' | 'name' | null>(null)

// 显示的设备列表
const displayDevices = computed(() => {
  let devices = filterEnabled.value
    ? bluetoothStore.filteredDevices
    : bluetoothStore.discoveredDevices

  // 应用排序
  if (sortBy.value === 'rssi') {
    devices = [...devices].sort((a, b) => b.RSSI - a.RSSI)
  } else if (sortBy.value === 'name') {
    devices = [...devices].sort((a, b) => {
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameA.localeCompare(nameB)
    })
  }

  return devices
})

// 过滤掉的设备数量
const filteredCount = computed(() => {
  return bluetoothStore.discoveredDevices.length - bluetoothStore.filteredDevices.length
})

/**
 * 开始扫描
 */
async function startScan() {
  uni.showLoading({
    title: '正在扫描...'
  })

  const result = await bluetoothStore.startScan()

  uni.hideLoading()

  if (!result.success) {
    uni.showToast({
      title: '扫描失败',
      icon: 'error'
    })
  }
}

/**
 * 停止扫描
 */
async function stopScan() {
  await bluetoothStore.stopScan()
}

/**
 * 连接设备
 */
async function connectDevice(device: BluetoothDevice) {
  if (bluetoothStore.isConnecting) {
    return
  }

  connectingDeviceId.value = device.deviceId

  uni.showLoading({
    title: '正在连接...'
  })

  const result = await bluetoothStore.connect(device.deviceId)

  uni.hideLoading()
  connectingDeviceId.value = ''

  if (result.success) {
    uni.showToast({
      title: '连接成功',
      icon: 'success'
    })

    // 延迟返回首页
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } else {
    uni.showToast({
      title: '连接失败',
      icon: 'error'
    })
  }
}

/**
 * 断开连接
 */
async function disconnect() {
  uni.showModal({
    title: '提示',
    content: '确定要断开连接吗？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '正在断开...'
        })

        await bluetoothStore.disconnect()

        uni.hideLoading()
        uni.showToast({
          title: '已断开连接',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 获取信号强度描述
 */
function getSignalStrength(rssi: number): string {
  if (rssi >= -50) return '强'
  if (rssi >= -70) return '中'
  return '弱'
}

/**
 * 过滤开关变化
 */
function handleFilterChange(e: any) {
  filterEnabled.value = e.detail.value

  if (filterEnabled.value) {
    const keywords = getRecommendedKeywords()
    bluetoothStore.applyFilter(keywords, -80)
  } else {
    bluetoothStore.clearFilter()
  }
}

/**
 * 排序
 */
function handleSort(type: 'rssi' | 'name') {
  sortBy.value = sortBy.value === type ? null : type
}

/**
 * 检查是否为推荐设备
 */
function isRecommended(device: BluetoothDevice): boolean {
  return isRecommendedDevice(device)
}

/**
 * 获取设备图标
 */
function getDeviceIcon(device: BluetoothDevice): string {
  const name = (device.name || '').toLowerCase()
  if (name.includes('inverter') || name.includes('逆变')) {
    return '⚡'
  }
  if (name.includes('solar') || name.includes('光伏')) {
    return '☀️'
  }
  if (name.includes('ble') || name.includes('蓝牙')) {
    return '📡'
  }
  return '📱'
}

/**
 * 获取信号条数
 */
function getSignalBars(rssi: number): number {
  const percentage = getSignalPercentage(rssi)
  if (percentage >= 75) return 4
  if (percentage >= 50) return 3
  if (percentage >= 25) return 2
  return 1
}
</script>

<style lang="scss" scoped>
.scan-page {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

/* 扫描控制 */
.scan-control {
  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }

    .scanning-tip {
      font-size: 24rpx;
      color: #1296db;
      animation: blink 1.5s infinite;
    }
  }

  .control-buttons {
    margin-bottom: 20rpx;

    .btn {
      width: 100%;
      padding: 24rpx;
      font-size: 32rpx;
    }
  }

  .scan-tip {
    padding: 20rpx;
    background-color: #fff7e6;
    border-left: 4rpx solid #faad14;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #666666;
    line-height: 1.6;
  }
}

/* 过滤和排序 */
.filter-section {
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .filter-title {
      font-size: 28rpx;
      color: #333333;
      font-weight: bold;
    }
  }

  .filter-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx;
    background-color: #fff7e6;
    border-radius: 8rpx;
    margin-bottom: 16rpx;

    .filter-tip {
      font-size: 24rpx;
      color: #faad14;
    }

    .filter-count {
      font-size: 24rpx;
      color: #999999;
    }
  }

  .sort-buttons {
    display: flex;
    gap: 12rpx;

    .btn-sort {
      flex: 1;
      padding: 16rpx;
      background-color: #f0f0f0;
      color: #666666;
      border-radius: 8rpx;
      font-size: 24rpx;
      transition: all 0.3s;

      &.active {
        background-color: #1296db;
        color: #ffffff;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}

/* 已连接设备 */
.connected-device {
  border: 2rpx solid #67C23A;

  .device-item {
    border: none;
    background-color: #f0f9ff;
  }
}

/* 设备列表 */
.device-list {
  .device-count {
    font-size: 24rpx;
    color: #999999;
    margin-left: 8rpx;
  }

  .empty-tip {
    text-align: center;
    padding: 80rpx 40rpx;

    .empty-icon {
      font-size: 100rpx;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }

  .device-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    margin-bottom: 16rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    transition: all 0.3s;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      background-color: #e8e8e8;
      transform: scale(0.98);
    }

    &.connected {
      background-color: #f0f9ff;
      border: 2rpx solid #1296db;
    }

    &.recommended {
      background-color: #e6f4ff;
      border: 2rpx solid #1296db;
    }

    .device-icon {
      flex-shrink: 0;
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1296db 0%, #409EFF 100%);
      border-radius: 12rpx;
      font-size: 40rpx;
      margin-right: 16rpx;
    }

    .device-info {
      flex: 1;

      .device-header {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 8rpx;

        .device-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
        }

        .recommend-badge {
          padding: 4rpx 12rpx;
          background-color: #1296db;
          color: #ffffff;
          border-radius: 8rpx;
          font-size: 20rpx;
        }
      }

      .device-id {
        font-size: 24rpx;
        color: #999999;
        margin-bottom: 8rpx;
      }

      .device-meta {
        display: flex;
        align-items: center;
        gap: 12rpx;
        font-size: 24rpx;
        color: #666666;

        .signal-bars {
          display: flex;
          gap: 4rpx;
          align-items: flex-end;

          .signal-bar {
            width: 6rpx;
            background-color: #e0e0e0;
            border-radius: 2rpx;

            &:nth-child(1) { height: 12rpx; }
            &:nth-child(2) { height: 18rpx; }
            &:nth-child(3) { height: 24rpx; }
            &:nth-child(4) { height: 30rpx; }

            &.active {
              background-color: #67c23a;
            }
          }
        }

        .rssi {
          font-size: 22rpx;
        }
      }
    }

    .device-actions {
      .connecting-badge {
        padding: 8rpx 20rpx;
        background-color: #1296db;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 24rpx;
        animation: pulse 1.5s infinite;
      }

      .connect-icon {
        font-size: 48rpx;
        color: #1296db;
      }

      .btn-disconnect {
        padding: 8rpx 24rpx;
        background-color: #F56C6C;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 24rpx;
      }
    }
  }
}

/* 帮助说明 */
.help-section {
  .help-list {
    .help-item {
      display: flex;
      align-items: flex-start;
      padding: 16rpx 0;
      gap: 20rpx;

      .help-number {
        flex-shrink: 0;
        width: 44rpx;
        height: 44rpx;
        line-height: 44rpx;
        text-align: center;
        background-color: #1296db;
        color: #ffffff;
        border-radius: 50%;
        font-size: 24rpx;
        font-weight: bold;
      }

      .help-text {
        flex: 1;
        font-size: 28rpx;
        color: #666666;
        line-height: 1.6;
      }
    }
  }
}

/* 动画 */
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
