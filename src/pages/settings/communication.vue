<template>
  <view class="comm-settings-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 蓝牙设置 -->
        <glass-card class="settings-card">
          <view class="card-title">蓝牙设置</view>
          <switch-field
            v-model="formData.bluetoothEnabled"
            label="启用蓝牙"
            description="开启蓝牙以连接设备"
          />
          <switch-field
            v-model="formData.bluetoothAutoConnect"
            label="自动连接"
            description="检测到已配对设备时自动连接"
            :disabled="!formData.bluetoothEnabled"
          />
          <view class="device-info">
            <text class="info-label">当前设备</text>
            <text class="info-value">{{ currentDevice }}</text>
          </view>
        </glass-card>

        <!-- Wi-Fi 设置 -->
        <glass-card class="settings-card">
          <view class="card-title">Wi-Fi 设置</view>
          <switch-field
            v-model="formData.wifiEnabled"
            label="启用 Wi-Fi"
            description="通过 Wi-Fi 连接设备和云服务"
          />
          <input-field
            v-model="formData.wifiSSID"
            label="Wi-Fi 名称"
            type="text"
            placeholder="请输入 Wi-Fi 名称"
            :disabled="!formData.wifiEnabled"
            :rules="wifiEnabled ? [createSSIDRule()] : []"
            ref="wifiSSIDRef"
          />
          <input-field
            v-model="formData.wifiPassword"
            label="Wi-Fi 密码"
            type="password"
            placeholder="请输入 Wi-Fi 密码"
            :disabled="!formData.wifiEnabled"
            ref="wifiPasswordRef"
          />
          <button
            class="test-connection-btn"
            :disabled="!formData.wifiEnabled || !formData.wifiSSID"
            @click="handleTestConnection"
          >
            测试连接
          </button>
        </glass-card>

        <!-- 云同步设置 -->
        <glass-card class="settings-card">
          <view class="card-title">云同步设置</view>
          <switch-field
            v-model="formData.cloudSyncEnabled"
            label="启用云同步"
            description="将数据同步到云端，支持多设备访问"
          />
          <slider-field
            v-model="formData.syncInterval"
            label="同步间隔"
            :min="5"
            :max="60"
            :step="5"
            unit="分钟"
            :disabled="!formData.cloudSyncEnabled"
          />
        </glass-card>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn primary" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import type { CommParams } from '@/types/settings'
import { createSSIDRule } from '@/utils/validation'
import GlassCard from '@/components/common/glass-card/index.vue'
import SwitchField from '@/components/forms/switch-field/index.vue'
import SliderField from '@/components/forms/slider-field/index.vue'
import InputField from '@/components/forms/input-field/index.vue'

const settingsStore = useSettingsStore()

// 表单数据
const formData = ref<CommParams>({
  bluetoothEnabled: true,
  bluetoothAutoConnect: true,
  wifiEnabled: false,
  wifiSSID: '',
  wifiPassword: '',
  cloudSyncEnabled: false,
  syncInterval: 15
})

const wifiSSIDRef = ref()
const wifiPasswordRef = ref()

const currentDevice = ref('未连接')
const wifiEnabled = computed(() => formData.value.wifiEnabled)

onMounted(() => {
  // 加载设置
  formData.value = { ...settingsStore.commParams }

  // 获取当前连接的蓝牙设备（模拟）
  getCurrentBluetoothDevice()
})

function getCurrentBluetoothDevice() {
  // 实际应用中应该从蓝牙服务获取
  currentDevice.value = 'INV-125kW-001'
}

function handleTestConnection() {
  if (!formData.value.wifiSSID) {
    uni.showToast({
      title: '请输入 Wi-Fi 名称',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '正在测试连接...'
  })

  // 模拟连接测试
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '连接成功',
      icon: 'success'
    })
  }, 2000)
}

function validateForm(): boolean {
  if (formData.value.wifiEnabled) {
    if (wifiSSIDRef.value && !wifiSSIDRef.value.validate()) {
      return false
    }
  }
  return true
}

function handleSave() {
  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入',
      icon: 'none'
    })
    return
  }

  try {
    settingsStore.updateCommParams(formData.value)
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
</script>

<style lang="scss" scoped>
.comm-settings-page {
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

        .device-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24rpx 0;
          margin-top: 16rpx;
          border-top: 2rpx solid #f0f0f0;

          .info-label {
            font-size: 28rpx;
            color: #333;
          }

          .info-value {
            font-size: 28rpx;
            color: #2979ff;
            font-weight: 600;
          }
        }

        .test-connection-btn {
          width: 100%;
          height: 88rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          border-radius: 12rpx;
          font-size: 28rpx;
          font-weight: 600;
          margin-top: 24rpx;

          &:active:not([disabled]) {
            opacity: 0.8;
          }

          &[disabled] {
            opacity: 0.5;
            background: #ccc;
          }
        }
      }
    }
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24rpx 32rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 2rpx solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

    .action-btn {
      width: 100%;
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
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .comm-settings-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .page-scroll {
      .settings-content {
        .settings-card {
          .card-title {
            color: #e0e0e0;
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .device-info {
            border-top-color: rgba(255, 255, 255, 0.1);

            .info-label {
              color: #e0e0e0;
            }

            .info-value {
              color: #4da6ff;
            }
          }
        }
      }
    }

    .bottom-actions {
      background: rgba(0, 0, 0, 0.8);
      border-top-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
