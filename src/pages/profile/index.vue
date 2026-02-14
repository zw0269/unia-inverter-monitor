<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="card user-card">
      <view class="user-header">
        <view class="avatar">👤</view>
        <view class="user-info">
          <view class="username">演示用户</view>
          <view class="user-role">系统管理员</view>
        </view>
      </view>
    </view>

    <!-- 系统信息 -->
    <view class="card system-info">
      <view class="card-title">系统信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">应用版本</text>
          <text class="value">{{ appStore.appVersion }}</text>
        </view>
        <view class="info-item">
          <text class="label">开发模式</text>
          <text class="value">Mock数据模拟</text>
        </view>
        <view v-if="systemInfo" class="info-item">
          <text class="label">设备平台</text>
          <text class="value">{{ systemInfo.platform }}</text>
        </view>
        <view v-if="systemInfo" class="info-item">
          <text class="label">系统版本</text>
          <text class="value">{{ systemInfo.system }}</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="card menu-card">
      <view class="card-title">功能设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="handleToggleDebug">
          <view class="menu-icon">🐛</view>
          <view class="menu-label">调试信息</view>
          <view class="menu-action">
            <switch
              :checked="appStore.showDebugInfo"
              @change="handleToggleDebug"
            />
          </view>
        </view>

        <view class="menu-item" @click="handleToggleTheme">
          <view class="menu-icon">🌙</view>
          <view class="menu-label">深色模式</view>
          <view class="menu-action">
            <switch
              :checked="appStore.theme === 'dark'"
              @change="handleToggleTheme"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="card stats-card">
      <view class="card-title">数据统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-icon">📊</view>
          <view class="stat-value">{{ deviceStore.historyData.length }}</view>
          <view class="stat-label">历史数据点</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">⚠️</view>
          <view class="stat-value">{{ deviceStore.alarms.length }}</view>
          <view class="stat-label">报警记录</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">🔌</view>
          <view class="stat-value">{{ bluetoothStore.discoveredDevices.length }}</view>
          <view class="stat-label">已发现设备</view>
        </view>
        <view class="stat-item">
          <view class="stat-icon">⏱️</view>
          <view class="stat-value">{{ runningDays }}</view>
          <view class="stat-label">运行天数</view>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="card action-card">
      <view class="card-title">快捷操作</view>
      <view class="action-list">
        <view class="action-item" @click="goToAlarmList">
          <view class="action-icon">📋</view>
          <view class="action-info">
            <view class="action-name">报警记录</view>
            <view class="action-desc">查看所有报警信息</view>
          </view>
          <view class="action-arrow">›</view>
        </view>

        <view class="action-item" @click="goToDeviceManage">
          <view class="action-icon">⚙️</view>
          <view class="action-info">
            <view class="action-name">设备管理</view>
            <view class="action-desc">设备信息与连接管理</view>
          </view>
          <view class="action-arrow">›</view>
        </view>

        <view class="action-item" @click="goToSettings">
          <view class="action-icon">🔧</view>
          <view class="action-info">
            <view class="action-name">系统设置</view>
            <view class="action-desc">参数配置与偏好设置</view>
          </view>
          <view class="action-arrow">›</view>
        </view>

        <view class="action-item" @click="handleAbout">
          <view class="action-icon">ℹ️</view>
          <view class="action-info">
            <view class="action-name">关于应用</view>
            <view class="action-desc">版本信息与使用说明</view>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <view class="copyright">© 2024 125kW混逆监控系统</view>
      <view class="version">Version {{ appStore.appVersion }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'

const appStore = useAppStore()
const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()

// 系统信息
const systemInfo = computed(() => appStore.systemInfo)

// 运行天数（模拟）
const runningDays = computed(() => {
  return Math.floor(deviceStore.totalEnergy / 125 / 8) // 按每天8小时满载计算
})

/**
 * 切换调试信息
 */
function handleToggleDebug() {
  appStore.toggleDebugInfo()
  uni.showToast({
    title: appStore.showDebugInfo ? '已开启调试' : '已关闭调试',
    icon: 'success'
  })
}

/**
 * 切换主题
 */
function handleToggleTheme() {
  appStore.toggleTheme()
  uni.showToast({
    title: appStore.theme === 'dark' ? '深色模式' : '浅色模式',
    icon: 'success'
  })
}

/**
 * 跳转到报警列表
 */
function goToAlarmList() {
  uni.navigateTo({
    url: '/pages/alarm/list'
  })
}

/**
 * 跳转到设备管理
 */
function goToDeviceManage() {
  uni.switchTab({
    url: '/pages/device/index'
  })
}

/**
 * 跳转到系统设置
 */
function goToSettings() {
  uni.navigateTo({
    url: '/pages/settings/index'
  })
}

/**
 * 关于应用
 */
function handleAbout() {
  uni.navigateTo({
    url: '/pages/settings/about'
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 20rpx;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

/* 用户卡片 */
.user-card {
  padding: 40rpx 24rpx;
  background: linear-gradient(135deg, #1296db, #4db8ff);
  color: #ffffff;

  .user-header {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60rpx;
    }

    .user-info {
      flex: 1;

      .username {
        font-size: 40rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .user-role {
        font-size: 28rpx;
        opacity: 0.9;
      }
    }
  }
}

/* 系统信息 */
.system-info {
  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #666666;
        font-size: 28rpx;
      }

      .value {
        color: #333333;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
  }
}

/* 功能菜单 */
.menu-card {
  .menu-list {
    .menu-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .menu-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }

      .menu-label {
        flex: 1;
        font-size: 32rpx;
        color: #333333;
      }

      .menu-action {
        switch {
          transform: scale(0.8);
        }
      }
    }
  }
}

/* 数据统计 */
.stats-card {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }

  .stat-item {
    text-align: center;
    padding: 30rpx 20rpx;
    background: linear-gradient(135deg, #f8f8f8, #ffffff);
    border-radius: 12rpx;

    .stat-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }

    .stat-value {
      font-size: 44rpx;
      font-weight: bold;
      color: #1296db;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 快捷操作 */
.action-card {
  .action-list {
    .action-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      transition: all 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f8f8f8;
        transform: translateX(8rpx);
      }

      .action-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }

      .action-info {
        flex: 1;

        .action-name {
          font-size: 32rpx;
          color: #333333;
          margin-bottom: 4rpx;
        }

        .action-desc {
          font-size: 24rpx;
          color: #999999;
        }
      }

      .action-arrow {
        font-size: 48rpx;
        color: #d9d9d9;
      }
    }
  }
}

/* 底部信息 */
.footer {
  text-align: center;
  padding: 40rpx 20rpx;
  color: #999999;

  .copyright {
    font-size: 24rpx;
    margin-bottom: 8rpx;
  }

  .version {
    font-size: 20rpx;
  }
}
</style>
