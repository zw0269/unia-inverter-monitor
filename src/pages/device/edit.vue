<template>
  <view class="edit-device-page">
    <view v-if="device" class="edit-form">
      <!-- 设备信息表单 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>

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
      </view>

      <view class="form-section">
        <view class="section-title">设备详情</view>

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

      <view class="form-section">
        <view class="section-title">设备信息（只读）</view>

        <view class="info-item">
          <text class="info-label">蓝牙设备名称</text>
          <text class="info-value">{{ device.name }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">蓝牙设备ID</text>
          <text class="info-value small">{{ device.deviceId }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">添加时间</text>
          <text class="info-value">{{ formatDate(device.addedDate) }}</text>
        </view>

        <view v-if="device.lastConnected" class="info-item">
          <text class="info-label">最后连接</text>
          <text class="info-value">{{ formatDate(device.lastConnected) }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="form-actions">
        <button class="btn btn-secondary" @click="handleCancel">
          取消
        </button>
        <button class="btn btn-primary" @click="handleSave">
          保存
        </button>
      </view>

      <!-- 删除按钮 -->
      <view class="delete-section">
        <button class="btn btn-danger" @click="handleDelete">
          删除设备
        </button>
        <view class="delete-tip">
          删除后无法恢复，请谨慎操作
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">❌</text>
      <text class="empty-text">设备不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceStore } from '@/store/modules/device'
import type { SavedDevice } from '@/types/device-add'

const deviceStore = useDeviceStore()

// 设备信息
const device = ref<SavedDevice | null>(null)

// 表单数据
const formData = ref({
  alias: '',
  location: '',
  ratedPower: 0,
  model: '',
  serialNumber: '',
  installDate: '',
  description: ''
})

onMounted(() => {
  // 获取设备ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any

  if (options.id) {
    const deviceData = deviceStore.getDeviceById(options.id)
    if (deviceData) {
      device.value = deviceData
      // 填充表单
      formData.value = {
        alias: deviceData.alias,
        location: deviceData.location,
        ratedPower: deviceData.ratedPower,
        model: deviceData.model,
        serialNumber: deviceData.serialNumber,
        installDate: deviceData.installDate,
        description: deviceData.description || ''
      }
    }
  }
})

/**
 * 日期选择变化
 */
function handleDateChange(e: any) {
  formData.value.installDate = e.detail.value
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 保存
 */
function handleSave() {
  if (!device.value) return

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

  try {
    deviceStore.updateDevice(device.value.id, formData.value)
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  }
}

/**
 * 取消
 */
function handleCancel() {
  uni.navigateBack()
}

/**
 * 删除设备
 */
function handleDelete() {
  if (!device.value) return

  const isCurrentDevice = device.value.id === deviceStore.currentDeviceId

  uni.showModal({
    title: '删除设备',
    content: `确定要删除"${device.value.alias}"吗？${isCurrentDevice ? '\n此设备是当前使用的设备，删除后将自动切换到其他设备。' : ''}\n删除后无法恢复！`,
    confirmColor: '#F56C6C',
    success: (res) => {
      if (res.confirm && device.value) {
        try {
          deviceStore.deleteDevice(device.value.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } catch (error: any) {
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.edit-device-page {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.edit-form {
  .form-section {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 24rpx;
      padding-bottom: 16rpx;
      border-bottom: 2rpx solid #f0f0f0;
    }

    .form-item {
      margin-bottom: 32rpx;

      &:last-child {
        margin-bottom: 0;
      }

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

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 28rpx;
        color: #666666;
      }

      .info-value {
        font-size: 28rpx;
        color: #333333;
        text-align: right;
        max-width: 60%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.small {
          font-size: 24rpx;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 20rpx;
    margin-bottom: 40rpx;

    .btn {
      flex: 1;
      padding: 28rpx;
      font-size: 32rpx;
    }
  }

  .delete-section {
    text-align: center;

    .btn-danger {
      width: 100%;
      padding: 28rpx;
      background-color: #F56C6C;
      color: #ffffff;
      border-radius: 8rpx;
      font-size: 32rpx;
      margin-bottom: 12rpx;

      &:active {
        background-color: #f44336;
      }
    }

    .delete-tip {
      font-size: 24rpx;
      color: #999999;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 200rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    display: block;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #999999;
  }
}
</style>
