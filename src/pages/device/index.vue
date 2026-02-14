<template>
  <view class="device-page">
    <!-- 设备信息卡片 -->
    <view class="card device-info-card">
      <view class="card-title">设备信息</view>

      <view class="info-list">
        <view class="info-item">
          <text class="label">设备名称</text>
          <text class="value">{{ deviceStore.deviceInfo.name }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备型号</text>
          <text class="value">{{ deviceStore.deviceInfo.model }}</text>
        </view>
        <view class="info-item">
          <text class="label">序列号</text>
          <text class="value">{{ deviceStore.deviceInfo.serialNumber }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备类型</text>
          <text class="value">{{ formatDeviceType(deviceStore.deviceInfo.type) }}</text>
        </view>
        <view class="info-item">
          <text class="label">固件版本</text>
          <text class="value">{{ deviceStore.deviceInfo.firmwareVersion }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备状态</text>
          <view
            class="status-badge"
            :style="{ backgroundColor: getStatusColor(deviceStore.deviceStatus) }"
          >
            {{ formatDeviceStatus(deviceStore.deviceStatus) }}
          </view>
        </view>
        <view class="info-item">
          <text class="label">最后更新</text>
          <text class="value">
            {{ deviceStore.deviceInfo.lastUpdateTime > 0
              ? formatDateTime(deviceStore.deviceInfo.lastUpdateTime)
              : '从未更新'
            }}
          </text>
        </view>
      </view>
    </view>

    <!-- 连接管理 -->
    <view class="card connection-card">
      <view class="card-title">连接管理</view>

      <view class="connection-status">
        <view class="status-row">
          <text class="label">蓝牙状态</text>
          <view class="status-value">
            <text
              class="status-dot"
              :class="{ active: bluetoothStore.initialized }"
            ></text>
            <text>{{ bluetoothStore.initialized ? '已初始化' : '未初始化' }}</text>
          </view>
        </view>

        <view class="status-row">
          <text class="label">连接状态</text>
          <view class="status-value">
            <text
              class="status-dot"
              :class="{ active: bluetoothStore.isConnected }"
            ></text>
            <text>{{ getConnectionStatusText() }}</text>
          </view>
        </view>

        <view v-if="bluetoothStore.connectedDevice" class="status-row">
          <text class="label">已连接设备</text>
          <text class="value">{{ bluetoothStore.connectedDevice.name }}</text>
        </view>
      </view>

      <view class="connection-actions">
        <button
          v-if="!bluetoothStore.isConnected"
          class="btn btn-primary"
          @click="goToScan"
        >
          连接设备
        </button>
        <button
          v-else
          class="btn btn-secondary"
          @click="handleDisconnect"
        >
          断开连接
        </button>
      </view>
    </view>

    <!-- 报警统计 -->
    <view class="card alarm-card">
      <view class="card-title">
        报警统计
        <text class="alarm-count">{{ deviceStore.alarms.length }} 条</text>
      </view>

      <view class="alarm-stats">
        <view class="stat-item">
          <view class="stat-value">{{ unresolvedAlarms }}</view>
          <view class="stat-label">未处理</view>
        </view>
        <view class="stat-item">
          <view class="stat-value resolved">{{ resolvedAlarms }}</view>
          <view class="stat-label">已处理</view>
        </view>
      </view>

      <button class="btn btn-secondary" @click="goToAlarmList">
        查看报警记录
      </button>
    </view>

    <!-- 设备操作 -->
    <view class="card operation-card">
      <view class="card-title">设备操作</view>

      <view class="operation-list">
        <view class="operation-item" @click="goToDeviceList">
          <view class="operation-icon">📱</view>
          <view class="operation-info">
            <view class="operation-name">设备管理</view>
            <view class="operation-desc">添加、编辑或删除设备</view>
          </view>
          <view class="operation-arrow">›</view>
        </view>

        <view class="operation-item" @click="handleRefresh">
          <view class="operation-icon">🔄</view>
          <view class="operation-info">
            <view class="operation-name">刷新数据</view>
            <view class="operation-desc">重新获取设备数据</view>
          </view>
          <view class="operation-arrow">›</view>
        </view>

        <view class="operation-item" @click="handleClearAlarms">
          <view class="operation-icon">🗑️</view>
          <view class="operation-info">
            <view class="operation-name">清空报警</view>
            <view class="operation-desc">清除所有报警记录</view>
          </view>
          <view class="operation-arrow">›</view>
        </view>

        <view class="operation-item" @click="handleReset">
          <view class="operation-icon">⚠️</view>
          <view class="operation-info">
            <view class="operation-name">重置数据</view>
            <view class="operation-desc">清空所有设备数据</view>
          </view>
          <view class="operation-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="card about-card">
      <view class="card-title">关于</view>
      <view class="about-info">
        <view class="info-row">
          <text class="label">应用版本</text>
          <text class="value">{{ appStore.appVersion }}</text>
        </view>
        <view class="info-row">
          <text class="label">开发模式</text>
          <text class="value">Mock数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'
import { useAppStore } from '@/store/modules/app'
import { formatDeviceStatus, formatDateTime, getStatusColor } from '@/utils/format'

const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()
const appStore = useAppStore()

// 未处理报警数
const unresolvedAlarms = computed(() =>
  deviceStore.alarms.filter(a => !a.resolved).length
)

// 已处理报警数
const resolvedAlarms = computed(() =>
  deviceStore.alarms.filter(a => a.resolved).length
)

/**
 * 格式化设备类型
 */
function formatDeviceType(type: string): string {
  const typeMap: Record<string, string> = {
    inverter: '逆变器',
    dataStick: '数据棒'
  }
  return typeMap[type] || type
}

/**
 * 获取连接状态文本
 */
function getConnectionStatusText(): string {
  const statusMap: Record<string, string> = {
    disconnected: '未连接',
    connecting: '连接中',
    connected: '已连接',
    disconnecting: '断开中'
  }
  return statusMap[bluetoothStore.connectionStatus] || '未知'
}

/**
 * 跳转到扫描页面
 */
function goToScan() {
  uni.navigateTo({
    url: '/pages/bluetooth/scan'
  })
}

/**
 * 跳转到报警列表
 */
function goToAlarmList() {
  uni.navigateTo({
    url: '/pages/alarm/list'
  })
}

/**
 * 跳转到设备列表
 */
function goToDeviceList() {
  uni.navigateTo({
    url: '/pages/device/list'
  })
}

/**
 * 断开连接
 */
function handleDisconnect() {
  uni.showModal({
    title: '提示',
    content: '确定要断开连接吗？',
    success: async (res) => {
      if (res.confirm) {
        await bluetoothStore.disconnect()
        uni.showToast({
          title: '已断开连接',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 刷新数据
 */
function handleRefresh() {
  if (!bluetoothStore.isConnected) {
    uni.showToast({
      title: '请先连接设备',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '数据刷新中',
    icon: 'loading'
  })

  setTimeout(() => {
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

/**
 * 清空报警
 */
function handleClearAlarms() {
  if (deviceStore.alarms.length === 0) {
    uni.showToast({
      title: '暂无报警记录',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '提示',
    content: '确定要清空所有报警记录吗？',
    success: (res) => {
      if (res.confirm) {
        deviceStore.clearAlarms()
        uni.showToast({
          title: '已清空',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 重置数据
 */
function handleReset() {
  uni.showModal({
    title: '警告',
    content: '此操作将清空所有设备数据，确定继续吗？',
    confirmColor: '#F56C6C',
    success: (res) => {
      if (res.confirm) {
        deviceStore.reset()
        uni.showToast({
          title: '已重置',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.device-page {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

/* 信息列表 */
.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
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
      font-weight: 500;
    }
  }
}

/* 连接状态 */
.connection-card {
  .connection-status {
    margin-bottom: 24rpx;

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
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

      .status-value {
        display: flex;
        align-items: center;
        gap: 12rpx;
        font-size: 28rpx;
        color: #666666;
      }

      .status-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background-color: #d9d9d9;

        &.active {
          background-color: #52c41a;
          animation: blink 2s infinite;
        }
      }
    }
  }

  .connection-actions {
    .btn {
      width: 100%;
      padding: 24rpx;
      font-size: 32rpx;
    }
  }
}

/* 报警统计 */
.alarm-card {
  .alarm-count {
    font-size: 24rpx;
    color: #999999;
    margin-left: 8rpx;
  }

  .alarm-stats {
    display: flex;
    gap: 20rpx;
    margin: 24rpx 0;

    .stat-item {
      flex: 1;
      text-align: center;
      padding: 30rpx 20rpx;
      background-color: #fff7e6;
      border-radius: 12rpx;

      .stat-value {
        font-size: 48rpx;
        font-weight: bold;
        color: #faad14;
        margin-bottom: 8rpx;

        &.resolved {
          color: #52c41a;
        }
      }

      .stat-label {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }

  .btn {
    width: 100%;
    padding: 24rpx;
    font-size: 28rpx;
  }
}

/* 操作列表 */
.operation-list {
  .operation-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    transition: all 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f8f8f8;
      transform: translateX(8rpx);
    }

    .operation-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }

    .operation-info {
      flex: 1;

      .operation-name {
        font-size: 32rpx;
        color: #333333;
        margin-bottom: 4rpx;
      }

      .operation-desc {
        font-size: 24rpx;
        color: #999999;
      }
    }

    .operation-arrow {
      font-size: 48rpx;
      color: #d9d9d9;
    }
  }
}

/* 关于信息 */
.about-card {
  .about-info {
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 20rpx 0;
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
</style>
