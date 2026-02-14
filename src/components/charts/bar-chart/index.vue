<template>
  <view class="bar-chart-container">
    <view :id="chartId" :style="chartStyle" class="chart-canvas"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '500rpx'
})

const emit = defineEmits<{
  finished: []
  error: [error: Error]
}>()

// 生成唯一 ID
const chartId = ref(`bar-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
let chartInstance: echarts.ECharts | null = null

const chartStyle = ref({
  width: props.width,
  height: props.height
})

/**
 * 初始化图表
 */
function initChart() {
  try {
    nextTick(() => {
      // #ifdef H5
      const chartDom = document.getElementById(chartId.value)
      if (!chartDom) {
        console.error('图表容器未找到')
        return
      }

      // 销毁旧实例
      if (chartInstance) {
        chartInstance.dispose()
      }

      // 创建新实例
      chartInstance = echarts.init(chartDom)
      chartInstance.setOption(props.option)

      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)

      emit('finished')
      // #endif

      // #ifndef H5
      console.warn('非 H5 平台，图表功能受限')
      // #endif
    })
  } catch (error: any) {
    console.error('初始化图表失败:', error)
    emit('error', error)
  }
}

/**
 * 更新图表配置
 */
function updateChart() {
  if (chartInstance && props.option) {
    chartInstance.setOption(props.option, true)
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/**
 * 清理资源
 */
function cleanup() {
  // #ifdef H5
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
  // #endif
}

// 监听配置变化
watch(() => props.option, updateChart, { deep: true })

onMounted(() => {
  initChart()
})

// 暴露方法供父组件调用
defineExpose({
  setOption: (option: EChartsOption) => {
    if (chartInstance) {
      chartInstance.setOption(option)
    }
  },
  resize: () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  },
  getInstance: () => chartInstance
})
</script>

<style lang="scss" scoped>
.bar-chart-container {
  width: 100%;
  position: relative;

  .chart-canvas {
    width: 100%;
  }
}
</style>
