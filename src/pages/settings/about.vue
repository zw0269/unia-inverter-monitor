<template>
  <view class="about-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="about-content">
        <!-- 应用信息 -->
        <view class="app-info-card">
          <view class="app-logo" :class="{ 'logo-pulse': logoPulsing }">
            <text class="logo-icon">⚡</text>
          </view>
          <text class="app-name">125kW 混逆监控系统</text>
          <text class="app-version">v{{ appVersion }}</text>
          <text class="app-description">专业的光伏储能逆变器监控管理系统</text>
          <view class="app-badges">
            <view class="badge">UNI-APP</view>
            <view class="badge">Vue 3</view>
            <view class="badge">TypeScript</view>
          </view>
        </view>

        <!-- 系统状态 -->
        <view class="section-card">
          <view class="section-title">系统状态</view>
          <view class="status-grid">
            <view class="status-item">
              <view class="status-icon-wrap ok">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">Settings Agent</text>
                <text class="status-value ok">运行中</text>
              </view>
            </view>
            <view class="status-item">
              <view class="status-icon-wrap" :class="btAgentStatus">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">Bluetooth Agent</text>
                <text class="status-value" :class="btAgentStatus">
                  {{ bluetoothStore.initialized ? '已就绪' : '待初始化' }}
                </text>
              </view>
            </view>
            <view class="status-item">
              <view class="status-icon-wrap ok">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">Device Agent</text>
                <text class="status-value ok">运行中</text>
              </view>
            </view>
            <view class="status-item">
              <view class="status-icon-wrap ok">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">Revenue Agent</text>
                <text class="status-value ok">运行中</text>
              </view>
            </view>
            <view class="status-item">
              <view class="status-icon-wrap ok">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">Meter Agent</text>
                <text class="status-value ok">运行中</text>
              </view>
            </view>
            <view class="status-item">
              <view class="status-icon-wrap ok">
                <text class="status-icon-text">●</text>
              </view>
              <view class="status-detail">
                <text class="status-label">App Agent</text>
                <text class="status-value ok">运行中</text>
              </view>
            </view>
          </view>
          <view class="event-bus-info">
            <text class="bus-label">事件总线</text>
            <text class="bus-value">
              {{ diagnostics.totalSubscriptions }} 订阅 / {{ diagnostics.eventLogSize }} 事件
            </text>
          </view>
        </view>

        <!-- 构建信息 -->
        <view class="section-card">
          <view class="section-title">构建信息</view>
          <view class="info-list">
            <view class="info-item" v-for="item in buildInfo" :key="item.label">
              <text class="info-label">{{ item.label }}</text>
              <text class="info-value">{{ item.value }}</text>
            </view>
          </view>
        </view>

        <!-- 设备信息 -->
        <view v-if="systemInfo" class="section-card">
          <view class="section-title">设备信息</view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">平台</text>
              <text class="info-value">{{ systemInfo.platform || '未知' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">系统版本</text>
              <text class="info-value">{{ systemInfo.system || '未知' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">屏幕尺寸</text>
              <text class="info-value">{{ systemInfo.screenWidth }}x{{ systemInfo.screenHeight }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">像素比</text>
              <text class="info-value">{{ systemInfo.pixelRatio }}x</text>
            </view>
          </view>
        </view>

        <!-- 帮助与支持 -->
        <view class="section-card">
          <view class="section-title">帮助与支持</view>
          <view class="link-list">
            <view class="link-item" v-for="link in helpLinks" :key="link.label" @click="link.action">
              <view class="link-content">
                <text class="link-icon">{{ link.icon }}</text>
                <text class="link-text">{{ link.label }}</text>
              </view>
              <text class="link-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 版权信息 -->
        <view class="copyright">
          <text class="copyright-text">© 2024 125kW 混逆监控系统</text>
          <text class="copyright-text">All Rights Reserved</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { agentBus } from '@/utils/event-bus'
import dayjs from 'dayjs'

const appStore = useAppStore()
const bluetoothStore = useBluetoothStore()

const logoPulsing = ref(false)
const appVersion = computed(() => appStore.appVersion)
const systemInfo = computed(() => appStore.systemInfo)
const diagnostics = computed(() => agentBus.getDiagnostics())

const btAgentStatus = computed(() => bluetoothStore.initialized ? 'ok' : 'warn')

const buildInfo = ref([
  { label: 'UniApp 版本', value: '3.0.0' },
  { label: 'Vue 版本', value: '3.4.0' },
  { label: '编译器版本', value: 'HBuilderX 4.0.0' },
  { label: '构建日期', value: dayjs().format('YYYY-MM-DD') }
])

const helpLinks = ref([
  {
    icon: '📖',
    label: '用户手册',
    action: () => uni.showToast({ title: '即将打开用户手册', icon: 'none' })
  },
  {
    icon: '🔒',
    label: '隐私政策',
    action: () => uni.showToast({ title: '即将打开隐私政策', icon: 'none' })
  },
  {
    icon: '📋',
    label: '使用条款',
    action: () => uni.showToast({ title: '即将打开使用条款', icon: 'none' })
  },
  {
    icon: '🔄',
    label: '检查更新',
    action: handleCheckUpdate
  }
])

onMounted(() => {
  setTimeout(() => {
    logoPulsing.value = true
    setTimeout(() => { logoPulsing.value = false }, 1000)
  }, 300)
})

function handleCheckUpdate() {
  uni.showLoading({ title: '检查更新中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '检查更新',
      content: '当前已是最新版本 v' + appVersion.value,
      showCancel: false
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #f1f5f9;

  .page-scroll {
    padding: 24rpx 28rpx;

    .about-content {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      // 应用信息卡片
      .app-info-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 56rpx 32rpx 40rpx;
        background: #fff;
        border-radius: 20rpx;
        border: 1rpx solid rgba(15, 23, 42, 0.04);
        box-shadow: 0 1rpx 3rpx rgba(15, 23, 42, 0.04), 0 4rpx 16rpx rgba(15, 23, 42, 0.03);

        .app-logo {
          width: 140rpx;
          height: 140rpx;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          border-radius: 32rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28rpx;
          box-shadow: 0 8rpx 32rpx rgba(14, 165, 233, 0.3);
          transition: transform 0.3s ease;

          &.logo-pulse {
            animation: logoBounce 0.6s ease;
          }

          .logo-icon {
            font-size: 80rpx;
          }
        }

        .app-name {
          font-size: 36rpx;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10rpx;
          letter-spacing: 2rpx;
        }

        .app-version {
          font-size: 26rpx;
          color: #0ea5e9;
          margin-bottom: 16rpx;
          font-weight: 600;
        }

        .app-description {
          font-size: 24rpx;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 24rpx;
        }

        .app-badges {
          display: flex;
          gap: 12rpx;

          .badge {
            padding: 6rpx 16rpx;
            background: #f8fafc;
            border: 1rpx solid #e2e8f0;
            border-radius: 10rpx;
            font-size: 20rpx;
            color: #475569;
            font-weight: 500;
          }
        }
      }

      // 通用 section 卡片
      .section-card {
        background: #fff;
        border-radius: 20rpx;
        padding: 24rpx;
        border: 1rpx solid rgba(15, 23, 42, 0.04);
        box-shadow: 0 1rpx 3rpx rgba(15, 23, 42, 0.04), 0 4rpx 16rpx rgba(15, 23, 42, 0.03);

        .section-title {
          font-size: 30rpx;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20rpx;
          padding-bottom: 16rpx;
          border-bottom: 1rpx solid #f1f5f9;
          letter-spacing: 0.5rpx;
        }
      }

      // 系统状态
      .status-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 16rpx;

        .status-item {
          width: calc(50% - 8rpx);
          display: flex;
          align-items: center;
          gap: 12rpx;
          padding: 14rpx 16rpx;
          background: #f8fafc;
          border-radius: 14rpx;

          .status-icon-wrap {
            .status-icon-text {
              font-size: 18rpx;
              animation: statusPulse 2s ease-in-out infinite;
            }
            &.ok .status-icon-text {
              color: #10b981;
              text-shadow: 0 0 6rpx rgba(16, 185, 129, 0.4);
            }
            &.warn .status-icon-text {
              color: #f59e0b;
              text-shadow: 0 0 6rpx rgba(245, 158, 11, 0.4);
            }
          }

          .status-detail {
            display: flex;
            flex-direction: column;

            .status-label {
              font-size: 22rpx;
              color: #94a3b8;
              font-weight: 500;
            }

            .status-value {
              font-size: 22rpx;
              font-weight: 600;
              &.ok { color: #10b981; }
              &.warn { color: #f59e0b; }
            }
          }
        }
      }

      .event-bus-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12rpx 16rpx;
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(6, 182, 212, 0.04));
        border-radius: 14rpx;

        .bus-label {
          font-size: 24rpx;
          color: #94a3b8;
          font-weight: 500;
        }

        .bus-value {
          font-size: 24rpx;
          color: #0ea5e9;
          font-weight: 600;
        }
      }

      // 信息列表
      .info-list {
        display: flex;
        flex-direction: column;

        .info-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14rpx 0;
          border-bottom: 1rpx solid #f1f5f9;
          &:last-child { border-bottom: none; }

          .info-label {
            font-size: 26rpx;
            color: #94a3b8;
            font-weight: 500;
          }

          .info-value {
            font-size: 26rpx;
            color: #0f172a;
            font-weight: 600;
          }
        }
      }

      // 链接列表
      .link-list {
        .link-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20rpx 0;
          border-bottom: 1rpx solid #f1f5f9;
          cursor: pointer;

          &:last-child { border-bottom: none; }

          &:active {
            background: #f8fafc;
            margin: 0 -20rpx;
            padding-left: 20rpx;
            padding-right: 20rpx;
            border-radius: 8rpx;
          }

          .link-content {
            display: flex;
            align-items: center;
            gap: 16rpx;

            .link-icon { font-size: 36rpx; }

            .link-text {
              font-size: 28rpx;
              color: #0f172a;
              font-weight: 500;
            }
          }

          .link-arrow {
            font-size: 40rpx;
            color: #cbd5e1;
            font-weight: 300;
          }
        }
      }

      // 版权
      .copyright {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40rpx 32rpx;
        gap: 8rpx;

        .copyright-text {
          font-size: 22rpx;
          color: #cbd5e1;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes logoBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.1); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
