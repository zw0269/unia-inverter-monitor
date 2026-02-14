<template>
  <view class="add-device-page">
    <!-- 步骤指示器 -->
    <step-indicator
      :current-step="currentStepNumber"
      :steps="stepNames"
    />

    <!-- 设备添加向导 -->
    <device-wizard
      @finish="handleFinish"
      @cancel="handleCancel"
    />

    <!-- 取消按钮 -->
    <view class="cancel-button">
      <button class="btn btn-text" @click="handleCancel">
        取消
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StepIndicator from '@/components/common/step-indicator/index.vue'
import DeviceWizard from '@/components/business/device-wizard/index.vue'

// 步骤名称
const stepNames = ref(['扫描设备', '填写信息', '连接配置', '完成'])

// 当前步骤号（用于步骤指示器）
const currentStepNumber = computed(() => {
  // 这里可以通过事件从 DeviceWizard 传递当前步骤
  // 暂时返回 1
  return 1
})

/**
 * 完成添加
 */
function handleFinish() {
  uni.showToast({
    title: '设备添加成功',
    icon: 'success'
  })

  // 返回设备列表页面
  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/device/list'
    })
  }, 1000)
}

/**
 * 取消添加
 */
function handleCancel() {
  uni.showModal({
    title: '提示',
    content: '确定要取消添加吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.add-device-page {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 120rpx;
}

.cancel-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);

  .btn {
    width: 100%;
    padding: 24rpx;
    font-size: 32rpx;
  }

  .btn-text {
    background-color: transparent;
    color: #999999;

    &:active {
      color: #666666;
    }
  }
}
</style>
