/**
 * 蓝牙相关类型定义
 */

// 蓝牙设备信息
export interface BluetoothDevice {
  deviceId: string
  name: string
  RSSI: number
  advertisData?: ArrayBuffer
  advertisServiceUUIDs?: string[]
  localName?: string
  serviceData?: Record<string, ArrayBuffer>
}

// 连接状态
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting'
}

// 蓝牙适配器状态
export interface BluetoothAdapterState {
  available: boolean
  discovering: boolean
}

// 蓝牙服务
export interface BluetoothService {
  uuid: string
  isPrimary: boolean
}

// 蓝牙特征值
export interface BluetoothCharacteristic {
  uuid: string
  serviceUuid: string
  properties: {
    read: boolean
    write: boolean
    notify: boolean
    indicate: boolean
  }
}

// 数据包
export interface DataPacket {
  type: 'realtime' | 'history' | 'alarm' | 'config'
  data: any
  timestamp: number
}
