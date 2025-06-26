# Queimadas em Foco

<p align="center"\>
<img src="[https://github.com/user-attachments/assets/da2c22a6-1fee-4c20-8ffc-9aa337d1a9ea](https://github.com/user-attachments/assets/da2c22a6-1fee-4c20-8ffc-9aa337d1a9ea)" alt="gifgithubatualizado"\>
</p\>

## 📌 Objetivo do Projeto

> [\!IMPORTANT]
> O objetivo é desenvolver uma aplicação web que permita aos usuários consultar e visualizar de forma interativa os dados de área queimada, risco de fogo e focos de calor obtidos na base de dados do BDQueimadas.

> **Status do Projeto: Concluído✅**

## Estrutura do Projeto

```
PROJETO/
├── backend/
│   ├── controllers/
│   │   └── db.ts
│   ├── dist/
│   │   └── server.js
│   ├── routes/
│   │   └── queimadas.ts
│   ├── src/
│   │   └── server.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── front/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Filtro.tsx
│   │   │   ├── Grafico.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Mapa.tsx
│   │   │   └── Tabela.tsx
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .eslintrc.cjs
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── README.md 
```

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido com as seguintes tecnologias:

**Frontend:**

  * React
  * Vite
  * TypeScript
  * Leaflet e React-Leaflet para mapas interativos
  * React Google Charts para visualização de dados
  * ESLint para linting de código

**Backend:**

  * Node.js com Express.js
  * TypeScript
  * PostgreSQL como banco de dados
  * Cors para gerenciamento de requisições entre domínios diferentes
  * Dotenv para gerenciamento de variáveis de ambiente
  * Turf.js para manipulação de dados geoespaciais

## ⚙️ Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas em sua máquina:

  * [Node.js](https://nodejs.org/en/) (que já vem com o npm)
  * [PostgreSQL](https://www.postgresql.org/download/)

````markdown
## 📦 Instalação

Siga os passos abaixo para instalar e executar o projeto em sua máquina local.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/octacodeteam/abp2.git](https://github.com/octacodeteam/abp2.git)
cd PROJETO
````

### 2\. Configuração do Banco de Dados

1.  **Descompacte o arquivo de dados:**
    Localize o arquivo `queimadas2.rar` na raiz do projeto e extraia o seu conteúdo. Isso criará uma pasta contendo o arquivo `queimadas2.sql`.

2.  **Crie o banco de dados no PostgreSQL:**
    Abra o pgAdmin, crie um novo banco de dados com o nome `queimadas` (ou o nome que preferir, mas lembre-se de usá-lo no passo de importação e no arquivo `.env`).

3.  **Importe os dados via `psql`:**
    O método recomendado para importar os dados é utilizando a ferramenta de linha de comando `psql`, pois o arquivo é muito grande para a interface do pgAdmin.

    Abra o seu terminal (CMD, PowerShell, etc.) e execute o comando abaixo, **ajustando o caminho final para o local exato onde você extraiu o arquivo `queimadas2.sql`**:

    ```bash
    psql -U postgres -d queimadas -f "C:\caminho\completo\para\seu\arquivo\queimadas2.sql"
    ```

    Você precisará informar a senha do seu usuário `postgres` para continuar.

    \<details\>
    \<summary\>\<strong\>👉 Problemas com o comando `psql`? (Clique para ver como configurar)\</strong\>\</summary\>

    Se o seu terminal não reconhecer o comando `psql`, significa que a pasta `bin` do PostgreSQL não está nas variáveis de ambiente do seu sistema. Siga os passos abaixo para resolver:

    1.  **Encontre a pasta `bin`:** O caminho geralmente é `C:\Program Files\PostgreSQL\<SUA_VERSÃO>\bin`. Confirme a versão instalada na sua máquina.
    2.  **Copie o caminho completo** dessa pasta.
    3.  **Adicione ao PATH do sistema:**
          * Pesquise por "Editar as variáveis de ambiente do sistema" no menu Iniciar.
          * Clique em "Variáveis de Ambiente...".
          * Na seção "Variáveis do sistema", selecione a variável `Path` e clique em "Editar...".
          * Clique em "Novo", cole o caminho que você copiou e clique em "OK" em todas as janelas para salvar.
    4.  **Reinicie o seu terminal** e tente executar o comando `psql` novamente.

    \</details\>

### 3\. Configuração do Backend

1.  **Acesse a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz da pasta `backend` e preencha com seus dados de conexão. **Use o mesmo nome de banco de dados (`DB_NAME`) que você criou e importou os dados.**
    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=seu_usuario_postgres
    DB_PASSWORD=sua_senha_postgres
    DB_NAME=queimadas
    PORT=3001
    ```
4.  **Execute o backend:**
    ```bash
    npm run projeto
    ```
    O servidor estará rodando em `http://localhost:3001`.

### 4\. Configuração do Frontend

1.  **Acesse a pasta do frontend em um novo terminal:**

    ```bash
    cd front
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Execute o frontend:**

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza um banco de dados PostgreSQL para armazenar os dados de queimadas. A configuração da conexão pode ser encontrada no arquivo `backend/controllers/db.ts`.

As principais tabelas utilizadas são:

  * **queimadas:** Armazena informações sobre os focos de queimada, como localização, data e intensidade (FRP).
  * **tabela\_raster:** (Inferido a partir da rota `/api/risco-de-fogo`) Armazena dados de risco de fogo.

## 🌐 API Endpoints

O backend expõe os seguintes endpoints para o frontend consumir:

  * `GET /api/queimadas`: Retorna dados de queimadas com base nos filtros de estado, bioma e período.
  * `GET /api/top-cidades-frp`: Retorna as 10 cidades com maior média de FRP (Fire Radiative Power).
  * `GET /api/estados`: Retorna uma lista de todos os estados.
  * `GET /api/biomas`: Retorna uma lista de todos os biomas.
  * `GET /api/estados-por-bioma`: Retorna os estados de um bioma específico.
  * `GET /api/biomas-por-estado`: Retorna os biomas de um estado específico.
  * `GET /api/area-queimada`: Retorna dados de área queimada em formato GeoJSON, com base em filtros de período, estado e bioma.
  * `GET /api/risco-de-fogo`: (Inferido) Retorna dados de risco de fogo.

## 💻 Autores

| Nome | Função | Github |
| :--- | :---: | :---: |
| Alisson Franco Gritti | Product Owner | [alissonfatec](https://github.com/alissonfatec) |
| Gustavo Henrique Ferreira Hammes | Scrum Master | [GustavoHammes](https://github.com/GustavoHammes) |
| Igor Santos Lima | Dev Team | [IgorSantosL](https://github.com/IgorSantosL) |
