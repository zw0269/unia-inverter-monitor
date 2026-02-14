<template>
  <view
    class="string-item"
    :class="{ warning: stringData.status === 'warning' }"
    @click="handleClick"
  >
    <view class="string-header">
      <view class="string-info">
        <view class="string-number">{{ stringData.id }}</view>
        <view class="string-details">
          <text class="string-name">{{ stringData.name }}</text>
          <text class="string-spec">{{ stringData.panelCount }}块×{{ stringData.panelPower }}W</text>
          <text v-if="stringData.status === 'warning'" class="warning-text">
            ⚠️ 功率偏低
          </text>
        </view>
      </view>
      <view class="string-power">
        <text class="power-value">{{ stringData.power }} kW</text>
        <text class="power-detail">{{ stringData.voltage }}V / {{ stringData.current }}A</text>
      </view>
    </view>

    <!-- 功率进度条 -->
    <view class="power-bar">
      <view
        class="power-fill"
        :style="{ width: stringData.efficiency + '%' }"
        :class="stringData.status"
      ></view>
    </view>

    <view class="string-stats">
      <text>今日: {{ stringData.todayEnergy }}kWh</text>
      <text :class="stringData.status === 'warning' ? 'warning' : ''">
        效率: {{ stringData.efficiency }}%
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PVString } from '@/types/device-detail'

// Props定义
interface Props {
  stringData: PVString
}

const props = defineProps<Props>()

// Emits定义
const emit = defineEmits<{
  click: [stringData: PVString]
}>()

// 点击事件
function handleClick() {
  emit('click', props.stringData)
}
</script>

<style lang="scss" scoped>
.string-item {
  background-color: #ffffff;
  padding: 28rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &.warning {
    border-left: 6rpx solid #faad14;
  }

  &:active {
    transform: scale(0.98);
  }
}

.string-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.string-info {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex: 1;
}

.string-number {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 12rpx;
}

.string-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .string-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
  }

  .string-spec {
    font-size: 24rpx;
    color: #999999;
  }

  .warning-text {
    font-size: 24rpx;
    color: #faad14;
  }
}

.string-power {
  text-align: right;

  .power-value {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #2563eb;
    margin-bottom: 8rpx;
  }

  .power-detail {
    display: block;
    font-size: 20rpx;
    color: #999999;
  }
}

/* 功率进度条 */
.power-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.power-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #95de64);
  border-radius: 6rpx;
  transition: width 0.3s;

  &.warning {
    background: linear-gradient(90deg, #faad14, #ffd666);
  }

  &.offline {
    background: linear-gradient(90deg, #d9d9d9, #f0f0f0);
  }
}

/* 组串统计 */
.string-stats {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #666666;

  text.warning {
    color: #faad14;
  }
}
</style>
