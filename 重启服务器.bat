@echo off
echo ========================================
echo 清理Vite缓存并重启服务器
echo ========================================
echo.

cd /d F:\unia

echo 正在清理缓存...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo 缓存已清理
) else (
    echo 无缓存需要清理
)

echo.
echo 正在启动开发服务器...
echo.
npm run dev:h5
