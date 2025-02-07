FROM node:18

WORKDIR /app

# Copia apenas package.json e package-lock.json
COPY package*.json ./

# Instala dependências (incluindo devDependencies)
RUN npm install --legacy-peer-deps

# Copia o restante do projeto (src, tsconfig.json, etc.)
COPY . .

# Faz o build do código
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
