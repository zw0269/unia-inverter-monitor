<template>
  <view class="about-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="about-content">
        <!-- 应用信息 -->
        <glass-card class="app-info-card">
          <view class="app-logo">
            <text class="logo-icon">⚡</text>
          </view>
          <text class="app-name">125kW 混逆监控系统</text>
          <text class="app-version">版本 v1.0.0</text>
          <text class="app-description">专业的光伏储能逆变器监控管理系统</text>
        </glass-card>

        <!-- 构建信息 -->
        <glass-card class="build-info-card">
          <view class="card-title">构建信息</view>
          <view class="info-list">
            <view class="info-item" v-for="item in buildInfo" :key="item.label">
              <text class="info-label">{{ item.label }}</text>
              <text class="info-value">{{ item.value }}</text>
            </view>
          </view>
        </glass-card>

        <!-- 功能链接 -->
        <glass-card class="links-card">
          <view class="card-title">帮助与支持</view>
          <view class="link-list">
            <view class="link-item" @click="handleUserManual">
              <view class="link-content">
                <text class="link-icon">📖</text>
                <text class="link-text">用户手册</text>
              </view>
              <text class="link-arrow">›</text>
            </view>
            <view class="link-item" @click="handlePrivacyPolicy">
              <view class="link-content">
                <text class="link-icon">🔒</text>
                <text class="link-text">隐私政策</text>
              </view>
              <text class="link-arrow">›</text>
            </view>
            <view class="link-item" @click="handleTermsOfService">
              <view class="link-content">
                <text class="link-icon">📋</text>
                <text class="link-text">使用条款</text>
              </view>
              <text class="link-arrow">›</text>
            </view>
            <view class="link-item" @click="handleCheckUpdate">
              <view class="link-content">
                <text class="link-icon">🔄</text>
                <text class="link-text">检查更新</text>
              </view>
              <text class="link-arrow">›</text>
            </view>
          </view>
        </glass-card>

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
import { ref } from 'vue'
import dayjs from 'dayjs'
import GlassCard from '@/components/common/glass-card/index.vue'

const buildInfo = ref([
  {
    label: 'UniApp 版本',
    value: '3.0.0'
  },
  {
    label: 'Vue 版本',
    value: '3.4.0'
  },
  {
    label: '编译器版本',
    value: 'HBuilderX 4.0.0'
  },
  {
    label: '构建日期',
    value: dayjs().format('YYYY-MM-DD')
  }
])

function handleUserManual() {
  uni.showToast({
    title: '即将打开用户手册',
    icon: 'none'
  })
  // 实际应用中应该打开手册页面或 PDF
}

function handlePrivacyPolicy() {
  uni.showToast({
    title: '即将打开隐私政策',
    icon: 'none'
  })
  // 实际应用中应该打开隐私政策页面
}

function handleTermsOfService() {
  uni.showToast({
    title: '即将打开使用条款',
    icon: 'none'
  })
  // 实际应用中应该打开使用条款页面
}

function handleCheckUpdate() {
  uni.showLoading({
    title: '检查更新中...'
  })

  // 模拟检查更新
  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '检查更新',
      content: '当前已是最新版本 v1.0.0',
      showCancel: false
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .page-scroll {
    padding: 32rpx;

    .about-content {
      display: flex;
      flex-direction: column;
      gap: 24rpx;

      .app-info-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64rpx 32rpx;

        .app-logo {
          width: 160rpx;
          height: 160rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 32rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32rpx;
          box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

          .logo-icon {
            font-size: 96rpx;
          }
        }

        .app-name {
          font-size: 40rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 16rpx;
        }

        .app-version {
          font-size: 28rpx;
          color: #999;
          margin-bottom: 24rpx;
        }

        .app-description {
          font-size: 24rpx;
          color: #666;
          text-align: center;
          line-height: 1.6;
        }
      }

      .build-info-card,
      .links-card {
        .card-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 32rpx;
          padding-bottom: 16rpx;
          border-bottom: 2rpx solid #f0f0f0;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 24rpx;

          .info-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16rpx 0;

            .info-label {
              font-size: 28rpx;
              color: #666;
            }

            .info-value {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
            }
          }
        }

        .link-list {
          display: flex;
          flex-direction: column;

          .link-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24rpx 0;
            border-bottom: 2rpx solid #f0f0f0;
            transition: background 0.3s;

            &:last-child {
              border-bottom: none;
            }

            &:active {
              background: rgba(0, 0, 0, 0.02);
            }

            .link-content {
              display: flex;
              align-items: center;

              .link-icon {
                font-size: 40rpx;
                margin-right: 20rpx;
              }

              .link-text {
                font-size: 28rpx;
                color: #333;
              }
            }

            .link-arrow {
              font-size: 48rpx;
              color: #999;
              font-weight: 300;
            }
          }
        }
      }

      .copyright {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48rpx 32rpx;
        gap: 12rpx;

        .copyright-text {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
        }
      }
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .about-page {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    .page-scroll {
      .about-content {
        .app-info-card {
          .app-name {
            color: #e0e0e0;
          }

          .app-version {
            color: #666;
          }

          .app-description {
            color: #999;
          }
        }

        .build-info-card,
        .links-card {
          .card-title {
            color: #e0e0e0;
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .info-list {
            .info-item {
              .info-label {
                color: #999;
              }

              .info-value {
                color: #e0e0e0;
              }
            }
          }

          .link-list {
            .link-item {
              border-bottom-color: rgba(255, 255, 255, 0.1);

              &:active {
                background: rgba(255, 255, 255, 0.02);
              }

              .link-content {
                .link-text {
                  color: #e0e0e0;
                }
              }

              .link-arrow {
                color: #666;
              }
            }
          }
        }

        .copyright {
          .copyright-text {
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
}
</style>
