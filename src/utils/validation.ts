/**
 * 表单验证工具函数
 */

import type { ValidationRule } from '@/types/settings'

/**
 * 数字范围验证
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  label: string
): { valid: boolean; message?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${label}不能为空` }
  }

  const numValue = Number(value)
  if (isNaN(numValue)) {
    return { valid: false, message: `${label}必须是数字` }
  }

  if (numValue < min || numValue > max) {
    return { valid: false, message: `${label}必须在 ${min} ~ ${max} 之间` }
  }

  return { valid: true }
}

/**
 * 必填验证
 */
export function validateRequired(
  value: any,
  label: string
): { valid: boolean; message?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${label}不能为空` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${label}不能为空` }
  }

  return { valid: true }
}

/**
 * IP 地址验证
 */
export function validateIP(value: string): { valid: boolean; message?: string } {
  if (!value) {
    return { valid: false, message: 'IP地址不能为空' }
  }

  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!ipRegex.test(value)) {
    return { valid: false, message: 'IP地址格式不正确' }
  }

  return { valid: true }
}

/**
 * Wi-Fi SSID 验证
 */
export function validateSSID(value: string): { valid: boolean; message?: string } {
  if (!value) {
    return { valid: false, message: 'Wi-Fi名称不能为空' }
  }

  if (value.length > 32) {
    return { valid: false, message: 'Wi-Fi名称不能超过32个字符' }
  }

  // SSID 可以包含任何可打印字符
  const ssidRegex = /^[\x20-\x7E]+$/
  if (!ssidRegex.test(value)) {
    return { valid: false, message: 'Wi-Fi名称包含非法字符' }
  }

  return { valid: true }
}

/**
 * 创建范围验证规则
 */
export function createRangeRule(
  min: number,
  max: number,
  label: string
): ValidationRule {
  return {
    validator: (value: any) => validateRange(value, min, max, label),
    trigger: 'blur'
  }
}

/**
 * 创建必填验证规则
 */
export function createRequiredRule(label: string): ValidationRule {
  return {
    validator: (value: any) => validateRequired(value, label),
    trigger: 'blur'
  }
}

/**
 * 创建 SSID 验证规则
 */
export function createSSIDRule(): ValidationRule {
  return {
    validator: (value: string) => validateSSID(value),
    trigger: 'blur'
  }
}

/**
 * 创建 IP 验证规则
 */
export function createIPRule(): ValidationRule {
  return {
    validator: (value: string) => validateIP(value),
    trigger: 'blur'
  }
}

/**
 * 批量验证
 */
export function validateAll(
  values: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  let valid = true

  for (const key in rules) {
    const value = values[key]
    const keyRules = rules[key]

    for (const rule of keyRules) {
      const result = rule.validator(value)
      if (!result.valid) {
        errors[key] = result.message || '验证失败'
        valid = false
        break
      }
    }
  }

  return { valid, errors }
}
