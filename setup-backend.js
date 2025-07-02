const { execSync } = require('child_process');
const fs = require('fs');

function check(cmd, name, installHint, required = true) {
  try {
    const output = execSync(cmd, { stdio: 'pipe' }).toString().trim();
    console.log(`[OK] ${name} encontrado: ${output.split('\n')[0]}`);
    return true;
  } catch (e) {
    if (required) {
      console.error(`\n[ERRO] ${name} não encontrado!`);
      if (installHint) console.error(`Dica: ${installHint}`);
      process.exit(1);
    } else {
      console.warn(`[AVISO] ${name} não encontrado (opcional).`);
    }
    return false;
  }
}

console.log('============================');
console.log('Checagens finais do backend...');
console.log('============================');

check('node -v', 'Node.js', 'Reinicie o computador após a instalação do Node.js.');
check('npm -v', 'npm', 'Reinicie o computador após a instalação do Node.js.');
check('docker -v', 'Docker Desktop', 'Abra o Docker Desktop manualmente após a instalação.', false);
check('psql --version', 'PostgreSQL', 'Procure "SQL Shell (psql)" no menu iniciar.', false);
check('npx prisma -v', 'Prisma CLI', 'Rode "npm install" para instalar as dependências.');

if (!fs.existsSync('node_modules')) {
  console.error('[ERRO] Dependências não instaladas! Rode "npm install" antes de continuar.');
  process.exit(1);
} else {
  console.log('[OK] Dependências instaladas.');
}

if (!fs.existsSync('.env')) {
  console.warn('[AVISO] Arquivo .env não encontrado! Crie e configure o arquivo .env conforme o README.');
} else {
  console.log('[OK] Arquivo .env encontrado.');
}

console.log('============================');
console.log('Tudo pronto! Agora você pode rodar o backend normalmente.'); 