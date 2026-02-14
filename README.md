# 125kW混逆监控App

基于UniApp + Vue3 + Pinia开发的光伏逆变器监控应用，通过蓝牙连接数据棒实时监控发电数据。

## 项目特点

- ✅ **完整的项目结构** - 清晰的目录组织，易于维护
- ✅ **Mock数据模拟** - 完整的蓝牙通信和数据生成模拟
- ✅ **真实的光伏曲线** - 根据时间自动生成符合光伏特性的功率曲线
- ✅ **响应式设计** - 支持多种设备和屏幕尺寸
- ✅ **TypeScript支持** - 完整的类型定义，提升开发体验
- ✅ **状态管理** - 使用Pinia进行集中状态管理
- ✅ **实时数据推送** - 每2秒自动更新设备数据

## 技术栈

- **框架**: UniApp + Vue3
- **状态管理**: Pinia
- **图表**: lime-echart + ECharts
- **语言**: TypeScript
- **构建工具**: Vite

## 项目结构

```
F:\unia\
├── src/
│   ├── api/                    # API接口
│   │   └── bluetooth/          # 蓝牙相关
│   │       └── mock.ts         # Mock蓝牙适配器
│   ├── mock/                   # Mock数据
│   │   └── device/
│   │       └── realtime.ts     # 实时数据生成器
│   ├── store/                  # Pinia状态管理
│   │   ├── modules/
│   │   │   ├── bluetooth.ts    # 蓝牙管理
│   │   │   ├── device.ts       # 设备数据管理
│   │   │   └── app.ts          # 应用全局状态
│   │   └── index.ts
│   ├── types/                  # TypeScript类型定义
│   │   ├── device.ts
│   │   └── bluetooth.ts
│   ├── utils/                  # 工具函数
│   │   └── format.ts           # 数据格式化
│   ├── pages/                  # 页面
│   │   ├── index/              # 首页监控
│   │   ├── statistics/         # 统计分析
│   │   ├── device/             # 设备管理
│   │   ├── profile/            # 个人中心
│   │   ├── bluetooth/          # 蓝牙扫描
│   │   └── alarm/              # 报警记录
│   ├── App.vue                 # 应用入口
│   ├── main.ts                 # 主入口
│   ├── pages.json              # 页面配置
│   ├── manifest.json           # 应用配置
│   └── uni.scss                # 全局样式变量
├── static/                     # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 核心功能

### 1. 蓝牙连接（Mock模拟）

- 扫描蓝牙设备
- 连接/断开设备
- 自动重连机制
- 连接状态管理

### 2. 实时监控

- **设备状态**: 运行状态、连接状态
- **直流侧数据**: 电压、电流、功率
- **交流侧数据**: 三相电压、三相电流、电网频率
- **效率与温度**: 转换效率、设备温度
- **发电量**: 今日发电、累计发电

### 3. 数据统计

- 功率曲线图表
- 发电量趋势
- 效率分析
- 运行时长统计

### 4. 设备管理

- 设备信息查看
- 连接管理
- 报警统计
- 数据操作

### 5. 报警管理

- 报警记录列表
- 报警级别分类
- 报警处理功能
- 报警过滤

## 快速开始

### 安装依赖

```bash
cd F:\unia
npm install
```

### 开发运行

```bash
# H5开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App开发
npm run dev:app
```

### 生产构建

```bash
# H5构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App构建
npm run build:app
```

## Mock数据说明

### 光伏发电模拟

Mock数据生成器会根据当前时间自动生成符合光伏特性的数据：

- **发电时段**: 06:00 - 18:00
- **峰值时间**: 12:00（正午）
- **功率曲线**: 符合实际光伏发电的上升和下降曲线
- **随机波动**: 模拟云层遮挡等自然因素
- **温度变化**: 根据功率自动计算设备温升

### 蓝牙连接模拟

- **扫描设备**: 模拟3个蓝牙设备，逐个发现
- **连接过程**: 模拟1.5秒的连接延迟
- **数据推送**: 连接成功后每2秒推送一次实时数据
- **断开连接**: 模拟0.5秒的断开延迟

## 页面说明

### 首页监控 (pages/index/index.vue)

- 设备状态卡片
- 蓝牙连接状态
- 关键指标展示
- 直流/交流侧数据
- 发电统计
- 功率曲线图表

### 统计分析 (pages/statistics/index.vue)

- 时间范围选择（日/周/月/年）
- 统计概览
- 发电量趋势图
- 功率曲线图
- 效率分析

### 设备管理 (pages/device/index.vue)

- 设备信息展示
- 连接管理
- 报警统计
- 设备操作（刷新、清空、重置）

### 个人中心 (pages/profile/index.vue)

- 用户信息
- 系统信息
- 功能设置
- 数据统计
- 快捷操作

### 蓝牙扫描 (pages/bluetooth/scan.vue)

- 扫描控制
- 设备列表
- 连接操作
- 使用说明

### 报警记录 (pages/alarm/list.vue)

- 报警列表
- 级别分类
- 过滤功能
- 处理操作

## 开发注意事项

### 1. TabBar图标

项目需要TabBar图标，请在`static/tabbar/`目录下放置以下图标：

- monitor.png / monitor-active.png
- statistics.png / statistics-active.png
- device.png / device-active.png
- profile.png / profile-active.png

建议尺寸：81px x 81px

### 2. lime-echart组件

首次运行前需要安装lime-echart组件：

```bash
npm install lime-echart echarts
```

### 3. 蓝牙权限

如果要在真机上测试蓝牙功能，需要在manifest.json中配置蓝牙权限（已配置）。

### 4. 切换到真实蓝牙

要切换到真实蓝牙，需要：

1. 创建真实的蓝牙适配器（参考mock.ts的接口）
2. 在store/modules/bluetooth.ts中替换import
3. 实现真实的蓝牙通信协议

## 数据格式化工具

项目提供了完整的数据格式化工具（src/utils/format.ts）：

- `formatPower()` - 功率格式化
- `formatEnergy()` - 电量格式化
- `formatVoltage()` - 电压格式化
- `formatCurrent()` - 电流格式化
- `formatTemperature()` - 温度格式化
- `formatFrequency()` - 频率格式化
- `formatEfficiency()` - 效率格式化
- `formatDateTime()` - 时间格式化
- `formatDeviceStatus()` - 状态格式化

## 常见问题

### Q1: 图表不显示？

A: 检查是否安装了lime-echart和echarts依赖。

### Q2: TabBar图标不显示？

A: 临时方案是在pages.json中注释掉iconPath配置，或者添加实际的图标文件。

### Q3: 如何修改Mock数据？

A: 编辑`src/mock/device/realtime.ts`文件，调整数据生成逻辑。

### Q4: 如何调整数据推送频率？

A: 在`src/api/bluetooth/mock.ts`中修改`startDataPush()`方法的定时器间隔。

## 后续优化建议

1. **UI美化**: 参考UI效果图进行界面优化
2. **真实蓝牙**: 实现真实的蓝牙通信
3. **数据持久化**: 使用uni.storage保存历史数据
4. **报警推送**: 实现报警通知功能
5. **数据导出**: 支持导出Excel或PDF报表
6. **多语言**: 国际化支持
7. **主题切换**: 实现深色模式
8. **离线缓存**: PWA支持

## 许可证

MIT

## 联系方式

如有问题，请联系开发团队。
