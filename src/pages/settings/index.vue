<template>
  <view class="settings-page">
    <view class="page-header">
      <text class="page-title">设置</text>
    </view>

    <view class="settings-list">
      <gradient-card
        v-for="category in categories"
        :key="category.key"
        class="category-card"
        @click="navigateToCategory(category.route)"
      >
        <view class="category-content">
          <view class="category-icon">{{ category.icon }}</view>
          <view class="category-info">
            <text class="category-name">{{ category.name }}</text>
            <text class="category-description">{{ category.description }}</text>
          </view>
          <text class="category-arrow">›</text>
        </view>
      </gradient-card>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SettingsCategoryInfo } from '@/types/settings'
import GradientCard from '@/components/common/gradient-card/index.vue'

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

function navigateToCategory(route: string) {
  uni.navigateTo({ url: route })
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32rpx;

  .page-header {
    margin-bottom: 48rpx;
    padding-top: 32rpx;

    .page-title {
      font-size: 56rpx;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }
  }

  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;

    .category-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .category-content {
        display: flex;
        align-items: center;
        padding: 32rpx;

        .category-icon {
          font-size: 56rpx;
          margin-right: 24rpx;
          width: 80rpx;
          height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16rpx;
        }

        .category-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8rpx;

          .category-name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
          }

          .category-description {
            font-size: 24rpx;
            color: #666;
            line-height: 1.5;
          }
        }

        .category-arrow {
          font-size: 48rpx;
          color: #999;
          font-weight: 300;
        }
      }
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .settings-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .settings-list {
      .category-card {
        .category-content {
          .category-info {
            .category-name {
              color: #e0e0e0;
            }

            .category-description {
              color: #999;
            }
          }

          .category-arrow {
            color: #666;
          }
        }
      }
    }
  }
}
</style>
