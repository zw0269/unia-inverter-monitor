<template>
  <view
    class="glass-card"
    :class="{ 'glass-card--blur': blur }"
    :style="cardStyle"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 毛玻璃卡片组件Props
 */
interface GlassCardProps {
  blur?: boolean        // 是否启用模糊效果
  padding?: string      // 内边距
  radius?: string       // 圆角大小
  bgOpacity?: number    // 背景透明度 (0-1)
}

const props = withDefaults(defineProps<GlassCardProps>(), {
  blur: true,
  padding: '32rpx',
  radius: '32rpx',
  bgOpacity: 0.1
})

/**
 * 计算卡片样式
 */
const cardStyle = computed(() => {
  return {
    padding: props.padding,
    borderRadius: props.radius,
    backgroundColor: `rgba(255, 255, 255, ${props.bgOpacity})`
  }
})
</script>

<style lang="scss" scoped>
.glass-card {
  position: relative;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

  // 边框高光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1rpx;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    border-radius: inherit;
  }
}

// 模糊效果 (仅在支持的平台)
.glass-card--blur {
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);

  // H5平台降级方案
  /* #ifdef H5 */
  @supports not (backdrop-filter: blur(40rpx)) {
    background-color: rgba(255, 255, 255, 0.85) !important;
  }
  /* #endif */

  // 小程序降级方案
  /* #ifdef MP */
  background-color: rgba(255, 255, 255, 0.85) !important;
  /* #endif */
}
</style>
