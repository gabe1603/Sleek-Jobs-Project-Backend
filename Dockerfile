FROM node:18-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Garante que o prisma/schema.prisma está presente
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
