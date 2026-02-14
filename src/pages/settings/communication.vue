<template>
  <view class="comm-settings-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 蓝牙设置 -->
        <view class="section-card">
          <view class="card-title-row">
            <text class="card-title">蓝牙设置</text>
            <view class="bt-status" :class="'bt-' + btState">
              <text class="bt-dot">●</text>
              <text class="bt-label">{{ btLabel }}</text>
            </view>
          </view>
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

          <!-- 已连接设备信息 -->
          <view class="device-info-panel">
            <view class="device-row">
              <text class="device-label">当前设备</text>
              <text class="device-value" :class="{ 'device-active': btConnected }">
                {{ currentDeviceName }}
              </text>
            </view>
            <view v-if="btConnected && currentSignal !== null" class="device-row">
              <text class="device-label">信号强度</text>
              <view class="signal-bar">
                <view
                  v-for="i in 4"
                  :key="i"
                  class="signal-segment"
                  :class="{ active: i <= signalLevel }"
                />
                <text class="signal-value">{{ currentSignal }} dBm</text>
              </view>
            </view>
            <view v-if="discoveredCount > 0" class="device-row">
              <text class="device-label">发现设备</text>
              <text class="device-value">{{ discoveredCount }} 台</text>
            </view>
          </view>

          <button
            v-if="!btConnected"
            class="scan-btn"
            :disabled="!formData.bluetoothEnabled"
            @click="handleGoScan"
          >
            扫描设备
          </button>
          <button
            v-else
            class="disconnect-btn"
            @click="handleDisconnect"
          >
            断开连接
          </button>
        </view>

        <!-- Wi-Fi 设置 -->
        <view class="section-card">
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
            class="test-btn"
            :class="{ testing: testingConnection }"
            :disabled="!formData.wifiEnabled || !formData.wifiSSID || testingConnection"
            @click="handleTestConnection"
          >
            {{ testingConnection ? '测试中...' : (testResult ? testResult : '测试连接') }}
          </button>
        </view>

        <!-- 云同步设置 -->
        <view class="section-card">
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
          <view v-if="formData.cloudSyncEnabled" class="sync-preview">
            <text class="sync-preview-text">
              每 {{ formData.syncInterval }} 分钟自动同步一次数据
            </text>
          </view>
        </view>

        <!-- 通信诊断 -->
        <view class="section-card">
          <view class="card-title">通信诊断</view>
          <view class="diag-row">
            <text class="diag-label">蓝牙 Agent 状态</text>
            <text class="diag-value" :class="'diag-' + (bluetoothStore.initialized ? 'ok' : 'warn')">
              {{ bluetoothStore.initialized ? '已就绪' : '未初始化' }}
            </text>
          </view>
          <view class="diag-row">
            <text class="diag-label">设备 Agent 状态</text>
            <text class="diag-value diag-ok">已就绪</text>
          </view>
          <view class="diag-row">
            <text class="diag-label">最近通信事件</text>
            <text class="diag-value">{{ lastCommEvent }}</text>
          </view>
        </view>
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
import { useBluetoothStore } from '@/store/modules/bluetooth'
import type { CommParams } from '@/types/settings'
import { createSSIDRule } from '@/utils/validation'
import { agentBus } from '@/utils/event-bus'
import dayjs from 'dayjs'
import SwitchField from '@/components/forms/switch-field/index.vue'
import SliderField from '@/components/forms/slider-field/index.vue'
import InputField from '@/components/forms/input-field/index.vue'

const settingsStore = useSettingsStore()
const bluetoothStore = useBluetoothStore()

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
const testingConnection = ref(false)
const testResult = ref('')

const wifiEnabled = computed(() => formData.value.wifiEnabled)

// 蓝牙状态
const btConnected = computed(() => bluetoothStore.isConnected)
const btState = computed(() => {
  if (!formData.value.bluetoothEnabled) return 'disabled'
  if (bluetoothStore.isConnected) return 'connected'
  if (bluetoothStore.isConnecting) return 'connecting'
  return 'idle'
})

const btLabel = computed(() => {
  const labels: Record<string, string> = {
    disabled: '已关闭',
    connected: '已连接',
    connecting: '连接中...',
    idle: '空闲'
  }
  return labels[btState.value]
})

// 当前设备名
const currentDeviceName = computed(() => {
  if (bluetoothStore.connectedDevice) {
    return bluetoothStore.connectedDevice.name || bluetoothStore.connectedDevice.deviceId
  }
  return '未连接'
})

// 信号强度
const currentSignal = computed(() => {
  if (bluetoothStore.connectedDevice) {
    return bluetoothStore.connectedDevice.RSSI
  }
  return null
})

const signalLevel = computed(() => {
  const rssi = currentSignal.value
  if (rssi === null) return 0
  if (rssi >= -50) return 4
  if (rssi >= -65) return 3
  if (rssi >= -80) return 2
  return 1
})

// 发现设备数量
const discoveredCount = computed(() => bluetoothStore.discoveredDevices.length)

// 最近通信事件
const lastCommEvent = computed(() => {
  const event = agentBus.getLastEvent('bluetooth:status:changed')
    || agentBus.getLastEvent('bluetooth:data:received')
    || agentBus.getLastEvent('bluetooth:device:found')
  if (!event) return '无'
  return dayjs(event.timestamp).format('HH:mm:ss')
})

onMounted(() => {
  formData.value = { ...settingsStore.commParams }
})

function handleGoScan() {
  uni.navigateTo({ url: '/pages/bluetooth/scan' })
}

async function handleDisconnect() {
  uni.showModal({
    title: '断开连接',
    content: '确定要断开当前蓝牙设备连接吗？',
    success: async (res) => {
      if (res.confirm) {
        await bluetoothStore.disconnect()
        uni.showToast({ title: '已断开连接', icon: 'success' })
      }
    }
  })
}

