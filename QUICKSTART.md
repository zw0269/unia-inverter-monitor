# Phase 1 核心UI组件 - 快速开始

## 10分钟快速上手指南

### 1. 查看组件演示 (2分钟)

在开发工具中运行项目,访问组件演示页面:

```
路径: /pages/components-demo/index
```

这个页面展示了所有5个核心组件的使用示例,并提供交互式演示。

---

### 2. 使用能量流组件 (3分钟)

**第一步:引入组件**

```vue
<script setup lang="ts">
import EnergyFlow from '@/components/business/energy-flow/index.vue'
</script>
```

**第二步:准备数据**

```typescript
const energyData = ref({
  solarPower: 105.2,      // 光伏功率
  batteryPower: 6.5,      // 储能功率(正为充电)
  loadPower: 98.7,        // 负载功率
  gridPower: 0,           // 电网功率
  batterySoc: 85          // 储能SOC%
})
```

**第三步:使用组件**

```vue
<template>
  <EnergyFlow
    :solar-power="energyData.solarPower"
    :battery-power="energyData.batteryPower"
    :load-power="energyData.loadPower"
    :grid-power="energyData.gridPower"
    :battery-soc="energyData.batterySoc"
  />
</template>
```

完成!能量流图表会自动显示,并带有流畅的动画效果。

---

### 3. 使用基础组件 (3分钟)

**状态徽章**

```vue
<template>
  <StatusBadge status="running" :pulse="true" />
</template>

<script setup lang="ts">
import StatusBadge from '@/components/common/status-badge/index.vue'
</script>
```

**进度条**

```vue
<template>
  <ProgressBar
    :percentage="85"
    theme="green"
    label="电池电量"
    :show-label="true"
  />
</template>

<script setup lang="ts">
import ProgressBar from '@/components/common/progress-bar/index.vue'
</script>
```

**渐变卡片**

```vue
<template>
  <GradientCard theme="blue" padding="32rpx">
    <text>这是一个蓝色渐变卡片</text>
  </GradientCard>
</template>

<script setup lang="ts">
import GradientCard from '@/components/common/gradient-card/index.vue'
</script>
```

---

### 4. 使用样式工具 (2分钟)

**方式1: 使用Mixin**

```vue
<style lang="scss" scoped>
@import '@/styles/mixins/tailwind.scss';

.my-card {
  @include card;
  @include shadow-lg;
}

.my-button {
  @include btn-primary;
}
</style>
```

**方式2: 使用工具类**

```vue
<template>
  <view class="card p-4 mb-3 shadow-lg">
    <text class="text-title font-bold text-primary">标题</text>
    <text class="text-body mt-2">正文内容</text>
  </view>
</template>

<style lang="scss" scoped>
@import '@/styles/index.scss';
</style>
```

**方式3: 使用动画**

```vue
<template>
  <view class="energy-node pulse-ring">能量节点</view>
  <view class="content fade-in-up">内容</view>
</template>

<style lang="scss" scoped>
@import '@/styles/animations.scss';
</style>
```

---

## 完整示例

查看完整的实际应用示例:

```
路径: /pages/energy-monitor/index
```

这个页面展示了如何将所有组件组合使用,构建一个完整的能量监控界面。

---

## 5个核心组件速查

| 组件 | 路径 | 用途 |
|------|------|------|
| EnergyFlow | `@/components/business/energy-flow` | 能量流SVG图 |
| GlassCard | `@/components/common/glass-card` | 毛玻璃卡片 |
| GradientCard | `@/components/common/gradient-card` | 渐变卡片 |
| StatusBadge | `@/components/common/status-badge` | 状态徽章 |
| ProgressBar | `@/components/common/progress-bar` | 进度条 |

---

## 常见问题

### Q1: 组件不显示?
**A:** 确保已正确引入组件并导入样式文件:
```scss
@import '@/styles/index.scss';
```

### Q2: 动画不流畅?
**A:** 检查是否有大量DOM操作,建议使用CSS动画而非JS动画。

### Q3: SVG在小程序不显示?
**A:** 能量流组件使用的是标准SVG,支持H5和微信小程序。确保`<svg>`标签正确闭合。

### Q4: 样式覆盖不生效?
**A:** 使用`scoped`时,可以用`::v-deep`或`/deep/`穿透样式。

### Q5: TypeScript类型错误?
**A:** 确保已导入类型定义:
```typescript
import type { EnergyFlowProps } from '@/components/types'
```

---

## 下一步

1. **阅读完整文档**
   查看 `src/components/README.md` 了解所有组件的详细API

2. **查看类型定义**
   查看 `src/components/types.ts` 了解所有TypeScript类型

3. **查看完成报告**
   查看 `PHASE1_COMPONENTS.md` 了解项目完整情况

4. **开始开发**
   基于这些组件构建你的业务页面

---

## 技术支持

如有问题,请参考:
- 组件文档: `src/components/README.md`
- 完成报告: `PHASE1_COMPONENTS.md`
- 演示页面: `/pages/components-demo/index`

---

**祝开发顺利!** 🚀
