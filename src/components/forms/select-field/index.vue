<template>
  <view class="select-field">
    <view class="field-label" v-if="label">{{ label }}</view>
    <view
      class="field-select-wrapper"
      :class="{ 'disabled': disabled }"
      @click="handleClick"
    >
      <text class="select-value" :class="{ 'placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </text>
      <text class="select-arrow">▼</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  label?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option?.label || ''
})

function handleClick() {
  if (props.disabled) return

  // 过滤掉禁用的选项
  const enabledOptions = props.options.filter(opt => !opt.disabled)

  uni.showActionSheet({
    itemList: enabledOptions.map(opt => opt.label),
    success: (res) => {
      const selectedOption = enabledOptions[res.tapIndex]
      if (selectedOption) {
        emit('update:modelValue', selectedOption.value)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.select-field {
  margin-bottom: 24rpx;

  .field-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .field-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    height: 88rpx;
    transition: all 0.3s;

    &.disabled {
      opacity: 0.6;
      background: #f0f0f0;
    }

    .select-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;

      &.placeholder {
        color: #999;
      }
    }

    .select-arrow {
      font-size: 20rpx;
      color: #999;
      margin-left: 12rpx;
      transition: transform 0.3s;
    }

    &:active:not(.disabled) {
      background: #eee;
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .select-field {
    .field-label {
      color: #e0e0e0;
    }

    .field-select-wrapper {
      background: rgba(255, 255, 255, 0.08);

      &.disabled {
        background: rgba(255, 255, 255, 0.04);
      }

      .select-value {
        color: #e0e0e0;

        &.placeholder {
          color: #666;
        }
      }

      .select-arrow {
        color: #666;
      }

      &:active:not(.disabled) {
        background: rgba(255, 255, 255, 0.12);
      }
    }
  }
}
</style>
