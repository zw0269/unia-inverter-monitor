<template>
  <view class="bill-page">
    <!-- 标题栏 -->
    <view class="page-header">
      <text class="page-title">电费账单</text>
      <view class="period-selector">
        <picker mode="selector" :range="periodOptions" range-key="label" @change="handlePeriodChange">
          <view class="selector-value">
            <text>{{ currentPeriodLabel }}</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 当前账单摘要 -->
    <view class="section" v-if="currentBill">
      <view class="summary-card">
        <view class="summary-header">
          <text class="summary-title">账单摘要</text>
          <view class="bill-status" :class="currentBill.status">
            <text>{{ billStatusText }}</text>
          </view>
        </view>

        <view class="summary-period">
          <text>{{ currentBill.startDate }} 至 {{ currentBill.endDate }}</text>
        </view>

        <view class="summary-main">
          <view class="main-item total">
            <text class="main-label">总用电量</text>
            <text class="main-value">{{ currentBill.totalConsumption.toFixed(2) }} kWh</text>
          </view>
          <view class="main-item cost">
            <text class="main-label">总电费</text>
            <text class="main-value">¥{{ currentBill.totalCost.toFixed(2) }}</text>
          </view>
        </view>

        <view class="summary-avg">
          <text class="avg-label">平均电价</text>
          <text class="avg-value">¥{{ currentBill.avgPrice.toFixed(3) }}/kWh</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section" v-if="currentBill">
      <view class="detail-card">
        <text class="card-title">费用明细</text>

        <view class="detail-list">
          <view class="detail-item peak">
            <view class="detail-header">
              <view class="detail-dot peak-dot"></view>
              <text class="detail-label">峰时电费</text>
            </view>
            <view class="detail-info">
              <text class="detail-consumption">{{ currentBill.peakConsumption.toFixed(2) }} kWh × ¥{{ tariffConfig.peakPrice }}/kWh</text>
              <text class="detail-amount">¥{{ currentBill.peakCost.toFixed(2) }}</text>
            </view>
          </view>

          <view class="detail-item valley">
            <view class="detail-header">
              <view class="detail-dot valley-dot"></view>
              <text class="detail-label">谷时电费</text>
            </view>
            <view class="detail-info">
              <text class="detail-consumption">{{ currentBill.valleyConsumption.toFixed(2) }} kWh × ¥{{ tariffConfig.valleyPrice }}/kWh</text>
              <text class="detail-amount">¥{{ currentBill.valleyCost.toFixed(2) }}</text>
            </view>
          </view>

          <view class="detail-item flat">
            <view class="detail-header">
              <view class="detail-dot flat-dot"></view>
              <text class="detail-label">平时电费</text>
            </view>
            <view class="detail-info">
              <text class="detail-consumption">{{ currentBill.flatConsumption.toFixed(2) }} kWh × ¥{{ tariffConfig.flatPrice }}/kWh</text>
              <text class="detail-amount">¥{{ currentBill.flatCost.toFixed(2) }}</text>
            </view>
          </view>

          <view class="detail-divider"></view>

          <view class="detail-subtotal">
            <text class="subtotal-label">小计</text>
            <text class="subtotal-amount">¥{{ currentBill.totalCost.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发电收益抵扣 -->
    <view class="section" v-if="currentBill">
      <view class="deduction-card">
        <text class="card-title">发电收益抵扣</text>

        <view class="deduction-list">
          <view class="deduction-item">
            <view class="deduction-icon">🔋</view>
            <view class="deduction-content">
              <text class="deduction-label">自用电量节省</text>
              <text class="deduction-desc">{{ currentBill.selfUseEnergy.toFixed(2) }} kWh</text>
            </view>
            <text class="deduction-amount saving">-¥{{ currentBill.selfUseSaving.toFixed(2) }}</text>
          </view>

          <view class="deduction-item">
            <view class="deduction-icon">⚡</view>
            <view class="deduction-content">
              <text class="deduction-label">上网收益</text>
              <text class="deduction-desc">发电上网</text>
            </view>
            <text class="deduction-amount revenue">-¥{{ currentBill.gridRevenue.toFixed(2) }}</text>
          </view>

          <view class="deduction-divider"></view>

          <view class="deduction-total">
            <text class="total-label">实际应缴费用</text>
            <text class="total-amount">¥{{ currentBill.actualCost.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史账单列表 -->
    <view class="section">
      <view class="history-card">
        <text class="card-title">历史账单</text>

        <view class="history-list">
          <view
            v-for="bill in displayBills"
            :key="bill.id"
            class="history-item"
            @click="handleBillClick(bill)"
          >
            <view class="history-header">
              <text class="history-period">{{ bill.period }}</text>
              <view class="history-status" :class="bill.status">
                <text>{{ getBillStatusText(bill.status) }}</text>
              </view>
            </view>

            <view class="history-stats">
              <view class="history-stat">
                <text class="stat-label">用电量</text>
                <text class="stat-value">{{ bill.totalConsumption.toFixed(2) }} kWh</text>
              </view>
              <view class="history-stat">
                <text class="stat-label">电费</text>
                <text class="stat-value">¥{{ bill.totalCost.toFixed(2) }}</text>
              </view>
              <view class="history-stat">
                <text class="stat-label">实际应缴</text>
                <text class="stat-value actual">¥{{ bill.actualCost.toFixed(2) }}</text>
              </view>
            </view>

            <view class="history-footer">
              <text class="history-date">{{ bill.startDate }} ~ {{ bill.endDate }}</text>
              <text class="history-action">查看详情 →</text>
            </view>
          </view>
        </view>

        <!-- 导出按钮 -->
        <view class="export-section">
          <button class="export-btn" @click="handleExport">
            <text>📤 导出账单</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMeterStore } from '@/store/modules/meter'
import { useRevenueStore } from '@/store/modules/revenue'
import type { ElectricityBill } from '@/types/meter'

const meterStore = useMeterStore()
const revenueStore = useRevenueStore()

// 周期选项
const periodOptions = [
  { label: '本月', value: 'month' },
  { label: '近3月', value: 'quarter' },
  { label: '近6月', value: 'half' },
  { label: '本年', value: 'year' }
]

const selectedPeriodIndex = ref(0)
const selectedPeriod = computed(() => periodOptions[selectedPeriodIndex.value].value as any)
const currentPeriodLabel = computed(() => periodOptions[selectedPeriodIndex.value].label)

// 电价配置
const tariffConfig = computed(() => revenueStore.tariffConfig)

// 当前账单（最新）
const currentBill = computed(() => {
  const bills = meterStore.getBills(selectedPeriod.value)
  return bills.length > 0 ? bills[0] : null
})

// 显示的账单列表
const displayBills = computed(() => {
  return meterStore.getBills(selectedPeriod.value)
})

// 账单状态文本
const billStatusText = computed(() => {
  if (!currentBill.value) return ''
  return getBillStatusText(currentBill.value.status)
})

// 获取账单状态文本
function getBillStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '待缴费'
    case 'paid':
      return '已缴费'
    case 'overdue':
      return '已逾期'
    default:
      return '未知'
  }
}

// 切换周期
function handlePeriodChange(e: any) {
  selectedPeriodIndex.value = e.detail.value
}

// 点击账单
function handleBillClick(bill: ElectricityBill) {
  uni.showToast({
    title: `查看 ${bill.period} 账单`,
    icon: 'none'
  })
}

// 导出账单
function handleExport() {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  meterStore.init()
})
</script>

