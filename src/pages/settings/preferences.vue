<template>
  <view class="preferences-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 外观设置 -->
        <view class="section-card">
          <view class="card-title">外观设置</view>
          <view class="theme-selector">
            <view class="theme-label">主题模式</view>
            <view class="theme-options">
              <view
                v-for="opt in themeOptions"
                :key="opt.value"
                class="theme-option"
                :class="{ active: formData.theme === opt.value }"
                @click="formData.theme = opt.value as any"
              >
                <view class="theme-icon-wrap" :class="'theme-' + opt.value">
                  <text class="theme-icon">{{ opt.icon }}</text>
                </view>
                <text class="theme-option-label">{{ opt.label }}</text>
              </view>
            </view>
          </view>
          <view class="theme-preview">
            <view class="preview-label">主题预览</view>
            <view class="preview-box" :class="{ 'dark': previewDark }">
              <view class="preview-card">
                <view class="preview-header">
                  <view class="preview-dot dot-1" />
                  <view class="preview-dot dot-2" />
                  <view class="preview-dot dot-3" />
                </view>
                <view class="preview-title">示例卡片</view>
                <view class="preview-bar" />
                <view class="preview-bar short" />
              </view>
            </view>
          </view>
        </view>

        <!-- 单位设置 -->
        <view class="section-card">
          <view class="card-title">单位设置</view>
          <view class="unit-grid">
            <view class="unit-item">
              <text class="unit-label">功率单位</text>
              <view class="unit-options">
                <view
                  v-for="opt in powerUnitOptions"
                  :key="opt.value"
                  class="unit-chip"
                  :class="{ active: formData.powerUnit === opt.value }"
                  @click="formData.powerUnit = opt.value as any"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
            <view class="unit-item">
              <text class="unit-label">电量单位</text>
              <view class="unit-options">
                <view
                  v-for="opt in energyUnitOptions"
                  :key="opt.value"
                  class="unit-chip"
                  :class="{ active: formData.energyUnit === opt.value }"
                  @click="formData.energyUnit = opt.value as any"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
            <view class="unit-item">
              <text class="unit-label">货币符号</text>
              <view class="unit-options">
                <view
                  v-for="opt in currencyOptions"
                  :key="opt.value"
                  class="unit-chip"
                  :class="{ active: formData.currencySymbol === opt.value }"
                  @click="formData.currencySymbol = opt.value as any"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
            <view class="unit-item">
              <text class="unit-label">温度单位</text>
              <view class="unit-options">
                <view
                  v-for="opt in temperatureOptions"
                  :key="opt.value"
                  class="unit-chip"
                  :class="{ active: formData.temperatureUnit === opt.value }"
                  @click="formData.temperatureUnit = opt.value as any"
                >
                  {{ opt.label }}
                </view>
              </view>
            </view>
          </view>

          <!-- 单位预览 -->
          <view v-if="currentPower > 0" class="unit-preview">
            <view class="preview-row">
              <text class="preview-label-text">当前功率</text>
              <text class="preview-value">{{ formattedPower }}</text>
            </view>
            <view class="preview-row">
              <text class="preview-label-text">今日发电</text>
              <text class="preview-value">{{ formattedEnergy }}</text>
            </view>
            <view class="preview-row">
              <text class="preview-label-text">设备温度</text>
              <text class="preview-value">{{ formattedTemp }}</text>
            </view>
          </view>
        </view>

        <!-- 格式设置 -->
        <view class="section-card">
          <view class="card-title">格式设置</view>
          <select-field
            v-model="formData.dateFormat"
            label="日期格式"
            :options="dateFormatOptions"
          />
          <view class="format-live">
            <text class="format-now">{{ dateExample }}</text>
          </view>
          <select-field
            v-model="formData.timeFormat"
            label="时间格式"
            :options="timeFormatOptions"
          />
          <view class="format-live">
            <text class="format-now">{{ timeExample }}</text>
          </view>
        </view>
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
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import { useDeviceStore } from '@/store/modules/device'
import type { UserPreferences } from '@/types/settings'
import dayjs from 'dayjs'
import SelectField from '@/components/forms/select-field/index.vue'

