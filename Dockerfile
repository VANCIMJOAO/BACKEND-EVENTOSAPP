# Usando imagem Node.js como base
FROM node:16

# Criando o diretório de trabalho
WORKDIR /app

# Copiando arquivos de dependências
COPY package*.json ./

# Instalando dependências com a flag --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copiando o restante do código
COPY . .

# Expondo a porta do servidor
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
