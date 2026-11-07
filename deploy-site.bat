@echo off
chcp 65001 >nul
setlocal

REM ============================================================
REM Автоматическая загрузка изменений сайта в GitHub (и на сервер)
REM ============================================================
REM Файл нужно положить в КОРНЕ локального репозитория (туда же,
REM где index.html, css/ и js/).
REM При двойном клике папка репозитория определяется автоматически.
REM ============================================================

cd /d "%~dp0"

echo.
echo === Автоматическая загрузка сайта в GitHub ===
echo.

set "CHANGES="
for /f "delims=" %%a in ('git status --porcelain') do set "CHANGES=1"

if "%CHANGES%"=="" goto :no_changes

echo [1/4] Подготовка изменений...
git add -A

echo.
echo [2/4] Фиксирую коммит...
git commit -m "Auto: site update"
if errorlevel 1 (
    echo.
    echo [!] Ошибка: не удалось создать коммит.
    echo     Убедитесь, что настроены: git config user.name и git config user.email.
    goto :done
)

echo.
echo [3/4] Загрузка в GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo [!] Ошибка: не удалось загрузить в GitHub.
    echo     Проверьте интернет, token и настройки git-учётной записи.
    goto :done
)

echo.
echo === Готово! ===
echo На сайт nafnafiki.ru обновление появится автоматически через 1-3 минуты (GitHub Pages).
goto :done

:no_changes
echo В репозитории нет изменений — ничего не заливается.

:done
echo.
pause
endlocal
