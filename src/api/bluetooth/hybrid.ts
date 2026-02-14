/**
 * 混合蓝牙适配器
 * 自动选择Web Bluetooth API或Mock蓝牙
 */

import type { BluetoothDevice, ConnectionStatus } from '@/types/bluetooth'
import { webBluetooth } from './web'
import { mockBluetooth } from './mock'

class HybridBluetoothAdapter {
  private adapter: typeof webBluetooth | typeof mockBluetooth

  constructor() {
    // 检测环境，选择合适的适配器
    if (this.isWebBluetoothSupported()) {
      console.log('使用 Web Bluetooth API')
      this.adapter = webBluetooth
    } else {
      console.log('Web Bluetooth 不可用，使用 Mock 蓝牙')
      this.adapter = mockBluetooth
    }
  }

  /**
   * 检查是否支持Web Bluetooth
   */
  private isWebBluetoothSupported(): boolean {
    return 'bluetooth' in navigator
  }

  /**
   * 获取当前使用的适配器类型
   */
  getAdapterType(): 'web' | 'mock' {
    return this.adapter === webBluetooth ? 'web' : 'mock'
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    return this.adapter.initialize()
  }

  /**
   * 开始扫描设备
   */
  async startDiscovery(): Promise<void> {
    return this.adapter.startDiscovery()
  }

  /**
   * 停止扫描
   */
  async stopDiscovery(): Promise<void> {
    return this.adapter.stopDiscovery()
  }

  /**
   * 连接设备
   */
  async connect(deviceId: string): Promise<void> {
    return this.adapter.connect(deviceId)
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    return this.adapter.disconnect()
  }

  /**
   * 获取当前设备
   */
  getCurrentDevice(): BluetoothDevice | null {
    return this.adapter.getCurrentDevice()
  }

  /**
   * 设置设备发现回调
   */
  onDeviceFound(callback: (device: BluetoothDevice) => void) {
    return this.adapter.onDeviceFound(callback)
  }

  /**
   * 设置连接状态变化回调
   */
  onConnectionStateChange(callback: (status: ConnectionStatus) => void) {
    return this.adapter.onConnectionStateChange(callback)
  }

  /**
   * 设置数据接收回调
   */
  onDataReceived(callback: (data: any) => void) {
    return this.adapter.onDataReceived(callback)
  }

  /**
   * 关闭蓝牙
   */
  async close(): Promise<void> {
    return this.adapter.close()
  }
}

export const hybridBluetooth = new HybridBluetoothAdapter()
