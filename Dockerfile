# Use uma imagem base do Node.js
FROM node:latest

# Crie um diretório de trabalho para a aplicação
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json (se aplicável) para o diretório de trabalho
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install

# Copie o resto do código-fonte da aplicação para o diretório de trabalho
COPY . .

# Exponha a porta em que a aplicação está rodando
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["npm", "start"]