<template>
  <view class="progress-bar">
    <view v-if="showLabel" class="progress-bar__label">
      <text class="label-text">{{ label }}</text>
      <text class="label-value" :style="{ color: progressColor }">
        {{ percentage }}%
      </text>
    </view>

    <view
      class="progress-bar__track"
      :style="trackStyle"
    >
      <view
        class="progress-bar__fill"
        :class="{ 'progress-bar__fill--animated': animated }"
        :style="fillStyle"
      >
        <view v-if="showPercentage && !showLabel" class="progress-bar__text">
          {{ percentage }}%
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 进度条主题
 */
type ProgressTheme = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gradient'

/**
 * 进度条组件Props
 */
interface ProgressBarProps {
  percentage: number          // 百分比 (0-100)
  theme?: ProgressTheme       // 主题颜色
  height?: string             // 高度
  radius?: string             // 圆角
  showPercentage?: boolean    // 是否显示百分比
  showLabel?: boolean         // 是否显示标签
  label?: string              // 标签文本
  animated?: boolean          // 是否显示动画
  striped?: boolean           // 是否显示条纹
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  percentage: 0,
  theme: 'blue',
  height: '16rpx',
  radius: '9999rpx',
  showPercentage: false,
  showLabel: false,
  label: '',
  animated: true,
  striped: false
})

/**
 * 主题颜色配置
 */
const themeColors = {
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  gradient: 'linear-gradient(90deg, #3B82F6, #10B981)'
}

/**
 * 进度条颜色
 */
const progressColor = computed(() => {
  if (props.theme === 'gradient') {
    return '#3B82F6'
  }
  return themeColors[props.theme]
})

/**
 * 轨道样式
 */
const trackStyle = computed(() => ({
  height: props.height,
  borderRadius: props.radius,
  backgroundColor: '#F3F4F6'
}))

/**
 * 填充样式
 */
const fillStyle = computed(() => {
  const safePercentage = Math.max(0, Math.min(100, props.percentage))

  let background = ''
  if (props.theme === 'gradient') {
    background = 'linear-gradient(90deg, #3B82F6, #10B981)'
  } else {
    background = themeColors[props.theme]
  }

  return {
    width: `${safePercentage}%`,
    height: props.height,
    borderRadius: props.radius,
    background
  }
})
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;
}

.progress-bar__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.label-text {
  font-size: 24rpx;
  color: #666;
}

.label-value {
  font-size: 28rpx;
  font-weight: 600;
}

.progress-bar__track {
  position: relative;
  overflow: hidden;
  background-color: #F3F4F6;
}

.progress-bar__fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  transition: width 0.6s ease;

  // 内部光泽效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    border-radius: inherit;
  }

  // 动画效果
  &--animated {
    animation: progress-fill 0.6s ease;
  }
}

.progress-bar__text {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: 1;
}

// 进度条填充动画
@keyframes progress-fill {
  0% {
    width: 0;
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
