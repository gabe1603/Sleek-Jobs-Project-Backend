FROM node:18-slim

# Instala o OpenSSL necessário para o Prisma funcionar corretamente
RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
