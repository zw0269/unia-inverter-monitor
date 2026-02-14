/**
 * 蓝牙连接管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BluetoothDevice, ConnectionStatus } from '@/types/bluetooth'
import { hybridBluetooth } from '@/api/bluetooth/hybrid'
import { filterDevicesByName, sortDevicesByRSSI } from '@/utils/device-filter'

export const useBluetoothStore = defineStore('bluetooth', () => {
  // 状态
  const initialized = ref(false)
  const discovering = ref(false)
  const connectionStatus = ref<ConnectionStatus>('disconnected')
  const connectedDevice = ref<BluetoothDevice | null>(null)
  const discoveredDevices = ref<BluetoothDevice[]>([])

  // 过滤选项
  const filterOptions = ref({
    enabled: false,
    keywords: [] as string[],
    minRSSI: -100
  })

  // 计算属性
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const isConnecting = computed(() => connectionStatus.value === 'connecting')

  // 过滤后的设备列表
  const filteredDevices = computed(() => {
    let devices = discoveredDevices.value

    // 应用关键词过滤
    if (filterOptions.value.enabled && filterOptions.value.keywords.length > 0) {
      devices = filterDevicesByName(devices, filterOptions.value.keywords)
    }

    // 应用信号强度过滤
    if (filterOptions.value.enabled && filterOptions.value.minRSSI > -100) {
      devices = devices.filter(d => d.RSSI >= filterOptions.value.minRSSI)
    }

    return devices
  })

  /**
   * 初始化蓝牙
   */
  async function initialize() {
    try {
      await hybridBluetooth.initialize()
      initialized.value = true

      // 设置回调
      setupCallbacks()

      console.log('蓝牙初始化成功')
      return { success: true }
    } catch (error) {
      console.error('蓝牙初始化失败:', error)
      return { success: false, error }
    }
  }

  /**
   * 设置回调函数
   */
  function setupCallbacks() {
    // 设备发现回调
    hybridBluetooth.onDeviceFound((device) => {
      const index = discoveredDevices.value.findIndex(d => d.deviceId === device.deviceId)
      if (index >= 0) {
        discoveredDevices.value[index] = device
      } else {
        discoveredDevices.value.push(device)
      }
    })

    // 连接状态变化回调
    hybridBluetooth.onConnectionStateChange((status) => {
      connectionStatus.value = status
      if (status === 'connected') {
        connectedDevice.value = hybridBluetooth.getCurrentDevice()
      } else if (status === 'disconnected') {
        connectedDevice.value = null
      }
    })
  }

  /**
   * 开始扫描设备
   */
  async function startScan() {
    if (!initialized.value) {
      await initialize()
    }

    try {
      discoveredDevices.value = []
      discovering.value = true
      await hybridBluetooth.startDiscovery()
      return { success: true }
    } catch (error) {
      console.error('开始扫描失败:', error)
      discovering.value = false
      return { success: false, error }
    }
  }

  /**
   * 停止扫描
   */
  async function stopScan() {
    try {
      await hybridBluetooth.stopDiscovery()
      discovering.value = false
      return { success: true }
    } catch (error) {
      console.error('停止扫描失败:', error)
      return { success: false, error }
    }
  }

  /**
   * 连接设备
   */
  async function connect(deviceId: string) {
    if (!initialized.value) {
      await initialize()
    }

    try {
      await hybridBluetooth.connect(deviceId)
      return { success: true }
    } catch (error) {
      console.error('连接设备失败:', error)
      uni.showToast({
        title: '连接失败',
        icon: 'error'
      })
      return { success: false, error }
    }
  }

  /**
   * 断开连接
   */
  async function disconnect() {
    try {
      await hybridBluetooth.disconnect()
      return { success: true }
    } catch (error) {
      console.error('断开连接失败:', error)
      return { success: false, error }
    }
  }

  /**
   * 清理资源
   */
  async function cleanup() {
    await disconnect()
    await hybridBluetooth.close()
    initialized.value = false
    discoveredDevices.value = []
  }

  /**
   * 应用过滤
   * @param keywords 关键词列表
   * @param minRSSI 最小信号强度
   */
  function applyFilter(keywords?: string[], minRSSI?: number) {
    if (keywords !== undefined) {
      filterOptions.value.keywords = keywords
    }
    if (minRSSI !== undefined) {
      filterOptions.value.minRSSI = minRSSI
    }
    filterOptions.value.enabled = true
  }

  /**
   * 清除过滤
   */
  function clearFilter() {
    filterOptions.value.enabled = false
    filterOptions.value.keywords = []
    filterOptions.value.minRSSI = -100
  }

  /**
   * 按信号强度排序设备
   */
  function sortDevices() {
    discoveredDevices.value = sortDevicesByRSSI(discoveredDevices.value)
  }

  return {
    // 状态
    initialized,
    discovering,
    connectionStatus,
    connectedDevice,
    discoveredDevices,
    filterOptions,

    // 计算属性
    isConnected,
    isConnecting,
    filteredDevices,

    // 方法
    initialize,
    startScan,
    stopScan,
    connect,
    disconnect,
    cleanup,
    applyFilter,
    clearFilter,
    sortDevices
  }
})
