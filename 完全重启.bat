@echo off
echo ========================================
echo 完全清理并重启项目
echo ========================================
echo.

cd /d F:\unia

echo [1/4] 停止所有Node进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] 清理所有缓存...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
if exist .temp rmdir /s /q .temp
if exist unpackage rmdir /s /q unpackage
echo 缓存已清理

echo.
echo [3/4] 重新安装依赖...
call npm install

echo.
echo [4/4] 启动开发服务器...
echo.
call npm run dev:h5
