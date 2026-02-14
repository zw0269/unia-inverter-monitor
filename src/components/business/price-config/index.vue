<template>
  <view class="price-config">
    <!-- 电价配置 -->
    <view class="config-section">
      <view class="section-title">电价配置</view>
      <view class="price-list">
        <view class="price-item">
          <text class="price-label">峰时电价</text>
          <view class="price-input-group">
            <input
              type="digit"
              class="price-input"
              v-model.number="localConfig.peakPrice"
              placeholder="0.00"
            />
            <text class="price-unit">元/kWh</text>
          </view>
        </view>
        <view class="price-item">
          <text class="price-label">平时电价</text>
          <view class="price-input-group">
            <input
              type="digit"
              class="price-input"
              v-model.number="localConfig.flatPrice"
              placeholder="0.00"
            />
            <text class="price-unit">元/kWh</text>
          </view>
        </view>
        <view class="price-item">
          <text class="price-label">谷时电价</text>
          <view class="price-input-group">
            <input
              type="digit"
              class="price-input"
              v-model.number="localConfig.valleyPrice"
              placeholder="0.00"
            />
            <text class="price-unit">元/kWh</text>
          </view>
        </view>
        <view class="price-item">
          <text class="price-label">上网电价</text>
          <view class="price-input-group">
            <input
              type="digit"
              class="price-input"
              v-model.number="localConfig.gridPrice"
              placeholder="0.00"
            />
            <text class="price-unit">元/kWh</text>
          </view>
        </view>
        <view class="price-item">
          <text class="price-label">光伏补贴</text>
          <view class="price-input-group">
            <input
              type="digit"
              class="price-input"
              v-model.number="localConfig.subsidyPrice"
              placeholder="0.00"
            />
            <text class="price-unit">元/kWh</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 时段配置说明 -->
    <view class="config-section">
      <view class="section-title">时段配置</view>
      <view class="time-periods">
        <view class="period-item">
          <view class="period-badge peak">峰</view>
          <text class="period-text">{{ formatTimeRanges(localConfig.peakHours) }}</text>
        </view>
        <view class="period-item">
          <view class="period-badge flat">平</view>
          <text class="period-text">{{ formatTimeRanges(localConfig.flatHours) }}</text>
        </view>
        <view class="period-item">
          <view class="period-badge valley">谷</view>
          <text class="period-text">{{ formatTimeRanges(localConfig.valleyHours) }}</text>
        </view>
      </view>
      <view class="time-note">
        <text class="note-text">时段配置说明：峰时为高电价时段，谷时为低电价时段</text>
      </view>
    </view>

    <!-- 收益预览 -->
    <view class="config-section">
      <view class="section-title">收益预览</view>
      <view class="preview-card">
        <view class="preview-item">
          <text class="preview-label">日均发电量</text>
          <text class="preview-value">800 kWh</text>
        </view>
        <view class="preview-divider"></view>
        <view class="preview-item">
          <text class="preview-label">预计日收益</text>
          <text class="preview-value primary">¥{{ estimatedRevenue.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="action-button secondary" @click="handleReset">
        <text class="button-text">恢复默认</text>
      </view>
      <view class="action-button primary" @click="handleSave">
        <text class="button-text">保存配置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TariffConfig } from '@/types/revenue'
import { DEFAULT_TARIFF_CONFIG, calculateRevenue } from '@/utils/revenue'

interface Props {
  config: TariffConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [config: TariffConfig]
  reset: []
}>()

// 本地配置（可编辑）
const localConfig = ref<TariffConfig>({ ...props.config })

// 监听外部配置变化
watch(
  () => props.config,
  newConfig => {
    localConfig.value = { ...newConfig }
  },
  { deep: true }
)

// 格式化时间范围
function formatTimeRanges(ranges: string[]): string {
  return ranges.join('、')
}

// 预计收益
const estimatedRevenue = computed(() => {
  // 模拟一天的发电收益计算
  const dailyEnergy = 800 // 日均发电量 800kWh
  const timestamp = Date.now()
  return calculateRevenue(dailyEnergy, timestamp, localConfig.value, 0.7)
})

// 保存配置
function handleSave() {
  // 验证配置
  if (!validateConfig()) {
    uni.showToast({
      title: '请填写完整的电价配置',
      icon: 'none'
    })
    return
  }

  emit('save', { ...localConfig.value })
  uni.showToast({
    title: '配置已保存',
    icon: 'success'
  })
}

// 重置配置
function handleReset() {
  uni.showModal({
    title: '确认重置',
    content: '是否恢复默认电价配置？',
    success: res => {
      if (res.confirm) {
        localConfig.value = { ...DEFAULT_TARIFF_CONFIG }
        emit('reset')
        uni.showToast({
          title: '已恢复默认配置',
          icon: 'success'
        })
      }
    }
  })
}

// 验证配置
function validateConfig(): boolean {
  return !!(
    localConfig.value.peakPrice >= 0 &&
    localConfig.value.flatPrice >= 0 &&
    localConfig.value.valleyPrice >= 0
  )
}
</script>

<style lang="scss" scoped>
.price-config {
  padding: 20rpx;
}

.config-section {
  margin-bottom: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 24rpx;
  }
}

// 电价列表
.price-list {
  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .price-label {
      font-size: 28rpx;
      color: #666666;
    }

    .price-input-group {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .price-input {
        width: 160rpx;
        height: 60rpx;
        padding: 0 20rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        font-size: 28rpx;
        text-align: right;
      }

      .price-unit {
        font-size: 24rpx;
        color: #999999;
        white-space: nowrap;
      }
    }
  }
}

// 时段配置
.time-periods {
  .period-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .period-badge {
      width: 56rpx;
      height: 56rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      color: #ffffff;
      margin-right: 16rpx;

      &.peak {
        background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      }

      &.flat {
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
      }

      &.valley {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
    }

    .period-text {
      font-size: 26rpx;
      color: #666666;
    }
  }
}

.time-note {
  margin-top: 20rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;

  .note-text {
    font-size: 24rpx;
    color: #999999;
    line-height: 1.6;
  }
}

// 收益预览
.preview-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;

  .preview-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .preview-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }

    .preview-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;

      &.primary {
        font-size: 40rpx;
      }
    }
  }

  .preview-divider {
    width: 2rpx;
    height: 80rpx;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 32rpx;
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;

  .action-button {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

      .button-text {
        color: #ffffff;
      }

      &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
      }
    }

    &.secondary {
      background: #f5f5f5;

      .button-text {
        color: #666666;
      }

      &:active {
        background: #e8e8e8;
      }
    }

    .button-text {
      font-size: 32rpx;
      font-weight: 500;
    }
  }
}
</style>
