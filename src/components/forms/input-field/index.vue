<template>
  <view class="input-field">
    <view class="field-label" v-if="label">{{ label }}</view>
    <view class="field-input-wrapper" :class="{ 'has-error': errorMessage, 'disabled': disabled }">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="type === 'password' ? -1 : 100"
        class="field-input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <text class="field-unit" v-if="unit">{{ unit }}</text>
      <view
        class="field-clear"
        v-if="clearable && modelValue && !disabled"
        @click="handleClear"
      >
        <text class="icon">×</text>
      </view>
    </view>
    <view class="field-error" v-if="errorMessage">{{ errorMessage }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ValidationRule } from '@/types/settings'

interface Props {
  modelValue: string | number
  label?: string
  type?: 'text' | 'number' | 'password'
  placeholder?: string
  rules?: ValidationRule[]
  unit?: string
  clearable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  clearable: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const errorMessage = ref('')
const isFocused = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') return 'password'
  if (props.type === 'number') return 'digit'
  return 'text'
})

function handleInput(e: any) {
  let value: string | number = e.detail.value

  if (props.type === 'number') {
    // 只允许数字和小数点
    value = value.replace(/[^\d.]/g, '')
    // 转换为数字
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      value = numValue
    }
  }

  emit('update:modelValue', value)

  // 实时验证（如果规则中有 change 触发器）
  if (props.rules?.some(rule => rule.trigger === 'change')) {
    validate()
  }
}

function handleBlur() {
  isFocused.value = false
  validate()
  emit('blur')
}

function handleFocus() {
  isFocused.value = true
  errorMessage.value = ''
  emit('focus')
}

function handleClear() {
  emit('update:modelValue', props.type === 'number' ? 0 : '')
  errorMessage.value = ''
}

function validate(): boolean {
  if (!props.rules || props.rules.length === 0) {
    errorMessage.value = ''
    return true
  }

  for (const rule of props.rules) {
    const result = rule.validator(props.modelValue)
    if (!result.valid) {
      errorMessage.value = result.message || '验证失败'
      return false
    }
  }

  errorMessage.value = ''
  return true
}

// 暴露验证方法供父组件调用
defineExpose({
  validate
})
</script>

<style lang="scss" scoped>
.input-field {
  margin-bottom: 24rpx;

  .field-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }

  .field-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    height: 88rpx;
    transition: all 0.3s;

    &.has-error {
      background: rgba(255, 77, 79, 0.05);
      border: 2rpx solid #ff4d4f;
    }

    &.disabled {
      opacity: 0.6;
      background: #f0f0f0;
    }

    .field-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      height: 100%;

      &::placeholder {
        color: #999;
      }
    }

    .field-unit {
      font-size: 24rpx;
      color: #666;
      margin-left: 12rpx;
    }

    .field-clear {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 12rpx;

      .icon {
        font-size: 36rpx;
        color: #999;
      }
    }
  }

  .field-error {
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 8rpx;
    line-height: 1.4;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .input-field {
    .field-label {
      color: #e0e0e0;
    }

    .field-input-wrapper {
      background: rgba(255, 255, 255, 0.08);

      &.disabled {
        background: rgba(255, 255, 255, 0.04);
      }

      .field-input {
        color: #e0e0e0;

        &::placeholder {
          color: #666;
        }
      }

      .field-unit {
        color: #999;
      }

      .field-clear .icon {
        color: #666;
      }
    }
  }
}
</style>
