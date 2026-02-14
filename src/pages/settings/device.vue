<template>
  <view class="device-settings-page">
    <!-- 设备连接状态头部 -->
    <view class="connection-header">
      <view class="conn-status" :class="'conn-' + connectionState">
        <view class="conn-dot-wrap">
          <text class="conn-dot">●</text>
        </view>
        <text class="conn-text">{{ connectionLabel }}</text>
      </view>
      <view v-if="hasUnsyncedChanges" class="sync-hint">
        <view class="sync-dot" />
        <text class="sync-text">参数待同步到设备</text>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 基本参数 -->
        <view class="section-card">
          <view class="card-header" @click="toggleSection('basic')">
            <view class="card-title-row">
              <view class="section-accent accent-blue" />
              <text class="card-title">基本参数</text>
              <text class="section-badge">{{ basicFieldCount }}/3</text>
            </view>
            <text class="collapse-icon" :class="{ expanded: expandedSections.basic }">‹</text>
          </view>
          <view v-show="expandedSections.basic" class="card-body">
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
          </view>
        </view>

        <!-- 电网参数 -->
        <view class="section-card">
          <view class="card-header" @click="toggleSection('grid')">
            <view class="card-title-row">
              <view class="section-accent accent-emerald" />
              <text class="card-title">电网参数</text>
              <text class="section-badge">{{ gridFieldCount }}/4</text>
            </view>
            <text class="collapse-icon" :class="{ expanded: expandedSections.grid }">‹</text>
          </view>
          <view v-show="expandedSections.grid" class="card-body">
            <view class="param-pair">
              <view class="param-pair-label">电网电压范围</view>
              <view class="param-pair-fields">
                <input-field
                  v-model="formData.gridVoltageMin"
                  label="最小值"
                  type="number"
                  placeholder="最小"
                  unit="V"
                  :rules="[createRangeRule(150, 250, '最小电网电压')]"
                  ref="gridVoltageMinRef"
                />
                <text class="pair-separator">~</text>
                <input-field
                  v-model="formData.gridVoltageMax"
                  label="最大值"
                  type="number"
                  placeholder="最大"
                  unit="V"
                  :rules="[createRangeRule(200, 300, '最大电网电压')]"
                  ref="gridVoltageMaxRef"
                />
              </view>
            </view>
            <view class="param-pair">
              <view class="param-pair-label">电网频率范围</view>
              <view class="param-pair-fields">
                <input-field
                  v-model="formData.gridFrequencyMin"
                  label="最小值"
                  type="number"
                  placeholder="最小"
                  unit="Hz"
                  :rules="[createRangeRule(45, 55, '最小电网频率')]"
                  ref="gridFrequencyMinRef"
                />
                <text class="pair-separator">~</text>
                <input-field
                  v-model="formData.gridFrequencyMax"
                  label="最大值"
                  type="number"
                  placeholder="最大"
                  unit="Hz"
                  :rules="[createRangeRule(45, 55, '最大电网频率')]"
                  ref="gridFrequencyMaxRef"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 保护参数 -->
        <view class="section-card">
          <view class="card-header" @click="toggleSection('protect')">
            <view class="card-title-row">
              <view class="section-accent accent-amber" />
              <text class="card-title">保护参数</text>
              <text class="section-badge warning">安全相关</text>
            </view>
            <text class="collapse-icon" :class="{ expanded: expandedSections.protect }">‹</text>
          </view>
          <view v-show="expandedSections.protect" class="card-body">
            <input-field
              v-model="formData.overTempThreshold"
              label="过温阈值"
              type="number"
              placeholder="请输入过温阈值"
              unit="℃"
              :rules="[createRangeRule(50, 100, '过温阈值')]"
              ref="overTempThresholdRef"
            />
            <view v-if="currentTemp > 0" class="current-value-hint">
              <text class="hint-label">当前温度</text>
              <text class="hint-value" :class="{ 'hint-warning': currentTemp > formData.overTempThreshold * 0.8 }">
                {{ currentTemp.toFixed(1) }}℃
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @click="handleReset">恢复默认</button>
      <button class="action-btn primary" @click="handleSave">
        <text>保存</text>
        <text v-if="hasUnsyncedChanges" class="save-badge">●</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'
