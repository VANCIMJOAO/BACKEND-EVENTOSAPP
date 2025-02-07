# Use a imagem oficial do Node 18
FROM node:18

# Cria a pasta de trabalho no contêiner
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (para cache)
COPY package*.json ./

# Instala dependências (incluindo devDependencies, pois o Nest CLI está lá)
RUN npm install --legacy-peer-deps

# Copia o restante do projeto (src, tsconfig.json, etc.)
COPY . .

# Compila o projeto (gera /app/dist)
RUN npm run build

# Expõe a porta da aplicação (ajuste se a sua porta for diferente)
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
