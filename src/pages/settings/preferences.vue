<template>
  <view class="preferences-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 外观设置 -->
        <glass-card class="settings-card">
          <view class="card-title">外观设置</view>
          <select-field
            v-model="formData.theme"
            label="主题模式"
            :options="themeOptions"
          />
          <view class="theme-preview">
            <view class="preview-label">主题预览</view>
            <view class="preview-box" :class="{ 'dark': previewDark }">
              <view class="preview-card">
                <view class="preview-title">示例卡片</view>
                <view class="preview-text">这是在当前主题下的显示效果</view>
              </view>
            </view>
          </view>
        </glass-card>

        <!-- 单位设置 -->
        <glass-card class="settings-card">
          <view class="card-title">单位设置</view>
          <select-field
            v-model="formData.powerUnit"
            label="功率单位"
            :options="powerUnitOptions"
          />
          <select-field
            v-model="formData.energyUnit"
            label="电量单位"
            :options="energyUnitOptions"
          />
          <select-field
            v-model="formData.currencySymbol"
            label="货币符号"
            :options="currencyOptions"
          />
          <select-field
            v-model="formData.temperatureUnit"
            label="温度单位"
            :options="temperatureOptions"
          />
        </glass-card>

        <!-- 格式设置 -->
        <glass-card class="settings-card">
          <view class="card-title">格式设置</view>
          <select-field
            v-model="formData.dateFormat"
            label="日期格式"
            :options="dateFormatOptions"
          />
          <view class="format-example">
            <text class="example-label">示例：</text>
            <text class="example-value">{{ dateExample }}</text>
          </view>
          <select-field
            v-model="formData.timeFormat"
            label="时间格式"
            :options="timeFormatOptions"
          />
          <view class="format-example">
            <text class="example-label">示例：</text>
            <text class="example-value">{{ timeExample }}</text>
          </view>
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
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import type { UserPreferences } from '@/types/settings'
import dayjs from 'dayjs'
import GlassCard from '@/components/common/glass-card/index.vue'
import SelectField from '@/components/forms/select-field/index.vue'

const settingsStore = useSettingsStore()

// 表单数据
const formData = ref<UserPreferences>({
  theme: 'auto',
  powerUnit: 'kW',
  energyUnit: 'kWh',
  currencySymbol: '¥',
  temperatureUnit: '℃',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h'
})

// 选项列表
const themeOptions = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色模式', value: 'light' },
  { label: '深色模式', value: 'dark' }
]

const powerUnitOptions = [
  { label: '千瓦 (kW)', value: 'kW' },
  { label: '瓦 (W)', value: 'W' }
]

const energyUnitOptions = [
  { label: '千瓦时 (kWh)', value: 'kWh' },
  { label: '兆瓦时 (MWh)', value: 'MWh' }
]

const currencyOptions = [
  { label: '人民币 (¥)', value: '¥' },
  { label: '美元 ($)', value: '$' },
  { label: '欧元 (€)', value: '€' }
]

const temperatureOptions = [
  { label: '摄氏度 (℃)', value: '℃' },
  { label: '华氏度 (℉)', value: '℉' }
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

// 预览是否为深色
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

// 日期示例
const dateExample = computed(() => {
  const now = dayjs()
  return now.format(formData.value.dateFormat)
})

// 时间示例
const timeExample = computed(() => {
  const now = dayjs()
  if (formData.value.timeFormat === '24h') {
    return now.format('HH:mm:ss')
  } else {
    return now.format('hh:mm:ss A')
  }
})

onMounted(() => {
  // 加载设置
  formData.value = { ...settingsStore.userPreferences }
})

function handleSave() {
  try {
    settingsStore.updateUserPreferences(formData.value)
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
        settingsStore.resetToDefaults('user')
        formData.value = { ...settingsStore.userPreferences }
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
.preferences-page {
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

        .theme-preview {
          margin-top: 32rpx;

          .preview-label {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 16rpx;
            font-weight: 500;
          }

          .preview-box {
            padding: 24rpx;
            background: #f5f5f5;
            border-radius: 12rpx;
            transition: all 0.3s;

            &.dark {
              background: #1a1a1a;

              .preview-card {
                background: #2a2a2a;
                border-color: rgba(255, 255, 255, 0.1);

                .preview-title {
                  color: #e0e0e0;
                }

                .preview-text {
                  color: #999;
                }
              }
            }

            .preview-card {
              background: #fff;
              border: 2rpx solid #e0e0e0;
              border-radius: 8rpx;
              padding: 24rpx;

              .preview-title {
                font-size: 28rpx;
                font-weight: 600;
                color: #333;
                margin-bottom: 12rpx;
              }

              .preview-text {
                font-size: 24rpx;
                color: #666;
                line-height: 1.5;
              }
            }
          }
        }

        .format-example {
          display: flex;
          align-items: center;
          padding: 16rpx 0;
          margin-bottom: 24rpx;

          .example-label {
            font-size: 24rpx;
            color: #999;
            margin-right: 12rpx;
          }

          .example-value {
            font-size: 24rpx;
            color: #2979ff;
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
  .preferences-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .page-scroll {
      .settings-content {
        .settings-card {
          .card-title {
            color: #e0e0e0;
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .theme-preview {
            .preview-label {
              color: #e0e0e0;
            }
          }

          .format-example {
            .example-label {
              color: #666;
            }

            .example-value {
              color: #4da6ff;
            }
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
