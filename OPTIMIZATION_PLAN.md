# UniApp 125kW逆变器监控优化计划

**生成时间：** 2026-02-14 16:20  
**基于Skills：** critical-code-reviewer, security-auditor, frontend-design, code-review, clean-code-review

---

## 🚨 Phase 1: Critical Fixes (必须立即修复)

### 1.1 Memory Leak - Interval Cleanup
**文件：** `src/pages/index/index.vue`  
**位置：** Line 398-402  
**优先级：** 🔴 Blocking

**问题：**
```typescript
onMounted(() => {
  // ...
  setInterval(() => {
    meterStore.updateRealtimeData()
    meterStore.updateEnergyBalance()
  }, 5000)
})
```

**修复：**
```typescript
let updateInterval: number | null = null

onMounted(() => {
  revenueStore.init()
  meterStore.init()
  updateInterval = setInterval(() => {
    meterStore.updateRealtimeData()
    meterStore.updateEnergyBalance()
  }, 5000) as unknown as number
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
})
```

---

### 1.2 Navigation Error Handling
**文件：** `src/pages/index/index.vue`  
**位置：** Lines 289-310  
**优先级：** 🔴 Blocking

**问题：** 所有导航函数缺少错误处理

**修复示例：**
```typescript
function goToDeviceDetail() {
  uni.navigateTo({
    url: '/pages/device/detail',
    fail: (err) => {
      console.error('Navigation failed:', err)
      uni.showToast({
        title: '页面加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}
```

**应用到：**
- `goToDeviceDetail()`
- `goToPVStrings()`
- `goToScan()`
- `goToRevenuePage()`
- `goToMeterPage()`

---

### 1.3 Null Safety on Computed Data
**文件：** `src/pages/index/index.vue`  
**位置：** Throughout template  
**优先级：** 🔴 Blocking

**问题：** `realtimeData` 可能为 null，虽然有 `v-if` 保护，但仍然脆弱

**修复：** 在计算属性中添加安全访问
```typescript
const safeRealtimeData = computed(() => realtimeData.value || {
  acPower: 0,
  dcPower: 0,
  todayEnergy: 0,
  efficiency: 0,
  temperature: 0,
  // ... 其他默认值
})
```

---

### 1.4 Accessibility Violations
**文件：** `src/pages/index/index.vue`  
**位置：** Multiple locations  
**优先级：** 🟡 Required

**问题：**
1. Icon-only buttons 缺少 aria-label
2. 颜色指示器缺少文本替代
3. `<view>` 元素使用 `@click` 而非 `<button>`

**修复示例：**
```vue
<!-- Before -->
<view class="access-item" @click="goToDeviceDetail">
  <view class="access-icon">📱</view>
  <text class="access-label">设备详情</text>
  <text class="access-arrow">›</text>
</view>

<!-- After -->
<button 
  class="access-item" 
  @click="goToDeviceDetail"
  aria-label="查看设备详情"
  type="button"
>
  <view class="access-icon" aria-hidden="true">📱</view>
  <text class="access-label">设备详情</text>
  <text class="access-arrow" aria-hidden="true">›</text>
</button>
```

---

## ⚠️ Phase 2: Required Changes (代码质量改进)

### 2.1 Remove Dead Code
**文件：** `src/pages/index/index.vue`  
**位置：** Lines 324-330 (placeholder), Lines 353-392 (commented initChart)  
**优先级：** 🟡 Required

**删除内容：**
- 注释的图表组件代码（90+ 行）
- `chartRef` 变量（未使用）
- `watch()` 监听器（已注释）

**保留：** 图表占位符 UI（lines 324-330）足以传达"功能开发中"

---

### 2.2 Extract Magic Numbers
**文件：** `src/pages/index/index.vue`  
**位置：** Line 400  
**优先级：** 🟡 Required

**修复：**
```typescript
// 在文件顶部定义常量
const METER_UPDATE_INTERVAL_MS = 5000
const CHART_UPDATE_INTERVAL_MS = 2000

// 使用常量
setInterval(() => {
  meterStore.updateRealtimeData()
  meterStore.updateEnergyBalance()
}, METER_UPDATE_INTERVAL_MS)
```

---

### 2.3 Improve Naming
**文件：** `src/pages/index/index.vue`  
**优先级：** 🟡 Required

**重命名：**
- `realtimeData` → `deviceRealtimeMetrics`
- `goToScan()` → `navigateToBluetoothScan()`
- `goToRevenuePage()` → `navigateToRevenuePage()`

---

### 2.4 Reduce Prop Drilling
**文件：** `src/pages/index/index.vue`  
**位置：** Lines 147-152  
**优先级：** 🟢 Suggested

**建议：** 让 `revenue-card` 组件直接消费 store，而非传递 5+ 个 props

---

## 🎨 Phase 3: UI/UX Enhancements (设计优化)

### 3.1 Typography Enhancement
**文件：** `src/uni.scss` (新建或添加)  
**优先级：** 🟢 Suggested

