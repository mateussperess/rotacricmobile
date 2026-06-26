# Rota Cric Mobile

Aplicativo mobile em Expo/React Native com backend em NestJS, Prisma e MySQL via Docker.

## Estrutura

- `app/`: rotas e telas do aplicativo Expo.
- `components/`: componentes reutilizaveis do app.
- `services/`: clientes e funcoes de acesso a API no app.
- `api/`: backend NestJS.
- `api/prisma/`: schema e migrations do Prisma.
- `api/docker-compose.yml`: banco MySQL e backend em containers.

## Requisitos

- Node.js
- npm
- Docker e Docker Compose
- Android Studio ou um celular Android configurado para desenvolvimento

## Configuracao de ambiente

O app mobile usa a variavel abaixo na `.env` da raiz:

```env
EXPO_PUBLIC_IP=SEU_IP_LOCAL
```

Ela e usada em `services/api.ts` para montar a URL:

```txt
http://EXPO_PUBLIC_IP:3000/api
```

Use o IP da maquina que esta rodando o backend, especialmente quando for testar em um celular fisico na mesma rede.

A API usa arquivos dentro de `api/`:

- `api/.env`: variaveis usadas pelo Docker Compose e pela API em container.
- `api/.env.local`: variaveis usadas para comandos locais do Prisma, como Prisma Studio e migrations.

Variaveis principais da API:

```env
DATABASE_URL=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
DB_PORT=
MYSQL_ROOT_PASSWORD=
JWT_SECRET=
NODE_ENV=
API_PORT=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Instalacao

Instale as dependencias do app:

```bash
npm install
```

Instale as dependencias da API:

```bash
cd api
npm install
```

## Rodando o projeto

Subir banco e backend com Docker:

```bash
cd api
docker compose up -d
```

Rebuildar quando mudar Dockerfile, dependencias ou algo que exija nova imagem:

```bash
cd api
docker compose up -d --build
```

Rodar o app no Android:

```bash
npx expo run:android
```

Tambem da para abrir o Metro manualmente:

```bash
npm start
```

## Prisma

Abrir o Prisma Studio usando as credenciais de `api/.env.local`:

```bash
cd api
npx dotenv -e .env.local -- prisma studio
```

Criar e aplicar uma migration em desenvolvimento:

```bash
cd api
npx prisma migrate dev --name nome_da_migration
```

Se precisar usar explicitamente o `.env.local`:

```bash
cd api
npx dotenv -e .env.local -- prisma migrate dev --name nome_da_migration
```

O container do backend roda `prisma migrate deploy` ao iniciar, aplicando migrations pendentes no banco do Docker.

## Testes

Os testes configurados hoje ficam na API.

Rodar todos os testes:

```bash
cd api
npm test
```

Rodar todos os testes em serie:

```bash
cd api
npm test -- --runInBand
```

O `--runInBand` e uma opcao do Jest. O primeiro `--` diz ao npm: "repasse o que vem depois para o script". Assim, `--runInBand` chega no Jest.

Na pratica, ele faz os testes rodarem um por vez, no mesmo processo. Isso ajuda quando:

- algum teste usa mocks globais;
- ha disputa por recurso compartilhado;
- o ambiente local fica instavel rodando testes em paralelo;
- voce quer uma saida mais previsivel para debugar.

Rodar um arquivo especifico:

```bash
cd api
npm test -- --runInBand src/utils/geo.utils.spec.ts
```

Rodar com cobertura:

```bash
cd api
npm run test:cov
```

Checar TypeScript da API:

```bash
cd api
npx tsc -p tsconfig.json --noEmit
```

## Comandos uteis

App:

```bash
npm start
npm run android
npm run web
npm run lint
```

API:

```bash
cd api
npm run start:dev
npm run build
npm run lint
npm test -- --runInBand
```

Docker:

```bash
cd api
docker compose up -d
docker compose up -d --build
docker compose logs -f
docker compose down
```