const settingsStore = useSettingsStore()
const deviceStore = useDeviceStore()

const formData = ref<UserPreferences>({
  theme: 'auto',
  powerUnit: 'kW',
  energyUnit: 'kWh',
  currencySymbol: '¥',
  temperatureUnit: '℃',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h'
})

const themeOptions = [
  { label: '跟随系统', value: 'auto', icon: '◐' },
  { label: '浅色', value: 'light', icon: '☀' },
  { label: '深色', value: 'dark', icon: '☾' }
]

const powerUnitOptions = [
  { label: 'kW', value: 'kW' },
  { label: 'W', value: 'W' }
]

const energyUnitOptions = [
  { label: 'kWh', value: 'kWh' },
  { label: 'MWh', value: 'MWh' }
]

const currencyOptions = [
  { label: '¥', value: '¥' },
  { label: '$', value: '$' },
  { label: '€', value: '€' }
]

const temperatureOptions = [
  { label: '℃', value: '℃' },
  { label: '℉', value: '℉' }
]

const dateFormatOptions = [
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }
]

const timeFormatOptions = [
  { label: '24小时制', value: '24h' },
  { label: '12小时制', value: '12h' }
]

// 实时数据
const currentPower = computed(() => deviceStore.currentPower)

// 格式化后的功率
const formattedPower = computed(() => {
  const power = deviceStore.currentPower
  if (formData.value.powerUnit === 'W') {
    return (power * 1000).toFixed(0) + ' W'
  }
  return power.toFixed(2) + ' kW'
})

// 格式化后的电量
const formattedEnergy = computed(() => {
  const energy = deviceStore.todayEnergy
  if (formData.value.energyUnit === 'MWh') {
    return (energy / 1000).toFixed(3) + ' MWh'
  }
  return energy.toFixed(2) + ' kWh'
})

// 格式化后的温度
const formattedTemp = computed(() => {
  const temp = deviceStore.temperature
  if (formData.value.temperatureUnit === '℉') {
    return (temp * 9 / 5 + 32).toFixed(1) + ' ℉'
  }
  return temp.toFixed(1) + ' ℃'
})

// 主题预览
const previewDark = computed(() => {
  if (formData.value.theme === 'auto') {
    // #ifdef H5
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    // #endif
    return false
  }
  return formData.value.theme === 'dark'
})

const dateExample = computed(() => dayjs().format(formData.value.dateFormat))

const timeExample = computed(() => {
  if (formData.value.timeFormat === '24h') {
    return dayjs().format('HH:mm:ss')
  }
  return dayjs().format('hh:mm:ss A')
})

onMounted(() => {
  formData.value = { ...settingsStore.userPreferences }
})

