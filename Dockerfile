# Usar uma imagem oficial do Node.js
FROM node:18

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de dependências para o cache
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps
RUN cat /root/.npm/_logs/2025-02-06T22_58_47_753Z-debug-0.log

# Copiar o arquivo tsconfig.json explicitamente
COPY tsconfig.json .

# Copiar o restante do código para o container
COPY . .

# Garantir que o arquivo tsconfig.json foi copiado
RUN ls -la ./tsconfig.json

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]


