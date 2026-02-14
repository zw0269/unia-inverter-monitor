<template>
  <view class="device-wizard">
    <!-- 步骤 1: 扫描设备 -->
    <view v-if="currentStep === 'scan'" class="wizard-step scan-step">
      <view class="step-title">扫描蓝牙设备</view>
      <view class="step-desc">请确保设备已开启蓝牙并处于可连接状态</view>

      <view class="scan-control">
        <button
          v-if="!bluetoothStore.discovering"
          class="btn btn-primary btn-large"
          @click="startScan"
        >
          开始扫描
        </button>
        <button
          v-else
          class="btn btn-secondary btn-large"
          @click="stopScan"
        >
          停止扫描
        </button>
      </view>

      <!-- 过滤开关 -->
      <view class="filter-control">
        <view class="filter-header">
          <text>智能过滤</text>
          <switch
            :checked="filterEnabled"
            @change="handleFilterChange"
            color="#1296db"
          />
        </view>
        <text v-if="filterEnabled" class="filter-tip">
          仅显示逆变器相关设备
        </text>
      </view>

      <!-- 设备列表 -->
      <view class="device-list">
        <view class="list-header">
          <text>可用设备 ({{ displayDevices.length }})</text>
          <view v-if="bluetoothStore.discovering" class="scanning-badge">
            扫描中...
          </view>
        </view>

        <view v-if="displayDevices.length === 0" class="empty-state">
          <text class="empty-icon">📡</text>
          <text class="empty-text">
            {{ bluetoothStore.discovering ? '正在搜索设备...' : '暂无设备，请开始扫描' }}
          </text>
        </view>

        <view
          v-for="device in displayDevices"
          :key="device.deviceId"
          class="device-item"
          :class="{ recommended: isRecommended(device) }"
          @click="selectDevice(device)"
        >
          <view class="device-info">
            <view class="device-header">
              <text class="device-name">{{ device.name || '未知设备' }}</text>
              <view v-if="isRecommended(device)" class="recommend-badge">
                推荐
              </view>
            </view>
            <text class="device-id">{{ device.deviceId }}</text>
            <view class="device-signal">
              <view class="signal-bars">
                <view
                  v-for="i in 4"
                  :key="i"
                  class="signal-bar"
                  :class="{ active: i <= getSignalBars(device.RSSI) }"
                ></view>
              </view>
              <text class="signal-text">{{ device.RSSI }} dBm</text>
            </view>
          </view>
          <view class="device-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 步骤 2: 填写信息 -->
    <view v-if="currentStep === 'info'" class="wizard-step info-step">
      <view class="step-title">填写设备信息</view>
      <view class="step-desc">请完善设备的详细信息</view>

      <view class="form-section">
        <view class="form-item required">
          <text class="form-label">设备别名</text>
          <input
            v-model="formData.alias"
            class="form-input"
            placeholder="请输入设备别名（必填）"
            :maxlength="20"
          />
        </view>

        <view class="form-item required">
          <text class="form-label">安装位置</text>
          <input
            v-model="formData.location"
            class="form-input"
            placeholder="请输入安装位置（必填）"
            :maxlength="30"
          />
        </view>

        <view class="form-item required">
          <text class="form-label">额定功率 (kW)</text>
          <input
            v-model.number="formData.ratedPower"
            class="form-input"
            type="number"
            placeholder="请输入额定功率"
          />
        </view>

        <view class="form-item">
          <text class="form-label">设备型号</text>
          <input
            v-model="formData.model"
            class="form-input"
            placeholder="请输入设备型号（可选）"
            :maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="form-label">序列号</text>
          <input
            v-model="formData.serialNumber"
            class="form-input"
            placeholder="请输入序列号（可选）"
            :maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="form-label">安装日期</text>
          <picker
            mode="date"
            :value="formData.installDate"
            @change="handleDateChange"
          >
            <view class="form-input picker-input">
              {{ formData.installDate || '请选择安装日期（可选）' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            placeholder="请输入备注信息（可选）"
            :maxlength="100"
          />
        </view>
      </view>

      <view class="form-actions">
        <button class="btn btn-secondary" @click="prevStep">
          上一步
        </button>
        <button class="btn btn-primary" @click="nextStep">
          下一步
        </button>
      </view>
    </view>

    <!-- 步骤 3: 连接配置 -->
    <view v-if="currentStep === 'config'" class="wizard-step config-step">
      <view class="step-title">连接设备</view>
      <view class="step-desc">正在尝试连接到设备...</view>

      <view class="connect-status">
        <view class="status-icon">
          <view v-if="connecting" class="loading-spinner"></view>
          <text v-else-if="connectSuccess" class="success-icon">✓</text>
          <text v-else class="error-icon">✕</text>
        </view>

        <view class="status-text">
          <text v-if="connecting">正在连接设备...</text>
          <text v-else-if="connectSuccess">连接成功！</text>
          <text v-else>连接失败</text>
        </view>

        <view v-if="connectError" class="error-message">
          {{ connectError }}
        </view>
      </view>

      <view class="connect-actions">
        <button
          v-if="!connecting && !connectSuccess"
          class="btn btn-primary"
          @click="retryConnect"
        >
          重试连接
        </button>
        <button
          v-if="!connecting && !connectSuccess"
          class="btn btn-secondary"
          @click="skipConnect"
        >
          跳过连接
        </button>
      </view>
    </view>

    <!-- 步骤 4: 完成确认 -->
    <view v-if="currentStep === 'confirm'" class="wizard-step confirm-step">
      <view class="success-animation">
        <text class="success-icon-large">✓</text>
      </view>

      <view class="success-title">设备添加成功！</view>
      <view class="success-desc">您可以在设备列表中查看和管理设备</view>

      <view class="device-summary">
        <view class="summary-item">
          <text class="summary-label">设备别名</text>
          <text class="summary-value">{{ formData.alias }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">安装位置</text>
          <text class="summary-value">{{ formData.location }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">额定功率</text>
          <text class="summary-value">{{ formData.ratedPower }} kW</text>
        </view>
        <view v-if="formData.model" class="summary-item">
          <text class="summary-label">设备型号</text>
          <text class="summary-value">{{ formData.model }}</text>
        </view>
      </view>

      <view class="confirm-actions">
        <button class="btn btn-secondary" @click="addAnother">
          继续添加
        </button>
        <button class="btn btn-primary" @click="finish">
          完成
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'
import type { BluetoothDevice } from '@/types/bluetooth'
import type { DeviceFormData, DeviceAddStep, SavedDevice } from '@/types/device-add'
import { getRecommendedKeywords, isRecommendedDevice, getSignalPercentage } from '@/utils/device-filter'

interface Emits {
  (e: 'finish'): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()

// 当前步骤
const currentStep = ref<DeviceAddStep>('scan')

// 选中的设备
const selectedDevice = ref<BluetoothDevice | null>(null)

// 过滤开关
const filterEnabled = ref(false)

// 表单数据
const formData = ref<DeviceFormData>({
  name: '',
  alias: '',
  location: '',
  ratedPower: 125,
  model: '',
  serialNumber: '',
  installDate: '',
  description: ''
})

// 连接状态
const connecting = ref(false)
const connectSuccess = ref(false)
const connectError = ref('')
const connectRetryCount = ref(0)

// 显示的设备列表
const displayDevices = computed(() => {
  if (filterEnabled.value) {
    return bluetoothStore.filteredDevices
  }
  return bluetoothStore.discoveredDevices
})

/**
 * 开始扫描
 */
async function startScan() {
  uni.showLoading({ title: '正在扫描...' })
  await bluetoothStore.startScan()
  uni.hideLoading()
}

/**
 * 停止扫描
 */
async function stopScan() {
  await bluetoothStore.stopScan()
}

/**
 * 过滤开关变化
 */
function handleFilterChange(e: any) {
  filterEnabled.value = e.detail.value

  if (filterEnabled.value) {
    const keywords = getRecommendedKeywords()
    bluetoothStore.applyFilter(keywords, -80)
  } else {
    bluetoothStore.clearFilter()
  }
}

/**
 * 检查是否为推荐设备
 */
function isRecommended(device: BluetoothDevice): boolean {
  return isRecommendedDevice(device)
}

/**
 * 获取信号条数
 */
function getSignalBars(rssi: number): number {
  const percentage = getSignalPercentage(rssi)
  if (percentage >= 75) return 4
  if (percentage >= 50) return 3
  if (percentage >= 25) return 2
  return 1
}

/**
 * 选择设备
 */
function selectDevice(device: BluetoothDevice) {
  selectedDevice.value = device
  formData.value.name = device.name
  currentStep.value = 'info'

  // 停止扫描
  stopScan()
}

/**
 * 日期选择变化
 */
function handleDateChange(e: any) {
  formData.value.installDate = e.detail.value
}

/**
 * 上一步
 */
function prevStep() {
  if (currentStep.value === 'info') {
    currentStep.value = 'scan'
  }
}

/**
 * 下一步
 */
function nextStep() {
  if (currentStep.value === 'info') {
    // 表单验证
    if (!formData.value.alias) {
      uni.showToast({
        title: '请输入设备别名',
        icon: 'none'
      })
      return
    }

    if (!formData.value.location) {
      uni.showToast({
        title: '请输入安装位置',
        icon: 'none'
      })
      return
    }

    if (!formData.value.ratedPower || formData.value.ratedPower <= 0) {
      uni.showToast({
        title: '请输入有效的额定功率',
        icon: 'none'
      })
      return
    }

    // 检查别名是否重复
    const exists = deviceStore.savedDevices.some(d => d.alias === formData.value.alias)
    if (exists) {
      uni.showToast({
        title: '设备别名已存在',
        icon: 'none'
      })
      return
    }

    currentStep.value = 'config'
    // 自动尝试连接
    tryConnect()
  }
}

/**
 * 尝试连接设备
 */
async function tryConnect() {
  if (!selectedDevice.value) {
    connectError.value = '未选择设备'
    return
  }

  connecting.value = true
  connectSuccess.value = false
  connectError.value = ''

  try {
    const result = await bluetoothStore.connect(selectedDevice.value.deviceId)

    if (result.success) {
      connectSuccess.value = true
      connecting.value = false

      // 延迟进入下一步
      setTimeout(() => {
        saveDevice()
      }, 1000)
    } else {
      throw new Error('连接失败')
    }
  } catch (error: any) {
    connecting.value = false
    connectSuccess.value = false
    connectError.value = error.message || '连接失败，请重试'
    connectRetryCount.value++
  }
}

/**
 * 重试连接
 */
function retryConnect() {
  if (connectRetryCount.value >= 3) {
    uni.showModal({
      title: '提示',
      content: '已重试3次，是否继续尝试？',
      success: (res) => {
        if (res.confirm) {
          connectRetryCount.value = 0
          tryConnect()
        }
      }
    })
  } else {
    tryConnect()
  }
}

/**
 * 跳过连接
 */
function skipConnect() {
  saveDevice()
}

/**
 * 保存设备
 */
function saveDevice() {
  if (!selectedDevice.value) return

  const device: SavedDevice = {
    id: `device_${Date.now()}`,
    deviceId: selectedDevice.value.deviceId,
    name: formData.value.name,
    alias: formData.value.alias,
    location: formData.value.location,
    ratedPower: formData.value.ratedPower,
    model: formData.value.model,
    serialNumber: formData.value.serialNumber,
    installDate: formData.value.installDate,
    addedDate: Date.now(),
    description: formData.value.description
  }

  try {
    deviceStore.addDevice(device)
    currentStep.value = 'confirm'
  } catch (error: any) {
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  }
}

/**
 * 继续添加
 */
function addAnother() {
  // 重置状态
  currentStep.value = 'scan'
  selectedDevice.value = null
  formData.value = {
    name: '',
    alias: '',
    location: '',
    ratedPower: 125,
    model: '',
    serialNumber: '',
    installDate: '',
    description: ''
  }
  connecting.value = false
  connectSuccess.value = false
  connectError.value = ''
  connectRetryCount.value = 0
}

/**
 * 完成
 */
function finish() {
  emit('finish')
}

// 监听步骤变化
watch(currentStep, (newStep) => {
  console.log('当前步骤:', newStep)
})
</script>

<style lang="scss" scoped>
.device-wizard {
  padding: 20rpx;
}

.wizard-step {
  .step-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .step-desc {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 32rpx;
  }
}

/* 扫描步骤 */
.scan-step {
  .scan-control {
    margin-bottom: 32rpx;

    .btn-large {
      width: 100%;
      padding: 28rpx;
      font-size: 32rpx;
    }
  }

  .filter-control {
    padding: 24rpx;
    background-color: #fff7e6;
    border-radius: 12rpx;
    margin-bottom: 24rpx;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 8rpx;
    }

    .filter-tip {
      font-size: 24rpx;
      color: #faad14;
    }
  }

  .device-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #666666;

      .scanning-badge {
        padding: 4rpx 16rpx;
        background-color: #1296db;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 24rpx;
        animation: blink 1.5s infinite;
      }
    }

    .empty-state {
      text-align: center;
      padding: 80rpx 40rpx;

      .empty-icon {
        font-size: 100rpx;
        display: block;
        margin-bottom: 20rpx;
      }

      .empty-text {
        font-size: 28rpx;
        color: #999999;
      }
    }

    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx;
      margin-bottom: 16rpx;
      background-color: #ffffff;
      border-radius: 12rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
        background-color: #f8f8f8;
      }

      &.recommended {
        border: 2rpx solid #1296db;
      }

      .device-info {
        flex: 1;

        .device-header {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 8rpx;

          .device-name {
            font-size: 32rpx;
            font-weight: bold;
            color: #333333;
          }

          .recommend-badge {
            padding: 4rpx 12rpx;
            background-color: #1296db;
            color: #ffffff;
            border-radius: 8rpx;
            font-size: 20rpx;
          }
        }

        .device-id {
          font-size: 24rpx;
          color: #999999;
          margin-bottom: 12rpx;
          display: block;
        }

        .device-signal {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .signal-bars {
            display: flex;
            gap: 4rpx;
            align-items: flex-end;

            .signal-bar {
              width: 6rpx;
              background-color: #e0e0e0;
              border-radius: 2rpx;

              &:nth-child(1) { height: 12rpx; }
              &:nth-child(2) { height: 18rpx; }
              &:nth-child(3) { height: 24rpx; }
              &:nth-child(4) { height: 30rpx; }

              &.active {
                background-color: #67c23a;
              }
            }
          }

          .signal-text {
            font-size: 24rpx;
            color: #666666;
          }
        }
      }

      .device-arrow {
        font-size: 48rpx;
        color: #d9d9d9;
      }
    }
  }
}

