<template>
  <view class="pv-strings-page">
    <!-- Header -->
    <view class="nav-bar">
      <button class="nav-btn" @click="goBack">←</button>
      <text class="title">光伏组串监控</text>
      <button class="action-btn" @click="handleIVCurve">IV曲线</button>
    </view>

    <!-- 组串概览 -->
    <view class="overview-section">
      <view class="overview-card">
        <text class="card-title">组串概览</text>
        <view class="overview-stats">
          <view class="stat-item">
            <text class="value large success">{{ stats.onlineCount }}</text>
            <text class="label">在线组串</text>
          </view>
          <view class="stat-item">
            <text class="value large primary">{{ stats.totalPower }}</text>
            <text class="label">总功率 (kW)</text>
          </view>
        </view>
        <view v-if="stats.warningCount > 0" class="warning-tip">
          ⚠️ {{ stats.warningCount }} 个组串功率偏低
        </view>
      </view>
    </view>

    <!-- 组串列表 -->
    <view class="strings-list">
      <view
        v-for="string in displayedStrings"
        :key="string.id"
        class="string-item"
        :class="{ warning: string.status === 'warning' }"
        @click="handleStringClick(string)"
      >
        <view class="string-header">
          <view class="string-info">
            <view class="string-number">{{ string.id }}</view>
            <view class="string-details">
              <text class="string-name">{{ string.name }}</text>
              <text class="string-spec">{{ string.panelCount }}块×{{ string.panelPower }}W</text>
              <text v-if="string.status === 'warning'" class="warning-text">
                ⚠️ 功率偏低
              </text>
            </view>
          </view>
          <view class="string-power">
            <text class="power-value">{{ string.power }} kW</text>
            <text class="power-detail">{{ string.voltage }}V / {{ string.current }}A</text>
          </view>
        </view>

        <!-- 功率进度条 -->
        <view class="power-bar">
          <view
            class="power-fill"
            :style="{ width: string.efficiency + '%' }"
            :class="string.status"
          ></view>
        </view>

        <view class="string-stats">
          <text>今日: {{ string.todayEnergy }}kWh</text>
          <text :class="string.status === 'warning' ? 'warning' : ''">
            效率: {{ string.efficiency }}%
          </text>
        </view>
      </view>

      <!-- 展开更多按钮 -->
      <view v-if="remainingCount > 0" class="load-more">
        <button @click="loadMore">展开更多组串 ({{ remainingCount }})</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PVString } from '@/types/device-detail'
import { getPVStrings, getStringsStats } from '@/mock/device/strings'

// 组串列表数据
const strings = ref<PVString[]>([])
const displayCount = ref(5) // 初始显示数量

// 统计数据
const stats = ref({
  onlineCount: 0,
  totalPower: '0',
  warningCount: 0,
  totalCount: 0
})

// 显示的组串列表
const displayedStrings = computed(() => {
  return strings.value.slice(0, displayCount.value)
})

// 剩余未显示的数量
const remainingCount = computed(() => {
  return Math.max(0, strings.value.length - displayCount.value)
})

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// IV曲线功能
function handleIVCurve() {
  uni.showToast({
    title: 'IV曲线功能开发中',
    icon: 'none'
  })
}

// 点击组串项
function handleStringClick(string: PVString) {
  uni.showModal({
    title: string.name,
    content: `
电压: ${string.voltage}V
电流: ${string.current}A
功率: ${string.power}kW
效率: ${string.efficiency}%
今日发电: ${string.todayEnergy}kWh
状态: ${formatStatus(string.status)}
    `,
    showCancel: false
  })
}

// 格式化状态
function formatStatus(status: string): string {
  const map: Record<string, string> = {
    normal: '正常',
    warning: '异常',
    offline: '离线'
  }
  return map[status] || status
}

// 加载更多
function loadMore() {
  displayCount.value += 5
  if (displayCount.value >= strings.value.length) {
    uni.showToast({
      title: '已加载全部组串',
      icon: 'none'
    })
  }
}

// 加载组串数据
async function loadStringsData() {
  try {
    uni.showLoading({ title: '加载中...' })

    // 获取组串列表
    strings.value = await getPVStrings()

    // 获取统计数据
    stats.value = getStringsStats()
  } catch (error) {
    console.error('加载组串数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadStringsData()
})
</script>

<style lang="scss" scoped>
.pv-strings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;

  .nav-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    color: #333333;
    font-size: 36rpx;
    padding: 0;
    margin: 0;

    &::after {
      border: none;
    }
  }

  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
  }

  .action-btn {
    height: 64rpx;
    padding: 0 24rpx;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #ffffff;
    border: none;
    border-radius: 32rpx;
    font-size: 24rpx;
    line-height: 64rpx;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.8;
    }
  }
}

/* 概览区域 */
.overview-section {
  padding: 24rpx 32rpx;
}

.overview-card {
  background-color: #ffffff;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);

  .card-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 24rpx;
  }
}

.overview-stats {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;

  .stat-item {
    flex: 1;
    text-align: center;
    padding: 32rpx 20rpx;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 16rpx;

    .value {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 8rpx;

      &.large {
        font-size: 56rpx;
      }

      &.success {
        color: #52c41a;
      }

      &.primary {
        color: #2563eb;
      }
    }

    .label {
      display: block;
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.warning-tip {
  padding: 16rpx 24rpx;
  background-color: #fff7e6;
  border-left: 4rpx solid #faad14;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #faad14;
}

/* 组串列表 */
.strings-list {
  padding: 0 32rpx;
}

.string-item {
  background-color: #ffffff;
  padding: 28rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &.warning {
    border-left: 6rpx solid #faad14;
  }

  &:active {
    transform: scale(0.98);
  }
}

.string-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.string-info {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex: 1;
}

.string-number {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 12rpx;
}

.string-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .string-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
  }

  .string-spec {
    font-size: 24rpx;
    color: #999999;
  }

  .warning-text {
    font-size: 24rpx;
    color: #faad14;
  }
}

.string-power {
  text-align: right;

  .power-value {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #2563eb;
    margin-bottom: 8rpx;
  }

  .power-detail {
    display: block;
    font-size: 20rpx;
    color: #999999;
  }
}

/* 功率进度条 */
.power-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.power-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #95de64);
  border-radius: 6rpx;
  transition: width 0.3s;

  &.warning {
    background: linear-gradient(90deg, #faad14, #ffd666);
  }

  &.offline {
    background: linear-gradient(90deg, #d9d9d9, #f0f0f0);
  }
}

/* 组串统计 */
.string-stats {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #666666;

  text.warning {
    color: #faad14;
  }
}

/* 加载更多 */
.load-more {
  margin-top: 24rpx;
  text-align: center;

  button {
    width: 100%;
    height: 88rpx;
    background-color: #ffffff;
    color: #333333;
    border: 2rpx solid #e0e0e0;
    border-radius: 16rpx;
    font-size: 28rpx;

    &::after {
      border: none;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style>
