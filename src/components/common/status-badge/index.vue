<template>
  <view
    class="status-badge"
    :class="[
      `status-badge--${status}`,
      { 'status-badge--pulse': pulse }
    ]"
    :style="badgeStyle"
  >
    <view v-if="showIcon" class="status-badge__icon">
      {{ statusIcon }}
    </view>
    <text class="status-badge__text">{{ statusText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 状态类型
 */
type StatusType = 'running' | 'charging' | 'discharging' | 'warning' | 'error' | 'offline' | 'standby'

/**
 * 状态徽章组件Props
 */
interface StatusBadgeProps {
  status: StatusType    // 状态类型
  text?: string         // 自定义文本
  pulse?: boolean       // 是否显示脉冲动画
  showIcon?: boolean    // 是否显示图标
  size?: 'small' | 'medium' | 'large'  // 尺寸
}

const props = withDefaults(defineProps<StatusBadgeProps>(), {
  status: 'standby',
  text: '',
  pulse: false,
  showIcon: true,
  size: 'medium'
})

/**
 * 状态配置
 */
const statusConfig = {
  running: {
    text: '运行中',
    icon: '●',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  charging: {
    text: '充电中',
    icon: '⚡',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  discharging: {
    text: '放电中',
    icon: '⚡',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  warning: {
    text: '告警',
    icon: '⚠',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  error: {
    text: '故障',
    icon: '✕',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  offline: {
    text: '离线',
    icon: '○',
    color: '#9CA3AF',
    bgColor: 'rgba(156, 163, 175, 0.1)'
  },
  standby: {
    text: '待机',
    icon: '○',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)'
  }
}

/**
 * 当前状态配置
 */
const currentConfig = computed(() => statusConfig[props.status])

/**
 * 状态文本
 */
const statusText = computed(() => props.text || currentConfig.value.text)

/**
 * 状态图标
 */
const statusIcon = computed(() => currentConfig.value.icon)

/**
 * 尺寸配置
 */
const sizeConfig = {
  small: {
    fontSize: '20rpx',
    padding: '4rpx 12rpx',
    iconSize: '16rpx'
  },
  medium: {
    fontSize: '24rpx',
    padding: '8rpx 16rpx',
    iconSize: '20rpx'
  },
  large: {
    fontSize: '28rpx',
    padding: '12rpx 24rpx',
    iconSize: '24rpx'
  }
}

/**
 * 徽章样式
 */
const badgeStyle = computed(() => {
  const config = currentConfig.value
  const size = sizeConfig[props.size]

  return {
    color: config.color,
    backgroundColor: config.bgColor,
    fontSize: size.fontSize,
    padding: size.padding
  }
})
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  border-radius: 9999rpx;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;

  &__icon {
    line-height: 1;
  }

  &__text {
    line-height: 1;
  }

  // 脉冲动画
  &--pulse {
    .status-badge__icon {
      animation: pulse 2s ease-in-out infinite;
    }
  }
}

// 不同状态的样式
.status-badge--running {
  border: 1rpx solid rgba(16, 185, 129, 0.3);
}

.status-badge--charging {
  border: 1rpx solid rgba(59, 130, 246, 0.3);
}

.status-badge--discharging {
  border: 1rpx solid rgba(245, 158, 11, 0.3);
}

.status-badge--warning {
  border: 1rpx solid rgba(245, 158, 11, 0.3);
}

.status-badge--error {
  border: 1rpx solid rgba(239, 68, 68, 0.3);
}

.status-badge--offline {
  border: 1rpx solid rgba(156, 163, 175, 0.3);
}

.status-badge--standby {
  border: 1rpx solid rgba(107, 114, 128, 0.3);
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}
</style>
