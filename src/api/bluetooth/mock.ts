/**
 * Mock蓝牙适配器
 * 模拟蓝牙连接和数据接收
 */

import type { BluetoothDevice, ConnectionStatus, DataPacket } from '@/types/bluetooth'
import { generateRealtimeData } from '@/mock/device/realtime'

// 模拟的蓝牙设备列表
const MOCK_DEVICES: BluetoothDevice[] = [
  {
    deviceId: 'mock-device-001',
    name: '125kW逆变器-01',
    RSSI: -45,
    localName: 'INV-125KW-001'
  },
  {
    deviceId: 'mock-device-002',
    name: '125kW逆变器-02',
    RSSI: -68,
    localName: 'INV-125KW-002'
  },
  {
    deviceId: 'mock-device-003',
    name: '数据棒-DataStick',
    RSSI: -52,
    localName: 'DataStick-A1'
  }
]

/**
 * Mock蓝牙适配器类
 */
export class MockBluetoothAdapter {
  private initialized = false
  private discovering = false
  private connected = false
  private currentDevice: BluetoothDevice | null = null
  private dataTimer: number | null = null

  // 回调函数
  private onDeviceFoundCallback: ((device: BluetoothDevice) => void) | null = null
  private onConnectionStateChangeCallback: ((status: ConnectionStatus) => void) | null = null
  private onDataReceivedCallback: ((packet: DataPacket) => void) | null = null

  /**
   * 初始化蓝牙适配器
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('[Mock蓝牙] 初始化成功')
        this.initialized = true
        resolve()
      }, 300)
    })
  }

  /**
   * 关闭蓝牙适配器
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.stopDiscovery()
      this.disconnect()
      this.initialized = false
      console.log('[Mock蓝牙] 适配器已关闭')
      resolve()
    })
  }

  /**
   * 开始扫描设备
   */
  async startDiscovery(): Promise<void> {
    if (!this.initialized) {
      throw new Error('蓝牙适配器未初始化')
    }

    return new Promise((resolve) => {
      this.discovering = true
      console.log('[Mock蓝牙] 开始扫描设备...')

      // 模拟设备扫描过程，逐个发现设备
      MOCK_DEVICES.forEach((device, index) => {
        setTimeout(() => {
          console.log(`[Mock蓝牙] 发现设备: ${device.name}`)
          this.onDeviceFoundCallback?.(device)
        }, (index + 1) * 500)
      })

      setTimeout(() => {
        console.log('[Mock蓝牙] 扫描完成')
        resolve()
      }, 2000)
    })
  }

  /**
   * 停止扫描
   */
  async stopDiscovery(): Promise<void> {
    this.discovering = false
    console.log('[Mock蓝牙] 停止扫描')
  }

  /**
   * 连接设备
   */
  async connect(deviceId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('蓝牙适配器未初始化')
    }

    const device = MOCK_DEVICES.find(d => d.deviceId === deviceId)
    if (!device) {
      throw new Error('设备不存在')
    }

    return new Promise((resolve, reject) => {
      console.log(`[Mock蓝牙] 正在连接设备: ${device.name}`)
      this.onConnectionStateChangeCallback?.('connecting')

      // 模拟连接过程
      setTimeout(() => {
        // 90%成功率
        if (Math.random() > 0.1) {
          this.connected = true
          this.currentDevice = device
          this.onConnectionStateChangeCallback?.('connected')
          console.log(`[Mock蓝牙] 设备连接成功: ${device.name}`)

          // 开始推送数据
          this.startDataPush()
          resolve()
        } else {
          this.onConnectionStateChangeCallback?.('disconnected')
          reject(new Error('连接失败'))
        }
      }, 1500)
    })
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return
    }

    return new Promise((resolve) => {
      console.log('[Mock蓝牙] 断开连接')
      this.onConnectionStateChangeCallback?.('disconnecting')

      // 停止数据推送
      this.stopDataPush()

      setTimeout(() => {
        this.connected = false
        this.currentDevice = null
        this.onConnectionStateChangeCallback?.('disconnected')
        console.log('[Mock蓝牙] 已断开连接')
        resolve()
      }, 500)
    })
  }

  /**
   * 开始推送模拟数据
   */
  private startDataPush(): void {
    if (this.dataTimer) {
      return
    }

    // 立即推送一次数据
    this.pushData()

    // 每2秒推送一次数据
    this.dataTimer = setInterval(() => {
      this.pushData()
    }, 2000) as unknown as number
  }

  /**
   * 停止推送数据
   */
  private stopDataPush(): void {
    if (this.dataTimer) {
      clearInterval(this.dataTimer)
      this.dataTimer = null
    }
  }

  /**
   * 推送一次数据
   */
  private pushData(): void {
    if (!this.connected || !this.onDataReceivedCallback) {
      return
    }

    // 生成实时数据
    const realtimeData = generateRealtimeData()

    const packet: DataPacket = {
      type: 'realtime',
      data: realtimeData,
      timestamp: Date.now()
    }

    this.onDataReceivedCallback(packet)
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * 获取当前连接的设备
   */
  getCurrentDevice(): BluetoothDevice | null {
    return this.currentDevice
  }

  /**
   * 设置设备发现回调
   */
  onDeviceFound(callback: (device: BluetoothDevice) => void): void {
    this.onDeviceFoundCallback = callback
  }

  /**
   * 设置连接状态变化回调
   */
  onConnectionStateChange(callback: (status: ConnectionStatus) => void): void {
    this.onConnectionStateChangeCallback = callback
  }

  /**
   * 设置数据接收回调
   */
  onDataReceived(callback: (packet: DataPacket) => void): void {
    this.onDataReceivedCallback = callback
  }
}

// 导出单例
export const mockBluetooth = new MockBluetoothAdapter()
