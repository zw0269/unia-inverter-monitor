# Phase 1 核心UI组件库

## 概述

本组件库包含125kW混逆智能管理系统Phase 1所需的核心UI组件,包括能量流SVG组件和基础通用组件。所有组件均采用Vue3 Composition API + TypeScript开发,完全兼容UniApp平台。

## 组件列表

### 1. 能量流SVG组件 (EnergyFlow)

**路径:** `@/components/business/energy-flow/index.vue`

**功能:**
- 实时显示能量流动态图
- 4个能量节点:光伏(☀️)、储能(🔋)、负载(🏠)、电网(⚡)
- 动态能量流动线条(带箭头)
- 脉冲环动画效果
- 实时功率数值显示
- 响应式SVG布局

**Props:**

```typescript
interface EnergyFlowProps {
  solarPower: number      // 光伏功率 (kW)
  batteryPower: number    // 储能功率 (kW, 正为充电, 负为放电)
  loadPower: number       // 负载功率 (kW)
  gridPower: number       // 电网功率 (kW, 正为上网, 负为用电)
  batterySoc: number      // 储能SOC百分比 (0-100)
}
```

**使用示例:**

```vue
<template>
  <EnergyFlow
    :solar-power="105.2"
    :battery-power="6.5"
    :load-power="98.7"
    :grid-power="0"
    :battery-soc="85"
  />
</template>

<script setup lang="ts">
import EnergyFlow from '@/components/business/energy-flow/index.vue'
</script>
```

---

### 2. 毛玻璃卡片 (GlassCard)

**路径:** `@/components/common/glass-card/index.vue`

**功能:**
- 半透明毛玻璃效果
- 模糊背景(backdrop-filter)
- 边框高光效果
- 自动降级方案(不支持模糊的平台)

**Props:**

```typescript
interface GlassCardProps {
  blur?: boolean        // 是否启用模糊 (默认true)
  padding?: string      // 内边距 (默认'32rpx')
  radius?: string       // 圆角大小 (默认'32rpx')
  bgOpacity?: number    // 背景透明度 0-1 (默认0.1)
}
```

**使用示例:**

```vue
<template>
  <GlassCard :blur="true" padding="32rpx">
    <text>毛玻璃效果内容</text>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/common/glass-card/index.vue'
</script>
```

---

### 3. 渐变卡片 (GradientCard)

**路径:** `@/components/common/gradient-card/index.vue`

**功能:**
- 多种预设渐变主题
- 支持4种渐变方向
- 自定义渐变颜色
- 内置光泽效果

**Props:**

```typescript
interface GradientCardProps {
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom'
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  padding?: string
  radius?: string
  shadow?: boolean
  customFrom?: string    // 自定义起始颜色
  customTo?: string      // 自定义结束颜色
}
```

**使用示例:**

```vue
<template>
  <!-- 预设主题 -->
  <GradientCard theme="blue" padding="32rpx">
    <text>蓝色渐变</text>
  </GradientCard>

  <!-- 自定义颜色 -->
  <GradientCard
    theme="custom"
    custom-from="#FF6B6B"
    custom-to="#4ECDC4"
  >
    <text>自定义渐变</text>
  </GradientCard>
</template>

<script setup lang="ts">
import GradientCard from '@/components/common/gradient-card/index.vue'
</script>
```

---

### 4. 状态徽章 (StatusBadge)

**路径:** `@/components/common/status-badge/index.vue`

**功能:**
- 7种预设状态类型
- 状态图标和颜色自动匹配
- 可选脉冲动画
- 3种尺寸选择

**Props:**

```typescript
interface StatusBadgeProps {
  status: 'running' | 'charging' | 'discharging' | 'warning' | 'error' | 'offline' | 'standby'
  text?: string              // 自定义文本
  pulse?: boolean            // 脉冲动画 (默认false)
  showIcon?: boolean         // 显示图标 (默认true)
  size?: 'small' | 'medium' | 'large'
}
```

**状态类型:**

| 状态 | 说明 | 颜色 | 图标 |
|------|------|------|------|
| running | 运行中 | 绿色 | ● |
| charging | 充电中 | 蓝色 | ⚡ |
| discharging | 放电中 | 橙色 | ⚡ |
| warning | 告警 | 橙色 | ⚠ |
| error | 故障 | 红色 | ✕ |
| offline | 离线 | 灰色 | ○ |
| standby | 待机 | 深灰 | ○ |

**使用示例:**

```vue
<template>
  <StatusBadge status="running" :pulse="true" />
  <StatusBadge status="charging" text="正在充电" />
  <StatusBadge status="warning" size="small" />
</template>

<script setup lang="ts">
import StatusBadge from '@/components/common/status-badge/index.vue'
</script>
```

---

### 5. 进度条 (ProgressBar)

**路径:** `@/components/common/progress-bar/index.vue`

**功能:**
- 6种颜色主题
- 渐变色进度条
- 百分比显示
- 平滑动画效果
- 可自定义标签

**Props:**

```typescript
interface ProgressBarProps {
  percentage: number           // 百分比 0-100
  theme?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gradient'
  height?: string              // 高度 (默认'16rpx')
  radius?: string              // 圆角 (默认'9999rpx')
  showPercentage?: boolean     // 显示百分比 (默认false)
  showLabel?: boolean          // 显示标签 (默认false)
  label?: string               // 标签文本
  animated?: boolean           // 动画效果 (默认true)
}
```

