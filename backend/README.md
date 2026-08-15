# Rota Cric Mobile API

Backend em NestJS com Prisma e MySQL.

## Principais tecnologias

- NestJS
- Prisma
- MySQL
- Docker Compose
- Jest

## Ambiente

Arquivos usados:

- `.env`: usado pelo Docker Compose e pelos containers.
- `.env.local`: usado pelos comandos locais do Prisma.

Variaveis comuns:

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

## Instalar dependencias

```bash
npm install
```

## Rodar com Docker

Subir banco e backend:

```bash
docker compose up -d
```

Subir recriando a imagem:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

Parar containers:

```bash
docker compose down
```

O backend expõe a API com prefixo `/api`. Exemplo local:

```txt
http://localhost:3000/api
```

## Rodar localmente

```bash
npm run start:dev
```

Outros scripts:

```bash
npm run build
npm run start
npm run start:prod
```

## Prisma

Abrir Prisma Studio usando `.env.local`:

```bash
npx dotenv -e .env.local -- prisma studio
```

Criar e aplicar migration em desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_migration
```

Caso precise garantir o uso do `.env.local`:

```bash
npx dotenv -e .env.local -- prisma migrate dev --name nome_da_migration
```

Aplicar migrations pendentes em ambiente ja provisionado:

```bash
npx prisma migrate deploy
```

Gerar Prisma Client:

```bash
npx prisma generate
```

## Testes

Rodar todos os testes:

```bash
npm test
```

Rodar todos os testes em serie:

```bash
npm test -- --runInBand
```

Explicando o comando:

- `npm test` executa o script `"test": "jest"` do `package.json`.
- O primeiro `--` separa argumentos do npm de argumentos do Jest.
- `--runInBand` manda o Jest rodar os testes um por vez, sem paralelizar workers.

Use `--runInBand` quando quiser depurar melhor, evitar concorrencia entre testes ou ter logs em ordem mais previsivel.

Rodar um teste especifico:

```bash
npm test -- --runInBand src/utils/geo.utils.spec.ts
```

Rodar testes em watch:

```bash
npm run test:watch
```

Rodar cobertura:

```bash
npm run test:cov
```

Rodar e2e:

```bash
npm run test:e2e
```

Checar TypeScript sem gerar build:

```bash
npx tsc -p tsconfig.json --noEmit
```

## Padrao atual de testes

Os testes unitarios e funcionais ficam em arquivos `*.spec.ts` dentro de `src/`.

Exemplos atuais:

- `src/utils/geo.utils.spec.ts`: teste unitario de funcoes puras.
- `src/auth/auth.service.functional.spec.ts`: teste funcional do fluxo de login com dependencias mockadas.

Para services que dependem de banco, use mocks do `PrismaService` no `TestingModule`. Para controllers, prefira mockar o service quando a intencao for testar apenas a camada HTTP/controller.
