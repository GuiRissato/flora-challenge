# English Dictionary API

## Descrição

Este projeto é uma API para um dicionário de palavras em inglês. Ele permite listar palavras, adicionar palavras aos favoritos e acessar os favoritos de um usuário com paginação.

## Tecnologias Utilizadas

- **Linguagem**: JavaScript (Node.js)
- **Frameworks e Bibliotecas**:
  - Express
  - Sequelize
  - Redis
  - PostgreSQL
- **Ferramentas**:
  - Nodemon

  ## Dependências

- axios: ^1.7.2
- bcryptjs: ^2.4.3
- dotenv: ^16.4.5
- express: ^4.19.2
- jsonwebtoken: ^9.0.2
- node-fetch: ^3.3.2
- perf_hooks: ^0.0.1
- pg: ^8.12.0
- redis: ^4.6.15
- swagger-jsdoc: ^6.2.8
- swagger-ui-express: ^5.0.1
- yamljs: ^0.3.0

## Dependências de Desenvolvimento

- nodemon: ^3.1.4
- sequelize: ^6.37.3

## Instalação e Uso

### Pré-requisitos

- Node.js
- PostgreSQL
- Redis

### Passo a Passo

1. **Clone o repositório:**
```sh
   git clone https://github.com/seu-usuario/english-dictionary-api.git
   cd english-dictionary-api
```

2. **Instale as dependencias:**
```sh
   npm install
```

3. **Configure o banco de dados:**
- Certifique-se de que o PostgreSQL e o Redis estão rodando.
- Crie um banco de dados PostgreSQL chamado english_dictionary.
- Configure a URL de conexão com o banco de dados no arquivo .env.

4. **Crie um arquivo .env com as seguintes variáveis:**
```sh
   DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=english_dictionary
    DB_HOST=localhost
    DB_PORT=5432
```

5. **Inicie o servidor:**
```sh
   npm start
```

6. **Acesse a API:**
- A API estará rodando em http://localhost:3333.

### Endpoint

- Você pode acessar os endpoints pela url http://localhost:3333/api-docs


