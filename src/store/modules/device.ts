/**
 * 设备数据管理 Store — 带跨 Agent 事件通信
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DeviceInfo, RealtimeData, AlarmInfo } from '@/types/device'
import type { SavedDevice } from '@/types/device-add'
import { DeviceStatus, DeviceType } from '@/types/device'
import { hybridBluetooth } from '@/api/bluetooth/hybrid'
import { generateHistoryData } from '@/mock/device/realtime'
import { agentBus } from '@/utils/event-bus'

const STORAGE_KEY_DEVICES = 'saved_devices'
const STORAGE_KEY_CURRENT_DEVICE = 'current_device_id'

export const useDeviceStore = defineStore('device', () => {
  // 设备信息
  const deviceInfo = ref<DeviceInfo>({
    id: 'INV-125KW-001',
    name: '125kW光伏逆变器',
    type: DeviceType.INVERTER,
    model: 'HN-125K-T',
    serialNumber: 'SN2024010001',
    firmwareVersion: 'V2.1.5',
    status: DeviceStatus.OFFLINE,
    lastUpdateTime: 0
  })

  // 实时数据
  const realtimeData = ref<RealtimeData | null>(null)

  // 历史数据（用于图表）
  const historyData = ref(generateHistoryData(12, 30)) // 最近12小时，30分钟间隔

  // 报警列表
  const alarms = ref<AlarmInfo[]>([])

  // 已保存的设备列表
  const savedDevices = ref<SavedDevice[]>([])

  // 当前选中的设备 ID
  const currentDeviceId = ref<string | null>(null)

  // 计算属性
  const isOnline = computed(() => realtimeData.value !== null)
  const deviceStatus = computed(() => realtimeData.value?.status || DeviceStatus.OFFLINE)
  const hasUnresolvedAlarms = computed(() =>
    alarms.value.some(alarm => !alarm.resolved)
  )

  // 当前功率
  const currentPower = computed(() => realtimeData.value?.acPower || 0)

  // 今日发电量
  const todayEnergy = computed(() => realtimeData.value?.todayEnergy || 0)

  // 累计发电量
  const totalEnergy = computed(() => realtimeData.value?.totalEnergy || 0)

  // 设备效率
  const efficiency = computed(() => realtimeData.value?.efficiency || 0)

  // 设备温度
  const temperature = computed(() => realtimeData.value?.temperature || 0)

  // 当前设备信息
  const currentDevice = computed(() => {
    if (!currentDeviceId.value) return null
    return savedDevices.value.find(d => d.id === currentDeviceId.value) || null
  })

  // 设备总数
  const deviceCount = computed(() => savedDevices.value.length)

  /**
   * 初始化设备数据监听
   */
  function initDataListener() {
    // 设置数据接收回调
    hybridBluetooth.onDataReceived((packet) => {
      if (packet.type === 'realtime') {
        updateRealtimeData(packet.data)
      } else if (packet.type === 'alarm') {
        addAlarm(packet.data)
      }
    })

    console.log('设备数据监听已初始化')
  }

  /**
   * 更新实时数据
   */
  function updateRealtimeData(data: RealtimeData) {
    realtimeData.value = data
    deviceInfo.value.status = data.status
    deviceInfo.value.lastUpdateTime = data.timestamp

    // 更新历史数据（保留最近12小时）
    const newPoint = {
      timestamp: data.timestamp,
      power: data.acPower,
      energy: data.todayEnergy
    }

    historyData.value.push(newPoint)

    // 只保留最近12小时的数据
    const cutoffTime = Date.now() - 12 * 60 * 60 * 1000
    historyData.value = historyData.value.filter(point => point.timestamp > cutoffTime)

    // 通知其他 agent：实时数据已更新
    agentBus.emit('device:realtime:updated', {
      power: data.acPower,
      energy: data.todayEnergy,
      temperature: data.temperature,
      status: data.status
    }, 'device')
  }

  /**
   * 添加报警
   */
  function addAlarm(alarm: AlarmInfo) {
    alarms.value.unshift(alarm)

    // 最多保留100条报警
    if (alarms.value.length > 100) {
      alarms.value = alarms.value.slice(0, 100)
    }

    // 通知其他 agent：新报警
    agentBus.emit('device:alarm:added', {
      alarm,
      totalUnresolved: alarms.value.filter(a => !a.resolved).length
    }, 'device')
  }

  /**
   * 监听来自 Settings Agent 的设备参数变更
   */
  function setupAgentListeners(): void {
    agentBus.on('settings:device:changed', (event) => {
      console.log('[Device Agent] 设备参数已变更:', event.payload.changedFields)
      // 参数变更后可同步到实际设备（通过蓝牙发送）
      agentBus.emit('device:params:synced', {
        params: event.payload.params,
        synced: false // 标记为待同步
      }, 'device')
    })
  }

  setupAgentListeners()

  /**
   * 解决报警
   */
  function resolveAlarm(alarmId: string) {
    const alarm = alarms.value.find(a => a.id === alarmId)
    if (alarm) {
      alarm.resolved = true
      alarm.resolvedTime = Date.now()
    }
  }

  /**
   * 清除所有报警
   */
  function clearAlarms() {
    alarms.value = []
  }

  /**
   * 获取功率曲线数据（用于图表）
   */
  function getPowerCurveData() {
    return historyData.value.map(point => ({
      time: point.timestamp,
      value: point.power
    }))
  }

  /**
   * 重置设备数据
   */
  function reset() {
    realtimeData.value = null
    deviceInfo.value.status = DeviceStatus.OFFLINE
    deviceInfo.value.lastUpdateTime = 0
  }

  /**
   * 从存储加载设备列表
   */
  function loadDevices() {
    try {
      const devicesJson = uni.getStorageSync(STORAGE_KEY_DEVICES)
      if (devicesJson) {
        savedDevices.value = JSON.parse(devicesJson)
      }

      const currentId = uni.getStorageSync(STORAGE_KEY_CURRENT_DEVICE)
      if (currentId) {
        currentDeviceId.value = currentId
      }

      console.log('设备列表加载成功:', savedDevices.value.length)
    } catch (error) {
      console.error('加载设备列表失败:', error)
    }
  }

  /**
   * 保存设备列表到存储
   */
  function saveDevices() {
    try {
      uni.setStorageSync(STORAGE_KEY_DEVICES, JSON.stringify(savedDevices.value))
      if (currentDeviceId.value) {
        uni.setStorageSync(STORAGE_KEY_CURRENT_DEVICE, currentDeviceId.value)
      }
      console.log('设备列表保存成功')
    } catch (error) {
      console.error('保存设备列表失败:', error)
    }
  }

  /**
   * 添加设备
   */
  function addDevice(device: SavedDevice) {
    // 检查别名是否重复
    const exists = savedDevices.value.some(d => d.alias === device.alias)
    if (exists) {
      throw new Error('设备别名已存在')
    }

    savedDevices.value.push(device)
    saveDevices()

    // 如果是第一个设备，自动设为当前设备
    if (savedDevices.value.length === 1) {
      currentDeviceId.value = device.id
      saveDevices()
    }

    console.log('设备添加成功:', device.alias)
  }

  /**
   * 更新设备
   */
  function updateDevice(id: string, data: Partial<SavedDevice>) {
    const index = savedDevices.value.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error('设备不存在')
    }

    // 如果修改了别名，检查是否重复
    if (data.alias && data.alias !== savedDevices.value[index].alias) {
      const exists = savedDevices.value.some(d => d.alias === data.alias && d.id !== id)
      if (exists) {
        throw new Error('设备别名已存在')
      }
    }

    savedDevices.value[index] = {
      ...savedDevices.value[index],
      ...data
    }
    saveDevices()

    console.log('设备更新成功:', id)
  }

  /**
   * 删除设备
   */
  function deleteDevice(id: string) {
    const index = savedDevices.value.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error('设备不存在')
    }

    savedDevices.value.splice(index, 1)

    // 如果删除的是当前设备，切换到第一个设备
    if (currentDeviceId.value === id) {
      currentDeviceId.value = savedDevices.value.length > 0 ? savedDevices.value[0].id : null
    }

    saveDevices()

    console.log('设备删除成功:', id)
  }

  /**
   * 切换当前设备
   */
  function switchDevice(id: string) {
    const device = savedDevices.value.find(d => d.id === id)
    if (!device) {
      throw new Error('设备不存在')
    }

    currentDeviceId.value = id
    saveDevices()

    console.log('切换到设备:', device.alias)
  }

  /**
   * 更新设备最后连接时间
   */
  function updateLastConnected(id: string) {
    const device = savedDevices.value.find(d => d.id === id)
    if (device) {
      device.lastConnected = Date.now()
      saveDevices()
    }
  }

  /**
   * 根据设备ID查找设备
   */
  function getDeviceById(id: string): SavedDevice | null {
    return savedDevices.value.find(d => d.id === id) || null
  }

  /**
   * 根据蓝牙设备ID查找设备
   */
  function getDeviceByBluetoothId(deviceId: string): SavedDevice | null {
    return savedDevices.value.find(d => d.deviceId === deviceId) || null
  }

  return {
    // 状态
    deviceInfo,
    realtimeData,
    historyData,
    alarms,
    savedDevices,
    currentDeviceId,

    // 计算属性
    isOnline,
    deviceStatus,
    hasUnresolvedAlarms,
    currentPower,
    todayEnergy,
    totalEnergy,
    efficiency,
    temperature,
    currentDevice,
    deviceCount,

    // 方法
    initDataListener,
    updateRealtimeData,
    addAlarm,
    resolveAlarm,
    clearAlarms,
    getPowerCurveData,
    reset,
    loadDevices,
    saveDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    switchDevice,
    updateLastConnected,
    getDeviceById,
    getDeviceByBluetoothId
  }
})
