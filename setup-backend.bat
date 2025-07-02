@echo off
chcp 65001 >nul
cd /d "%~dp0"

setlocal enabledelayedexpansion

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
    echo [AVISO] Node.js foi instalado, mas ainda não está disponível neste terminal.
    echo Feche esta janela e execute o script novamente!
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
    echo [AVISO] Docker Desktop foi instalado, mas ainda não está disponível neste terminal.
    echo [IMPORTANTE] Reinicie o computador e execute o script novamente para continuar.
    pause
    exit /b 1
)
echo [OK] Docker Desktop instalado!

REM --- 4. Checa e atualiza o WSL ---
set /a STEP+=1
call :progress "Checando e atualizando o WSL..."
where wsl >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] O WSL não está instalado. Instale o WSL2 antes de prosseguir.
    echo Execute: wsl --install
    echo Veja mais detalhes em: https://aka.ms/wslstore
    pause
    exit /b 1
)
echo [LOG] Atualizando o WSL...
wsl --update
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao atualizar o WSL.
    echo Tente atualizar manualmente pelo comando: wsl --update
    pause
    exit /b 1
)
echo [OK] WSL atualizado!

echo ============================
echo [OK] Todas as dependências do sistema foram instaladas!
echo ============================

REM --- Instala dependências do projeto Node ---
echo [LOG] Instalando dependências do projeto (npm install)...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao rodar npm install.
    pause
    exit /b 1
)

REM --- Sobe containers Docker ---
echo [LOG] Subindo containers Docker (docker-compose up --build -d)...
docker-compose up --build -d
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao subir containers Docker.
    pause
    exit /b 1
)

REM --- Executa migrations do Prisma ---
echo [LOG] Executando migrations do Prisma...
docker exec -it express_app npx prisma migrate deploy
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao executar migrations do Prisma.
    pause
    exit /b 1
)

echo [OK] Setup finalizado. Backend rodando!
echo Pressione qualquer tecla para sair.
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
