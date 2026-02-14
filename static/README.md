# 静态资源目录

此目录用于存放应用的静态资源文件。

## TabBar图标

需要在以下路径放置TabBar图标：

- `static/tabbar/monitor.png` - 监控页图标（未选中）
- `static/tabbar/monitor-active.png` - 监控页图标（选中）
- `static/tabbar/statistics.png` - 统计页图标（未选中）
- `static/tabbar/statistics-active.png` - 统计页图标（选中）
- `static/tabbar/device.png` - 设备页图标（未选中）
- `static/tabbar/device-active.png` - 设备页图标（选中）
- `static/tabbar/profile.png` - 个人中心图标（未选中）
- `static/tabbar/profile-active.png` - 个人中心图标（选中）

## 图标建议尺寸

- TabBar图标: 81px x 81px (推荐)

## 临时方案

如果暂时没有图标，可以使用纯色占位图，或者在pages.json中注释掉TabBar的icon配置。
