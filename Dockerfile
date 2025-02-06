# Usar uma imagem oficial do Node.js
FROM node:18

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de dependências primeiro
COPY package*.json ./

# Instalar dependências com suporte para conflitos
RUN npm install --legacy-peer-deps

# Copiar o arquivo tsconfig.json explicitamente
COPY tsconfig.json ./tsconfig.json

# Copiar o restante do código para o container
COPY . .

# Verificar se o tsconfig.json foi copiado
RUN ls -la ./tsconfig.json

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
