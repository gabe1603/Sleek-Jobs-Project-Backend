@echo off
chcp 65001 >nul
echo ============================
echo Instalador do Backend - Jobs Board
echo ============================

REM Verifica se o Chocolatey está instalado
where choco >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Chocolatey nao encontrado!
    echo Para instalar, copie e cole o comando abaixo no PowerShell como Administrador:
    echo.
    echo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    echo.
    echo Depois de instalar o Chocolatey, feche e abra novamente este terminal e execute este script de novo.
    pause
    exit /b 1
) ELSE (
    echo [OK] Chocolatey encontrado!
)

echo Instalando Node.js, Docker Desktop e PostgreSQL...
choco install -y nodejs-lts docker-desktop postgresql

echo Instalando dependencias do projeto (npm install)...
call npm install

echo Rodando checagens finais...
node setup-backend.js

IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Alguma checagem falhou. Veja as mensagens acima.
    pause
    exit /b 1
)

echo ============================
echo Iniciando o Docker Desktop (abra manualmente se nao abrir)...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Aguardando Docker Desktop inicializar...
TIMEOUT /T 20

echo Subindo banco de dados e backend com Docker Compose...
docker-compose up --build -d

echo Rodando migrations do Prisma...
docker exec -it express_app npx prisma migrate deploy

echo Iniciando backend em modo desenvolvimento...
docker exec -it express_app npm run dev

echo ============================
echo Backend rodando! Acesse http://localhost:3000
pause 