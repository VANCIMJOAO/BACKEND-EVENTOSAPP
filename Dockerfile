# Usar uma imagem oficial do Node.js com a versão correta
FROM node:18

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro para aproveitar o cache
COPY package*.json ./

# Instalar dependências com suporte para conflitos
RUN npm install --legacy-peer-deps

# Copiar o restante do código para o container
COPY . .

# Verificar se o arquivo tsconfig.json está presente
RUN ls -la ./tsconfig.json

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
