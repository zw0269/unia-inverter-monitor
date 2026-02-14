<template>
  <view class="alarm-page">
    <!-- 告警统计 -->
    <view class="alarm-stats">
      <view class="stat-card critical">
        <text class="stat-value">{{ criticalCount }}</text>
        <text class="stat-label">严重告警</text>
      </view>
      <view class="stat-card warning">
        <text class="stat-value">{{ warningCount }}</text>
        <text class="stat-label">警告</text>
      </view>
      <view class="stat-card info">
        <text class="stat-value">{{ infoCount }}</text>
        <text class="stat-label">提示</text>
      </view>
    </view>

    <!-- 过滤器 -->
    <view class="card filter-card">
      <view class="filter-tabs">
        <view
          v-for="tab in filterTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentFilter === tab.value }"
          @click="currentFilter = tab.value"
        >
          {{ tab.label }}
          <text v-if="tab.count > 0" class="badge">{{ tab.count }}</text>
        </view>
      </view>
    </view>

    <!-- 报警列表 -->
    <view class="alarm-list">
      <view v-if="filteredAlarms.length === 0" class="empty-state">
        <view class="empty-icon">✅</view>
        <view class="empty-text">暂无报警记录</view>
      </view>

      <view
        v-for="alarm in filteredAlarms"
        :key="alarm.id"
        class="card alarm-item"
        :class="`level-${alarm.level}`"
        @click="handleAlarmClick(alarm)"
      >
        <view class="alarm-header">
          <view class="alarm-level">
            <view class="level-icon" :class="`level-${alarm.level}`">
              {{ getLevelIcon(alarm.level) }}
            </view>
            <text class="level-text">{{ getLevelText(alarm.level) }}</text>
          </view>
          <view
            class="alarm-status"
            :class="{ resolved: alarm.resolved }"
          >
            {{ alarm.resolved ? '已处理' : '待处理' }}
          </view>
        </view>

        <view class="alarm-content">
          <view class="alarm-code">代码: {{ alarm.code }}</view>
          <view class="alarm-message">{{ alarm.message }}</view>
        </view>

        <view class="alarm-footer">
          <view class="alarm-time">
            <text class="time-label">发生时间:</text>
            <text class="time-value">{{ formatDateTime(alarm.timestamp) }}</text>
          </view>
          <view v-if="alarm.resolved && alarm.resolvedTime" class="alarm-time">
            <text class="time-label">处理时间:</text>
            <text class="time-value">{{ formatDateTime(alarm.resolvedTime) }}</text>
          </view>
        </view>

        <view v-if="!alarm.resolved" class="alarm-actions">
          <button class="btn-resolve" @click.stop="resolveAlarm(alarm.id)">
            标记已处理
          </button>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view v-if="deviceStore.alarms.length > 0" class="bottom-actions">
      <button class="btn btn-secondary" @click="handleClearAll">
        清空所有报警
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceStore } from '@/store/modules/device'
import { formatDateTime } from '@/utils/format'
import type { AlarmInfo } from '@/types/device'

const deviceStore = useDeviceStore()

// 过滤条件
const currentFilter = ref('all')

// 过滤选项
const filterTabs = computed(() => {
  const all = deviceStore.alarms.length
  const unresolved = deviceStore.alarms.filter(a => !a.resolved).length
  const resolved = deviceStore.alarms.filter(a => a.resolved).length

  return [
    { label: '全部', value: 'all', count: all },
    { label: '待处理', value: 'unresolved', count: unresolved },
    { label: '已处理', value: 'resolved', count: resolved }
  ]
})

// 过滤后的报警列表
const filteredAlarms = computed(() => {
  let alarms = deviceStore.alarms

  if (currentFilter.value === 'unresolved') {
    alarms = alarms.filter(a => !a.resolved)
  } else if (currentFilter.value === 'resolved') {
    alarms = alarms.filter(a => a.resolved)
  }

  return alarms
})

// 统计各级别告警数量
const criticalCount = computed(() => {
  return deviceStore.alarms.filter(a => a.level === 'critical' && !a.resolved).length
})

const warningCount = computed(() => {
  return deviceStore.alarms.filter(a => a.level === 'warning' && !a.resolved).length
})

const infoCount = computed(() => {
  return deviceStore.alarms.filter(a => a.level === 'info' && !a.resolved).length
})

/**
 * 获取级别图标
 */
