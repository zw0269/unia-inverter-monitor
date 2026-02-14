# Web Bluetooth API 使用说明

**更新时间**: 2026-02-12
**状态**: ✅ 已集成

---

## 🎉 功能已完善！

应用现在已集成**Web Bluetooth API**，可以连接真实的蓝牙设备！

---

## 📱 功能说明

### 自动适配器选择
应用会自动检测浏览器环境并选择合适的蓝牙适配器：

- ✅ **支持Web Bluetooth** → 使用真实的Web Bluetooth API
- ❌ **不支持** → 自动降级到Mock蓝牙（模拟数据）

### 浏览器支持情况

| 浏览器 | 版本 | 支持Web Bluetooth |
|--------|------|------------------|
| Chrome | 56+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| Opera | 43+ | ✅ 完全支持 |
| Safari | - | ❌ 不支持 |
| Firefox | - | ❌ 不支持（需手动启用） |

---

## 🚀 使用方法

### 1. 在支持的浏览器中打开
推荐使用：
- Google Chrome（最佳）
- Microsoft Edge
- Opera

### 2. 确保使用HTTPS
Web Bluetooth API需要安全上下文（HTTPS或localhost）

✅ localhost:3001 - 可以使用
✅ https://your-domain.com - 可以使用
❌ http://192.168.x.x - 不能使用（非localhost的HTTP）

### 3. 点击扫描设备
1. 打开应用首页
2. 点击"扫描设备"按钮
3. 浏览器会弹出设备选择器
4. 选择要连接的设备
5. 等待连接完成

---

## 🔧 设备配置

### 蓝牙服务UUID配置

如果您的设备使用不同的UUID，请修改：
`F:\unia\src\api\bluetooth\web.ts`

```typescript
// 修改为您的设备UUID
private readonly SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'
private readonly CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'
```

### 设备过滤器配置

修改设备扫描过滤器（同一文件）：

```typescript
filters: [
  { namePrefix: '125kW' },      // 设备名称前缀
  { namePrefix: 'Inverter' },   // 或其他前缀
  { namePrefix: 'BLE' },
  { services: [this.SERVICE_UUID] }
]
```

---

## 📊 数据协议

### 接收数据格式

应用期望接收以下格式的数据（根据实际设备协议修改）：

```
偏移量 | 字段 | 类型 | 说明
-------|------|------|------
0      | dcVoltage | Float32 | 直流电压
4      | dcCurrent | Float32 | 直流电流
8      | dcPower   | Float32 | 直流功率
12     | acVoltageA | Float32 | A相电压
16     | acCurrentA | Float32 | A相电流
...    | ...       | ...     | ...
```

### 修改数据解析

在 `F:\unia\src\api\bluetooth\web.ts` 中的 `parseBluetoothData` 方法：

```typescript
private parseBluetoothData(dataView: DataView): any {
  try {
    const data = {
      dcVoltage: dataView.getFloat32(0, true),
      dcCurrent: dataView.getFloat32(4, true),
      dcPower: dataView.getFloat32(8, true),
      // 根据您的设备协议添加更多字段
    }
    return data
  } catch (error) {
    console.error('数据解析失败:', error)
    return null
  }
}
```

---

## 🐛 常见问题

### Q1: 点击扫描没有反应？
**A**:
1. 确认使用的是Chrome/Edge浏览器
2. 确认访问地址是localhost或HTTPS
3. 检查浏览器控制台是否有错误

### Q2: 提示"浏览器不支持Web Bluetooth"？
**A**:
- 更换为Chrome或Edge浏览器
- 或者继续使用Mock模拟数据（自动降级）

### Q3: 弹出设备选择器但没有设备？
**A**:
1. 确认蓝牙设备已开启且未连接其他设备
2. 确认设备名称符合过滤器配置
3. 尝试修改filters为`acceptAllDevices: true`（开发测试）

### Q4: 连接成功但没有数据？
**A**:
1. 检查UUID配置是否正确
2. 检查数据解析逻辑是否匹配设备协议
3. 查看浏览器控制台日志

### Q5: 如何在非HTTPS环境使用？
**A**:
- 只能通过localhost访问
- 或者使用Mock模拟数据（已自动降级）

---

## 🔍 调试方法

### 查看蓝牙日志
打开浏览器开发者工具（F12），切换到Console标签：

```
使用 Web Bluetooth API  ← 使用真实蓝牙
使用 Mock 蓝牙          ← 降级到模拟数据
```

### 查看连接过程
```
正在连接设备: xxx
GATT服务器已连接
已获取服务: xxx
已获取特征值: xxx
已启用通知
设备连接成功
```

### Chrome蓝牙调试
Chrome浏览器地址栏输入：
```
chrome://bluetooth-internals
```
可以查看详细的蓝牙调试信息

---

## 📝 开发者说明

### 文件结构
```
src/api/bluetooth/
├── web.ts      - Web Bluetooth API 适配器（真实蓝牙）
├── mock.ts     - Mock 蓝牙适配器（模拟数据）
└── hybrid.ts   - 混合适配器（自动选择）
```

### 适配器接口
所有适配器实现统一接口：
```typescript
- initialize()           - 初始化
- startDiscovery()       - 开始扫描
- stopDiscovery()        - 停止扫描
- connect(deviceId)      - 连接设备
- disconnect()           - 断开连接
- onDeviceFound()        - 设备发现回调
- onConnectionStateChange() - 连接状态回调
- onDataReceived()       - 数据接收回调
```

### 添加新适配器
1. 创建新适配器类
2. 实现统一接口
3. 在hybrid.ts中添加选择逻辑

---

## 🎯 下一步优化

### 建议改进
1. **协议适配** - 根据实际设备实现正确的数据协议
2. **错误处理** - 完善各种异常情况的处理
3. **重连机制** - 实现自动重连功能
4. **数据校验** - 添加数据校验和CRC校验
5. **多设备支持** - 支持连接多个设备

### 测试建议
1. 使用真实蓝牙设备测试
2. 测试各种异常情况（断线、数据错误等）
3. 测试不同浏览器的兼容性
4. 长时间连接稳定性测试

---

## 📞 技术支持

### 相关文档
- Web Bluetooth API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
- Chrome Bluetooth: https://developer.chrome.com/articles/bluetooth/

### 检查清单
- [x] Web Bluetooth API已集成
- [x] 自动适配器选择已实现
- [x] Mock蓝牙降级已实现
- [ ] 实际设备协议适配（需要根据设备修改）
- [ ] UUID配置（需要根据设备修改）
- [ ] 数据解析逻辑（需要根据设备修改）

---

**现在就可以在Chrome浏览器中连接真实的蓝牙设备了！** 🎉

---

*文档由协调者创建*
*最后更新: 2026-02-12*
