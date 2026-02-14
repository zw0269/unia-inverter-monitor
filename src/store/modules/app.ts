/**
 * 应用全局状态 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    initialized.value = true
    console.log('应用初始化完成')
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
