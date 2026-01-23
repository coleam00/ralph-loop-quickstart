@echo off
setlocal enabledelayedexpansion

:: Ralph Wiggum Autonomous Development Loop
:: =========================================
:: This script runs Claude Code in a continuous loop, each iteration with a fresh
:: context window. It reads PROMPT.md and feeds it to Claude until all tasks are
:: complete or max iterations is reached.
::
:: Usage: ralph.bat <max_iterations>
:: Example: ralph.bat 20

:: Check for required argument
if "%~1"=="" (
    echo Error: Missing required argument
    echo.
    echo Usage: %~nx0 ^<max_iterations^>
    echo Example: %~nx0 20
    exit /b 1
)

set MAX_ITERATIONS=%~1

:: Verify required files exist
if not exist "PROMPT.md" (
    echo Error: PROMPT.md not found
    echo Please create PROMPT.md or run /create-prd first
    exit /b 1
)

if not exist "prd.md" (
    echo Error: prd.md not found
    echo Please create your PRD or run /create-prd first
    exit /b 1
)

if not exist "activity.md" (
    echo Warning: activity.md not found, creating it...
    (
        echo # Project Build - Activity Log
        echo.
        echo ## Current Status
        echo **Last Updated:** Not started
        echo **Tasks Completed:** 0
        echo **Current Task:** None
        echo.
        echo ---
        echo.
        echo ## Session Log
        echo.
        echo ^<!-- Agent will append dated entries here --^>
    ) > activity.md
)

:: Create screenshots directory if it doesn't exist
if not exist "screenshots" mkdir screenshots

echo ======================================
echo    Ralph Wiggum Autonomous Loop
echo ======================================
echo.
echo Max iterations: %MAX_ITERATIONS%
echo Completion signal: ^<promise^>COMPLETE^</promise^>
echo.
echo Starting in 3 seconds... Press Ctrl+C to abort
timeout /t 3 /nobreak > nul
echo.

:: Main loop
set i=0
:loop
set /a i+=1
if %i% gtr %MAX_ITERATIONS% goto maxreached

echo ======================================
echo    Iteration %i% of %MAX_ITERATIONS%
echo ======================================
echo.

:: Run Claude with the prompt from PROMPT.md
set "TEMPFILE=%TEMP%\ralph_output_%i%.txt"

:: Use Node.js helper to run claude (avoids Windows escaping issues)
node ralph-helper.js PROMPT.md "%TEMPFILE%"

echo.

:: Check for completion signal
findstr /c:"<promise>COMPLETE</promise>" "%TEMPFILE%" > nul 2>&1
if %errorlevel%==0 (
    del "%TEMPFILE%" 2>nul
    echo.
    echo ======================================
    echo    ALL TASKS COMPLETE!
    echo ======================================
    echo.
    echo Finished after %i% iteration(s^)
    echo.
    echo Next steps:
    echo   1. Review the completed work in your project
    echo   2. Check activity.md for the full build log
    echo   3. Review screenshots/ for visual verification
    echo   4. Run your tests to verify everything works
    echo.
    exit /b 0
)

del "%TEMPFILE%" 2>nul

echo.
echo --- End of iteration %i% ---
echo.

:: Small delay between iterations to prevent hammering
timeout /t 2 /nobreak > nul

goto loop

:maxreached
echo.
echo ======================================
echo    MAX ITERATIONS REACHED
echo ======================================
echo.
echo Reached max iterations (%MAX_ITERATIONS%) without completion.
echo.
echo Options:
echo   1. Run again with more iterations: ralph.bat 50
echo   2. Check activity.md to see current progress
echo   3. Check prd.md to see remaining tasks
echo   4. Manually complete remaining tasks
echo.
exit /b 1
