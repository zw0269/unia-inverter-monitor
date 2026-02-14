<template>
  <view class="demo-page">
    <!-- 页面标题 -->
    <view class="demo-header">
      <text class="demo-title">Phase 1 核心UI组件</text>
      <text class="demo-subtitle">能量流SVG + 基础组件库</text>
    </view>

    <!-- 能量流组件演示 -->
    <view class="demo-section">
      <view class="section-title">1. 能量流SVG组件</view>
      <EnergyFlow
        :solar-power="energyData.solarPower"
        :battery-power="energyData.batteryPower"
        :load-power="energyData.loadPower"
        :grid-power="energyData.gridPower"
        :battery-soc="energyData.batterySoc"
      />

      <!-- 控制面板 -->
      <view class="control-panel card-sm mt-3">
        <text class="control-title">模拟控制</text>
        <button class="btn-primary" @click="randomizeEnergy">随机数据</button>
      </view>
    </view>

    <!-- 毛玻璃卡片演示 -->
    <view class="demo-section">
      <view class="section-title">2. 毛玻璃卡片组件</view>

      <view class="glass-demo-bg">
        <GlassCard :blur="true" padding="32rpx">
          <view class="glass-demo-content">
            <text class="demo-text">这是一个毛玻璃效果卡片</text>
            <text class="demo-text-sm">支持模糊效果和透明背景</text>
          </view>
        </GlassCard>
      </view>
    </view>

    <!-- 渐变卡片演示 -->
    <view class="demo-section">
      <view class="section-title">3. 渐变卡片组件</view>

      <view class="gradient-demo-grid">
        <GradientCard theme="blue" padding="24rpx">
          <text class="gradient-text">蓝色主题</text>
        </GradientCard>

        <GradientCard theme="green" padding="24rpx">
          <text class="gradient-text">绿色主题</text>
        </GradientCard>

        <GradientCard theme="purple" padding="24rpx">
          <text class="gradient-text">紫色主题</text>
        </GradientCard>

        <GradientCard theme="orange" padding="24rpx">
          <text class="gradient-text">橙色主题</text>
        </GradientCard>
      </view>
    </view>

    <!-- 状态徽章演示 -->
    <view class="demo-section">
      <view class="section-title">4. 状态徽章组件</view>

      <view class="badge-demo-grid">
        <StatusBadge status="running" :pulse="true" />
        <StatusBadge status="charging" :pulse="true" />
        <StatusBadge status="discharging" />
        <StatusBadge status="warning" :pulse="true" />
        <StatusBadge status="error" />
        <StatusBadge status="offline" />
        <StatusBadge status="standby" />
      </view>
    </view>

    <!-- 进度条演示 -->
    <view class="demo-section">
      <view class="section-title">5. 进度条组件</view>

      <view class="card-sm">
        <ProgressBar
          :percentage="85"
          theme="green"
          label="电池电量"
          :show-label="true"
          :animated="true"
        />

        <view class="mt-4">
          <ProgressBar
            :percentage="65"
            theme="blue"
            label="充电进度"
            :show-label="true"
            :animated="true"
          />
        </view>

        <view class="mt-4">
          <ProgressBar
            :percentage="40"
            theme="orange"
            label="负载率"
            :show-label="true"
            :animated="true"
          />
        </view>

        <view class="mt-4">
          <ProgressBar
            :percentage="95"
            theme="gradient"
            label="系统效率"
            :show-label="true"
            :animated="true"
          />
        </view>
      </view>
    </view>

    <!-- Phase 1 新页面入口 -->
    <view class="demo-section">
      <view class="section-title">Phase 1 新页面</view>

      <view class="nav-cards">
        <view class="nav-card" @click="goToDeviceDetail">
          <view class="card-icon">📱</view>
          <view class="card-content">
            <text class="card-title">设备详情页</text>
            <text class="card-desc">查看混合逆变器详细参数</text>
          </view>
          <text class="card-arrow">›</text>
        </view>

        <view class="nav-card" @click="goToPVStrings">
          <view class="card-icon">☀️</view>
          <view class="card-content">
            <text class="card-title">光伏组串监控</text>
            <text class="card-desc">监控20路组串运行状态</text>
          </view>
          <text class="card-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 组合示例 -->
    <view class="demo-section">
      <view class="section-title">6. 组件组合示例</view>

      <view class="card">
        <view class="flex-between mb-3">
          <text class="text-title-sm">设备状态</text>
          <StatusBadge status="running" :pulse="true" size="small" />
        </view>

        <view class="mb-3">
          <ProgressBar
            :percentage="energyData.batterySoc"
            theme="green"
            label="储能SOC"
            :show-label="true"
            :animated="true"
          />
        </view>

        <view class="grid-2">
          <GradientCard theme="blue" padding="24rpx" radius="16rpx">
            <view class="stat-item">
              <text class="stat-value">{{ energyData.solarPower }}kW</text>
              <text class="stat-label">光伏功率</text>
            </view>
          </GradientCard>

          <GradientCard theme="purple" padding="24rpx" radius="16rpx">
            <view class="stat-item">
              <text class="stat-value">{{ energyData.loadPower }}kW</text>
              <text class="stat-label">负载功率</text>
            </view>
          </GradientCard>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EnergyFlow from '@/components/business/energy-flow/index.vue'
