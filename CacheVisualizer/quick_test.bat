@echo off
echo ===========================================
echo   Simple Cache Visualizer Test (Quick)
echo ===========================================
echo.

REM Find C# compiler
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo ERROR: C# compiler not found
    pause
    exit /b 1
)

echo Compiling basic test...
echo.

REM Compile only the essential files for basic test
"%CSC%" /out:SimpleTest.exe ^
    Scripts\Core\CacheConfiguration.cs ^
    Scripts\Core\AddressComponents.cs ^
    Scripts\Core\AddressDecoder.cs ^
    Scripts\Core\CacheLine.cs ^
    Scripts\Core\CacheAccessResult.cs ^
    Scripts\Core\DirectMappingController.cs ^
    Tests\SimpleCacheTest.cs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build Successful! Running test...
    echo.
    SimpleTest.exe
) else (
    echo.
    echo Build FAILED!
)

pause
