/**
 * 应用全局状态 Store — 带跨 Agent 事件通信
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentBus } from '@/utils/event-bus'

export const useAppStore = defineStore('app', () => {
  // 主题模式（保留用于兼容，但将从 settings store 获取）
  const theme = ref<'light' | 'dark'>('light')

  // 是否显示调试信息
  const showDebugInfo = ref(false)

  // 应用版本
  const appVersion = ref('1.0.0')

  // 系统信息
  const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null)

  // 是否已初始化
  const initialized = ref(false)

  /**
   * 切换主题
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value === 'dark')
  }

  /**
   * 应用主题
   */
  function applyTheme(isDark: boolean) {
    // 在实际应用中，这里可以设置 CSS 变量或类名
    // 例如：document.documentElement.classList.toggle('dark', isDark)

    // 由于 uni-app 的限制，暂时只更新状态
    theme.value = isDark ? 'dark' : 'light'

    // #ifdef H5
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.value)
    }
    // #endif
  }

  /**
   * 切换调试信息显示
   */
  function toggleDebugInfo() {
    showDebugInfo.value = !showDebugInfo.value
  }

  /**
   * 获取系统信息
   */
  function getSystemInfo() {
    uni.getSystemInfo({
      success: (res) => {
        systemInfo.value = res
        console.log('系统信息:', res)
      }
    })
  }

  /**
   * 初始化应用
   */
  async function initialize() {
    if (initialized.value) {
      return
    }

    // 获取系统信息
    getSystemInfo()

    // 加载设置（延迟导入避免循环依赖）
    try {
      const { useSettingsStore } = await import('./settings')
      const settingsStore = useSettingsStore()

      // 加载所有设置
      settingsStore.loadAllSettings()

      // 应用主题
      applyTheme(settingsStore.isDarkMode)

      // 监听系统主题变化（仅在跟随系统时）
      // #ifdef H5
      if (typeof window !== 'undefined' && window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        darkModeQuery.addEventListener('change', (e) => {
          if (settingsStore.userPreferences.theme === 'auto') {
            applyTheme(e.matches)
          }
        })
      }
      // #endif
    } catch (error) {
      console.error('初始化设置失败:', error)
    }

    // 设置跨 Agent 监听
    setupAgentListeners()

    initialized.value = true

    // 通知其他 agent：应用已初始化
    agentBus.emit('app:initialized', { version: appVersion.value }, 'app')
    console.log('应用初始化完成')
  }

  /**
   * 监听来自其他 Agent 的事件
   */
  function setupAgentListeners(): void {
    // 监听主题变更事件
    agentBus.on('app:theme:changed', (event) => {
      applyTheme(event.payload.isDark)
    })

    // 监听系统设置变更（语言变化等）
    agentBus.on('settings:system:changed', (event) => {
      const { changedFields } = event.payload
      if (changedFields.includes('language')) {
        console.log('[App Agent] 语言设置已变更')
      }
    })

    // 监听用户偏好变更
    agentBus.on('settings:user:changed', (event) => {
      const { changedFields, preferences } = event.payload
      if (changedFields.includes('theme')) {
        const isDark = preferences.theme === 'dark' ||
          (preferences.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
        applyTheme(isDark)
      }
    })
  }

  return {
    // 状态
    theme,
    showDebugInfo,
    appVersion,
    systemInfo,
    initialized,

    // 方法
    toggleTheme,
    applyTheme,
    toggleDebugInfo,
    getSystemInfo,
    initialize
  }
})