**添加：**
```scss
/* 引入更有特色的字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

/* 全局字体栈 */
$font-family-base: 'Inter', 'SF Pro Display', -apple-system, 'Noto Sans SC', sans-serif;
$font-family-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

/* 字重变量 */
$font-weight-normal: 400;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-black: 900;
```

---

### 3.2 Color System Expansion
**文件：** `src/uni.scss`  
**优先级：** 🟢 Suggested

**添加：**
```scss
/* 现有颜色 */
$color-primary: #1296db;
$color-bg-light: #f8f8f8;

/* 新增语义化颜色 */
$color-solar: #f59e0b;      // 光伏 - 橙色
$color-battery: #10b981;    // 储能 - 绿色
$color-grid: #6366f1;       // 电网 - 紫色
$color-load: #3b82f6;       // 负载 - 蓝色
$color-alert: #ef4444;      // 报警 - 红色
$color-success: #10b981;    // 成功 - 绿色
$color-warning: #f59e0b;    // 警告 - 橙色

/* Border Radius 系统 */
$radius-sm: 12rpx;
$radius-md: 16rpx;
$radius-lg: 20rpx;
$radius-xl: 32rpx;

/* Spacing 系统 */
$spacing-xs: 8rpx;
$spacing-sm: 12rpx;
$spacing-md: 16rpx;
$spacing-lg: 24rpx;
$spacing-xl: 32rpx;
$spacing-2xl: 48rpx;
```

---

### 3.3 Add Microinteractions
**文件：** `src/pages/index/index.vue` <style> section  
**优先级：** 🟢 Suggested

**添加动画：**
```scss
/* 功率数值更新动画 */
.power-value {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.updating {
    animation: pulse-scale 0.5s ease;
  }
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 实时指示器脉冲 */
.live-indicator .dot {
  animation: pulse-opacity 2s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 能量流动画 */
.energy-node {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: flow 2s linear infinite;
    pointer-events: none;
  }
}

@keyframes flow {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

/* 卡片悬浮效果 */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: translateY(2rpx);
  }
}

/* Hero卡片视差效果 */
.power-card {
  transform: translateY(-60rpx);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}
```

---

### 3.4 Improve Visual Hierarchy
**文件：** `src/pages/index/index.vue`  
**优先级：** 🟢 Suggested

**优化电站名称显示：**
```vue
<view class="station-main">
  <text class="station-label">当前电站</text>
  <text class="station-name">工业园区1号站</text>
  <view class="station-meta">
    <text class="station-capacity">125kW</text>
    <text class="station-separator">·</text>
    <text class="station-status">并网运行</text>
  </view>
</view>
```

```scss
.station-name {
  font-size: 48rpx;
  font-weight: 900;  // 增强权重
  letter-spacing: -0.5rpx;  // 紧缩字距
  line-height: 1.1;
}

.station-meta {
  display: flex;
  gap: 8rpx;
  align-items: center;
  
  .station-capacity {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }
}
```

---

## 🔒 Phase 4: Security Hardening (安全加固)

### 4.1 Production Build Optimization
**文件：** `vite.config.ts`  
**优先级：** 🟡 Required

**添加：**
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 移除生产环境的 console 和 debugger
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

---

### 4.2 Storage Encryption (Optional)
**文件：** `src/utils/storage.ts` (新建)  
**优先级：** 🟢 Suggested (如需存储敏感历史数据)

**实现：**
```typescript
import CryptoJS from 'crypto-js'

const STORAGE_KEY = 'inverter-app-secret-key' // 生产环境应从 env 读取

export function setSecureStorage(key: string, value: any) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(value),
    STORAGE_KEY
  ).toString()
  
  uni.setStorageSync(key, encrypted)
}

export function getSecureStorage<T>(key: string): T | null {
  try {
    const encrypted = uni.getStorageSync(key)
    if (!encrypted) return null
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, STORAGE_KEY)
    const str = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(str) as T
  } catch {
    return null
  }
}
```

---

### 4.3 Content Security Policy (H5 Build)
**文件：** `index.html`  
**优先级：** 🟢 Suggested

**添加：**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' https://fonts.gstatic.com;">
```

---

### 4.4 Run Security Audit
**优先级：** 🟡 Required

**执行：**
```bash
cd F:\unia
npm audit
npm audit fix
npm outdated
```

**检查重点：**
- Vue 3 版本是否最新（当前 3.4.21）
- Pinia 版本（当前 2.1.7）
- ECharts 版本（当前 5.5.0）

---

## 📦 Phase 5: Component Refactoring (组件拆分)

### 5.1 Extract Large Components
**文件：** `src/pages/index/index.vue` (400+ lines)  
**优先级：** 🟢 Suggested (提升可维护性)

**建议拆分为：**

```
src/components/business/
├── device-status-card/        # 设备状态卡片（lines 8-44）
│   └── index.vue
├── hero-power-section/        # Hero 功率展示（lines 46-145）
│   └── index.vue
├── energy-flow-section/       # 能量流图（lines 157-213）
│   └── index.vue
├── dc-ac-data-panels/         # 直流交流数据面板（lines 229-295）
│   └── index.vue
└── quick-access-grid/         # 快速访问网格（lines 315-335）
    └── index.vue
