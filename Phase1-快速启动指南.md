# Phase 1 新页面快速启动指南

## 🚀 快速开始

### 1. 启动开发服务器

```bash
cd F:/unia
npm run dev:h5
```

服务器启动后,在浏览器访问: `http://localhost:5173`

### 2. 访问新页面的三种方式

#### 方式1: 从首页快速访问 (推荐)

1. 打开首页: `http://localhost:5173`
2. 滚动到"快速访问"区域
3. 点击"设备详情"或"组串监控"卡片

#### 方式2: 直接访问URL

- **设备详情页:**
  ```
  http://localhost:5173/#/pages/device/detail
  ```

- **光伏组串监控页:**
  ```
  http://localhost:5173/#/pages/device/pv-strings
  ```

#### 方式3: 从组件演示页访问

1. 访问: `http://localhost:5173/#/pages/components-demo/index`
2. 找到"Phase 1 新页面"区域
3. 点击对应的导航卡片

## 📱 页面功能说明

### 设备详情页功能

**页面路径:** `/pages/device/detail`

**主要功能:**
1. 显示混合逆变器的实时参数
2. 展示PV侧(光伏侧)参数
3. 展示电网侧三相参数
4. 显示温度、发电量等其他参数
5. 提供参数设置和日志查看入口

**操作方式:**
- 点击左上角返回按钮,返回上一页
- 点击"参数设置"按钮(开发中)
- 点击"查看日志"按钮(开发中)

**数据说明:**
- 当前使用Mock数据,自动加载
- 温度超过阈值会显示警告色
- 累计发电量使用千分位格式

### 光伏组串监控页功能

**页面路径:** `/pages/device/pv-strings`

**主要功能:**
1. 显示组串概览统计(在线数量、总功率)
2. 列表展示20路组串的运行状态
3. 识别异常组串并高亮显示
4. 支持分页加载查看更多组串
5. 提供IV曲线分析入口

**操作方式:**
- 点击左上角返回按钮,返回上一页
- 点击"IV曲线"按钮(开发中)
- 点击任意组串,查看详细信息
- 点击"展开更多"按钮,加载更多组串

**数据说明:**
- 初始显示5个组串
- 每次展开增加5个
- 异常组串会显示橙色警告
- 进度条根据效率百分比显示

## 🎨 UI特性

### 设计亮点

1. **渐变背景**
   - 设备详情页Header使用蓝紫渐变
   - 创造视觉层次感

2. **脉冲动画**
   - 通信状态和运行状态点
   - 动态呼吸效果

3. **毛玻璃效果**
   - 状态卡片使用半透明背景
   - backdrop-filter模糊效果

4. **颜色语义化**
   - 绿色(#52c41a): 正常状态、MPPT效率
   - 橙色(#faad14): 温度警告、异常组串
   - 蓝色(#2563eb): 频率、累计发电量
   - 紫色(#4f46e5): PV功率高亮

5. **交互反馈**
   - 点击缩放动画
   - Toast提示
   - 加载状态

## 📊 数据说明

### Mock数据位置

- **设备详情数据:** `src/mock/device/detail.ts`
- **组串监控数据:** `src/mock/device/strings.ts`

### 如何修改Mock数据

#### 修改设备详情数据

编辑 `src/mock/device/detail.ts`:

```typescript
export const mockDeviceDetail: DeviceDetail = {
  // 修改这里的值
  ratedPower: 125.0,  // 额定功率
  activePower: 98.7,  // 有功功率
  // ... 其他参数
}
```

#### 修改组串数据

编辑 `src/mock/device/strings.ts`:

```typescript
export const mockPVStrings: PVString[] = [
  {
    id: 1,
    voltage: 730,    // 修改电压
    current: 7.1,    // 修改电流
    power: 5.2,      // 修改功率
    efficiency: 94,  // 修改效率
    status: 'normal' // 修改状态: 'normal' | 'warning' | 'offline'
  },
  // ... 更多组串
]
```

### 如何替换为真实API

1. 创建API服务文件 `src/api/device.ts`
2. 实现API调用函数
3. 在页面组件中替换Mock数据调用

示例:
```typescript
// 原来
import { getDeviceDetail } from '@/mock/device/detail'

// 替换为
import { getDeviceDetail } from '@/api/device'
```

## 🔧 开发调试

### 修改页面内容

#### 设备详情页
- 文件位置: `src/pages/device/detail.vue`
- 修改模板: `<template>` 区域
- 修改逻辑: `<script setup>` 区域
- 修改样式: `<style>` 区域

#### 光伏组串监控页
- 文件位置: `src/pages/device/pv-strings.vue`
- 结构同上

### 热重载

修改文件后保存,浏览器会自动刷新,无需手动重启服务器。

### 调试技巧

1. **查看控制台日志**
   - 打开浏览器开发者工具(F12)
   - 查看Console面板

2. **检查网络请求**
   - Network面板查看API请求

3. **调试样式**
   - Elements面板实时修改CSS
   - 验证效果后复制到源码

## 📝 常见问题

### Q1: 页面显示空白?
**A:** 检查控制台是否有错误,确认Mock数据文件是否正确导入。

### Q2: 跳转失败?
**A:** 检查`pages.json`是否正确配置路由,路径是否正确。

### Q3: 样式不生效?
**A:** 确认SCSS语法正确,检查是否有选择器冲突。

### Q4: TypeScript报错?
**A:** 检查类型定义是否导入,Props类型是否匹配。

### Q5: Mock数据不显示?
**A:** 确认异步加载完成,检查loading状态处理。

## 🎯 下一步计划

### 待实现功能

1. **设备详情页**
   - [ ] IV曲线图表
   - [ ] 参数设置功能
   - [ ] 日志查看功能
   - [ ] 实时数据更新

2. **光伏组串监控页**
   - [ ] IV曲线分析
   - [ ] 组串对比功能
   - [ ] 数据导出
   - [ ] 筛选和排序

3. **通用优化**
   - [ ] 骨架屏加载
   - [ ] 下拉刷新
   - [ ] 错误处理
   - [ ] 性能优化

## 📞 技术支持

如有问题,请查阅以下文档:
- `Phase1-新页面开发报告.md` - 完整开发报告
- `Phase1-验证清单.md` - 功能验证清单
- `PROJECT_FILES.md` - 项目文件说明
- `QUICK_START.md` - 项目快速开始

---

**祝开发顺利!** 🎉
