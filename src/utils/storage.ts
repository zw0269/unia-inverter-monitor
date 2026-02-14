/**
 * 存储工具函数
 */

// 防抖定时器缓存
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {}

/**
 * 保存设置（带防抖）
 */
export function saveSettings<T>(
  key: string,
  data: T,
  delay: number = 500
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 清除之前的定时器
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key])
    }

    // 设置新的定时器
    debounceTimers[key] = setTimeout(() => {
      try {
        uni.setStorageSync(key, JSON.stringify(data))
        resolve()
      } catch (error) {
        console.error(`保存设置失败 [${key}]:`, error)
        reject(error)
      }
    }, delay)
  })
}

/**
 * 加载设置
 */
export function loadSettings<T>(key: string, defaultValue: T): T {
  try {
    const value = uni.getStorageSync(key)
    if (value) {
      return JSON.parse(value) as T
    }
  } catch (error) {
    console.error(`加载设置失败 [${key}]:`, error)
  }
  return defaultValue
}

/**
 * 清除设置
 */
export function clearSettings(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error(`清除设置失败 [${key}]:`, error)
  }
}

/**
 * 导出所有设置
 */
export function exportAllSettings(): Record<string, any> {
  try {
    const info = uni.getStorageInfoSync()
    const allSettings: Record<string, any> = {}

    info.keys.forEach((key) => {
      if (key.startsWith('settings_')) {
        try {
          const value = uni.getStorageSync(key)
          if (value) {
            allSettings[key] = JSON.parse(value)
          }
        } catch (error) {
          console.error(`导出设置失败 [${key}]:`, error)
        }
      }
    })

    return allSettings
  } catch (error) {
    console.error('导出所有设置失败:', error)
    return {}
  }
}

/**
 * 导入设置
 */
export function importSettings(data: Record<string, any>): void {
  try {
    for (const key in data) {
      if (key.startsWith('settings_')) {
        uni.setStorageSync(key, JSON.stringify(data[key]))
      }
    }
  } catch (error) {
    console.error('导入设置失败:', error)
    throw error
  }
}

/**
 * 清除所有设置
 */
export function clearAllSettings(): void {
  try {
    const info = uni.getStorageInfoSync()
    info.keys.forEach((key) => {
      if (key.startsWith('settings_')) {
        uni.removeStorageSync(key)
      }
    })
  } catch (error) {
    console.error('清除所有设置失败:', error)
    throw error
  }
}

/**
 * 立即保存设置（不防抖）
 */
export function saveSettingsSync<T>(key: string, data: T): void {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
  } catch (error) {
    console.error(`保存设置失败 [${key}]:`, error)
    throw error
  }
}

/**
 * 获取存储大小信息
 */
export function getStorageInfo(): {
  currentSize: number
  limitSize: number
  keys: string[]
} {
  try {
    const info = uni.getStorageInfoSync()
    return {
      currentSize: info.currentSize,
      limitSize: info.limitSize,
      keys: info.keys
    }
  } catch (error) {
    console.error('获取存储信息失败:', error)
    return {
      currentSize: 0,
      limitSize: 0,
      keys: []
    }
  }
}
