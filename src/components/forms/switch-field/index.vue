<template>
  <view class="switch-field" @click="handleClick">
    <view class="switch-content">
      <view class="switch-label">{{ label }}</view>
      <view class="switch-description" v-if="description">{{ description }}</view>
    </view>
    <switch
      :checked="modelValue"
      :disabled="disabled"
      color="#2979ff"
      @change="handleChange"
      @click.stop
    />
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function handleChange(e: any) {
  if (!props.disabled) {
    emit('update:modelValue', e.detail.value)
  }
}

function handleClick() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<style lang="scss" scoped>
.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  min-height: 88rpx;

  .switch-content {
    flex: 1;
    margin-right: 24rpx;

    .switch-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
      font-weight: 500;
    }

    .switch-description {
      font-size: 24rpx;
      color: #999;
      line-height: 1.5;
    }
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .switch-field {
    .switch-content {
      .switch-label {
        color: #e0e0e0;
      }

      .switch-description {
        color: #666;
      }
    }
  }
}
</style>
