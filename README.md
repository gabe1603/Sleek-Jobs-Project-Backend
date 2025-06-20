# Sleek Jobs Board Backend

Backend for the Sleek Jobs Board system, built with Node.js, Express, Prisma, and PostgreSQL.

## 🛠️ Technologies

- Node.js
- Express
- PostgreSQL (via Docker)
- Prisma ORM
- Docker + Docker Compose

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <REPO_URL>
cd sleek_aus/back
```

### 2. Create the .env file
Create a `.env` file in the project root with:
```env
DATABASE_URL="postgresql://postgres:123456@postgres:5432/mydb"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Start the environment with Docker Compose
```bash
docker-compose up --build -d
```
This will start:
- PostgreSQL on localhost:5432
- Express API on localhost:3000

### 4. Run Prisma migrations (if needed)
```bash
docker exec -it express_app sh
npx prisma migrate dev --name init
```

### 5. (Optional) Open Prisma Studio
```bash
docker exec -it express_app sh
npx prisma studio
```

## 🧪 Testing the API

You can access the API at:
```
http://localhost:3000/api/health
```

Or test a sample endpoint:
```bash
curl http://localhost:3000/api/jobs
```

## 📂 Project Structure
```
├── prisma/                  # Prisma schema and migrations
├── src/
│   ├── config/              # Configuration files (Prisma Client)
│   ├── controllers/         # Route logic
│   ├── middlewares/         # Middlewares (auth, validation, etc)
│   ├── routes/              # Express route files
│   └── server.js            # App entry point
├── uploads/                 # Uploaded files (avatars, logos, images)
├── .env
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔑 API Endpoints (Summary)

### Authentication
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — User login

### Users
- `GET /api/users/profile` — Get authenticated user's profile (requires JWT)
- `PATCH /api/users/profile` — Update authenticated user's profile (requires JWT)
- `POST /api/users/:id/avatar` — Upload user avatar (multipart/form-data, requires JWT)
- `GET /api/users/:userId/company` — Get user's company
- `GET /api/users/:userId` — Get user by ID (requires JWT)
- `GET /api/users/:userId/jobs` — List jobs created by user
- `PATCH /api/users/:userId` — Update user info (admin/self, requires JWT)
- `GET /api/users` — List all users (admin only, requires JWT)

### Companies
- `GET /api/companies/:companyId` — Get company by ID
- `POST /api/companies` — Create company (multipart/form-data, upload logo, requires JWT)

### Jobs
- `GET /api/jobs` — List all jobs
- `GET /api/jobs/:id` — Get job by ID
- `POST /api/jobs` — Create job (multipart/form-data, upload image, requires JWT)
- `POST /api/jobs/:id/image` — Upload job image (multipart/form-data, requires JWT)
- `DELETE /api/jobs/:id` — Delete job (admin or employer creator, requires JWT)

### Applications
- `POST /api/applications/:jobId/apply` — Apply to a job (requires JWT)
- `GET /api/applications/user/:userId` — List applications for a user (requires JWT)

### Skills
- `GET /api/skills` — List all skills
- `GET /api/skills/user/:userId` — List skills for a user

### CV
- `GET /api/cv/:userId` — Get user's CV
- `POST /api/cv` — Create or update CV (requires JWT)

### Health Check
- `GET /api/health` — Check API status

## 📤 File Uploads
- **User avatar:** `POST /api/users/:id/avatar` (field: `avatar`)
- **Company logo:** `POST /api/companies` (field: `logo`)
- **Job image:** `POST /api/jobs` or `POST /api/jobs/:id/image` (field: `image`)
- All uploads use `multipart/form-data`.
- Uploaded files are served at `/uploads/<filename>`.

## 🧑‍💻 Example cURL Requests

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@email.com","password":"password123","role":"employer"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@email.com","password":"password123"}'
```

**Get all users (admin only):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <YOUR_ADMIN_JWT>"
```

**Create a company (with logo):**
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -F "name=Acme Ltd" \
  -F "location=Sydney" \
  -F "description=Tech company" \
  -F "logo=@/path/to/logo.png"
```

**Apply to a job:**
```bash
curl -X POST http://localhost:3000/api/applications/<jobId>/apply \
  -H "Authorization: Bearer <YOUR_JWT>"
```

## 📝 Developer Notes

- Always use the `.env` file for sensitive configs. Never commit it to the repo.
- Use `npx prisma studio` to browse the database visually.
- Run `npx prisma migrate dev` to apply migrations.
- Use `npm run dev` for hot-reload development (if available).
- All error messages are in English (AU standard).
- All logs are detailed for easier debugging.
- API is ready for integration with a React frontend or other clients.

## 🤝 Contributing

1. Fork this repository
2. Create a branch for your feature (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📝 Licence

This project is licensed under the MIT Licence. See the [LICENSE](LICENSE) file for details. 