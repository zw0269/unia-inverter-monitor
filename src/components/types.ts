/**
 * 组件类型定义
 */

// ==================== 能量流组件 ====================

/**
 * 能量流组件Props
 */
export interface EnergyFlowProps {
  /** 光伏功率 (kW) */
  solarPower: number
  /** 储能功率 (kW, 正为充电, 负为放电) */
  batteryPower: number
  /** 负载功率 (kW) */
  loadPower: number
  /** 电网功率 (kW, 正为上网, 负为用电) */
  gridPower: number
  /** 储能SOC百分比 (0-100) */
  batterySoc: number
}

// ==================== 毛玻璃卡片 ====================

/**
 * 毛玻璃卡片Props
 */
export interface GlassCardProps {
  /** 是否启用模糊效果 */
  blur?: boolean
  /** 内边距 */
  padding?: string
  /** 圆角大小 */
  radius?: string
  /** 背景透明度 (0-1) */
  bgOpacity?: number
}

// ==================== 渐变卡片 ====================

/**
 * 渐变方向
 */
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial'

/**
 * 渐变主题
 */
export type GradientTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom'

/**
 * 渐变卡片Props
 */
export interface GradientCardProps {
  /** 渐变主题 */
  theme?: GradientTheme
  /** 渐变方向 */
  direction?: GradientDirection
  /** 内边距 */
  padding?: string
  /** 圆角大小 */
  radius?: string
  /** 是否显示阴影 */
  shadow?: boolean
  /** 自定义起始颜色 */
  customFrom?: string
  /** 自定义结束颜色 */
  customTo?: string
}

// ==================== 状态徽章 ====================

/**
 * 状态类型
 */
export type StatusType =
  | 'running'      // 运行中
  | 'charging'     // 充电中
  | 'discharging'  // 放电中
  | 'warning'      // 告警
  | 'error'        // 故障
  | 'offline'      // 离线
  | 'standby'      // 待机

/**
 * 状态徽章Props
 */
export interface StatusBadgeProps {
  /** 状态类型 */
  status: StatusType
  /** 自定义文本 */
  text?: string
  /** 是否显示脉冲动画 */
  pulse?: boolean
  /** 是否显示图标 */
  showIcon?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
}

/**
 * 状态配置
 */
export interface StatusConfig {
  /** 显示文本 */
  text: string
  /** 图标 */
  icon: string
  /** 颜色 */
  color: string
  /** 背景颜色 */
  bgColor: string
}

// ==================== 进度条 ====================

/**
 * 进度条主题
 */
export type ProgressTheme = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gradient'

/**
 * 进度条Props
 */
export interface ProgressBarProps {
  /** 百分比 (0-100) */
  percentage: number
  /** 主题颜色 */
  theme?: ProgressTheme
  /** 高度 */
  height?: string
  /** 圆角 */
  radius?: string
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示动画 */
  animated?: boolean
  /** 是否显示条纹 */
  striped?: boolean
}

// ==================== 通用类型 ====================

/**
 * 尺寸类型
 */
export type Size = 'small' | 'medium' | 'large'

/**
 * 颜色主题
 */
export type ColorTheme =
  | 'primary'   // 主色
  | 'success'   // 成功
  | 'warning'   // 警告
  | 'danger'    // 危险
  | 'info'      // 信息
  | 'default'   // 默认

/**
 * 动画速度
 */
export type AnimationSpeed = 'slow' | 'normal' | 'fast'

/**
 * 方向
 */
export type Direction = 'top' | 'right' | 'bottom' | 'left'
