<template>
  <view class="system-settings-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="settings-content">
        <!-- 数据管理 -->
        <view class="section-card">
          <view class="card-title">数据管理</view>
          <slider-field
            v-model="formData.dataRefreshInterval"
            label="数据刷新间隔"
            :min="1"
            :max="60"
            :step="1"
            unit="秒"
          />
          <view class="refresh-preview">
            <text class="preview-text">
              每 {{ formData.dataRefreshInterval }} 秒更新一次设备数据
            </text>
          </view>
          <slider-field
            v-model="formData.dataRetentionDays"
            label="数据保留天数"
            :min="7"
            :max="365"
            :step="1"
            unit="天"
          />
        </view>

        <!-- 连接管理 -->
        <view class="section-card">
          <view class="card-title-row">
            <text class="card-title">连接管理</text>
            <view class="conn-status-mini" :class="'conn-' + connectionState">
              <text class="conn-dot-mini">●</text>
              <text class="conn-label-mini">{{ connectionLabel }}</text>
            </view>
          </view>
          <switch-field
            v-model="formData.autoReconnect"
            label="自动重连"
            description="设备断开后自动尝试重新连接"
          />
        </view>

        <!-- 通知设置 -->
        <view class="section-card">
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
          <view v-if="unresolvedAlarms > 0" class="alarm-reminder">
            <text class="alarm-icon">!</text>
            <text class="alarm-text">当前有 {{ unresolvedAlarms }} 条未处理报警</text>
          </view>
        </view>

        <!-- 语言设置 -->
        <view class="section-card">
          <view class="card-title">语言设置</view>
          <select-field
            v-model="formData.language"
            label="系统语言"
            :options="languageOptions"
          />
        </view>

        <!-- 缓存管理 -->
        <view class="section-card">
          <view class="card-title">缓存管理</view>
          <view class="storage-info">
            <view class="storage-row">
              <text class="info-label">缓存大小</text>
              <text class="info-value">{{ cacheSize }}</text>
            </view>
            <view class="storage-bar">
              <view class="storage-bar-fill" :style="{ width: storagePercent + '%' }" />
            </view>
            <view class="storage-row">
              <text class="storage-hint">{{ storagePercent.toFixed(1) }}% 已使用</text>
              <text class="storage-hint">上限 {{ storageLimitLabel }}</text>
            </view>
          </view>
          <button class="clear-cache-btn" @click="handleClearCache">清除缓存</button>

          <!-- 导入导出 -->
          <view class="export-section">
            <button class="export-btn" @click="handleExport">导出设置</button>
            <button class="export-btn" @click="handleImport">导入设置</button>
          </view>
        </view>

        <!-- Agent 通信日志 -->
        <view class="section-card">
          <view class="card-title">系统诊断</view>
          <view class="diag-row">
            <text class="diag-label">事件总线订阅数</text>
            <text class="diag-value">{{ diagnostics.totalSubscriptions }}</text>
          </view>
          <view class="diag-row">
            <text class="diag-label">事件日志数量</text>
            <text class="diag-value">{{ diagnostics.eventLogSize }}</text>
          </view>
          <view class="diag-row">
            <text class="diag-label">最后事件时间</text>
            <text class="diag-value">{{ lastEventTime }}</text>
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
import { useDeviceStore } from '@/store/modules/device'
import type { SystemSettings } from '@/types/settings'
import { getStorageInfo, exportAllSettings, importSettings } from '@/utils/storage'
import { agentBus } from '@/utils/event-bus'
import dayjs from 'dayjs'
import SwitchField from '@/components/forms/switch-field/index.vue'
import SliderField from '@/components/forms/slider-field/index.vue'
import SelectField from '@/components/forms/select-field/index.vue'

const settingsStore = useSettingsStore()
const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()

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
const storagePercent = ref(0)
const storageLimitLabel = ref('5 MB')

// 蓝牙连接状态
const connectionState = computed(() => {
  if (bluetoothStore.isConnected) return 'connected'
  if (bluetoothStore.isConnecting) return 'connecting'
  return 'disconnected'
})

const connectionLabel = computed(() => {
  const labels: Record<string, string> = {
    connected: '已连接',
    connecting: '连接中',
    disconnected: '未连接'
  }
  return labels[connectionState.value]
})

// 未解决报警数
const unresolvedAlarms = computed(() => {
  return deviceStore.alarms.filter(a => !a.resolved).length
})

// 事件总线诊断
const diagnostics = computed(() => agentBus.getDiagnostics())

const lastEventTime = computed(() => {
  const t = diagnostics.value.lastEventTime
  if (!t) return '无'
  return dayjs(t).format('HH:mm:ss')
})

onMounted(() => {
  formData.value = { ...settingsStore.systemSettings }
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
    const limitKB = info.limitSize || 5120
    storagePercent.value = Math.min((sizeKB / limitKB) * 100, 100)
    storageLimitLabel.value = limitKB >= 1024 ? `${(limitKB / 1024).toFixed(0)} MB` : `${limitKB} KB`
  } catch (error) {
    cacheSize.value = '未知'
  }
}

