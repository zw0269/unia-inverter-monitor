<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAppStore } from '@/store/modules/app'
import { useBluetoothStore } from '@/store/modules/bluetooth'
import { useDeviceStore } from '@/store/modules/device'
import { useRevenueStore } from '@/store/modules/revenue'
import { useMeterStore } from '@/store/modules/meter'

const appStore = useAppStore()
const bluetoothStore = useBluetoothStore()
const deviceStore = useDeviceStore()
const revenueStore = useRevenueStore()
const meterStore = useMeterStore()

onLaunch(() => {
  console.log('App Launch')
  // 初始化应用
  appStore.initialize()

  // 初始化蓝牙
  bluetoothStore.initialize()

  // 初始化设备数据监听
  deviceStore.initDataListener()

  // 初始化收益与电表 Agent 监听
  revenueStore.setupAgentListeners()
  meterStore.setupAgentListeners()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-size: 16px;
  line-height: 1.6;
}

/* 通用容器 */
.container {
  padding: 20rpx;
}

/* 卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 标题 */
.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333333;
}

/* 按钮 */
.btn {
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn-primary {
  background-color: #1296db;
  color: #ffffff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333333;
}

/* 数据项 */
.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.data-label {
  color: #666666;
  font-size: 28rpx;
}

.data-value {
  color: #333333;
  font-size: 28rpx;
  font-weight: bold;
}

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}

.status-online {
  background-color: #67C23A;
  color: #ffffff;
}

.status-offline {
  background-color: #909399;
  color: #ffffff;
}

.status-warning {
  background-color: #E6A23C;
  color: #ffffff;
}

.status-error {
  background-color: #F56C6C;
  color: #ffffff;
}
</style>
