# Jobs Board Backend

Backend para o sistema de Jobs Board desenvolvido com Node.js, Express e Prisma.

## 🛠️ Tecnologias

- Node.js
- Express
- PostgreSQL (via Docker)
- Prisma ORM
- Docker + Docker Compose

## 🚀 Como rodar o projeto

### 1. Clonar o repositório
```bash
git clone <URL_DO_REPO>
cd nome-do-projeto
```

### 2. Criar o arquivo .env
Crie um arquivo `.env` na raiz com:
```env
DATABASE_URL="postgresql://postgres:123456@postgres:5432/mydb"
```

### 3. Subir o ambiente com Docker Compose
```bash
docker-compose up --build -d
```
Isso irá iniciar:
- PostgreSQL em localhost:5432
- API Express em localhost:3000

### 4. Rodar as migrações Prisma (caso necessário)
```bash
docker exec -it express_app sh
npx prisma migrate dev --name init
```

## 🧪 Testar a aplicação

Acesse:
```
http://localhost:3000
```

Ou teste a rota de exemplo:
```bash
curl http://localhost:3000/users
```

## 🗃️ Estrutura de pastas
```
├── prisma/                  # schema.prisma do banco de dados
├── src/
│   ├── config/              # Arquivos de configuração (Prisma Client)
│   ├── controllers/         # Lógicas das rotas
│   ├── middlewares/         # Middlewares como auth, validação, etc
│   ├── routes/              # Arquivo de rotas Express
│   └── server.js            # Ponto de entrada da aplicação
├── .env
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 📦 Dependências Principais

- `express`: Framework web
- `@prisma/client`: ORM para PostgreSQL
- `bcryptjs`: Hash de senhas
- `jsonwebtoken`: Autenticação JWT
- `express-validator`: Validação de dados
- `cors`: Middleware para CORS
- `dotenv`: Gerenciamento de variáveis de ambiente
- `helmet`: Segurança HTTP
- `morgan`: Logging de requisições

## 🔑 Endpoints da API

### Autenticação
- `POST /api/users/register` - Registro de usuário
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Perfil do usuário (requer autenticação)
- `PATCH /api/users/profile` - Atualizar perfil (requer autenticação)

### Empresas
- `GET /api/companies` - Listar empresas
- `POST /api/companies` - Criar empresa (requer autenticação)
- `GET /api/companies/:id` - Detalhes da empresa
- `PATCH /api/companies/:id` - Atualizar empresa (requer autenticação)

### Vagas
- `GET /api/jobs` - Listar vagas
- `POST /api/jobs` - Criar vaga (requer autenticação)
- `GET /api/jobs/:id` - Detalhes da vaga
- `PATCH /api/jobs/:id` - Atualizar vaga (requer autenticação)
- `DELETE /api/jobs/:id` - Deletar vaga (requer autenticação)

### Candidaturas
- `POST /api/applications` - Criar candidatura (requer autenticação)
- `GET /api/applications` - Listar candidaturas (requer autenticação)
- `PATCH /api/applications/:id` - Atualizar status da candidatura (requer autenticação)

## 💡 Dicas para Desenvolvedores

1. **Variáveis de Ambiente**
   - Sempre use o arquivo `.env` para configurações sensíveis
   - Nunca comite o arquivo `.env` no repositório
   - Use `.env.example` como template

2. **Banco de Dados**
   - Use o Prisma Studio para visualizar dados: `npx prisma studio`
   - Mantenha as migrações atualizadas: `npx prisma migrate dev`
   - Gere o cliente Prisma após alterações: `npx prisma generate`

3. **Desenvolvimento**
   - Use `npm run dev` para desenvolvimento com hot-reload
   - Mantenha os logs ativos para debug
   - Siga o padrão de commits convencionais

4. **Segurança**
   - Sempre valide inputs
   - Use autenticação JWT
   - Implemente rate limiting em produção
   - Mantenha as dependências atualizadas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 