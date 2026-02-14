/**
 * 设置相关类型定义
 */

// 设备参数
export interface DeviceParams {
  ratedPower: number          // 额定功率 (kW)
  maxPvVoltage: number        // 最大 PV 电压 (V)
  maxPvCurrent: number        // 最大 PV 电流 (A)
  gridVoltageMin: number      // 最小电网电压 (V)
  gridVoltageMax: number      // 最大电网电压 (V)
  gridFrequencyMin: number    // 最小电网频率 (Hz)
  gridFrequencyMax: number    // 最大电网频率 (Hz)
  overTempThreshold: number   // 过温阈值 (℃)
}

// 系统设置
export interface SystemSettings {
  dataRefreshInterval: number  // 数据刷新间隔 (秒)
  dataRetentionDays: number    // 数据保留天数
  autoReconnect: boolean       // 自动重连
  alarmNotification: boolean   // 报警通知
  soundEnabled: boolean        // 声音提示
  vibrationEnabled: boolean    // 振动提示
  language: 'zh-CN' | 'en-US'  // 语言
}

// 通信参数
export interface CommParams {
  bluetoothEnabled: boolean
  bluetoothAutoConnect: boolean
  wifiEnabled: boolean
  wifiSSID: string
  wifiPassword: string
  cloudSyncEnabled: boolean
  syncInterval: number         // 同步间隔（分钟）
}

// 用户偏好
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  powerUnit: 'kW' | 'W'
  energyUnit: 'kWh' | 'MWh'
  currencySymbol: '¥' | '$' | '€'
  temperatureUnit: '℃' | '℉'
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
  timeFormat: '24h' | '12h'
}

// 表单验证规则
export interface ValidationRule {
  validator: (value: any) => { valid: boolean; message?: string }
  trigger?: 'blur' | 'change'
}

// 设置分类
export type SettingsCategory = 'device' | 'system' | 'comm' | 'user'

// 设置分类信息（扩展支持状态摘要）
export interface SettingsCategoryInfo {
  key: SettingsCategory
  name: string
  description: string
  icon: string
  route: string
}

// 分类实时状态（用于设置首页状态徽标）
export interface CategoryStatus {
  key: SettingsCategory | 'about'
  status: 'normal' | 'warning' | 'error' | 'syncing'
  summary: string // 简短状态摘要，如 "蓝牙已连接" / "3 项已修改"
}

// 设置变更记录（用于跨 Agent 通信）
export interface SettingsChangeRecord {
  category: SettingsCategory
  changedFields: string[]
  previousValues: Record<string, any>
  newValues: Record<string, any>
  timestamp: number
}

// 诊断信息
export interface DiagnosticInfo {
  label: string
  value: string
  status: 'ok' | 'warning' | 'error'
}