import GlassCard from '@/components/common/glass-card/index.vue'
import GradientCard from '@/components/common/gradient-card/index.vue'
import StatusBadge from '@/components/common/status-badge/index.vue'
import ProgressBar from '@/components/common/progress-bar/index.vue'

/**
 * 能量数据
 */
const energyData = ref({
  solarPower: 105.2,
  batteryPower: 6.5,
  loadPower: 98.7,
  gridPower: 0,
  batterySoc: 85
})

/**
 * 随机生成能量数据
 */
const randomizeEnergy = () => {
  energyData.value = {
    solarPower: Math.random() * 125,
    batteryPower: (Math.random() - 0.5) * 50,
    loadPower: Math.random() * 100,
    gridPower: (Math.random() - 0.5) * 30,
    batterySoc: Math.floor(Math.random() * 100)
  }
}

/**
 * 跳转到设备详情页
 */
function goToDeviceDetail() {
  uni.navigateTo({
    url: '/pages/device/detail'
  })
}

/**
 * 跳转到光伏组串监控页
 */
function goToPVStrings() {
  uni.navigateTo({
    url: '/pages/device/pv-strings'
  })
}
</script>

<style lang="scss" scoped>
// 在 scoped 样式中使用 @import 导入 mixins（避免 @use 作用域问题）
@import '@/styles/mixins/tailwind.scss';

.demo-page {
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(180deg, #F0F9FF 0%, #F5F5F5 100%);
}

.demo-header {
  text-align: center;
  padding: 40rpx 0 60rpx;
}

.demo-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 16rpx;
}

.demo-subtitle {
  display: block;
  font-size: 28rpx;
  color: #6B7280;
}

.demo-section {
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 24rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid #3B82F6;
}

/* 控制面板 */
.control-panel {
  text-align: center;
}

.control-title {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
}

/* 毛玻璃演示 */
.glass-demo-bg {
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
}

.glass-demo-content {
  text-align: center;
}

.demo-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.demo-text-sm {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

/* 渐变卡片网格 */
.gradient-demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.gradient-text {
  display: block;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 徽章演示网格 */
.badge-demo-grid {
  @include card;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

/* 统计项 */
.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* Phase 1 导航卡片 */
.nav-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.nav-card {
  @include card;
  display: flex;
  align-items: center;
  padding: 32rpx;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    font-size: 72rpx;
    margin-right: 24rpx;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1F2937;
    }

    .card-desc {
      font-size: 24rpx;
      color: #6B7280;
    }
  }

  .card-arrow {
    font-size: 48rpx;
    color: #D1D5DB;
  }
}
</style>