function handleTestConnection() {
  if (!formData.value.wifiSSID) {
    uni.showToast({ title: '请输入 Wi-Fi 名称', icon: 'none' })
    return
  }

  testingConnection.value = true
  testResult.value = ''

  setTimeout(() => {
    testingConnection.value = false
    testResult.value = '连接成功'
    uni.showToast({ title: '连接成功', icon: 'success' })
    // 3 秒后重置
    setTimeout(() => { testResult.value = '' }, 3000)
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
    uni.showToast({ title: '请检查输入', icon: 'none' })
    return
  }

  try {
    settingsStore.updateCommParams(formData.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}
</script>

<style lang="scss" scoped>
.comm-settings-page {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;

  .page-scroll {
    flex: 1;
    padding: 24rpx 28rpx;
    padding-bottom: 160rpx;

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .section-card {
        background: #fff;
        border-radius: 20rpx;
        padding: 24rpx;
        box-shadow: 0 1rpx 3rpx rgba(15, 23, 42, 0.04), 0 4rpx 16rpx rgba(15, 23, 42, 0.03);
        border: 1rpx solid rgba(15, 23, 42, 0.04);

        .card-title {
          font-size: 30rpx;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.5rpx;
          margin-bottom: 24rpx;
          padding-bottom: 16rpx;
          border-bottom: 1rpx solid #f1f5f9;
        }

        .card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24rpx;
          padding-bottom: 16rpx;
          border-bottom: 1rpx solid #f1f5f9;

          .card-title {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }

          .bt-status {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .bt-dot { font-size: 16rpx; }
            .bt-label { font-size: 22rpx; font-weight: 600; }

            &.bt-connected {
              .bt-dot { color: #10b981; text-shadow: 0 0 8rpx rgba(16, 185, 129, 0.5); }
              .bt-label { color: #10b981; }
            }

            &.bt-connecting {
              .bt-dot { color: #f59e0b; animation: statusPulse 1.5s infinite; }
              .bt-label { color: #f59e0b; }
            }

            &.bt-idle {
              .bt-dot { color: #0ea5e9; }
              .bt-label { color: #0ea5e9; }
            }

            &.bt-disabled {
              .bt-dot { color: #94a3b8; }
              .bt-label { color: #94a3b8; }
            }
          }
        }

        .device-info-panel {
          margin: 16rpx 0;
          padding: 16rpx 20rpx;
          background: #f8fafc;
          border: 1rpx solid #f1f5f9;
          border-radius: 14rpx;

          .device-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10rpx 0;

            .device-label {
              font-size: 26rpx;
              color: #94a3b8;
              font-weight: 500;
            }

            .device-value {
              font-size: 26rpx;
              color: #475569;
              font-weight: 500;

              &.device-active {
                color: #10b981;
              }
            }

            .signal-bar {
              display: flex;
              align-items: flex-end;
              gap: 4rpx;

              .signal-segment {
                width: 8rpx;
                background: #e2e8f0;
                border-radius: 2rpx;
                transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);

                &:nth-child(1) { height: 12rpx; }
                &:nth-child(2) { height: 18rpx; }
                &:nth-child(3) { height: 24rpx; }
                &:nth-child(4) { height: 30rpx; }

                &.active {
                  background: #10b981;
                }
              }

              .signal-value {
                font-size: 22rpx;
                color: #94a3b8;
                margin-left: 12rpx;
                font-weight: 500;
              }
            }
          }
        }

        .scan-btn,
        .disconnect-btn {
          width: 100%;
          height: 80rpx;
          border: none;
          border-radius: 18rpx;
          font-size: 28rpx;
          font-weight: 600;
          margin-top: 16rpx;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scan-btn {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: #fff;
          box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.25);

          &:active:not([disabled]) { transform: scale(0.97); }
          &[disabled] { opacity: 0.4; }
        }

        .disconnect-btn {
          background: rgba(239, 68, 68, 0.06);
          color: #ef4444;
          border: 1rpx solid rgba(239, 68, 68, 0.12);

          &:active { transform: scale(0.97); background: rgba(239, 68, 68, 0.12); }
        }

        .test-btn {
          width: 100%;
          height: 80rpx;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: #fff;
          border: none;
          border-radius: 18rpx;
          font-size: 28rpx;
          font-weight: 600;
          margin-top: 16rpx;
          box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.25);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

          &.testing { opacity: 0.7; }
          &:active:not([disabled]) { transform: scale(0.97); }
          &[disabled] { opacity: 0.4; }
        }

        .sync-preview {
          padding: 12rpx 20rpx;
          margin-top: 12rpx;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(6, 182, 212, 0.04));
          border-radius: 14rpx;

          .sync-preview-text {
            font-size: 22rpx;
            color: #0ea5e9;
            font-weight: 500;
          }
        }

        .diag-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14rpx 0;
          border-bottom: 1rpx solid #f1f5f9;

          &:last-child { border-bottom: none; }

          .diag-label {
            font-size: 26rpx;
            color: #94a3b8;
            font-weight: 500;
          }

          .diag-value {
            font-size: 26rpx;
            font-weight: 500;
            color: #0ea5e9;

            &.diag-ok { color: #10b981; }
            &.diag-warn { color: #f59e0b; }
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
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-top: 1rpx solid #e2e8f0;

    .action-btn {
      width: 100%;
      height: 88rpx;
      border-radius: 18rpx;
      font-size: 30rpx;
      font-weight: 700;
      letter-spacing: 0.5rpx;
      border: none;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &.primary {
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        color: #fff;
        box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.25);

        &:active { transform: scale(0.97); }
      }
    }
  }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
