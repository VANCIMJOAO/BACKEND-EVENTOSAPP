# Usar uma imagem oficial do Node.js
FROM node:18

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de dependências para o cache
COPY package*.json ./

# Listar os arquivos no diretório para verificar a cópia
RUN ls -la

# Instalar dependências
RUN npm install --legacy-peer-deps

# Verificar o log do NPM para debugging
RUN cat /root/.npm/_logs/2025-02-06T22_58_47_753Z-debug-0.log || true

# Copiar o arquivo tsconfig.json explicitamente
COPY tsconfig.json .

# Listar os arquivos novamente para garantir que tsconfig.json foi copiado
RUN ls -la ./tsconfig.json

# Copiar o restante do código para o container
COPY . .

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