<style scoped lang="scss">
.bill-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}

.period-selector {
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.selector-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #1e293b;
}

.selector-arrow {
  font-size: 20rpx;
  color: #64748b;
}

.section {
  margin-bottom: 24rpx;
}

.summary-card,
.detail-card,
.deduction-card,
.history-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.summary-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.bill-status {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;

  &.pending {
    background: #fef3c7;
    color: #d97706;
  }

  &.paid {
    background: #d1fae5;
    color: #059669;
  }

  &.overdue {
    background: #fee2e2;
    color: #dc2626;
  }
}

.summary-period {
  font-size: 24rpx;
  color: #64748b;
  margin-bottom: 24rpx;
}

.summary-main {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.main-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 12rpx;

  &.total {
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  }

  &.cost {
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
  }
}

.main-label {
  font-size: 24rpx;
  color: #64748b;
}

.main-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
}

.summary-avg {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.avg-label {
  font-size: 26rpx;
  color: #64748b;
}

.avg-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
}

.detail-list,
.deduction-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;

  &.peak {
    border-left: 6rpx solid #ef4444;
  }

  &.valley {
    border-left: 6rpx solid #3b82f6;
  }

  &.flat {
    border-left: 6rpx solid #10b981;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.detail-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;

  &.peak-dot {
    background: #ef4444;
  }

  &.valley-dot {
    background: #3b82f6;
  }

  &.flat-dot {
    background: #10b981;
  }
}

.detail-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
}

.detail-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-consumption {
  font-size: 24rpx;
  color: #64748b;
}

.detail-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.detail-divider,
.deduction-divider {
  height: 2rpx;
  background: #e2e8f0;
  margin: 16rpx 0;
}

.detail-subtotal,
.deduction-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f1f5f9;
  border-radius: 12rpx;
}

.subtotal-label,
.total-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
}

.subtotal-amount {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
}

.total-amount {
  font-size: 40rpx;
  font-weight: 700;
  color: #ef4444;
}

.deduction-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.deduction-icon {
  font-size: 40rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
}

.deduction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.deduction-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
}

.deduction-desc {
  font-size: 24rpx;
  color: #64748b;
}

.deduction-amount {
  font-size: 32rpx;
  font-weight: 600;

  &.saving {
    color: #10b981;
  }

  &.revenue {
    color: #3b82f6;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.history-item {
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &:active {
    border-color: #3b82f6;
    background: #eff6ff;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.history-period {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
}

.history-status {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.pending {
    background: #fef3c7;
    color: #d97706;
  }

  &.paid {
    background: #d1fae5;
    color: #059669;
  }

  &.overdue {
    background: #fee2e2;
    color: #dc2626;
  }
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.history-stat {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #94a3b8;
}

.stat-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #475569;

  &.actual {
    color: #ef4444;
  }
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 2rpx solid #e2e8f0;
}

.history-date {
  font-size: 22rpx;
  color: #94a3b8;
}

.history-action {
  font-size: 24rpx;
  color: #3b82f6;
  font-weight: 500;
}

.export-section {
  padding-top: 24rpx;
  border-top: 2rpx solid #e2e8f0;
}

.export-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}
</style>
