<template>
  <view
    class="alarm-card"
    :class="[`level-${alarm.level}`, { confirmed: alarm.confirmed }]"
  >
    <view class="alarm-header">
      <view class="alarm-info">
        <view class="alarm-icon">{{ getIcon(alarm.level) }}</view>
        <view class="alarm-text">
          <text class="alarm-title">{{ alarm.title }}</text>
          <text class="alarm-device">{{ alarm.deviceName }}</text>
        </view>
      </view>
      <view class="alarm-badge" :class="alarm.level">
        {{ getLevelText(alarm.level) }}
      </view>
    </view>

    <text class="alarm-message">{{ alarm.message }}</text>

    <view class="alarm-footer">
      <text class="alarm-time">{{ formatTime(alarm.timestamp) }}</text>
      <button
        v-if="!alarm.confirmed"
        class="btn-confirm"
        @click="handleConfirm"
      >
        确认
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Alarm {
  id: string
  level: 'critical' | 'warning' | 'info'
  title: string
  deviceName: string
  message: string
  timestamp: number
  confirmed: boolean
}

interface Props {
  alarm: Alarm
}

const props = defineProps<Props>()
const emit = defineEmits<{
  confirm: [id: string]
}>()

/**
 * 获取图标
 */
const getIcon = (level: string) => {
  const icons = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[level] || 'ℹ️'
}

/**
 * 获取级别文本
 */
const getLevelText = (level: string) => {
  const texts = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return texts[level] || level
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1小时显示分钟
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时显示小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 否则显示完整日期
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 确认告警
 */
const handleConfirm = () => {
  emit('confirm', props.alarm.id)
}
</script>

<style lang="scss" scoped>
.alarm-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #d9d9d9;
  transition: all 0.3s;

  &.level-info {
    border-left-color: #3b82f6;
  }

  &.level-warning {
    border-left-color: #f59e0b;
  }

  &.level-critical {
    border-left-color: #ef4444;
    background: linear-gradient(to right, #fff5f5, #ffffff);
  }

  &.confirmed {
    opacity: 0.6;
  }

  .alarm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .alarm-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      flex: 1;

      .alarm-icon {
        font-size: 48rpx;
        line-height: 1;
      }

      .alarm-text {
        flex: 1;

        .alarm-title {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 8rpx;
        }

        .alarm-device {
          display: block;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }

    .alarm-badge {
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
      font-size: 22rpx;
      font-weight: bold;
      color: #ffffff;

      &.critical {
        background: #ef4444;
      }

      &.warning {
        background: #f59e0b;
      }

      &.info {
        background: #3b82f6;
      }
    }
  }

  .alarm-message {
    display: block;
    font-size: 28rpx;
    color: #666666;
    line-height: 1.6;
    margin-bottom: 16rpx;
  }

  .alarm-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;

    .alarm-time {
      font-size: 24rpx;
      color: #999999;
    }

    .btn-confirm {
      padding: 8rpx 24rpx;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #ffffff;
      border-radius: 8rpx;
      font-size: 24rpx;
      border: none;
    }
  }
}
</style>
