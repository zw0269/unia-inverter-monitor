/**
 * 设置 Store — 带跨 Agent 事件通信
 */

import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import type {
  DeviceParams,
  SystemSettings,
  CommParams,
  UserPreferences,
  SettingsCategory,
  SettingsChangeRecord,
  CategoryStatus
} from '@/types/settings'
import { saveSettings, loadSettings, saveSettingsSync } from '@/utils/storage'
import { agentBus } from '@/utils/event-bus'

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

  // 变更历史记录
  const changeHistory = ref<SettingsChangeRecord[]>([])

  // 各分类状态（用于首页状态展示）
  const categoryStatuses = ref<CategoryStatus[]>([
    { key: 'device', status: 'normal', summary: '额定功率 125kW' },
    { key: 'system', status: 'normal', summary: '刷新间隔 2秒' },
    { key: 'comm', status: 'normal', summary: '蓝牙已启用' },
    { key: 'user', status: 'normal', summary: '跟随系统主题' },
    { key: 'about', status: 'normal', summary: 'v1.0.0' }
  ])

  // 计算属性：是否为深色模式
  const isDarkMode = computed(() => {
    if (userPreferences.value.theme === 'auto') {
      // #ifdef H5
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      // #endif
      return false
    }
    return userPreferences.value.theme === 'dark'
  })

  // 计算属性：未同步的变更数
  const pendingChanges = computed(() => changeHistory.value.length)

  /**
   * 生成变更记录并通知其他 Agent
   */
  function recordChange(
    category: SettingsCategory,
    previous: Record<string, any>,
    current: Record<string, any>
  ): void {
    const changedFields: string[] = []
    const previousValues: Record<string, any> = {}
    const newValues: Record<string, any> = {}

    for (const key of Object.keys(current)) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changedFields.push(key)
        previousValues[key] = previous[key]
        newValues[key] = current[key]
      }
    }

    if (changedFields.length === 0) return

    const record: SettingsChangeRecord = {
      category,
      changedFields,
      previousValues,
      newValues,
      timestamp: Date.now()
    }

    changeHistory.value.push(record)
    // 最多保留 50 条变更记录
    if (changeHistory.value.length > 50) {
      changeHistory.value = changeHistory.value.slice(-50)
    }
  }

  // 更新设备参数
  function updateDeviceParams(params: Partial<DeviceParams>): void {
    const previous = { ...deviceParams.value }
    deviceParams.value = { ...deviceParams.value, ...params }
    saveSettings('settings_device', deviceParams.value)

    recordChange('device', previous, deviceParams.value)
    updateCategoryStatus('device', '额定功率 ' + deviceParams.value.ratedPower + 'kW')

    // 通知 device agent：参数已变更
    agentBus.emit('settings:device:changed', {
      params: deviceParams.value,
      changedFields: Object.keys(params)
    }, 'settings')
  }

  // 更新系统设置
  function updateSystemSettings(settings: Partial<SystemSettings>): void {
    const previous = { ...systemSettings.value }
    systemSettings.value = { ...systemSettings.value, ...settings }
    saveSettings('settings_system', systemSettings.value)

    recordChange('system', previous, systemSettings.value)
    updateCategoryStatus('system', '刷新间隔 ' + systemSettings.value.dataRefreshInterval + '秒')

    // 通知 app agent：系统设置已变更（主题/语言等）
    agentBus.emit('settings:system:changed', {
      settings: systemSettings.value,
      changedFields: Object.keys(settings)
    }, 'settings')
  }

  // 更新通信参数
  function updateCommParams(params: Partial<CommParams>): void {
    const previous = { ...commParams.value }
    commParams.value = { ...commParams.value, ...params }
    saveSettings('settings_comm', commParams.value)

    recordChange('comm', previous, commParams.value)

    const btStatus = commParams.value.bluetoothEnabled ? '蓝牙已启用' : '蓝牙已关闭'
    updateCategoryStatus('comm', btStatus)

    // 通知 bluetooth agent：通信参数已变更
    agentBus.emit('settings:comm:changed', {
      params: commParams.value,
      changedFields: Object.keys(params)
    }, 'settings')
  }

  // 更新用户偏好
  function updateUserPreferences(prefs: Partial<UserPreferences>): void {
    const previous = { ...userPreferences.value }
    userPreferences.value = { ...userPreferences.value, ...prefs }
    saveSettings('settings_user', userPreferences.value)

    recordChange('user', previous, userPreferences.value)

    const themeLabels: Record<string, string> = { auto: '跟随系统主题', light: '浅色主题', dark: '深色主题' }
    updateCategoryStatus('user', themeLabels[userPreferences.value.theme] || '自定义')

    // 通知 app agent：用户偏好已变更（主题变化等）
    agentBus.emit('settings:user:changed', {
      preferences: userPreferences.value,
      changedFields: Object.keys(prefs)
    }, 'settings')

    // 如果主题变化，额外发送主题变更事件
    if (prefs.theme !== undefined && prefs.theme !== previous.theme) {
      agentBus.emit('app:theme:changed', {
        theme: prefs.theme,
        isDark: isDarkMode.value
      }, 'settings')
    }
  }

  // 更新分类状态
  function updateCategoryStatus(key: SettingsCategory | 'about', summary: string, status: CategoryStatus['status'] = 'normal'): void {
    const idx = categoryStatuses.value.findIndex(s => s.key === key)
    if (idx >= 0) {
      categoryStatuses.value[idx] = { key, status, summary }
    }
  }

  // 恢复默认值
  function resetToDefaults(category: SettingsCategory): void {
    switch (category) {
      case 'device':
        deviceParams.value = { ...defaultDeviceParams }
        saveSettingsSync('settings_device', deviceParams.value)
        updateCategoryStatus('device', '额定功率 125kW')
        break
      case 'system':
        systemSettings.value = { ...defaultSystemSettings }
        saveSettingsSync('settings_system', systemSettings.value)
        updateCategoryStatus('system', '刷新间隔 2秒')
        break
      case 'comm':
        commParams.value = { ...defaultCommParams }
        saveSettingsSync('settings_comm', commParams.value)
        updateCategoryStatus('comm', '蓝牙已启用')
        break
      case 'user':
        userPreferences.value = { ...defaultUserPreferences }
        saveSettingsSync('settings_user', userPreferences.value)
        updateCategoryStatus('user', '跟随系统主题')
        break
    }

    // 通知所有 agent：设置已重置
    agentBus.emit('settings:reset', { category }, 'settings')
  }

  // 加载所有设置
  function loadAllSettings(): void {
    try {
      deviceParams.value = loadSettings('settings_device', defaultDeviceParams)
      systemSettings.value = loadSettings('settings_system', defaultSystemSettings)
      commParams.value = loadSettings('settings_comm', defaultCommParams)
      userPreferences.value = loadSettings('settings_user', defaultUserPreferences)
      initialized.value = true

      // 刷新状态摘要
      refreshAllStatuses()
    } catch (error) {
      console.error('加载设置失败:', error)
      deviceParams.value = { ...defaultDeviceParams }
      systemSettings.value = { ...defaultSystemSettings }
      commParams.value = { ...defaultCommParams }
      userPreferences.value = { ...defaultUserPreferences }
    }
  }

  // 刷新所有分类状态
  function refreshAllStatuses(): void {
    updateCategoryStatus('device', '额定功率 ' + deviceParams.value.ratedPower + 'kW')
    updateCategoryStatus('system', '刷新间隔 ' + systemSettings.value.dataRefreshInterval + '秒')
    updateCategoryStatus('comm', commParams.value.bluetoothEnabled ? '蓝牙已启用' : '蓝牙已关闭')

    const themeLabels: Record<string, string> = { auto: '跟随系统主题', light: '浅色主题', dark: '深色主题' }
    updateCategoryStatus('user', themeLabels[userPreferences.value.theme] || '自定义')
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

  /**
   * 监听来自其他 Agent 的事件
   */
  function setupAgentListeners(): void {
    // 监听蓝牙状态变化 → 更新通信分类状态
    agentBus.on('bluetooth:status:changed', (event) => {
      const status = event.payload.status
      if (status === 'connected') {
        updateCategoryStatus('comm', '蓝牙已连接', 'normal')
      } else if (status === 'connecting') {
        updateCategoryStatus('comm', '正在连接...', 'syncing')
      } else if (status === 'disconnected') {
        updateCategoryStatus('comm', commParams.value.bluetoothEnabled ? '蓝牙未连接' : '蓝牙已关闭', 'warning')
      }
    })

    // 监听设备数据更新 → 刷新设备分类状态
    agentBus.on('device:realtime:updated', (event) => {
      const power = event.payload.power
      if (power !== undefined) {
        updateCategoryStatus('device', '当前功率 ' + power.toFixed(1) + 'kW')
      }
    })
  }

  // 初始化 agent 监听
  setupAgentListeners()

  // 监听系统主题变化（仅 H5）
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeQuery.addEventListener('change', () => {
      if (userPreferences.value.theme === 'auto') {
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
    changeHistory,
    categoryStatuses,

    // 计算属性
    isDarkMode,
    pendingChanges,

    // 方法
    updateDeviceParams,
    updateSystemSettings,
    updateCommParams,
    updateUserPreferences,
    updateCategoryStatus,
    resetToDefaults,
    loadAllSettings,
    refreshAllStatuses,
    saveAllSettings,
    getDefaults
  }
})