function handleSave() {
  try {
    settingsStore.updateSystemSettings(formData.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}

function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '清除缓存后，历史数据将被删除且无法恢复。确定要清除吗？',
    confirmText: '清除',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        try {
          const info = uni.getStorageInfoSync()
          info.keys.forEach((key) => {
            if (!key.startsWith('settings_')) {
              uni.removeStorageSync(key)
            }
          })
          calculateCacheSize()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (error) {
          uni.showToast({ title: '清除失败', icon: 'error' })
        }
      }
    }
  })
}

function handleExport() {
  try {
    const data = exportAllSettings()
    const jsonStr = JSON.stringify(data, null, 2)
    // 复制到剪贴板
    uni.setClipboardData({
      data: jsonStr,
      success: () => {
        uni.showToast({ title: '设置已复制到剪贴板', icon: 'success' })
      }
    })
  } catch (error) {
    uni.showToast({ title: '导出失败', icon: 'error' })
  }
}

function handleImport() {
  uni.getClipboardData({
    success: (res) => {
      try {
        const data = JSON.parse(res.data)
        uni.showModal({
          title: '导入设置',
          content: '将覆盖当前所有设置，确定继续？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              importSettings(data)
              settingsStore.loadAllSettings()
              formData.value = { ...settingsStore.systemSettings }
              calculateCacheSize()
              uni.showToast({ title: '导入成功', icon: 'success' })
            }
          }
        })
      } catch {
        uni.showToast({ title: '剪贴板中无有效设置数据', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.system-settings-page {
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

          .conn-status-mini {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .conn-dot-mini { font-size: 16rpx; }
            .conn-label-mini { font-size: 22rpx; font-weight: 600; letter-spacing: 0.5rpx; }

            &.conn-connected {
              .conn-dot-mini { color: #10b981; text-shadow: 0 0 8rpx rgba(16, 185, 129, 0.5); }
              .conn-label-mini { color: #10b981; }
            }

            &.conn-connecting {
              .conn-dot-mini { color: #f59e0b; animation: statusPulse 1.5s infinite; }
              .conn-label-mini { color: #f59e0b; }
            }

            &.conn-disconnected {
              .conn-dot-mini { color: #cbd5e1; }
              .conn-label-mini { color: #94a3b8; }
            }
          }
        }

        .refresh-preview {
          padding: 12rpx 20rpx;
          margin-bottom: 20rpx;
          background: #f8fafc;
          border: 1rpx solid #f1f5f9;
          border-radius: 14rpx;

          .preview-text {
            font-size: 22rpx;
            color: #0ea5e9;
            font-weight: 500;
          }
        }

        .alarm-reminder {
          display: flex;
          align-items: center;
          gap: 12rpx;
          padding: 16rpx 20rpx;
          margin-top: 16rpx;
          background: rgba(245, 158, 11, 0.08);
          border-radius: 14rpx;
          border: 1rpx solid rgba(245, 158, 11, 0.2);

          .alarm-icon {
            width: 36rpx;
            height: 36rpx;
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            font-weight: 700;
          }

          .alarm-text {
            font-size: 24rpx;
            color: #f59e0b;
            font-weight: 500;
          }
        }

        .storage-info {
          margin-bottom: 20rpx;

          .storage-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8rpx 0;

            .info-label {
              font-size: 28rpx;
              color: #475569;
              font-weight: 600;
              letter-spacing: 0.5rpx;
            }

            .info-value {
              font-size: 28rpx;
              color: #0ea5e9;
              font-weight: 600;
            }

            .storage-hint {
              font-size: 22rpx;
              color: #94a3b8;
              font-weight: 500;
            }
          }

          .storage-bar {
            height: 8rpx;
            background: #f1f5f9;
            border-radius: 4rpx;
            margin: 12rpx 0;
            overflow: hidden;

            .storage-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #0ea5e9, #06b6d4);
              border-radius: 4rpx;
              transition: width 0.3s ease;
            }
          }
        }

        .clear-cache-btn {
          width: 100%;
          height: 80rpx;
          background: rgba(239, 68, 68, 0.06);
          color: #ef4444;
          border: 1rpx solid rgba(239, 68, 68, 0.12);
          border-radius: 18rpx;
          font-size: 28rpx;
          font-weight: 600;
          letter-spacing: 0.5rpx;
          margin-bottom: 20rpx;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

          &:active {
            background: rgba(239, 68, 68, 0.12);
            transform: scale(0.97);
          }
        }

        .export-section {
          display: flex;
          gap: 16rpx;

          .export-btn {
            flex: 1;
            height: 80rpx;
            background: #f8fafc;
            color: #475569;
            border: 1rpx solid #e2e8f0;
            border-radius: 18rpx;
            font-size: 26rpx;
            font-weight: 500;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

            &:active {
              background: #f1f5f9;
              transform: scale(0.97);
            }
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
            color: #0ea5e9;
            font-weight: 500;
          }
        }
      }
    }
  }

  .section-accent {
    width: 6rpx;
    height: 32rpx;
    border-radius: 3rpx;
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

        &:active {
          transform: scale(0.97);
        }
      }
    }
  }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