```

**优势：**
- 降低单个组件复杂度
- 提升代码复用性
- 便于单元测试
- 减少重渲染范围

---

## 🧪 Phase 6: Testing & Validation (测试验证)

### 6.1 Add Type Safety
**文件：** `src/types/device.ts`  
**优先级：** 🟢 Suggested

**完善类型定义：**
```typescript
export interface RealtimeData {
  // 基础数据
  acPower: number
  dcPower: number
  todayEnergy: number
  totalEnergy: number
  efficiency: number
  temperature: number
  
  // 直流侧
  dcVoltage: number
  dcCurrent: number
  
  // 交流侧
  acVoltageA: number
  acVoltageB: number
  acVoltageC: number
  acCurrentA: number
  acCurrentB: number
  acCurrentC: number
  acFrequency: number
  
  // 元数据
  timestamp: number
  deviceStatus: 'running' | 'stopped' | 'fault' | 'unknown'
}

// 确保 computed 使用正确类型
const realtimeData: ComputedRef<RealtimeData | null> = computed(() => 
  deviceStore.realtimeData
)
```

---

### 6.2 Add Error Boundary
**文件：** `src/App.vue`  
**优先级：** 🟢 Suggested

**添加全局错误处理：**
```typescript
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('Uncaught error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  uni.showModal({
    title: '应用错误',
    content: '应用遇到了一个错误，请重启应用',
    showCancel: false
  })
  
  // 可选：上报到错误监控平台（Sentry, Bugsnag）
  return false // 阻止错误向上传播
})
```

---

## 📊 Implementation Priority Matrix

| Phase | 任务 | 影响 | 工作量 | 优先级 |
|-------|------|------|--------|--------|
| 1.1 | Memory Leak Fix | 高 | 5分钟 | 🔴 P0 |
| 1.2 | Navigation Error Handling | 高 | 15分钟 | 🔴 P0 |
| 1.3 | Null Safety | 中 | 10分钟 | 🔴 P0 |
| 1.4 | Accessibility | 高 | 30分钟 | 🟡 P1 |
| 2.1 | Remove Dead Code | 低 | 5分钟 | 🟡 P1 |
| 2.2 | Extract Magic Numbers | 低 | 10分钟 | 🟡 P1 |
| 2.3 | Improve Naming | 低 | 15分钟 | 🟡 P1 |
| 3.1-3.4 | UI/UX Enhancements | 中 | 2小时 | 🟢 P2 |
| 4.1 | Production Build | 中 | 10分钟 | 🟡 P1 |
| 4.2-4.4 | Security Hardening | 中 | 30分钟 | 🟢 P2 |
| 5.1 | Component Refactoring | 低 | 4小时 | 🟢 P3 |
| 6.1-6.2 | Testing & Validation | 中 | 1小时 | 🟢 P2 |

**总工作量估算：**
- P0 (Blocking): ~30分钟
- P1 (Required): ~1小时
- P2 (Suggested): ~4小时
- P3 (Optional): ~4小时

---

## ✅ Quick Wins Checklist (30分钟快速优化)

执行以下步骤可立即提升代码质量：

```bash
# 1. 修复 Memory Leak (5分钟)
# 添加 onUnmounted() 清理定时器

# 2. 添加导航错误处理 (15分钟)
# 为所有 uni.navigateTo() 添加 fail 回调

# 3. 清理死代码 (5分钟)
# 删除注释的图表代码和 chartRef

# 4. 提取魔法数字 (5分钟)
# 定义 METER_UPDATE_INTERVAL_MS 常量

# 5. 运行安全审计
cd F:\unia
npm audit
npm audit fix
```

---

## 📝 Next Steps

1. **立即执行：** Phase 1 所有 Blocking 问题（~30分钟）
2. **本周完成：** Phase 2 Required Changes（~1小时）
3. **下周计划：** Phase 3 UI/UX Enhancements（~2小时）
4. **长期优化：** Phase 5 Component Refactoring（按需）

---

## 🔗 参考文档

- **Critical Code Reviewer Skill:** `/openclaw/skills/critical-code-reviewer/SKILL.md`
- **Security Auditor Skill:** `/openclaw/skills/security-auditor/SKILL.md`
- **Frontend Design Skill:** `/openclaw/skills/frontend-design/SKILL.md`
- **UniApp官方文档：** https://uniapp.dcloud.net.cn/
- **Vue 3文档：** https://vuejs.org/

---

**生成工具：** OpenClaw Critical Code Reviewer + Security Auditor + Frontend Design  
**审查日期：** 2026-02-14  
**项目版本：** 1.0.0
