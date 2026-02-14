/**
 * 设置 Store
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  DeviceParams,
  SystemSettings,
  CommParams,
  UserPreferences,
  SettingsCategory
} from '@/types/settings'
import { saveSettings, loadSettings, saveSettingsSync } from '@/utils/storage'

// 默认设备参数
const defaultDeviceParams: DeviceParams = {
  ratedPower: 125,
  maxPvVoltage: 1000,
  maxPvCurrent: 250,
  gridVoltageMin: 187,
  gridVoltageMax: 265,
  gridFrequencyMin: 49.5,
  gridFrequencyMax: 50.5,
  overTempThreshold: 80
}

// 默认系统设置
const defaultSystemSettings: SystemSettings = {
  dataRefreshInterval: 2,
  dataRetentionDays: 30,
  autoReconnect: true,
  alarmNotification: true,
  soundEnabled: true,
  vibrationEnabled: false,
  language: 'zh-CN'
}

// 默认通信参数
const defaultCommParams: CommParams = {
  bluetoothEnabled: true,
  bluetoothAutoConnect: true,
  wifiEnabled: false,
  wifiSSID: '',
  wifiPassword: '',
  cloudSyncEnabled: false,
  syncInterval: 15
}

// 默认用户偏好
const defaultUserPreferences: UserPreferences = {
  theme: 'auto',
  powerUnit: 'kW',
  energyUnit: 'kWh',
  currencySymbol: '¥',
  temperatureUnit: '℃',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h'
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const deviceParams = ref<DeviceParams>({ ...defaultDeviceParams })
  const systemSettings = ref<SystemSettings>({ ...defaultSystemSettings })
  const commParams = ref<CommParams>({ ...defaultCommParams })
  const userPreferences = ref<UserPreferences>({ ...defaultUserPreferences })

  // 是否已初始化
  const initialized = ref(false)

  // 计算属性：是否为深色模式
  const isDarkMode = computed(() => {
    if (userPreferences.value.theme === 'auto') {
      // 根据系统主题判断
      // 注意：uni-app 中获取系统主题需要特殊处理
      // #ifdef H5
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      // #endif
      return false
    }
    return userPreferences.value.theme === 'dark'
  })

  // 更新设备参数
  function updateDeviceParams(params: Partial<DeviceParams>): void {
    deviceParams.value = { ...deviceParams.value, ...params }
    saveSettings('settings_device', deviceParams.value)
  }

  // 更新系统设置
  function updateSystemSettings(settings: Partial<SystemSettings>): void {
    systemSettings.value = { ...systemSettings.value, ...settings }
    saveSettings('settings_system', systemSettings.value)
  }

  // 更新通信参数
  function updateCommParams(params: Partial<CommParams>): void {
    commParams.value = { ...commParams.value, ...params }
    saveSettings('settings_comm', commParams.value)
  }

  // 更新用户偏好
  function updateUserPreferences(prefs: Partial<UserPreferences>): void {
    userPreferences.value = { ...userPreferences.value, ...prefs }
    saveSettings('settings_user', userPreferences.value)
  }

  // 恢复默认值
  function resetToDefaults(category: SettingsCategory): void {
    switch (category) {
      case 'device':
        deviceParams.value = { ...defaultDeviceParams }
        saveSettingsSync('settings_device', deviceParams.value)
        break
      case 'system':
        systemSettings.value = { ...defaultSystemSettings }
        saveSettingsSync('settings_system', systemSettings.value)
        break
      case 'comm':
        commParams.value = { ...defaultCommParams }
        saveSettingsSync('settings_comm', commParams.value)
        break
      case 'user':
        userPreferences.value = { ...defaultUserPreferences }
        saveSettingsSync('settings_user', userPreferences.value)
        break
    }
  }

  // 加载所有设置
  function loadAllSettings(): void {
    try {
      deviceParams.value = loadSettings('settings_device', defaultDeviceParams)
      systemSettings.value = loadSettings('settings_system', defaultSystemSettings)
      commParams.value = loadSettings('settings_comm', defaultCommParams)
      userPreferences.value = loadSettings('settings_user', defaultUserPreferences)
      initialized.value = true
    } catch (error) {
      console.error('加载设置失败:', error)
      // 加载失败时使用默认值
      deviceParams.value = { ...defaultDeviceParams }
      systemSettings.value = { ...defaultSystemSettings }
      commParams.value = { ...defaultCommParams }
      userPreferences.value = { ...defaultUserPreferences }
    }
  }

  // 保存所有设置（立即保存，不防抖）
  function saveAllSettings(): void {
    try {
      saveSettingsSync('settings_device', deviceParams.value)
      saveSettingsSync('settings_system', systemSettings.value)
      saveSettingsSync('settings_comm', commParams.value)
      saveSettingsSync('settings_user', userPreferences.value)
    } catch (error) {
      console.error('保存设置失败:', error)
      throw error
    }
  }

  // 获取默认值
  function getDefaults(category: SettingsCategory) {
    switch (category) {
      case 'device':
        return { ...defaultDeviceParams }
      case 'system':
        return { ...defaultSystemSettings }
      case 'comm':
        return { ...defaultCommParams }
      case 'user':
        return { ...defaultUserPreferences }
      default:
        return null
    }
  }

  // 监听系统主题变化（仅 H5）
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeQuery.addEventListener('change', () => {
      // 触发响应式更新
      if (userPreferences.value.theme === 'auto') {
        // 强制触发计算属性更新
        userPreferences.value = { ...userPreferences.value }
      }
    })
  }
  // #endif

  return {
    // 状态
    deviceParams,
    systemSettings,
    commParams,
    userPreferences,
    initialized,

    // 计算属性
    isDarkMode,

    // 方法
    updateDeviceParams,
    updateSystemSettings,
    updateCommParams,
    updateUserPreferences,
    resetToDefaults,
    loadAllSettings,
    saveAllSettings,
    getDefaults
  }
})