**使用示例:**

```vue
<template>
  <!-- 基础进度条 -->
  <ProgressBar :percentage="85" theme="green" />

  <!-- 带标签的进度条 -->
  <ProgressBar
    :percentage="65"
    theme="blue"
    label="充电进度"
    :show-label="true"
    :animated="true"
  />

  <!-- 渐变进度条 -->
  <ProgressBar
    :percentage="95"
    theme="gradient"
    label="系统效率"
    :show-label="true"
  />
</template>

<script setup lang="ts">
import ProgressBar from '@/components/common/progress-bar/index.vue'
</script>
```

---

## 样式工具库

### Tailwind Mixins

**路径:** `@/styles/mixins/tailwind.scss`

**功能:** 提供类似Tailwind CSS的SCSS Mixin,适配UniApp的rpx单位。

**常用Mixin:**

```scss
// 卡片样式
@include card;
@include card-lg;
@include glass-card;

// 渐变背景
@include gradient-bg(#3B82F6, #1D4ED8);
@include gradient-blue;
@include gradient-green;

// 文字样式
@include text-title;
@include text-body;
@include text-sm;

// 布局
@include flex-center;
@include flex-between;
@include grid-2;

// 按钮
@include btn-primary;
@include btn-secondary;
@include btn-gradient;

// 阴影
@include shadow;
@include shadow-lg;
```

### 动画样式

**路径:** `@/styles/animations.scss`

**动画列表:**

| 动画类 | 说明 | 用途 |
|--------|------|------|
| .pulse-ring | 脉冲环 | 能量流节点 |
| .pulse-dot | 点脉冲 | 状态指示器 |
| .flow-line | 流动线条 | 能量流动 |
| .fade-in-up | 淡入向上 | 页面元素进入 |
| .zoom-in | 放大进入 | 弹窗/对话框 |
| .spin | 旋转 | 加载指示器 |
| .bounce | 弹跳 | 提示/通知 |
| .shake | 摇晃 | 错误提示 |

**使用示例:**

```vue
<template>
  <view class="card fade-in-up">
    动画卡片
  </view>

  <view class="status-dot pulse-dot"></view>
</template>

<style lang="scss" scoped>
@import '@/styles/animations.scss';
</style>
```

---

## 全局样式

**路径:** `@/styles/index.scss`

**功能:** 提供全局CSS工具类,类似Tailwind CSS。

**工具类示例:**

```html
<!-- 间距 -->
<view class="p-4 m-2"></view>

<!-- 文字 -->
<text class="text-title font-bold text-primary"></text>

<!-- 布局 -->
<view class="flex-center grid-2"></view>

<!-- 颜色 -->
<view class="bg-primary text-white"></view>

<!-- 圆角 -->
<view class="rounded-xl"></view>

<!-- 阴影 -->
<view class="shadow-lg"></view>
```

---

## 类型定义

**路径:** `@/components/types.ts`

所有组件的TypeScript类型定义都集中在此文件中,便于统一管理和引用。

**使用示例:**

```typescript
import type {
  EnergyFlowProps,
  StatusType,
  GradientTheme
} from '@/components/types'
```

---

## 演示页面

**路径:** `@/pages/components-demo/index.vue`

提供了所有组件的使用示例和交互演示。

**访问方式:**
在`pages.json`中添加路由后,通过导航访问演示页面。

---

## 性能优化建议

1. **SVG动画优化**
   - 能量流组件使用CSS动画而非JS动画,性能更优
   - 建议在数据更新频率较高时使用节流(throttle)

2. **样式按需导入**
   ```scss
   // 只导入需要的Mixin
   @import '@/styles/mixins/tailwind.scss';

   // 使用特定Mixin
   .my-card {
     @include card;
     @include shadow-lg;
   }
   ```

3. **组件懒加载**
   ```typescript
   // 异步加载组件
   const EnergyFlow = defineAsyncComponent(() =>
     import('@/components/business/energy-flow/index.vue')
   )
   ```

---

## 浏览器兼容性

| 特性 | H5 | 微信小程序 | 备注 |
|------|-------|-----------|------|
| SVG | ✅ | ✅ | 完全支持 |
| backdrop-filter | ⚠️ | ❌ | 自动降级 |
| CSS动画 | ✅ | ✅ | 完全支持 |
| 渐变 | ✅ | ✅ | 完全支持 |

**说明:**
- ⚠️ 表示部分浏览器支持,已提供降级方案
- ❌ 表示不支持,已提供替代方案

---

## 版本历史

### v1.0.0 (2026-02-12)

**Phase 1核心组件**
- ✅ 能量流SVG组件
- ✅ 毛玻璃卡片组件
- ✅ 渐变卡片组件
- ✅ 状态徽章组件
- ✅ 进度条组件
- ✅ Tailwind样式Mixin库
- ✅ 动画样式库
- ✅ TypeScript类型定义
- ✅ 组件演示页面

---

## 后续计划

### Phase 2
- 图表组件 (功率曲线、能量统计)
- 数据卡片组件
- 设备状态卡片
- 时间选择器

### Phase 3
- 表单组件
- 弹窗/对话框
- 下拉刷新
- 空状态组件

---

## 技术支持

如有问题或建议,请联系开发团队。
