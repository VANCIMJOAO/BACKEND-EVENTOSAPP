# Use uma imagem oficial do Node
FROM node:18

# Cria a pasta de trabalho no container
WORKDIR /app

# Copia somente package.json e package-lock.json primeiro
# (para aproveitar cache em builds subsequentes)
COPY package*.json ./

# Instala as dependências (incluindo as devDependencies,
# pois o Nest CLI precisa delas para compilar)
RUN npm install --legacy-peer-deps

# Copia todo o restante (incluindo tsconfig.json, src/, etc.)
COPY . .

# Compila o TypeScript para a pasta dist/
RUN npm run build

# Expõe a porta em que sua aplicação escuta
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
