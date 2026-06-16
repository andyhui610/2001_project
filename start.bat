@echo off
title 2001: A Space Odyssey Frame Analysis Dashboard
echo ========================================================
echo  正在啟動《2001 太空漫遊》逐幀分析書籍寫作儀表板...
echo ========================================================

REM 1. 執行數據分析以生成 metadata.json
echo 正在更新劇本與鏡頭邊界數據...
"C:\Users\andyh\AppData\Local\Programs\Python\Python311\python.exe" generate_data.py
if %ERRORLEVEL% neq 0 (
    echo [錯誤] 數據提取失敗！請檢查 Python 3.11 與 pypdf 模組。
    pause
    exit /b %ERRORLEVEL%
)

REM 2. 建立筆記儲存資料夾 (如果不存在的話)
if not exist analysis_notes (
    echo 建立筆記儲存資料夾...
    mkdir analysis_notes
)

REM 3. 自動開啟瀏覽器指向本地伺服器
echo 正在開啟瀏覽器...
start http://localhost:8000

REM 4. 啟動本地寫作伺服器 (將持續在前台運行以輸出日誌)
echo 正在啟動本地寫作伺服器...
"C:\Users\andyh\AppData\Local\Programs\Python\Python311\python.exe" server.py

pause
