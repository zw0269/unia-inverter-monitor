# Phase 2 收益计算模块说明

## 📁 文件清单

### 新增文件（11个）

```
src/
├── types/
│   ├── revenue.ts                              # 收益类型定义
│   └── chart.ts                                # 图表类型定义
├── utils/
│   ├── revenue.ts                              # 收益计算工具
│   └── chart.ts                                # 图表配置工具
├── store/modules/
│   └── revenue.ts                              # 收益状态管理
├── components/
│   ├── charts/
│   │   ├── line-chart/index.vue               # 折线图组件
│   │   └── bar-chart/index.vue                # 柱状图组件
│   └── business/
│       ├── revenue-card/index.vue             # 收益卡片
│       └── price-config/index.vue             # 电价配置
├── pages/revenue/
│   ├── index.vue                              # 收益统计页面
│   └── config.vue                             # 电价配置页面
└── mock/revenue/
    └── history.ts                              # Mock数据生成器
```

### 修改文件（3个）

```
src/pages/
├── index/index.vue                             # 添加收益卡片
├── statistics/index.vue                        # 恢复图表功能
└── pages.json                                  # 添加路由配置
```

## 🎯 核心功能

### 1. 收益计算引擎

**位置**: `src/utils/revenue.ts`

**主要函数**:
```typescript
// 计算指定时段电价
calculateTariff(timestamp, config): number

// 计算收益
calculateRevenue(energy, timestamp, config, selfUseRate): number

// 计算自发自用率
calculateSelfUseRate(generation, consumption): number

// 生成收益历史数据
generateRevenueHistory(startTime, endTime, config): RevenuePoint[]

// 计算收益统计
calculateRevenueStats(points, period, config): RevenueStats

// 判断收益趋势
getRevenueTrend(current, previous): RevenueTrend

// 获取收益概览
getRevenueOverview(todayPoints, yesterdayPoints, config): RevenueOverview
```

**收益计算公式**:
```
自用收益 = 自用电量 × 当前时段电价
上网收益 = 上网电量 × 上网电价
补贴收益 = 总发电量 × 补贴电价
总收益 = 自用收益 + 上网收益 + 补贴收益
```

### 2. 图表配置工具

**位置**: `src/utils/chart.ts`

**主要函数**:
```typescript
// 创建折线图配置
createLineChartOption(data, options): EChartsOption

// 创建柱状图配置
createBarChartOption(data, options): EChartsOption

// 创建饼图配置
createPieChartOption(data, options): EChartsOption

// 数据降采样
downsampleData(data, maxPoints): T[]

// rpx转px
rpxToPx(rpx): number
```

**支持的主题**:
- blue（蓝色）
- green（绿色）
- orange（橙色）
- red（红色）
- purple（紫色）
- gradient（渐变）

### 3. Store 管理

**位置**: `src/store/modules/revenue.ts`

**状态**:
```typescript
{
  tariffConfig: TariffConfig,      // 电价配置
  revenueHistory: RevenueHistory[], // 历史收益
  currentPeriod: RevenuePeriod,     // 当前周期
  revenueOverview: RevenueOverview  // 收益概览
}
```

**主要方法**:
```typescript
init()                           // 初始化
saveTariffConfig(config)         // 保存电价配置
resetTariffConfig()              // 重置配置
addTodayRevenue(...)             // 添加今日收益
updateRevenueOverview()          // 更新概览
getRevenueStats(period)          // 获取统计
getRevenueTrendData(period)      // 获取趋势数据
getRevenueHistoryList(period)    // 获取历史列表
```

## 🎨 组件使用

### 收益卡片

```vue
<template>
  <revenue-card
    :revenue="100.50"
    :today-energy="800"
    :self-use-rate="75"
    :trend="'up'"
    :change-rate="5.2"
    @detail="handleDetail"
  />
</template>

<script setup>
import RevenueCard from '@/components/business/revenue-card/index.vue'

function handleDetail() {
  uni.navigateTo({ url: '/pages/revenue/index' })
}
</script>
```

### 折线图

```vue
<template>
  <line-chart :option="chartOption" height="400rpx" />
</template>

<script setup>
import LineChart from '@/components/charts/line-chart/index.vue'
import { createLineChartOption } from '@/utils/chart'

const chartOption = createLineChartOption(
  {
    xAxisData: ['1月', '2月', '3月'],
    series: [{ name: '收益', data: [100, 200, 150] }]
  },
  {
    theme: 'blue',
    smooth: true,
    areaStyle: true
  }
)
</script>
```

### 柱状图

```vue
<template>
  <bar-chart :option="chartOption" height="400rpx" />
</template>

<script setup>
import BarChart from '@/components/charts/bar-chart/index.vue'
import { createBarChartOption } from '@/utils/chart'

const chartOption = createBarChartOption(
  {
    xAxisData: ['周一', '周二', '周三'],
    series: [{ name: '发电量', data: [800, 900, 750] }]
  },
  {
    theme: 'green',
    yAxisLabel: '发电量（kWh）'
  }
)
</script>
```

