# Route Segments

## Contexto

As rotas no banco de dados (`routes`) representam **trechos físicos** entre duas cidades, sendo que cada rota já possui nome, polyline, distância e cor. Todas essas rotas juntas compõem a **Rota CRIC** como um todo.

O problema é que essa estrutura, sozinha, não responde perguntas como:

- _De Charqueadas, para onde posso ir na CRIC?_
- _Quais são os destinos possíveis a partir de São Jerônimo?_

A tabela `routes`, que é um espelhamento da tabela da plataforma oficial do Rota CRIC, não tem essa semântica. Ela sabe _como_ ir de A para B (polyline, distância), mas a aplicação não sabia formalmente que A e B são cidades conectadas.

## Solução: `route_segments`

A tabela `route_segments` é a ponte semântica entre cidades e rotas.

Cada registro diz: **"de `from_city` para `to_city`, utiliza-se a rota `route_id`"**.

```
route_segments
├── from_city_id -> Charqueadas
├── to_city_id   -> São Jerônimo
└── route_id     -> rota "Charqueadas -> São Jerônimo" (com polyline, distância, etc.)
```

A `distance` é preenchida automaticamente a partir da rota informada, não precisa ser enviada no body da requisição.

## Por que não colocar `origin_city_id` e `destination_city_id` direto em `routes`?

Essa abordagem implicaria em algumas limitações, como por exemplo, cada rota a um único par origem-destino, perdendo as cidades intermediárias da CRIC. O `route_segment` mantém a separação de responsabilidades:

- `routes` -> dados geográficos do trecho (polyline, distância, cor)
- `route_segments` -> significado navegável (de onde, para onde, por qual rota)

## Endpoints

| Método   | Endpoint                                   | Descrição                                 |
| -------- | ------------------------------------------ | ----------------------------------------- |
| `POST`   | `/route-segments`                          | Cria um segmento                          |
| `GET`    | `/route-segments?routeId=xxx`              | Lista segmentos de uma rota               |
| `GET`    | `/route-segments/from/:cityId`             | Destinos possíveis a partir de uma cidade |
| `GET`    | `/route-segments/from/:cityId?routeId=xxx` | Destinos filtrados por rota específica    |
| `GET`    | `/route-segments/:id`                      | Busca um segmento                         |
| `DELETE` | `/route-segments/:id`                      | Soft delete                               |

### Por que o `routeId` é opcional no `GET /from/:cityId`?

Hoje a aplicação tem apenas a CRIC, então os dois comportamentos são idênticos. O parâmetro existe para quando uma cidade pertencer a mais de uma rota, sem ele os destinos de rotas diferentes viriam misturados (pode ser que futuramente eu reveja a modelagem, então por ora, vou deixar assim).

## Body da criação

```json
{
  "route_id": "<id da rota em routes>",
  "from_city_id": "<id da cidade de origem>",
  "to_city_id": "<id da cidade de destino>"
}
```

Não é possível criar dois segmentos com a mesma combinação de `route_id + from_city_id + to_city_id`, há validação no service.
