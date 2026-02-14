<template>
  <view class="slider-field">
    <view class="slider-header">
      <view class="slider-label">{{ label }}</view>
      <view class="slider-value" v-if="showValue">
        {{ modelValue }}{{ unit }}
      </view>
    </view>
    <slider
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :activeColor="activeColor"
      :backgroundColor="backgroundColor"
      :block-size="blockSize"
      @change="handleChange"
      @changing="handleChanging"
    />
    <view class="slider-range">
      <text class="range-min">{{ min }}{{ unit }}</text>
      <text class="range-max">{{ max }}{{ unit }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  label: string
  min: number
  max: number
  step?: number
  unit?: string
  showValue?: boolean
  disabled?: boolean
  activeColor?: string
  backgroundColor?: string
  blockSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  unit: '',
  showValue: true,
  disabled: false,
  activeColor: '#2979ff',
  backgroundColor: '#e0e0e0',
  blockSize: 28
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
  (e: 'changing', value: number): void
}>()

function handleChange(e: any) {
  const value = e.detail.value
  emit('update:modelValue', value)
  emit('change', value)
}

function handleChanging(e: any) {
  const value = e.detail.value
  emit('changing', value)
}
</script>

<style lang="scss" scoped>
.slider-field {
  margin-bottom: 32rpx;

  .slider-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .slider-label {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .slider-value {
      font-size: 28rpx;
      color: #2979ff;
      font-weight: 600;
    }
  }

  .slider-range {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;

    .range-min,
    .range-max {
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .slider-field {
    .slider-header {
      .slider-label {
        color: #e0e0e0;
      }

      .slider-value {
        color: #4da6ff;
      }
    }

    .slider-range {
      .range-min,
      .range-max {
        color: #666;
      }
    }
  }
}
</style>
