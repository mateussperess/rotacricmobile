# 🚲 Rotacric Mobile — Monorepo

Repositório unificado do ecossistema **Rotacric Mobile**. O projeto é estruturado como um Monorepo composto por um aplicativo mobile em **React Native / Expo Router** no frontend e uma API RESTful em **NestJS + Prisma + MySQL** no backend.

---

## 🏗️ Arquitetura do Projeto

```text
rotacricmobile/
├── frontend/               # Aplicativo Mobile (React Native + Expo Router)
│   ├── app/                # Estrutura de telas e navegação (File-based routing)
│   ├── components/         # Componentes visuais reutilizáveis
│   ├── services/           # Comunicação com a API (Axios client)
│   ├── hooks/              # Custom React Hooks
│   ├── assets/             # Imagens, fontes e ícones
│   └── package.json
│
├── backend/                # API REST (NestJS + Prisma ORM + Docker)
│   ├── src/                # Módulos (Auth, Cities, Routes, Anchor Points, etc.)
│   ├── prisma/             # Schema do banco de dados e migrations
│   ├── dump_20260805_003554.sql # Dump SQL inicial do banco
│   ├── docker-compose.yml  # Containerização do MySQL 8.0 + API NestJS
│   └── package.json
│
├── package.json            # Orquestrador Monorepo (NPM Workspaces)
└── README.md               # Instruções gerais do projeto
```

---

## 🛠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado na sua máquina:

1. **[Node.js](https://nodejs.org/)** (v20 ou superior) e **NPM** (v10 ou superior).
2. **[Docker](https://www.docker.com/)** e **Docker Compose** instalados e em execução.
3. Para rodar o app no celular ou emulador:
   - **Expo Go** instalado no seu smartphone Android/iOS, OU
   - **Android Studio** (com emulador configurado), OU
   - **Xcode** (para simulador iOS no macOS).

---

## 🚀 Passo a Passo para Executar em uma Nova Máquina

Siga estas etapas para configurar e rodar o projeto do zero com sucesso:

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd rotacricmobile

# Instala as dependências de todo o Monorepo (Root, Frontend e Backend)
npm install
```

---

### 2. Configurar as Variáveis de Ambiente (`.env`)

#### A. Backend Environment:
Crie o arquivo `.env` dentro da pasta `backend/` a partir do modelo `.env.example`:
```bash
cp backend/.env.example backend/.env
```

#### B. Frontend Environment:
Crie o arquivo `.env` dentro da pasta `frontend/` a partir do modelo `.env.example`:
```bash
cp frontend/.env.example frontend/.env
```
> ⚠️ **IMPORTANTE**: No arquivo `frontend/.env`, você **deve** atualizar a variável `EXPO_PUBLIC_IP` com o **endereço de IP local** da sua máquina na rede Wi-Fi/Ethernet.
> - **Linux/Mac**: execute `hostname -I` (pegue o primeiro IP, ex: `192.168.1.50`).
> - **Windows**: execute `ipconfig` e pegue o *Endereço IPv4*.

Exemplo no `frontend/.env`:
```env
EXPO_PUBLIC_IP=192.168.1.50
```

---

### 3. Subir a API e o Banco de Dados (Docker)

Na raiz do projeto, execute o comando abaixo para subir os containers do MySQL e da API em segundo plano:

```bash
npm run docker:up
```

*Caso queira acompanhar a inicialização e os logs:*
```bash
npm run docker:logs
```

---

### 4. Inicializar o Banco de Dados (Migrations ou Dump)

Para ter o banco de dados populado com as cidades, rotas e dados iniciais do projeto, você tem duas opções:

#### Opção A: Restaurar o Dump SQL Oficial (Recomendado para Dev)
Execute o comando a seguir para importar o dump oficial diretamente no container do MySQL:

```bash
docker exec -i rtcmobile-db mysql -u root -proot rtcmobile < backend/dump_20260805_003554.sql
```

#### Opção B: Executar Migrations do Prisma
Se preferir criar o banco limpo a partir das migrations:

```bash
cd backend
npx prisma migrate dev
```

---

### 5. Executar o Aplicativo Mobile (Frontend)

Com a API rodando e o banco populado, inicie o aplicativo mobile a partir da raiz:

```bash
# Para iniciar o servidor de desenvolvimento do Expo
npm run start:frontend

# Ou para compilar e abrir direto no emulador Android
npm run android

# Ou para compilar e abrir no simulador iOS (somente macOS)
npm run ios
```

No terminal do Expo, escaneie o **QR Code** com o aplicativo **Expo Go** no seu celular ou pressione `a` para abrir no emulador Android.

---

## ⚡ Comandos Úteis do Monorepo

| Comando | Descrição |
| :--- | :--- |
| `npm run start:frontend` | Inicia o servidor Metro do Expo no frontend |
| `npm run start:backend` | Inicia o servidor NestJS em modo watch (local) |
| `npm run build:backend` | Compila o projeto TypeScript do backend |
| `npm run android` | Inicia a compilação e executa o app no Android |
| `npm run ios` | Inicia a compilação e executa o app no iOS |
| `npm run docker:up` | Sobe o banco MySQL e a API via Docker Compose |
| `npm run docker:down` | Parar todos os containers do Docker |
| `npm run docker:logs` | Acompanha os logs em tempo real dos containers Docker |
| `npm run lint` | Executa a verificação de código no frontend e backend |

---

## ❓ Solução de Problemas Comuns

### 🔴 `AxiosError: Network Error` no Aplicativo Mobile
- **Causa**: O IP da sua máquina mudou ou não está configurado corretamente no `frontend/.env`.
- **Solução**: Verifique seu IP com `hostname -I` ou `ipconfig`, atualize `EXPO_PUBLIC_IP` em `frontend/.env` e recarregue o aplicativo pressionando `r` no terminal do Expo.

### 🔴 Container do Backend não conecta no MySQL
- **Causa**: O container do MySQL ainda está inicializando na primeira execução.
- **Solução**: O `docker-compose.yml` inclui *healthcheck*. Aguarde alguns segundos até o MySQL ficar `healthy` e reinicie se necessário com `npm run docker:up`.

---

## 📄 Licença

Este projeto é de uso restrito do time **Rotacric Mobile**.
