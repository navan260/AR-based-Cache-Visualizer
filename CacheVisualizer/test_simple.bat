@echo off
echo Testing if cache simulator works...
echo.

REM Simple test - just run the already compiled program
if exist "SimpleTest.exe" (
    echo Found SimpleTest.exe - Running it...
    SimpleTest.exe
) else if exist "CacheDemo.exe" (
    echo Found CacheDemo.exe - Running it...
    CacheDemo.exe
) else (
    echo No compiled program found.
    echo Trying to compile...
    
    C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /out:QuickTest.exe ^
        Scripts\Core\CacheConfiguration.cs ^
        Scripts\Core\AddressComponents.cs ^
        Scripts\Core\AddressDecoder.cs ^
        Scripts\Core\CacheLine.cs ^
        Scripts\Core\CacheAccessResult.cs ^
        Scripts\Core\DirectMappingController.cs ^
        Tests\SimpleCacheTest.cs
    
    if ERRORLEVEL 1 (
        echo.
        echo Compilation FAILED!
        echo This means there might be a C# compiler issue.
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo Compilation SUCCESS!
        echo Running test...
        QuickTest.exe
    )
)

pause
