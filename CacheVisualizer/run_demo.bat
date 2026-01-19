@echo off
echo ==========================================
echo   Recompiling Fixed Demo
echo ==========================================
echo.
echo Closing any running instances...
taskkill /F /IM CacheDemo.exe 2>nul
timeout /t 2 /nobreak >nul

echo Compiling fixed version...
echo.

C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /out:CacheDemo.exe ^
    /optimize+ ^
    Scripts\Core\CacheConfiguration.cs ^
    Scripts\Core\AddressComponents.cs ^
    Scripts\Core\AddressDecoder.cs ^
    Scripts\Core\CacheLine.cs ^
    Scripts\Core\CacheAccessResult.cs ^
    Scripts\Core\DirectMappingController.cs ^
    Scripts\Demo\DemoScenarios.cs ^
    InteractiveDemo.cs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   Build Successful! Running demo...
    echo ==========================================
    echo.
    CacheDemo.exe
) else (
    echo.
    echo Build FAILED!
    pause
)