function getLevelIcon(level: string): string {
  const iconMap: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🔥'
  }
  return iconMap[level] || 'ℹ️'
}

/**
 * 获取级别文本
 */
function getLevelText(level: string): string {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return textMap[level] || level
}

/**
 * 点击报警项
 */
function handleAlarmClick(alarm: AlarmInfo) {
  uni.showModal({
    title: `${getLevelText(alarm.level)}报警`,
    content: `代码: ${alarm.code}\n\n${alarm.message}\n\n发生时间: ${formatDateTime(alarm.timestamp)}${alarm.resolved ? '\n\n处理时间: ' + formatDateTime(alarm.resolvedTime!) : ''}`,
    showCancel: !alarm.resolved,
    cancelText: '关闭',
    confirmText: alarm.resolved ? '确定' : '标记已处理',
    success: (res) => {
      if (res.confirm && !alarm.resolved) {
        resolveAlarm(alarm.id)
      }
    }
  })
}

/**
 * 处理报警
 */
function resolveAlarm(alarmId: string) {
  deviceStore.resolveAlarm(alarmId)
  uni.showToast({
    title: '已标记为已处理',
    icon: 'success'
  })
}

/**
 * 清空所有报警
 */
function handleClearAll() {
  uni.showModal({
    title: '确认',
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
</script>

<style lang="scss" scoped>
.alarm-page {
  padding: 20rpx;
  padding-bottom: 140rpx;
  background-color: #f8f8f8;
}

/* 告警统计 */
.alarm-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;

  .stat-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6rpx;
    }

    &.critical {
      &::before {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .stat-value {
        color: #ef4444;
      }
    }

    &.warning {
      &::before {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }

      .stat-value {
        color: #f59e0b;
      }
    }

    &.info {
      &::before {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }

      .stat-value {
        color: #3b82f6;
      }
    }

    .stat-value {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 过滤器 */
.filter-card {
  padding: 0;
  margin-bottom: 20rpx;

  .filter-tabs {
    display: flex;

    .tab-item {
      position: relative;
      flex: 1;
      text-align: center;
      padding: 24rpx;
      font-size: 28rpx;
      color: #666666;
      border-bottom: 4rpx solid transparent;
      transition: all 0.3s;

      &.active {
        color: #1296db;
        font-weight: bold;
        border-bottom-color: #1296db;
      }

      .badge {
        display: inline-block;
        margin-left: 8rpx;
        padding: 2rpx 12rpx;
        background-color: #f56c6c;
        color: #ffffff;
        font-size: 20rpx;
        border-radius: 20rpx;
      }
    }
  }
}

/* 报警列表 */
.alarm-list {
  .empty-state {
    text-align: center;
    padding: 120rpx 40rpx;

    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }

  .alarm-item {
    margin-bottom: 16rpx;
    border-left: 6rpx solid #d9d9d9;

    &.level-info {
      border-left-color: #1890ff;
    }

    &.level-warning {
      border-left-color: #faad14;
    }

    &.level-error {
      border-left-color: #f5222d;
    }

    &.level-critical {
      border-left-color: #cf1322;
      background-color: #fff1f0;
    }

    .alarm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .alarm-level {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .level-icon {
          font-size: 32rpx;
        }

        .level-text {
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
        }
      }

      .alarm-status {
        padding: 4rpx 16rpx;
        background-color: #faad14;
        color: #ffffff;
        font-size: 24rpx;
        border-radius: 4rpx;

        &.resolved {
          background-color: #52c41a;
        }
      }
    }

    .alarm-content {
      margin-bottom: 16rpx;

      .alarm-code {
        font-size: 24rpx;
        color: #999999;
        margin-bottom: 8rpx;
      }

      .alarm-message {
        font-size: 28rpx;
        color: #333333;
        line-height: 1.6;
      }
    }

    .alarm-footer {
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;

      .alarm-time {
        display: flex;
        gap: 12rpx;
        margin-bottom: 8rpx;
        font-size: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .time-label {
          color: #999999;
        }

        .time-value {
          color: #666666;
        }
      }
    }

    .alarm-actions {
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;

      .btn-resolve {
        width: 100%;
        padding: 16rpx;
        background-color: #1296db;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 28rpx;
        text-align: center;
      }
    }
  }
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  bottom: 20rpx;
  left: 20rpx;
  right: 20rpx;
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);

  .btn {
    width: 100%;
    padding: 24rpx;
    font-size: 32rpx;
  }
}
</style>
