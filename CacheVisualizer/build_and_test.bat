@echo off
echo ==========================================
echo   Building Cache Visualizer Test (v2)
echo ==========================================
echo.

REM Find C# compiler
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo ERROR: C# compiler not found at %CSC%
    echo Please install .NET Framework or adjust the path
    pause
    exit /b 1
)

echo Compiling C# files...
echo.

REM Compile all files together
"%CSC%" /out:CacheTest.exe ^
    /optimize+ ^
    Scripts\Core\CacheConfiguration.cs ^
    Scripts\Core\AddressComponents.cs ^
    Scripts\Core\AddressDecoder.cs ^
    Scripts\Core\CacheLine.cs ^
    Scripts\Core\CacheAccessResult.cs ^
    Scripts\Core\DirectMappingController.cs ^
    Scripts\Core\SetAssociativeMappingController.cs ^
    Scripts\Core\FullyAssociativeMappingController.cs ^
    Scripts\Core\ReplacementPolicyManager.cs ^
    Tests\CacheSimulatorTest.cs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   Build Successful!
    echo ==========================================
    echo.
    echo Running tests...
    echo.
    CacheTest.exe
    echo.
    echo ==========================================
    echo   Tests Complete!
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo   Build FAILED - See errors above
    echo ==========================================
)

pause