### 电价配置

```vue
<template>
  <price-config
    :config="tariffConfig"
    @save="handleSave"
    @reset="handleReset"
  />
</template>

<script setup>
import PriceConfig from '@/components/business/price-config/index.vue'

const tariffConfig = {
  peakPrice: 0.8,
  valleyPrice: 0.3,
  flatPrice: 0.5,
  gridPrice: 0.35,
  subsidyPrice: 0.42,
  // ...
}

function handleSave(config) {
  console.log('保存配置:', config)
}

function handleReset() {
  console.log('重置配置')
}
</script>
```

## 📊 页面路由

### 收益统计页面

**路由**: `/pages/revenue/index`

**参数**: 无

**功能**:
- 时间范围选择
- 收益概览展示
- 收益趋势图表
- 发电量对比图表
- 收益明细列表
- 电价配置入口

### 电价配置页面

**路由**: `/pages/revenue/config`

**参数**: 无

**功能**:
- 电价配置表单
- 时段配置说明
- 收益预览
- 保存/重置操作

## 🔧 配置说明

### 默认电价配置

```typescript
{
  peakPrice: 0.8,      // 峰时电价（元/kWh）
  valleyPrice: 0.3,    // 谷时电价（元/kWh）
  flatPrice: 0.5,      // 平时电价（元/kWh）
  gridPrice: 0.35,     // 上网电价（元/kWh）
  subsidyPrice: 0.42,  // 光伏补贴（元/kWh）

  // 时段配置
  peakHours: ['08:00-11:00', '18:00-22:00'],
  valleyHours: ['00:00-06:00'],
  flatHours: ['06:00-08:00', '11:00-18:00', '22:00-24:00']
}
```

### 数据存储

**localStorage 键名**:
- `tariff_config` - 电价配置
- `revenue_history` - 历史收益数据

**清除数据**:
```javascript
uni.removeStorageSync('tariff_config')
uni.removeStorageSync('revenue_history')
```

## 🎯 使用示例

### 完整使用流程

```typescript
import { useRevenueStore } from '@/store/modules/revenue'
import { calculateRevenue } from '@/utils/revenue'
import { createLineChartOption } from '@/utils/chart'

// 1. 初始化 Store
const revenueStore = useRevenueStore()
revenueStore.init()

// 2. 获取今日收益
const todayRevenue = revenueStore.todayRevenue
console.log('今日收益:', todayRevenue)

// 3. 获取月度统计
const monthStats = revenueStore.getRevenueStats('month')
console.log('月度统计:', monthStats)

// 4. 修改电价配置
revenueStore.saveTariffConfig({
  peakPrice: 0.9,
  valleyPrice: 0.35,
  // ...
})

// 5. 生成图表
const trendData = revenueStore.getRevenueTrendData('week')
const chartOption = createLineChartOption(
  {
    xAxisData: trendData.map(d => formatDate(d.timestamp)),
    series: [{ name: '收益', data: trendData.map(d => d.revenue) }]
  },
  { theme: 'blue', smooth: true }
)
```

## ⚠️ 注意事项

### 1. 平台兼容性

- ✅ H5 平台 - 完全支持
- ⚠️ 小程序 - 图表功能需要适配
- ⚠️ App - 图表功能需要适配

### 2. 数据来源

当前使用 Mock 数据：
- 30天历史收益
- 随机波动算法
- 季节性调整

生产环境需要：
- 接入真实设备数据 API
- 接入电价数据接口
- 实现数据同步机制

### 3. 性能优化

- 图表数据自动降采样（>1000点）
- 防抖更新（500ms）
- 使用 Canvas 渲染模式

## 🐛 已知问题

1. **图表仅支持 H5**: 小程序和 App 需要额外适配
2. **时段配置静态**: 未实现时间选择器交互
3. **Mock 数据**: 需要接入真实数据源

## 🔮 后续优化

1. **多平台适配**: 集成小程序/App 图表方案
2. **数据接入**: 接入真实设备和电价 API
3. **功能增强**: 添加收益导出、预测功能
4. **性能优化**: 虚拟滚动、图表懒加载

## 📝 API 参考

详细 API 文档请查看各文件的 JSDoc 注释：
- `src/types/revenue.ts` - 类型定义
- `src/utils/revenue.ts` - 收益计算 API
- `src/utils/chart.ts` - 图表配置 API
- `src/store/modules/revenue.ts` - Store API

## 🎉 总结

Phase 2 收益计算模块已完整实现，包括：
- ✅ 完整的收益计算系统
- ✅ 可视化图表组件
- ✅ 电价配置管理
- ✅ 历史数据统计
- ✅ 响应式 UI 设计

开发服务器已启动: **http://localhost:3001**

祝使用愉快！🚀
