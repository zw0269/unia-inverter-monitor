<template>
  <view class="settings-page">
    <!-- 顶部横幅 -->
    <view class="page-banner">
      <view class="banner-content">
        <text class="banner-title">设置</text>
        <text class="banner-subtitle">系统配置与个性化</text>
      </view>
      <view v-if="pendingChanges > 0" class="pending-badge">
        <text class="pending-count">{{ pendingChanges }}</text>
        <text class="pending-text">待同步</text>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll">
      <view class="settings-list">
        <view
          v-for="(category, index) in categories"
          :key="category.key"
          class="category-card"
          :class="['accent-' + index, { 'card-enter': mounted }]"
          :style="{ animationDelay: (index * 60 + 80) + 'ms' }"
          @click="navigateToCategory(category.route)"
        >
          <view class="card-accent" :class="'accent-bar-' + index" />
          <view class="category-content">
            <view class="category-icon-wrap">
              <view class="category-icon" :class="'icon-bg-' + index">
                {{ category.icon }}
              </view>
              <view
                v-if="getStatus(category.key)"
                class="status-dot"
                :class="'status-' + getStatus(category.key)!.status"
              />
            </view>
            <view class="category-info">
              <view class="category-name-row">
                <text class="category-name">{{ category.name }}</text>
                <view v-if="getStatus(category.key)?.status === 'syncing'" class="sync-indicator">
                  <text class="sync-pulse">●</text>
                </view>
              </view>
              <text class="category-description">{{ category.description }}</text>
              <text v-if="getStatus(category.key)" class="category-summary">
                {{ getStatus(category.key)!.summary }}
              </text>
            </view>
            <view class="category-arrow-wrap">
              <text class="category-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Agent 通信状态 -->
      <view class="agent-status-bar" :class="{ 'card-enter': mounted }" :style="{ animationDelay: '480ms' }">
        <view class="agent-header">
          <view class="agent-dot" />
          <text class="agent-title">Agent 事件总线</text>
        </view>
        <view class="agent-metrics">
          <view class="metric-item">
            <text class="metric-num">{{ diagnostics.totalSubscriptions }}</text>
            <text class="metric-label">订阅</text>
          </view>
          <view class="metric-divider" />
          <view class="metric-item">
            <text class="metric-num">{{ diagnostics.eventLogSize }}</text>
            <text class="metric-label">事件</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SettingsCategoryInfo, CategoryStatus } from '@/types/settings'
import { useSettingsStore } from '@/store/modules/settings'
import { agentBus } from '@/utils/event-bus'

const settingsStore = useSettingsStore()
const mounted = ref(false)

const categories = ref<SettingsCategoryInfo[]>([
  {
    key: 'device',
    name: '设备参数',
    description: '配置设备额定功率、保护参数等',
    icon: '⚙️',
    route: '/pages/settings/device'
  },
  {
    key: 'system',
    name: '系统设置',
    description: '数据刷新、通知、语言等系统配置',
    icon: '🖥️',
    route: '/pages/settings/system'
  },
  {
    key: 'comm',
    name: '通信参数',
    description: '蓝牙、Wi-Fi、云同步配置',
    icon: '📡',
    route: '/pages/settings/communication'
  },
  {
    key: 'user',
    name: '用户偏好',
    description: '主题、单位、格式等个性化设置',
    icon: '👤',
    route: '/pages/settings/preferences'
  },
  {
    key: 'about' as any,
    name: '关于应用',
    description: '版本信息、用户手册、隐私政策',
    icon: 'ℹ️',
    route: '/pages/settings/about'
  }
])

const pendingChanges = computed(() => settingsStore.pendingChanges)
const diagnostics = computed(() => agentBus.getDiagnostics())

function getStatus(key: string): CategoryStatus | undefined {
  return settingsStore.categoryStatuses.find(s => s.key === key)
}

function navigateToCategory(route: string) {
  uni.navigateTo({ url: route })
}

onMounted(() => {
  settingsStore.refreshAllStatuses()
  setTimeout(() => {
    mounted.value = true
  }, 50)
})
</script>

<style lang="scss" scoped>
// ── Design System: Refined Industrial ──
// Slate palette + Energy-themed accents
// Layered shadows + Left accent borders

