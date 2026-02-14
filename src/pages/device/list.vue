<template>
  <view class="device-list-page">
    <!-- 设备统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ deviceStore.deviceCount }}</text>
        <text class="stat-label">设备总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ onlineCount }}</text>
        <text class="stat-label">在线设备</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="deviceStore.savedDevices.length === 0" class="empty-state">
      <view class="empty-icon">📱</view>
      <view class="empty-title">暂无设备</view>
      <view class="empty-desc">点击下方按钮添加您的第一台设备</view>
      <button class="btn btn-primary" @click="goToAdd">
        添加设备
      </button>
    </view>

    <!-- 设备列表 -->
    <view v-else class="device-list">
      <device-list-item
        v-for="device in deviceStore.savedDevices"
        :key="device.id"
        :device="device"
        :is-active="device.id === deviceStore.currentDeviceId"
        :is-online="false"
        @click="handleDeviceClick"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </view>

    <!-- 浮动添加按钮 -->
    <view v-if="deviceStore.savedDevices.length > 0" class="fab" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDeviceStore } from '@/store/modules/device'
import DeviceListItem from '@/components/business/device-list-item/index.vue'
import type { SavedDevice } from '@/types/device-add'

const deviceStore = useDeviceStore()

// 在线设备数（暂时为0，后续可以根据实际连接状态计算）
const onlineCount = computed(() => 0)

onMounted(() => {
  // 加载设备列表
  deviceStore.loadDevices()
})

/**
 * 跳转到添加页面
 */
function goToAdd() {
  uni.navigateTo({
    url: '/pages/device/add'
  })
}

/**
 * 设备点击
 */
function handleDeviceClick(device: SavedDevice) {
  // 切换当前设备
  uni.showModal({
    title: '切换设备',
    content: `确定要切换到"${device.alias}"吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          deviceStore.switchDevice(device.id)
          uni.showToast({
            title: '切换成功',
            icon: 'success'
          })
        } catch (error: any) {
          uni.showToast({
            title: error.message || '切换失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

/**
 * 编辑设备
 */
function handleEdit(device: SavedDevice) {
  uni.navigateTo({
    url: `/pages/device/edit?id=${device.id}`
  })
}

/**
 * 删除设备
 */
function handleDelete(device: SavedDevice) {
  const isCurrentDevice = device.id === deviceStore.currentDeviceId

  uni.showModal({
    title: '删除设备',
    content: `确定要删除"${device.alias}"吗？${isCurrentDevice ? '\n此设备是当前使用的设备，删除后将自动切换到其他设备。' : ''}\n删除后无法恢复！`,
    confirmColor: '#F56C6C',
    success: (res) => {
      if (res.confirm) {
        try {
          deviceStore.deleteDevice(device.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error: any) {
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 下拉刷新
function onPullDownRefresh() {
  deviceStore.loadDevices()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 500)
}

// 暴露下拉刷新方法
defineExpose({
  onPullDownRefresh
})
</script>

<style lang="scss" scoped>
.device-list-page {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .stat-item {
    flex: 1;
    text-align: center;
    padding: 32rpx 20rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .stat-value {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #1296db;
      margin-bottom: 8rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }

  .empty-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 40rpx;
    line-height: 1.6;
  }

  .btn {
    width: 400rpx;
    margin: 0 auto;
    padding: 24rpx;
    font-size: 32rpx;
  }
}

/* 设备列表 */
.device-list {
  // DeviceListItem 组件自带间距
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1296db 0%, #409EFF 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(18, 150, 219, 0.4);
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(18, 150, 219, 0.3);
  }

  .fab-icon {
    font-size: 64rpx;
    color: #ffffff;
    font-weight: 300;
  }
}
</style>
