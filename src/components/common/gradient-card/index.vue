<template>
  <view
    class="gradient-card"
    :class="[`gradient-card--${theme}`, `gradient-card--${direction}`]"
    :style="cardStyle"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 渐变方向
 */
type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial'

/**
 * 渐变主题
 */
type GradientTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom'

/**
 * 渐变卡片组件Props
 */
interface GradientCardProps {
  theme?: GradientTheme           // 渐变主题
  direction?: GradientDirection   // 渐变方向
  padding?: string                // 内边距
  radius?: string                 // 圆角大小
  shadow?: boolean                // 是否显示阴影
  customFrom?: string             // 自定义起始颜色
  customTo?: string               // 自定义结束颜色
}

const props = withDefaults(defineProps<GradientCardProps>(), {
  theme: 'blue',
  direction: 'diagonal',
  padding: '32rpx',
  radius: '32rpx',
  shadow: true,
  customFrom: '',
  customTo: ''
})

/**
 * 预设渐变主题
 */
const gradientThemes = {
  blue: {
    from: '#3B82F6',
    to: '#1D4ED8'
  },
  green: {
    from: '#10B981',
    to: '#059669'
  },
  purple: {
    from: '#8B5CF6',
    to: '#6D28D9'
  },
  orange: {
    from: '#F59E0B',
    to: '#D97706'
  },
  red: {
    from: '#EF4444',
    to: '#DC2626'
  },
  custom: {
    from: props.customFrom || '#3B82F6',
    to: props.customTo || '#1D4ED8'
  }
}

/**
 * 计算渐变角度
 */
const gradientAngle = computed(() => {
  switch (props.direction) {
    case 'horizontal':
      return '90deg'
    case 'vertical':
      return '180deg'
    case 'diagonal':
      return '135deg'
    case 'radial':
      return 'circle'
    default:
      return '135deg'
  }
})

/**
 * 计算卡片样式
 */
const cardStyle = computed(() => {
  const theme = gradientThemes[props.theme]
  const isRadial = props.direction === 'radial'

  let background = ''
  if (isRadial) {
    background = `radial-gradient(circle, ${theme.from}, ${theme.to})`
  } else {
    background = `linear-gradient(${gradientAngle.value}, ${theme.from}, ${theme.to})`
  }

  return {
    background,
    padding: props.padding,
    borderRadius: props.radius
  }
})
</script>

<style lang="scss" scoped>
.gradient-card {
  position: relative;
  color: #ffffff;
  overflow: hidden;

  // 阴影效果
  &--shadow {
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  }

  // 光泽效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    pointer-events: none;
  }
}
</style>
