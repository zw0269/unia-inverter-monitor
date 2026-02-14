<template>
  <view class="device-settings-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 基本参数 -->
        <glass-card class="settings-card">
          <view class="card-title">基本参数</view>
          <input-field
            v-model="formData.ratedPower"
            label="额定功率"
            type="number"
            placeholder="请输入额定功率"
            unit="kW"
            :rules="[createRangeRule(1, 200, '额定功率')]"
            ref="ratedPowerRef"
          />
          <input-field
            v-model="formData.maxPvVoltage"
            label="最大 PV 电压"
            type="number"
            placeholder="请输入最大 PV 电压"
            unit="V"
            :rules="[createRangeRule(100, 1500, '最大 PV 电压')]"
            ref="maxPvVoltageRef"
          />
          <input-field
            v-model="formData.maxPvCurrent"
            label="最大 PV 电流"
            type="number"
            placeholder="请输入最大 PV 电流"
            unit="A"
            :rules="[createRangeRule(10, 500, '最大 PV 电流')]"
            ref="maxPvCurrentRef"
          />
        </glass-card>

        <!-- 电网参数 -->
        <glass-card class="settings-card">
          <view class="card-title">电网参数</view>
          <input-field
            v-model="formData.gridVoltageMin"
            label="最小电网电压"
            type="number"
            placeholder="请输入最小电网电压"
            unit="V"
            :rules="[createRangeRule(150, 250, '最小电网电压')]"
            ref="gridVoltageMinRef"
          />
          <input-field
            v-model="formData.gridVoltageMax"
            label="最大电网电压"
            type="number"
            placeholder="请输入最大电网电压"
            unit="V"
            :rules="[createRangeRule(200, 300, '最大电网电压')]"
            ref="gridVoltageMaxRef"
          />
          <input-field
            v-model="formData.gridFrequencyMin"
            label="最小电网频率"
            type="number"
            placeholder="请输入最小电网频率"
            unit="Hz"
            :rules="[createRangeRule(45, 55, '最小电网频率')]"
            ref="gridFrequencyMinRef"
          />
          <input-field
            v-model="formData.gridFrequencyMax"
            label="最大电网频率"
            type="number"
            placeholder="请输入最大电网频率"
            unit="Hz"
            :rules="[createRangeRule(45, 55, '最大电网频率')]"
            ref="gridFrequencyMaxRef"
          />
        </glass-card>

        <!-- 保护参数 -->
        <glass-card class="settings-card">
          <view class="card-title">保护参数</view>
          <input-field
            v-model="formData.overTempThreshold"
            label="过温阈值"
            type="number"
            placeholder="请输入过温阈值"
            unit="℃"
            :rules="[createRangeRule(50, 100, '过温阈值')]"
            ref="overTempThresholdRef"
          />
        </glass-card>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @click="handleReset">恢复默认</button>
      <button class="action-btn primary" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import type { DeviceParams } from '@/types/settings'
import { createRangeRule } from '@/utils/validation'
import GlassCard from '@/components/common/glass-card/index.vue'
import InputField from '@/components/forms/input-field/index.vue'

const settingsStore = useSettingsStore()

// 表单数据
const formData = ref<DeviceParams>({
  ratedPower: 125,
  maxPvVoltage: 1000,
  maxPvCurrent: 250,
  gridVoltageMin: 187,
  gridVoltageMax: 265,
  gridFrequencyMin: 49.5,
  gridFrequencyMax: 50.5,
  overTempThreshold: 80
})

// 表单引用
const ratedPowerRef = ref()
const maxPvVoltageRef = ref()
const maxPvCurrentRef = ref()
const gridVoltageMinRef = ref()
const gridVoltageMaxRef = ref()
const gridFrequencyMinRef = ref()
const gridFrequencyMaxRef = ref()
const overTempThresholdRef = ref()

onMounted(() => {
  // 加载设置
  formData.value = { ...settingsStore.deviceParams }
})

function validateAll(): boolean {
  const refs = [
    ratedPowerRef.value,
    maxPvVoltageRef.value,
    maxPvCurrentRef.value,
    gridVoltageMinRef.value,
    gridVoltageMaxRef.value,
    gridFrequencyMinRef.value,
    gridFrequencyMaxRef.value,
    overTempThresholdRef.value
  ]

  let valid = true
  for (const ref of refs) {
    if (ref && !ref.validate()) {
      valid = false
    }
  }

  return valid
}

function handleSave() {
  if (!validateAll()) {
    uni.showToast({
      title: '请检查输入',
      icon: 'none'
    })
    return
  }

  // 额外验证：最小值不能大于最大值
  if (formData.value.gridVoltageMin >= formData.value.gridVoltageMax) {
    uni.showToast({
      title: '最小电网电压必须小于最大电网电压',
      icon: 'none'
    })
    return
  }

  if (formData.value.gridFrequencyMin >= formData.value.gridFrequencyMax) {
    uni.showToast({
      title: '最小电网频率必须小于最大电网频率',
      icon: 'none'
    })
    return
  }

  try {
    settingsStore.updateDeviceParams(formData.value)
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

function handleReset() {
  uni.showModal({
    title: '确认恢复默认',
    content: '当前设置将丢失，确定要恢复默认设置吗？',
    success: (res) => {
      if (res.confirm) {
        settingsStore.resetToDefaults('device')
        formData.value = { ...settingsStore.deviceParams }
        uni.showToast({
          title: '已恢复默认',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.device-settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;

  .page-scroll {
    flex: 1;
    padding: 32rpx;
    padding-bottom: 160rpx;

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .settings-card {
        .card-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 32rpx;
          padding-bottom: 16rpx;
          border-bottom: 2rpx solid #f0f0f0;
        }
      }
    }
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 24rpx;
    padding: 24rpx 32rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 2rpx solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

    .action-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 16rpx;
      font-size: 32rpx;
      font-weight: 600;
      border: none;
      transition: all 0.3s;

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;

        &:active {
          opacity: 0.8;
        }
      }

      &.secondary {
        background: #f5f5f5;
        color: #666;

        &:active {
          background: #e0e0e0;
        }
      }
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .device-settings-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .page-scroll {
      .settings-content {
        .settings-card {
          .card-title {
            color: #e0e0e0;
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .bottom-actions {
      background: rgba(0, 0, 0, 0.8);
      border-top-color: rgba(255, 255, 255, 0.1);

      .action-btn.secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #e0e0e0;

        &:active {
          background: rgba(255, 255, 255, 0.12);
        }
      }
    }
  }
}
</style>