/* 信息步骤 */
.info-step {
  .form-section {
    .form-item {
      margin-bottom: 32rpx;

      &.required .form-label::after {
        content: '*';
        color: #f56c6c;
        margin-left: 4rpx;
      }

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 12rpx;
      }

      .form-input {
        width: 100%;
        padding: 24rpx;
        background-color: #f8f8f8;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333333;
        box-sizing: border-box;
      }

      .picker-input {
        color: #999999;

        &:not(:empty) {
          color: #333333;
        }
      }

      .form-textarea {
        width: 100%;
        min-height: 160rpx;
        padding: 24rpx;
        background-color: #f8f8f8;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333333;
        box-sizing: border-box;
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 40rpx;

    .btn {
      flex: 1;
      padding: 28rpx;
      font-size: 32rpx;
    }
  }
}

/* 连接步骤 */
.config-step {
  .connect-status {
    text-align: center;
    padding: 80rpx 40rpx;

    .status-icon {
      margin-bottom: 32rpx;

      .loading-spinner {
        width: 100rpx;
        height: 100rpx;
        margin: 0 auto;
        border: 8rpx solid #f0f0f0;
        border-top-color: #1296db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .success-icon {
        display: block;
        width: 100rpx;
        height: 100rpx;
        line-height: 100rpx;
        margin: 0 auto;
        background-color: #67c23a;
        color: #ffffff;
        font-size: 60rpx;
        border-radius: 50%;
      }

      .error-icon {
        display: block;
        width: 100rpx;
        height: 100rpx;
        line-height: 100rpx;
        margin: 0 auto;
        background-color: #f56c6c;
        color: #ffffff;
        font-size: 60rpx;
        border-radius: 50%;
      }
    }

    .status-text {
      font-size: 32rpx;
      color: #333333;
      margin-bottom: 12rpx;
    }

    .error-message {
      font-size: 24rpx;
      color: #f56c6c;
    }
  }

  .connect-actions {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .btn {
      width: 100%;
      padding: 28rpx;
      font-size: 32rpx;
    }
  }
}

/* 确认步骤 */
.confirm-step {
  text-align: center;

  .success-animation {
    margin: 40rpx 0;

    .success-icon-large {
      display: block;
      width: 160rpx;
      height: 160rpx;
      line-height: 160rpx;
      margin: 0 auto;
      background-color: #67c23a;
      color: #ffffff;
      font-size: 100rpx;
      border-radius: 50%;
      animation: scaleIn 0.5s ease-out;
    }
  }

  .success-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .success-desc {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }

  .device-summary {
    text-align: left;
    padding: 32rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    margin-bottom: 40rpx;

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .summary-label {
        font-size: 28rpx;
        color: #666666;
      }

      .summary-value {
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
      }
    }
  }

  .confirm-actions {
    display: flex;
    gap: 20rpx;

    .btn {
      flex: 1;
      padding: 28rpx;
      font-size: 32rpx;
    }
  }
}

/* 动画 */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
