<template>
  <view class="system-settings-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 数据管理 -->
        <glass-card class="settings-card">
          <view class="card-title">数据管理</view>
          <slider-field
            v-model="formData.dataRefreshInterval"
            label="数据刷新间隔"
            :min="1"
            :max="60"
            :step="1"
            unit="秒"
          />
          <slider-field
            v-model="formData.dataRetentionDays"
            label="数据保留天数"
            :min="7"
            :max="365"
            :step="1"
            unit="天"
          />
        </glass-card>

        <!-- 连接管理 -->
        <glass-card class="settings-card">
          <view class="card-title">连接管理</view>
          <switch-field
            v-model="formData.autoReconnect"
            label="自动重连"
            description="设备断开后自动尝试重新连接"
          />
        </glass-card>

        <!-- 通知设置 -->
        <glass-card class="settings-card">
          <view class="card-title">通知设置</view>
          <switch-field
            v-model="formData.alarmNotification"
            label="报警通知"
            description="设备出现故障时推送通知"
          />
          <switch-field
            v-model="formData.soundEnabled"
            label="声音提示"
            description="操作和通知时播放提示音"
          />
          <switch-field
            v-model="formData.vibrationEnabled"
            label="振动提示"
            description="操作和通知时振动反馈"
          />
        </glass-card>

        <!-- 语言设置 -->
        <glass-card class="settings-card">
          <view class="card-title">语言设置</view>
          <select-field
            v-model="formData.language"
            label="系统语言"
            :options="languageOptions"
          />
        </glass-card>

        <!-- 缓存管理 -->
        <glass-card class="settings-card">
          <view class="card-title">缓存管理</view>
          <view class="cache-info">
            <text class="info-label">缓存大小</text>
            <text class="info-value">{{ cacheSize }}</text>
          </view>
          <button class="clear-cache-btn" @click="handleClearCache">清除缓存</button>
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
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import type { SystemSettings } from '@/types/settings'
import { getStorageInfo } from '@/utils/storage'
import GlassCard from '@/components/common/glass-card/index.vue'
import SwitchField from '@/components/forms/switch-field/index.vue'
import SliderField from '@/components/forms/slider-field/index.vue'
import SelectField from '@/components/forms/select-field/index.vue'

const settingsStore = useSettingsStore()

// 表单数据
const formData = ref<SystemSettings>({
  dataRefreshInterval: 2,
  dataRetentionDays: 30,
  autoReconnect: true,
  alarmNotification: true,
  soundEnabled: true,
  vibrationEnabled: false,
  language: 'zh-CN'
})

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const cacheSize = ref('0 KB')

onMounted(() => {
  // 加载设置
  formData.value = { ...settingsStore.systemSettings }

  // 计算缓存大小
  calculateCacheSize()
})

function calculateCacheSize() {
  try {
    const info = getStorageInfo()
    const sizeKB = info.currentSize
    if (sizeKB < 1024) {
      cacheSize.value = `${sizeKB} KB`
    } else {
      cacheSize.value = `${(sizeKB / 1024).toFixed(2)} MB`
    }
  } catch (error) {
    cacheSize.value = '未知'
  }
}

function handleSave() {
  try {
    settingsStore.updateSystemSettings(formData.value)
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

function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '清除缓存后，历史数据将被删除且无法恢复。确定要清除吗？',
    confirmText: '清除',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        try {
          // 清除除设置外的所有缓存
          const info = uni.getStorageInfoSync()
          info.keys.forEach((key) => {
            if (!key.startsWith('settings_')) {
              uni.removeStorageSync(key)
            }
          })

          calculateCacheSize()

          uni.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '清除失败',
            icon: 'error'
          })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.system-settings-page {
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

        .cache-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24rpx 0;
          margin-bottom: 24rpx;

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

        .clear-cache-btn {
          width: 100%;
          height: 88rpx;
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
          border: 2rpx solid #ff4d4f;
          border-radius: 12rpx;
          font-size: 28rpx;
          font-weight: 600;

          &:active {
            background: rgba(255, 77, 79, 0.2);
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
  .system-settings-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .page-scroll {
      .settings-content {
        .settings-card {
          .card-title {
            color: #e0e0e0;
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .cache-info {
            .info-label {
              color: #e0e0e0;
            }

            .info-value {
              color: #4da6ff;
            }
          }

          .clear-cache-btn {
            background: rgba(255, 77, 79, 0.15);
            color: #ff6b6b;
            border-color: #ff6b6b;
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
