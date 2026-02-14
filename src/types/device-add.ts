/**
 * 设备添加流程类型定义
 */

// 设备添加步骤
export type DeviceAddStep = 'scan' | 'info' | 'config' | 'confirm'

// 设备表单数据
export interface DeviceFormData {
  name: string              // 设备名称
  alias: string             // 设备别名
  location: string          // 安装位置
  ratedPower: number        // 额定功率
  model: string             // 设备型号
  serialNumber: string      // 序列号
  installDate: string       // 安装日期
  description?: string      // 备注
}

// 保存的设备信息
export interface SavedDevice {
  id: string                // 设备 ID
  deviceId: string          // 蓝牙设备 ID
  name: string              // 蓝牙设备名称
  alias: string             // 用户设置的别名
  location: string          // 安装位置
  ratedPower: number        // 额定功率
  model: string             // 设备型号
  serialNumber: string      // 序列号
  installDate: string       // 安装日期
  addedDate: number         // 添加时间
  lastConnected?: number    // 最后连接时间
  description?: string      // 备注
}
