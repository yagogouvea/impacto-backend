# Use Node.js LTS version
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Instale dependências do sistema para Prisma
RUN apt-get update && apt-get install -y openssl

# Install app dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copie TODO o código, incluindo prisma, src, etc.
COPY . .

# Agora gere o client do Prisma
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start the server com verificação de ambiente
CMD [ "npm", "run", "start:check" ]

# Debug: listar variáveis de ambiente no start (apenas para debug)
# CMD printenv
