/**
 * 跨 Store Agent 事件总线
 * 用于 Settings / Bluetooth / Device / App 各个 Agent 之间的通信
 */

export type AgentEventType =
  | 'settings:device:changed'
  | 'settings:system:changed'
  | 'settings:comm:changed'
  | 'settings:user:changed'
  | 'settings:reset'
  | 'bluetooth:status:changed'
  | 'bluetooth:device:found'
  | 'bluetooth:data:received'
  | 'device:realtime:updated'
  | 'device:alarm:added'
  | 'device:params:synced'
  | 'revenue:tariff:changed'
  | 'revenue:data:updated'
  | 'revenue:overview:refreshed'
  | 'meter:realtime:updated'
  | 'meter:balance:updated'
  | 'meter:bill:generated'
  | 'meter:stats:calculated'
  | 'app:theme:changed'
  | 'app:initialized'

export interface AgentEvent<T = any> {
  type: AgentEventType
  payload: T
  timestamp: number
  source: string // 发出事件的 store 名称
}

type EventHandler<T = any> = (event: AgentEvent<T>) => void

class AgentEventBus {
  private handlers: Map<AgentEventType, Set<EventHandler>> = new Map()
  private eventLog: AgentEvent[] = []
  private maxLogSize = 100

  /**
   * 订阅事件
   */
  on<T = any>(type: AgentEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler as EventHandler)

    // 返回取消订阅函数
    return () => this.off(type, handler)
  }

  /**
   * 取消订阅
   */
  off<T = any>(type: AgentEventType, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.delete(handler as EventHandler)
    }
  }

  /**
   * 发布事件
   */
  emit<T = any>(type: AgentEventType, payload: T, source: string): void {
    const event: AgentEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source
    }

    // 记录日志
    this.eventLog.push(event)
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize)
    }

    // 通知所有订阅者
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error(`[EventBus] 事件处理错误 ${type}:`, error)
        }
      })
    }
  }

  /**
   * 获取事件日志（用于诊断）
   */
  getEventLog(filter?: AgentEventType): AgentEvent[] {
    if (filter) {
      return this.eventLog.filter(e => e.type === filter)
    }
    return [...this.eventLog]
  }

  /**
   * 获取最近的事件
   */
  getLastEvent(type: AgentEventType): AgentEvent | undefined {
    for (let i = this.eventLog.length - 1; i >= 0; i--) {
      if (this.eventLog[i].type === type) {
        return this.eventLog[i]
      }
    }
    return undefined
  }

  /**
   * 清除所有订阅和日志
   */
  clear(): void {
    this.handlers.clear()
    this.eventLog = []
  }

  /**
   * 获取诊断信息
   */
  getDiagnostics() {
    const subscriptions: Record<string, number> = {}
    this.handlers.forEach((handlers, type) => {
      subscriptions[type] = handlers.size
    })

    return {
      totalSubscriptions: Array.from(this.handlers.values()).reduce((sum, s) => sum + s.size, 0),
      subscriptionsByType: subscriptions,
      eventLogSize: this.eventLog.length,
      lastEventTime: this.eventLog.length > 0
        ? this.eventLog[this.eventLog.length - 1].timestamp
        : null
    }
  }
}

// 全局单例
export const agentBus = new AgentEventBus()