function handleSave() {
  try {
    settingsStore.updateUserPreferences(formData.value)
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
        settingsStore.resetToDefaults('user')
        formData.value = { ...settingsStore.userPreferences }
        uni.showToast({ title: '已恢复默认', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.preferences-page {
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

        // 主题选择器
        .theme-selector {
          margin-bottom: 24rpx;

          .theme-label {
            font-size: 26rpx;
            font-weight: 600;
            color: #475569;
            margin-bottom: 16rpx;
          }

          .theme-options {
            display: flex;
            gap: 16rpx;

            .theme-option {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10rpx;
              padding: 20rpx 12rpx;
              background: #f8fafc;
              border-radius: 16rpx;
              border: 2rpx solid transparent;
              cursor: pointer;
              transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

              &.active {
                border-color: #0ea5e9;
                background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(6, 182, 212, 0.04));
              }

              &:active {
                transform: scale(0.97);
              }

              .theme-icon-wrap {
                width: 64rpx;
                height: 64rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;

                .theme-icon {
                  font-size: 36rpx;
                }

                &.theme-auto {
                  background: linear-gradient(135deg, #f1f5f9 50%, #1e293b 50%);
                }

                &.theme-light {
                  background: #f8fafc;
                }

                &.theme-dark {
                  background: #1e293b;
                }
              }

              .theme-option-label {
                font-size: 24rpx;
                font-weight: 500;
                color: #0f172a;
              }
            }
          }
        }

        // 主题预览
        .theme-preview {
          .preview-label {
            font-size: 26rpx;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12rpx;
          }

          .preview-box {
            padding: 20rpx;
            background: #f8fafc;
            border-radius: 14rpx;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

            &.dark {
              background: #0f172a;

              .preview-card {
                background: #1e293b;
                border-color: rgba(255, 255, 255, 0.06);

                .preview-title { color: #e2e8f0; }
                .preview-bar { background: rgba(255, 255, 255, 0.1); }
              }
            }

            .preview-card {
              background: #fff;
              border: 1rpx solid #e2e8f0;
              border-radius: 10rpx;
              padding: 20rpx;
              transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

              .preview-header {
                display: flex;
                gap: 8rpx;
                margin-bottom: 16rpx;

                .preview-dot {
                  width: 16rpx;
                  height: 16rpx;
                  border-radius: 50%;

                  &.dot-1 { background: #ff5f57; }
                  &.dot-2 { background: #febc2e; }
                  &.dot-3 { background: #28c840; }
                }
              }

              .preview-title {
                font-size: 26rpx;
                font-weight: 700;
                color: #0f172a;
                letter-spacing: 0.5rpx;
                margin-bottom: 12rpx;
              }

              .preview-bar {
                height: 12rpx;
                background: #f1f5f9;
                border-radius: 6rpx;
                margin-bottom: 8rpx;

                &.short { width: 60%; }
              }
            }
          }
        }

        // 单位网格
        .unit-grid {
          display: flex;
          flex-direction: column;
          gap: 20rpx;

          .unit-item {
            .unit-label {
              font-size: 26rpx;
              font-weight: 600;
              color: #475569;
              margin-bottom: 12rpx;
              display: block;
            }

            .unit-options {
              display: flex;
              gap: 12rpx;

              .unit-chip {
                flex: 1;
                text-align: center;
                padding: 14rpx 0;
                font-size: 26rpx;
                font-weight: 500;
                color: #475569;
                background: #f8fafc;
                border-radius: 12rpx;
                border: 1rpx solid transparent;
                cursor: pointer;
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

                &.active {
                  color: #0ea5e9;
                  border-color: #0ea5e9;
                  background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(6, 182, 212, 0.04));
                }

                &:active {
                  transform: scale(0.97);
                }
              }
            }
          }
        }

        // 单位预览
        .unit-preview {
          margin-top: 20rpx;
          padding: 16rpx 20rpx;
          background: #f8fafc;
          border: 1rpx solid #f1f5f9;
          border-radius: 14rpx;

          .preview-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8rpx 0;

            .preview-label-text {
              font-size: 24rpx;
              font-weight: 500;
              color: #94a3b8;
            }

            .preview-value {
              font-size: 26rpx;
              color: #0ea5e9;
              font-weight: 700;
            }
          }
        }

        // 格式实时预览
        .format-live {
          padding: 10rpx 20rpx;
          margin-bottom: 16rpx;

          .format-now {
            font-size: 24rpx;
            color: #0ea5e9;
            font-weight: 600;
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
    padding: 24rpx 32rpx;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-top: 1rpx solid #e2e8f0;

    .action-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 18rpx;
      font-size: 30rpx;
      font-weight: 600;
      border: none;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &.primary {
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        color: #fff;
        box-shadow: 0 4rpx 16rpx rgba(14, 165, 233, 0.25);

        &:active {
          transform: scale(0.97);
        }
      }

      &.secondary {
        background: #f8fafc;
        color: #475569;
        border: 1rpx solid #e2e8f0;

        &:active {
          transform: scale(0.97);
        }
      }
    }
  }
}
</style>