import type { DeviceParams } from '@/types/settings'
import { createRangeRule } from '@/utils/validation'
import InputField from '@/components/forms/input-field/index.vue'

const settingsStore = useSettingsStore()
const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()

const expandedSections = ref({
  basic: true,
  grid: true,
  protect: true
})

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

const originalData = ref<DeviceParams>({ ...formData.value })

const ratedPowerRef = ref()
const maxPvVoltageRef = ref()
const maxPvCurrentRef = ref()
const gridVoltageMinRef = ref()
const gridVoltageMaxRef = ref()
const gridFrequencyMinRef = ref()
const gridFrequencyMaxRef = ref()
const overTempThresholdRef = ref()

const connectionState = computed(() => {
  if (bluetoothStore.isConnected) return 'connected'
  if (bluetoothStore.isConnecting) return 'connecting'
  return 'disconnected'
})

const connectionLabel = computed(() => {
  const labels: Record<string, string> = {
    connected: '设备已连接',
    connecting: '正在连接...',
    disconnected: '设备未连接'
  }
  return labels[connectionState.value]
})

const currentTemp = computed(() => deviceStore.temperature)

const hasUnsyncedChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

const basicFieldCount = computed(() => {
  let count = 0
  if (formData.value.ratedPower !== originalData.value.ratedPower) count++
  if (formData.value.maxPvVoltage !== originalData.value.maxPvVoltage) count++
  if (formData.value.maxPvCurrent !== originalData.value.maxPvCurrent) count++
  return count
})

const gridFieldCount = computed(() => {
  let count = 0
  if (formData.value.gridVoltageMin !== originalData.value.gridVoltageMin) count++
  if (formData.value.gridVoltageMax !== originalData.value.gridVoltageMax) count++
  if (formData.value.gridFrequencyMin !== originalData.value.gridFrequencyMin) count++
  if (formData.value.gridFrequencyMax !== originalData.value.gridFrequencyMax) count++
  return count
})

function toggleSection(section: keyof typeof expandedSections.value) {
  expandedSections.value[section] = !expandedSections.value[section]
}

onMounted(() => {
  formData.value = { ...settingsStore.deviceParams }
  originalData.value = { ...settingsStore.deviceParams }
})

function validateAll(): boolean {
  const refs = [
    ratedPowerRef.value, maxPvVoltageRef.value, maxPvCurrentRef.value,
    gridVoltageMinRef.value, gridVoltageMaxRef.value,
    gridFrequencyMinRef.value, gridFrequencyMaxRef.value,
    overTempThresholdRef.value
  ]
  let valid = true
  for (const ref of refs) {
    if (ref && !ref.validate()) valid = false
  }
  return valid
}

