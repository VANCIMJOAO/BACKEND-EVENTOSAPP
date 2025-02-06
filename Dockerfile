# Usar uma imagem oficial do Node.js
FROM node:16

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache)
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps --force

# Copiar o restante do código para o container
COPY . .

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
