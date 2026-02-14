/**
 * Web Bluetooth API 适配器
 * 用于H5环境下的真实蓝牙通信
 */

import type { BluetoothDevice, ConnectionStatus } from '@/types/bluetooth'

class WebBluetoothAdapter {
  private device: BluetoothDevice | null = null
  private bluetoothDevice: any = null
  private server: any = null
  private characteristic: any = null

  // 回调函数
  private onDeviceFoundCallback: ((device: BluetoothDevice) => void) | null = null
  private onConnectionStateChangeCallback: ((status: ConnectionStatus) => void) | null = null
  private onDataReceivedCallback: ((data: any) => void) | null = null

  // 事件监听器引用（用于清理）
  private characteristicValueChangedHandler: ((event: any) => void) | null = null
  private gattServerDisconnectedHandler: (() => void) | null = null

  // 蓝牙服务UUID（根据实际设备修改）
  private readonly SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'
  private readonly CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'

  /**
   * 检查浏览器是否支持Web Bluetooth
   */
  isSupported(): boolean {
    return 'bluetooth' in navigator
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('当前浏览器不支持Web Bluetooth API')
    }
    console.log('Web Bluetooth API 可用')
  }

  /**
   * 开始扫描设备（Web Bluetooth使用requestDevice）
   */
  async startDiscovery(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('当前浏览器不支持Web Bluetooth API')
    }

    try {
      // Web Bluetooth API 通过requestDevice弹出设备选择器
      // 注意：需要用户手势触发（如点击按钮）

      // 生产模式：使用设备名称前缀和服务UUID进行过滤
      // 这样可以减少恶意设备的风险
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: '125kW' },        // 逆变器设备名称前缀
          { namePrefix: 'INV' },          // 可能的其他前缀
          { namePrefix: 'HN-125K' },      // 根据实际设备型号调整
          { services: [this.SERVICE_UUID] }
        ],
        optionalServices: [this.SERVICE_UUID]
      })

      /* 开发/测试模式：接受所有设备（不推荐在生产环境使用）
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      })
      */

      console.log('发现设备:', device.name)

      // 验证设备名称格式（额外安全检查）
      if (device.name && !this.validateDeviceName(device.name)) {
        console.warn('设备名称格式不符合预期:', device.name)
        throw new Error('设备名称验证失败')
      }

      // 触发设备发现回调
      if (this.onDeviceFoundCallback) {
        const bluetoothDevice: BluetoothDevice = {
          deviceId: device.id,
          name: device.name || '未知设备',
          RSSI: -60, // Web Bluetooth API 不提供RSSI
          advertisData: undefined
        }
        this.onDeviceFoundCallback(bluetoothDevice)
      }

      // 直接保存设备引用，准备连接
      this.bluetoothDevice = device
      this.device = {
        deviceId: device.id,
        name: device.name || '未知设备',
        RSSI: -60,
        advertisData: undefined
      }

    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        console.log('用户取消了设备选择')
        throw new Error('未选择设备')
      } else {
        console.error('扫描设备失败:', error)
        throw error
      }
    }
  }

  /**
   * 验证设备名称格式（根据实际设备命名规则调整）
   */
  private validateDeviceName(name: string): boolean {
    // 示例：验证设备名称包含预期的关键词
    const validPrefixes = ['125kW', 'INV', 'HN-125K', '逆变器']
    return validPrefixes.some(prefix => name.includes(prefix))
  }

  /**
   * 停止扫描
   */
  async stopDiscovery(): Promise<void> {
    // Web Bluetooth API没有停止扫描的方法
    console.log('Web Bluetooth: 扫描已结束')
  }

  /**
   * 移除事件监听器（防止内存泄漏）
   */
  private removeEventListeners() {
    if (this.characteristicValueChangedHandler && this.characteristic) {
      this.characteristic.removeEventListener('characteristicvaluechanged', this.characteristicValueChangedHandler)
      this.characteristicValueChangedHandler = null
    }
    
    if (this.gattServerDisconnectedHandler && this.bluetoothDevice) {
      this.bluetoothDevice.removeEventListener('gattserverdisconnected', this.gattServerDisconnectedHandler)
      this.gattServerDisconnectedHandler = null
    }
  }

  /**
   * 连接设备
   */
  async connect(deviceId: string): Promise<void> {
    if (!this.bluetoothDevice) {
      throw new Error('未找到要连接的设备')
    }

    try {
      // 先移除旧的事件监听器
      this.removeEventListeners()

      // 通知连接状态变化
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback('connecting')
      }

      console.log('正在连接设备:', this.bluetoothDevice.name)

      // 连接GATT服务器
      this.server = await this.bluetoothDevice.gatt.connect()
      console.log('GATT服务器已连接')

      // 获取主服务
      const service = await this.server.getPrimaryService(this.SERVICE_UUID)
      console.log('已获取服务:', this.SERVICE_UUID)

      // 获取特征值
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID)
      console.log('已获取特征值:', this.CHARACTERISTIC_UUID)

      // 启用通知
      await this.characteristic.startNotifications()
      console.log('已启用通知')

      // 创建并保存事件监听器引用
      this.characteristicValueChangedHandler = (event: any) => {
        const value = event.target.value
        this.handleDataReceived(value)
      }
      
      this.gattServerDisconnectedHandler = () => {
        console.log('设备已断开连接')
        if (this.onConnectionStateChangeCallback) {
          this.onConnectionStateChangeCallback('disconnected')
        }
      }

      // 监听特征值变化
      this.characteristic.addEventListener('characteristicvaluechanged', this.characteristicValueChangedHandler)

      // 监听断开连接
      this.bluetoothDevice.addEventListener('gattserverdisconnected', this.gattServerDisconnectedHandler)

      // 通知连接成功
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback('connected')
      }

      console.log('设备连接成功')

    } catch (error) {
      console.error('连接设备失败:', error)
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback('disconnected')
      }
      throw error
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    // 先移除事件监听器
    this.removeEventListeners()

    if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
      this.bluetoothDevice.gatt.disconnect()
      console.log('已断开设备连接')
    }

    this.device = null
    this.bluetoothDevice = null
    this.server = null
    this.characteristic = null

    if (this.onConnectionStateChangeCallback) {
      this.onConnectionStateChangeCallback('disconnected')
    }
  }

  /**
   * 处理接收到的数据
   */
  private handleDataReceived(value: DataView) {
    try {
      // 解析数据（根据实际协议修改）
      const data = this.parseBluetoothData(value)

      if (this.onDataReceivedCallback) {
        this.onDataReceivedCallback(data)
      }
    } catch (error) {
      console.error('蓝牙数据解析失败:', error)
      
      // 通知用户数据异常
      if (typeof uni !== 'undefined') {
        uni.showToast({
          title: '数据异常，请检查设备',
          icon: 'error',
          duration: 3000
        })
      }
      
      // 可选：多次解析失败后自动断开连接
      // this.disconnect()
    }
  }

  /**
   * 解析蓝牙数据
   */
  private parseBluetoothData(dataView: DataView): any {
    // 这里需要根据实际设备的协议来解析数据
    // 示例：假设数据格式为 [功率(4字节), 电压(4字节), 电流(4字节), ...]

    // 定义最小数据包大小（根据实际协议调整）
    const MIN_PACKET_SIZE = 20 // 5个Float32字段 * 4字节

    // 边界检查
    if (dataView.byteLength < MIN_PACKET_SIZE) {
      throw new Error(`Invalid packet size: ${dataView.byteLength} bytes, expected at least ${MIN_PACKET_SIZE} bytes`)
    }

    // 解析数据
    const dcVoltage = dataView.getFloat32(0, true)
    const dcCurrent = dataView.getFloat32(4, true)
    const dcPower = dataView.getFloat32(8, true)
    const acVoltageA = dataView.getFloat32(12, true)
    const acCurrentA = dataView.getFloat32(16, true)

    // 数据范围校验（根据实际设备规格调整）
    const VALIDATION_RANGES = {
      DC_VOLTAGE: { min: 0, max: 1500 },   // 直流电压范围（伏特）
      DC_CURRENT: { min: 0, max: 200 },    // 直流电流范围（安培）
      DC_POWER: { min: 0, max: 150000 },   // 直流功率范围（瓦特，150kW）
      AC_VOLTAGE: { min: 0, max: 500 },    // 交流电压范围（伏特）
      AC_CURRENT: { min: 0, max: 300 }     // 交流电流范围（安培）
    }

    // 验证数值范围
    if (dcVoltage < VALIDATION_RANGES.DC_VOLTAGE.min || dcVoltage > VALIDATION_RANGES.DC_VOLTAGE.max) {
      throw new Error(`Invalid DC voltage: ${dcVoltage}V (expected ${VALIDATION_RANGES.DC_VOLTAGE.min}-${VALIDATION_RANGES.DC_VOLTAGE.max}V)`)
    }

    if (dcCurrent < VALIDATION_RANGES.DC_CURRENT.min || dcCurrent > VALIDATION_RANGES.DC_CURRENT.max) {
      throw new Error(`Invalid DC current: ${dcCurrent}A (expected ${VALIDATION_RANGES.DC_CURRENT.min}-${VALIDATION_RANGES.DC_CURRENT.max}A)`)
    }

    if (dcPower < VALIDATION_RANGES.DC_POWER.min || dcPower > VALIDATION_RANGES.DC_POWER.max) {
      throw new Error(`Invalid DC power: ${dcPower}W (expected ${VALIDATION_RANGES.DC_POWER.min}-${VALIDATION_RANGES.DC_POWER.max}W)`)
    }

    // 检查NaN值
    if (isNaN(dcVoltage) || isNaN(dcCurrent) || isNaN(dcPower) || isNaN(acVoltageA) || isNaN(acCurrentA)) {
      throw new Error('Data contains NaN values')
    }

    const data = {
      dcVoltage,
      dcCurrent,
      dcPower,
      acVoltageA,
      acCurrentA,
      // ... 根据实际协议添加更多字段
      timestamp: Date.now()
    }

    return data
  }

  /**
   * 写入数据到设备
   */
  async writeData(data: ArrayBuffer): Promise<void> {
    if (!this.characteristic) {
      throw new Error('未连接设备')
    }

    try {
      await this.characteristic.writeValue(data)
      console.log('数据写入成功')
    } catch (error) {
      console.error('数据写入失败:', error)
      throw error
    }
  }

  /**
   * 获取当前连接的设备
   */
  getCurrentDevice(): BluetoothDevice | null {
    return this.device
  }

  /**
   * 设置设备发现回调
   */
  onDeviceFound(callback: (device: BluetoothDevice) => void) {
    this.onDeviceFoundCallback = callback
  }

  /**
   * 设置连接状态变化回调
   */
  onConnectionStateChange(callback: (status: ConnectionStatus) => void) {
    this.onConnectionStateChangeCallback = callback
  }

  /**
   * 设置数据接收回调
   */
  onDataReceived(callback: (data: any) => void) {
    this.onDataReceivedCallback = callback
  }

  /**
   * 关闭蓝牙
   */
  async close(): Promise<void> {
    await this.disconnect()
  }
}

export const webBluetooth = new WebBluetoothAdapter()
