/**
 * 图表配置工具函数
 */

import type { EChartsOption } from 'echarts'
import type { ChartOptions, ChartData, ChartTheme, CHART_THEME_COLORS } from '@/types/chart'

/**
 * 主题色配置
 */
const THEME_COLORS = {
  blue: {
    primary: '#1296db',
    gradientStart: '#1296db',
    gradientEnd: '#4db8ff'
  },
  green: {
    primary: '#52c41a',
    gradientStart: '#52c41a',
    gradientEnd: '#95de64'
  },
  orange: {
    primary: '#fa8c16',
    gradientStart: '#fa8c16',
    gradientEnd: '#ffc069'
  },
  red: {
    primary: '#f5222d',
    gradientStart: '#f5222d',
    gradientEnd: '#ff7875'
  },
  purple: {
    primary: '#722ed1',
    gradientStart: '#722ed1',
    gradientEnd: '#b37feb'
  },
  gradient: {
    primary: '#1296db',
    gradientStart: '#1296db',
    gradientEnd: '#52c41a'
  }
}

/**
 * 获取主题色
 */
function getThemeColor(theme: ChartTheme = 'blue') {
  return THEME_COLORS[theme]
}

/**
 * 创建渐变色配置
 */
function createGradientColor(startColor: string, endColor: string, opacity: number = 1) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: startColor },
      { offset: 1, color: endColor }
    ]
  }
}

/**
 * 创建通用网格配置
 */
function createGridConfig() {
  return {
    left: '12%',
    right: '5%',
    bottom: '15%',
    top: '10%',
    containLabel: false
  }
}

/**
 * 创建通用工具提示配置
 */
function createTooltipConfig() {
  return {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e5e5',
    borderWidth: 1,
    textStyle: {
      color: '#333',
      fontSize: 12
    },
    padding: [8, 12],
    extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); border-radius: 4px;'
  }
}

/**
 * 创建折线图配置
 */
export function createLineChartOption(
  data: ChartData,
  options: ChartOptions = {}
): EChartsOption {
  const {
    title,
    theme = 'blue',
    xAxisLabel,
    yAxisLabel,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    smooth = true,
    areaStyle = false,
    colors,
    animationDuration = 1000
  } = options

  const themeColor = getThemeColor(theme)
  const colorPalette = colors || [
    themeColor.primary,
    '#52c41a',
    '#fa8c16',
    '#722ed1',
    '#f5222d'
  ]

  const option: EChartsOption = {
    color: colorPalette,
    title: title
      ? {
          text: title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        }
      : undefined,
    grid: createGridConfig(),
    xAxis: {
      type: 'category',
      data: data.xAxisData || [],
      name: xAxisLabel,
      nameTextStyle: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e5e5'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#666',
        rotate: data.xAxisData && data.xAxisData.length > 12 ? 45 : 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameTextStyle: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        fontSize: 10,
        color: '#666'
      },
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: data.series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        width: 2,
        color: colorPalette[index % colorPalette.length]
      },
      itemStyle: {
        color: colorPalette[index % colorPalette.length]
      },
      areaStyle: areaStyle
        ? {
            color: createGradientColor(
              colorPalette[index % colorPalette.length],
              `${colorPalette[index % colorPalette.length]}20`
            )
          }
        : undefined
    })),
    tooltip: showTooltip ? createTooltipConfig() : undefined,
    legend: showLegend && data.legend
      ? {
          data: data.legend,
          bottom: 0,
          textStyle: {
            fontSize: 11,
            color: '#666'
          }
        }
      : undefined,
    animation: true,
    animationDuration
  }

  return option
}

/**
 * 创建柱状图配置
 */
export function createBarChartOption(
  data: ChartData,
  options: ChartOptions = {}
): EChartsOption {
  const {
    title,
    theme = 'blue',
    xAxisLabel,
    yAxisLabel,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    barWidth = '60%',
    stack = false,
    colors,
    animationDuration = 1000
  } = options

  const themeColor = getThemeColor(theme)
  const colorPalette = colors || [
    themeColor.primary,
    '#52c41a',
    '#fa8c16',
    '#722ed1',
    '#f5222d'
  ]

  const option: EChartsOption = {
    color: colorPalette,
    title: title
      ? {
          text: title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        }
      : undefined,
    grid: createGridConfig(),
    xAxis: {
      type: 'category',
      data: data.xAxisData || [],
      name: xAxisLabel,
      nameTextStyle: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e5e5'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#666',
        rotate: data.xAxisData && data.xAxisData.length > 12 ? 45 : 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameTextStyle: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        fontSize: 10,
        color: '#666'
      },
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: data.series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barWidth,
      stack: stack ? 'total' : undefined,
      itemStyle: {
        color: createGradientColor(
          themeColor.gradientStart,
          themeColor.gradientEnd
        ),
        borderRadius: stack ? [0, 0, 0, 0] : [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: createGradientColor(
            themeColor.gradientEnd,
            themeColor.gradientStart
          )
        }
      }
    })),
    tooltip: showTooltip ? createTooltipConfig() : undefined,
    legend: showLegend && data.legend
      ? {
          data: data.legend,
          bottom: 0,
          textStyle: {
            fontSize: 11,
            color: '#666'
          }
        }
      : undefined,
    animation: true,
    animationDuration
  }

  return option
}

/**
 * 创建饼图配置
 */
export function createPieChartOption(
  data: ChartData,
  options: ChartOptions = {}
): EChartsOption {
  const {
    title,
    theme = 'blue',
    showLegend = true,
    showTooltip = true,
    colors,
    animationDuration = 1000
  } = options

  const themeColor = getThemeColor(theme)
  const colorPalette = colors || [
    themeColor.primary,
    '#52c41a',
    '#fa8c16',
    '#722ed1',
    '#f5222d',
    '#13c2c2',
    '#2f54eb'
  ]

  const option: EChartsOption = {
    color: colorPalette,
    title: title
      ? {
          text: title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        }
      : undefined,
    series: [
      {
        name: data.series[0]?.name || '数据',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 11,
          color: '#666',
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: data.series[0]?.data || []
      }
    ],
    tooltip: showTooltip
      ? {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e5e5e5',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 12
          },
          padding: [8, 12],
          extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); border-radius: 4px;'
        }
      : undefined,
    legend: showLegend
      ? {
          bottom: 0,
          left: 'center',
          textStyle: {
            fontSize: 11,
            color: '#666'
          }
        }
      : undefined,
    animation: true,
    animationDuration
  }

  return option
}

/**
 * 数据降采样（当数据点过多时）
 */
export function downsampleData<T>(data: T[], maxPoints: number = 1000): T[] {
  if (data.length <= maxPoints) {
    return data
  }

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

/**
 * rpx 转 px
 */
export function rpxToPx(rpx: number): number {
  // 获取屏幕宽度
  const screenWidth = uni.getSystemInfoSync().screenWidth || 375
  return (rpx / 750) * screenWidth
}

/**
 * 创建响应式字体大小
 */
export function responsiveFontSize(baseSize: number): number {
  const screenWidth = uni.getSystemInfoSync().screenWidth || 375
  const scale = screenWidth / 375
  return Math.round(baseSize * scale)
}