.settings-page {
  min-height: 100vh;
  background: #f1f5f9;

  .page-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 36rpx 32rpx 28rpx;
    background: #fff;
    border-bottom: 1rpx solid #e2e8f0;

    .banner-content {
      .banner-title {
        font-size: 44rpx;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 2rpx;
        display: block;
      }

      .banner-subtitle {
        font-size: 24rpx;
        color: #94a3b8;
        margin-top: 6rpx;
        display: block;
        letter-spacing: 1rpx;
      }
    }

    .pending-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 20rpx;
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.08));
      border: 1rpx solid rgba(14, 165, 233, 0.15);
      border-radius: 24rpx;

      .pending-count {
        font-size: 26rpx;
        font-weight: 700;
        color: #0ea5e9;
      }

      .pending-text {
        font-size: 22rpx;
        color: #0ea5e9;
        font-weight: 500;
      }
    }
  }

  .page-scroll {
    padding: 24rpx 28rpx;

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 16rpx;

      .category-card {
        position: relative;
        background: #fff;
        border-radius: 20rpx;
        overflow: hidden;
        box-shadow:
          0 1rpx 3rpx rgba(15, 23, 42, 0.04),
          0 4rpx 16rpx rgba(15, 23, 42, 0.03);
        border: 1rpx solid rgba(15, 23, 42, 0.04);
        cursor: pointer;
        opacity: 0;
        transform: translateY(24rpx);
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);

        &.card-enter {
          animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        &:active {
          transform: scale(0.975) translateY(0) !important;
          box-shadow:
            0 1rpx 2rpx rgba(15, 23, 42, 0.06),
            0 2rpx 8rpx rgba(15, 23, 42, 0.04);
        }

        .card-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6rpx;
        }

        // 每个分类独特的强调色
        .accent-bar-0 { background: linear-gradient(180deg, #3b82f6, #2563eb); }
        .accent-bar-1 { background: linear-gradient(180deg, #10b981, #059669); }
        .accent-bar-2 { background: linear-gradient(180deg, #8b5cf6, #7c3aed); }
        .accent-bar-3 { background: linear-gradient(180deg, #f59e0b, #d97706); }
        .accent-bar-4 { background: linear-gradient(180deg, #64748b, #475569); }

        .category-content {
          display: flex;
          align-items: center;
          padding: 28rpx 24rpx 28rpx 28rpx;

          .category-icon-wrap {
            position: relative;
            margin-right: 24rpx;
            flex-shrink: 0;

            .category-icon {
              font-size: 40rpx;
              width: 84rpx;
              height: 84rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 22rpx;
            }

            // 渐变图标背景 - 更有层次感
            .icon-bg-0 {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.06));
              box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.1);
            }
            .icon-bg-1 {
              background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06));
              box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.1);
            }
            .icon-bg-2 {
              background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.06));
              box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.1);
            }
            .icon-bg-3 {
              background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06));
              box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.1);
            }
            .icon-bg-4 {
              background: linear-gradient(135deg, rgba(100, 116, 139, 0.12), rgba(71, 85, 105, 0.06));
              box-shadow: 0 2rpx 8rpx rgba(100, 116, 139, 0.1);
            }

            .status-dot {
              position: absolute;
              top: -4rpx;
              right: -4rpx;
              width: 18rpx;
              height: 18rpx;
              border-radius: 50%;
              border: 3rpx solid #fff;

              &.status-normal {
                background: #10b981;
                box-shadow: 0 0 8rpx rgba(16, 185, 129, 0.4);
              }
              &.status-warning {
                background: #f59e0b;
                box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.4);
              }
              &.status-error {
                background: #ef4444;
                box-shadow: 0 0 8rpx rgba(239, 68, 68, 0.4);
              }
              &.status-syncing {
                background: #0ea5e9;
                box-shadow: 0 0 8rpx rgba(14, 165, 233, 0.4);
                animation: statusGlow 2s ease-in-out infinite;
              }
            }
          }

          .category-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6rpx;

            .category-name-row {
              display: flex;
              align-items: center;
              gap: 12rpx;

              .sync-indicator .sync-pulse {
                font-size: 16rpx;
                color: #0ea5e9;
                animation: statusGlow 2s ease-in-out infinite;
              }
            }

            .category-name {
              font-size: 30rpx;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.5rpx;
            }

            .category-description {
              font-size: 24rpx;
              color: #94a3b8;
              line-height: 1.5;
            }

            .category-summary {
              font-size: 22rpx;
              color: #0ea5e9;
              font-weight: 600;
              margin-top: 2rpx;
            }
          }

          .category-arrow-wrap {
            width: 48rpx;
            height: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 8rpx;
            flex-shrink: 0;

            .category-arrow {
              font-size: 44rpx;
              color: #cbd5e1;
              font-weight: 300;
              transition: transform 0.15s ease, color 0.15s ease;
            }
          }
        }

        // hover/active 时箭头前移
        &:active .category-arrow {
          transform: translateX(4rpx);
          color: #94a3b8;
        }
      }
    }

    .agent-status-bar {
      margin-top: 24rpx;
      margin-bottom: 24rpx;
      padding: 24rpx 28rpx;
      background: #fff;
      border-radius: 16rpx;
      box-shadow:
        0 1rpx 3rpx rgba(15, 23, 42, 0.04),
        0 4rpx 16rpx rgba(15, 23, 42, 0.03);
      border: 1rpx solid rgba(15, 23, 42, 0.04);
      opacity: 0;
      transform: translateY(24rpx);

      &.card-enter {
        animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .agent-header {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 20rpx;

        .agent-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8rpx rgba(16, 185, 129, 0.5);
          animation: statusGlow 3s ease-in-out infinite;
        }

        .agent-title {
          font-size: 24rpx;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 1rpx;
          text-transform: uppercase;
        }
      }

      .agent-metrics {
        display: flex;
        align-items: center;

        .metric-item {
          flex: 1;
          display: flex;
          align-items: baseline;
          gap: 8rpx;

          .metric-num {
            font-size: 36rpx;
            font-weight: 800;
            color: #0f172a;
          }

          .metric-label {
            font-size: 22rpx;
            color: #94a3b8;
            font-weight: 500;
          }
        }

        .metric-divider {
          width: 1rpx;
          height: 40rpx;
          background: #e2e8f0;
          margin: 0 24rpx;
        }
      }
    }
  }
}

// ── Animations ──

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes statusGlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
