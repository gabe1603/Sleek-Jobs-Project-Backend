@echo off
chcp 65001 >nul

REM Garante que está na pasta do script
cd /d "%~dp0"

REM Habilita suporte a cores ANSI (pode não funcionar em CMD antigo)
for /f "delims=" %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"

set "COLOR_OK=%ESC%[32m"
set "COLOR_WARN=%ESC%[33m"
set "COLOR_ERR=%ESC%[31m"
set "COLOR_RESET=%ESC%[0m"

set STEP=0
set TOTAL=8

call :progress "Iniciando instalador..."

echo ============================
echo %COLOR_OK%Instalador do Backend - Jobs Board%COLOR_RESET%
echo ============================

REM Verifica se o Chocolatey está instalado
set /a STEP+=1
call :progress "Verificando Chocolatey..."
where choco >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Chocolatey nao encontrado!%COLOR_RESET%
    echo.
    echo %COLOR_WARN%Para instalar o Chocolatey, siga os passos abaixo:%COLOR_RESET%
    echo 1. Um PowerShell sera aberto automaticamente como Administrador.
    echo 2. Copie e cole o comando abaixo no PowerShell e pressione Enter:
    echo.
    echo Set-ExecutionPolicy Bypass -Scope Process -Force; ^
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; ^
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    echo.
    echo 3. Aguarde a instalacao terminar, feche o PowerShell e execute este script novamente.
    echo.
    powershell -NoExit -Command "Start-Process powershell -Verb runAs"
    pause
    exit /b 1
)
echo %COLOR_OK%[OK] Chocolatey encontrado!%COLOR_RESET%

set RESTART_REQUIRED=0

set /a STEP+=1
call :progress "Instalando Node.js..."
echo %COLOR_WARN%[LOG] Instalando Node.js...%COLOR_RESET%
choco install -y nodejs-lts
IF %ERRORLEVEL% EQU 3010 (
    set RESTART_REQUIRED=1
)
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Node.js não foi instalado corretamente.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Instalando Docker Desktop..."
echo %COLOR_WARN%[LOG] Instalando Docker Desktop...%COLOR_RESET%
choco install -y docker-desktop
IF %ERRORLEVEL% EQU 3010 (
    set RESTART_REQUIRED=1
)

where docker >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Docker não foi instalado corretamente.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Instalando PostgreSQL..."
echo %COLOR_WARN%[LOG] Instalando PostgreSQL...%COLOR_RESET%
choco install -y postgresql
IF %ERRORLEVEL% EQU 3010 (
    set RESTART_REQUIRED=1
)

where psql >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_WARN%[AVISO] PostgreSQL não encontrado no PATH. Se usar somente o container, ignore este aviso.%COLOR_RESET%
)

IF %RESTART_REQUIRED% EQU 1 (
    echo.
    echo %COLOR_WARN%============================%COLOR_RESET%
    echo %COLOR_WARN%Uma ou mais instalacoes requerem que o computador seja reiniciado.%COLOR_RESET%
    echo %COLOR_WARN%Por favor, reinicie o computador AGORA e execute este script novamente apos o reboot.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Instalando dependencias do projeto (npm install)..."
echo %COLOR_WARN%[LOG] Instalando dependencias do projeto...%COLOR_RESET%
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Falha ao rodar npm install. Verifique o log acima.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Rodando checagens finais..."
echo %COLOR_WARN%[LOG] Rodando checagens finais...%COLOR_RESET%
node setup-backend.js
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Alguma checagem falhou. Veja as mensagens acima.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Iniciando o Docker Desktop..."
echo %COLOR_WARN%[LOG] Iniciando o Docker Desktop (abra manualmente se nao abrir)...%COLOR_RESET%
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

REM Aguarda o Docker Desktop estar pronto (em vez de timeout fixo)
:wait_docker
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %COLOR_WARN%[LOG] Aguardando Docker Desktop ficar pronto...%COLOR_RESET%
    timeout /t 5
    goto wait_docker
)

set /a STEP+=1
call :progress "Subindo banco de dados e backend com Docker Compose..."
echo %COLOR_WARN%[LOG] Subindo banco de dados e backend...%COLOR_RESET%
docker-compose up --build -d
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Falha ao subir containers com Docker Compose. Veja o log acima.%COLOR_RESET%
    pause
    exit /b 1
)

REM Checa se o container backend subiu corretamente
docker ps | findstr express_app >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Container do backend (express_app) não está rodando.%COLOR_RESET%
    pause
    exit /b 1
)

set /a STEP+=1
call :progress "Rodando migrations do Prisma..."
echo %COLOR_WARN%[LOG] Rodando migrations do Prisma...%COLOR_RESET%
docker exec -it express_app npx prisma migrate deploy
IF %ERRORLEVEL% NEQ 0 (
    echo %COLOR_ERR%[ERRO] Falha ao rodar migrations do Prisma. Veja o log acima.%COLOR_RESET%
    pause
    exit /b 1
)

echo %COLOR_OK%============================%COLOR_RESET%
echo %COLOR_OK%Iniciando backend em modo desenvolvimento...%COLOR_RESET%
docker exec -it express_app npm run dev

echo %COLOR_OK%============================%COLOR_RESET%
echo %COLOR_OK%Backend rodando! Acesse http://localhost:3000%COLOR_RESET%
pause
exit /b 0

:progress
setlocal EnableDelayedExpansion
set "msg=%~1"
set /a percent=(%STEP%*100)/%TOTAL%
set "bar="
for /l %%i in (1,1,%STEP%) do set "bar=!bar!#"
for /l %%i in (%STEP%,1,%TOTAL%) do set "bar=!bar!_"
set "bar=[!bar!] %percent%%"
echo !bar! - %msg%
endlocal
exit /b 0
