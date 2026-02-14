<template>
  <view
    class="device-list-item"
    :class="{ active: isActive }"
    @click="handleClick"
  >
    <view class="device-icon">
      <text class="icon-text">{{ deviceIcon }}</text>
    </view>

    <view class="device-info">
      <view class="device-header">
        <text class="device-alias">{{ device.alias }}</text>
        <view v-if="isOnline" class="online-badge">
          <text class="signal-icon">📶</text>
          <text class="online-text">在线</text>
        </view>
      </view>

      <view class="device-name">{{ device.name }}</view>

      <view class="device-meta">
        <view class="meta-item">
          <text class="meta-icon">📍</text>
          <text class="meta-text">{{ device.location }}</text>
        </view>
        <view v-if="device.lastConnected" class="meta-item">
          <text class="meta-icon">🕒</text>
          <text class="meta-text">{{ formatLastConnected(device.lastConnected) }}</text>
        </view>
      </view>
    </view>

    <view class="device-actions">
      <view class="action-btn" @click.stop="handleEdit">
        <text class="action-icon">✏️</text>
      </view>
      <view class="action-btn delete" @click.stop="handleDelete">
        <text class="action-icon">🗑️</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SavedDevice } from '@/types/device-add'

interface Props {
  device: SavedDevice
  isActive?: boolean
  isOnline?: boolean
}

interface Emits {
  (e: 'click', device: SavedDevice): void
  (e: 'edit', device: SavedDevice): void
  (e: 'delete', device: SavedDevice): void
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  isOnline: false
})

const emit = defineEmits<Emits>()

// 设备图标（根据设备名称推测）
const deviceIcon = computed(() => {
  const name = props.device.name.toLowerCase()
  if (name.includes('inverter') || name.includes('逆变')) {
    return '⚡'
  }
  if (name.includes('solar') || name.includes('光伏')) {
    return '☀️'
  }
  return '📱'
})

/**
 * 格式化最后连接时间
 */
function formatLastConnected(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function handleClick() {
  emit('click', props.device)
}

function handleEdit() {
  emit('edit', props.device)
}

function handleDelete() {
  emit('delete', props.device)
}
</script>

<style lang="scss" scoped>
.device-list-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    background-color: #f8f8f8;
  }

  &.active {
    border: 2rpx solid #1296db;
    background-color: #f0f9ff;
  }

  .device-icon {
    flex-shrink: 0;
    width: 100rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1296db 0%, #409EFF 100%);
    border-radius: 16rpx;
    margin-right: 20rpx;

    .icon-text {
      font-size: 52rpx;
    }
  }

  .device-info {
    flex: 1;
    min-width: 0;

    .device-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .device-alias {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .online-badge {
        display: flex;
        align-items: center;
        gap: 4rpx;
        padding: 4rpx 12rpx;
        background-color: #67c23a;
        border-radius: 8rpx;
        font-size: 20rpx;
        color: #ffffff;

        .signal-icon {
          font-size: 20rpx;
        }
      }
    }

    .device-name {
      font-size: 24rpx;
      color: #999999;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .device-meta {
      display: flex;
      gap: 24rpx;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4rpx;
        font-size: 24rpx;
        color: #666666;

        .meta-icon {
          font-size: 20rpx;
        }

        .meta-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .device-actions {
    flex-shrink: 0;
    display: flex;
    gap: 12rpx;
    margin-left: 12rpx;

    .action-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      border-radius: 12rpx;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
        background-color: #e0e0e0;
      }

      &.delete {
        background-color: #fee;

        &:active {
          background-color: #fdd;
        }
      }

      .action-icon {
        font-size: 32rpx;
      }
    }
  }
}
</style>
