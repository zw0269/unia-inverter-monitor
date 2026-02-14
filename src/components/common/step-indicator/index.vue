<template>
  <view class="step-indicator">
    <view
      v-for="(step, index) in steps"
      :key="index"
      class="step-item"
      :class="{
        active: index + 1 === currentStep,
        completed: index + 1 < currentStep
      }"
    >
      <view class="step-number">
        <text v-if="index + 1 < currentStep" class="check-icon">✓</text>
        <text v-else>{{ index + 1 }}</text>
      </view>
      <view class="step-label">{{ step }}</view>
      <view v-if="index < steps.length - 1" class="step-line"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number      // 当前步骤 (1-4)
  steps: string[]         // 步骤名称数组
}

withDefaults(defineProps<Props>(), {
  currentStep: 1,
  steps: () => ['步骤1', '步骤2', '步骤3', '步骤4']
})
</script>

<style lang="scss" scoped>
.step-indicator {
  display: flex;
  justify-content: space-between;
  padding: 32rpx 20rpx;
  background-color: #ffffff;

  .step-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .step-number {
      width: 56rpx;
      height: 56rpx;
      line-height: 56rpx;
      text-align: center;
      border-radius: 50%;
      background-color: #e8e8e8;
      color: #999999;
      font-size: 24rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
      transition: all 0.3s;
      z-index: 2;

      .check-icon {
        color: #ffffff;
        font-size: 28rpx;
      }
    }

    .step-label {
      font-size: 24rpx;
      color: #999999;
      text-align: center;
      transition: all 0.3s;
    }

    .step-line {
      position: absolute;
      top: 28rpx;
      left: 50%;
      width: 100%;
      height: 2rpx;
      background-color: #e8e8e8;
      transition: all 0.3s;
      z-index: 1;
    }

    &.completed {
      .step-number {
        background-color: #1296db;
        color: #ffffff;
      }

      .step-label {
        color: #1296db;
      }

      .step-line {
        background-color: #1296db;
      }
    }

    &.active {
      .step-number {
        background-color: #1296db;
        color: #ffffff;
        border: 3rpx solid #e6f4ff;
        animation: pulse 2s infinite;
      }

      .step-label {
        color: #1296db;
        font-weight: bold;
      }
    }

    &:last-child {
      .step-line {
        display: none;
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(18, 150, 219, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8rpx rgba(18, 150, 219, 0);
  }
}
</style>
