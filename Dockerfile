FROM node:18

WORKDIR /app

# Copie tudo de uma vez (ou apenas o que for necessário) 
COPY . . 

RUN ls -la  # Apenas para debug, opcional

# Instale dependências 
RUN npm install --legacy-peer-deps

# Compile o projeto
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