function handleSave() {
  if (!validateAll()) {
    uni.showToast({ title: '请检查输入', icon: 'none' })
    return
  }
  if (formData.value.gridVoltageMin >= formData.value.gridVoltageMax) {
    uni.showToast({ title: '最小电网电压必须小于最大电网电压', icon: 'none' })
    return
  }
  if (formData.value.gridFrequencyMin >= formData.value.gridFrequencyMax) {
    uni.showToast({ title: '最小电网频率必须小于最大电网频率', icon: 'none' })
    return
  }
  try {
    settingsStore.updateDeviceParams(formData.value)
    originalData.value = { ...formData.value }
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'error' })
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
        originalData.value = { ...formData.value }
        uni.showToast({ title: '已恢复默认', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
// ── Design System: Refined Industrial ──

.device-settings-page {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;

  .connection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 32rpx;
    background: #fff;
    border-bottom: 1rpx solid #e2e8f0;

    .conn-status {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .conn-dot-wrap {
        .conn-dot { font-size: 18rpx; }
      }

      .conn-text {
        font-size: 26rpx;
        font-weight: 600;
        letter-spacing: 0.5rpx;
      }

      &.conn-connected {
        .conn-dot { color: #10b981; text-shadow: 0 0 8rpx rgba(16, 185, 129, 0.5); }
        .conn-text { color: #10b981; }
      }
      &.conn-connecting {
        .conn-dot { color: #f59e0b; animation: statusPulse 1.5s ease-in-out infinite; }
        .conn-text { color: #f59e0b; }
      }
      &.conn-disconnected {
        .conn-dot { color: #cbd5e1; }
        .conn-text { color: #94a3b8; }
      }
    }

    .sync-hint {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .sync-dot {
        width: 10rpx;
        height: 10rpx;
        border-radius: 50%;
        background: #0ea5e9;
        animation: statusPulse 2s ease-in-out infinite;
      }

      .sync-text {
        font-size: 22rpx;
        color: #0ea5e9;
        font-weight: 500;
      }
    }
  }

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
        box-shadow:
          0 1rpx 3rpx rgba(15, 23, 42, 0.04),
          0 4rpx 16rpx rgba(15, 23, 42, 0.03);
        border: 1rpx solid rgba(15, 23, 42, 0.04);

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20rpx;
          border-bottom: 1rpx solid #f1f5f9;
          cursor: pointer;

          .card-title-row {
            display: flex;
            align-items: center;
            gap: 14rpx;

            .section-accent {
              width: 6rpx;
              height: 32rpx;
              border-radius: 3rpx;
            }

            .accent-blue { background: linear-gradient(180deg, #3b82f6, #2563eb); }
            .accent-emerald { background: linear-gradient(180deg, #10b981, #059669); }
            .accent-amber { background: linear-gradient(180deg, #f59e0b, #d97706); }

            .card-title {
              font-size: 30rpx;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.5rpx;
            }

            .section-badge {
              font-size: 20rpx;
              color: #0ea5e9;
              background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.06));
              padding: 4rpx 16rpx;
              border-radius: 10rpx;
              font-weight: 600;

              &.warning {
                color: #f59e0b;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.06));
              }
            }
          }

          .collapse-icon {
            font-size: 32rpx;
            color: #cbd5e1;
            transform: rotate(-90deg);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            &.expanded { transform: rotate(90deg); }
          }
        }

        .card-body {
          padding-top: 20rpx;

          .param-pair {
            margin-bottom: 20rpx;

            .param-pair-label {
              font-size: 26rpx;
              color: #475569;
              margin-bottom: 12rpx;
              font-weight: 600;
              letter-spacing: 0.5rpx;
            }

            .param-pair-fields {
              display: flex;
              align-items: flex-start;
              gap: 12rpx;

              .pair-separator {
                color: #cbd5e1;
                font-size: 32rpx;
                margin-top: 68rpx;
              }
            }
          }

          .current-value-hint {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18rpx 22rpx;
            margin-top: 16rpx;
            background: #f8fafc;
            border-radius: 14rpx;
            border: 1rpx solid #f1f5f9;

            .hint-label {
              font-size: 24rpx;
              color: #94a3b8;
              font-weight: 500;
            }

            .hint-value {
              font-size: 28rpx;
              font-weight: 700;
              color: #10b981;
              &.hint-warning { color: #f59e0b; }
            }
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
    display: flex;
    gap: 24rpx;
    padding: 24rpx 28rpx;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-top: 1rpx solid #e2e8f0;

    .action-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 18rpx;
      font-size: 30rpx;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &.primary {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        color: #fff;
        box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.25);
        .save-badge { font-size: 16rpx; color: #fbbf24; }
        &:active { transform: scale(0.97); opacity: 0.9; }
      }

      &.secondary {
        background: #f8fafc;
        color: #475569;
        border: 1rpx solid #e2e8f0;
        &:active { background: #f1f5f9; transform: scale(0.97); }
      }
    }
  }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
