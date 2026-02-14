<template>
  <view class="config-page">
    <price-config
      :config="tariffConfig"
      @save="handleSave"
      @reset="handleReset"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRevenueStore } from '@/store/modules/revenue'
import type { TariffConfig } from '@/types/revenue'
import PriceConfig from '@/components/business/price-config/index.vue'

const revenueStore = useRevenueStore()

// 电价配置
const tariffConfig = computed(() => revenueStore.tariffConfig)

// 保存配置
function handleSave(config: TariffConfig) {
  revenueStore.saveTariffConfig(config)
}

// 重置配置
function handleReset() {
  revenueStore.resetTariffConfig()
}
</script>

<style lang="scss" scoped>
.config-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
