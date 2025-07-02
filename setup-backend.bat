@echo off
chcp 65001 >nul
cd /d "%~dp0"

setlocal enabledelayedexpansion

REM --- Progresso - inicializa variáveis ---
set STEP=0
set TOTAL=4

REM =============================
REM INÍCIO DO FLUXO PRINCIPAL
REM =============================

echo ============================
echo Instalador Backend - Jobs Board
echo ============================

REM --- 1. Verifica e instala Chocolatey ---
set /a STEP+=1
call :progress "Verificando Chocolatey..."

where choco >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [LOG] Chocolatey nao encontrado. Instalando automaticamente...
    @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass ^
      -Command "[Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar o Chocolatey via PowerShell.
        pause
        exit /b 1
    )
    set "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
    echo [OK] Chocolatey instalado com sucesso!
) ELSE (
    echo [OK] Chocolatey já instalado!
)

REM --- 2. Instala Node.js LTS ---
set /a STEP+=1
call :progress "Instalando Node.js LTS..."
echo [LOG] Instalando Node.js LTS...
choco install -y nodejs-lts
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar o Node.js.
    pause
    exit /b 1
)
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js não foi instalado corretamente.
    pause
    exit /b 1
)
echo [OK] Node.js instalado!

REM --- 3. Instala Docker Desktop ---
set /a STEP+=1
call :progress "Instalando Docker Desktop..."
echo [LOG] Instalando Docker Desktop...
choco install -y docker-desktop
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar o Docker Desktop.
    pause
    exit /b 1
)
where docker >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Docker não foi instalado corretamente.
    pause
    exit /b 1
)
echo [OK] Docker Desktop instalado!

REM --- 4. Instala PostgreSQL ---
set /a STEP+=1
call :progress "Instalando PostgreSQL..."
echo [LOG] Instalando PostgreSQL...
choco install -y postgresql
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar o PostgreSQL.
    pause
    exit /b 1
)
where psql >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [AVISO] PostgreSQL não encontrado no PATH. Se usar somente o container, ignore este aviso.
) ELSE (
    echo [OK] PostgreSQL instalado!
)

echo ============================
echo [OK] Todas as dependências foram instaladas!
echo ============================

REM --- Continuação do setup do seu projeto ---
REM Descomente/adapte conforme necessário:

REM echo [LOG] Instalando dependências do projeto (npm install)...
REM call npm install

REM echo [LOG] Subindo containers Docker...
REM docker-compose up --build -d

REM echo [LOG] Executando migrations do Prisma...
REM docker exec -it express_app npx prisma migrate deploy

REM echo [OK] Setup finalizado. Pressione qualquer tecla para sair.
pause
endlocal
exit /b 0

REM =============================
REM FUNÇÃO DE PROGRESSO (DEVE ESTAR AO FINAL)
REM =============================
:progress
setlocal enabledelayedexpansion
set "msg=%~1"
set /a percent=(%STEP%*100)/%TOTAL%
set "bar="
for /l %%i in (1,1,%STEP%) do set "bar=!bar!#"
for /l %%i in (%STEP%,1,%TOTAL%) do set "bar=!bar!_"
set "bar=[!bar!] %percent%%"
echo !bar! - %msg%
endlocal
exit /b 0
