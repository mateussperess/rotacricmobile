import json, math, os, base64, time, requests, gzip
from pathlib import Path

MUNICIPIOS = [
  "Charqueadas", 
  "Arroio dos Ratos", 
  "São Jerônimo", 
  "General Câmara",
  "Triunfo", 
  "Vale Verde", 
  "Butiá", 
  "Barão do Triunfo", 
  "Minas do Leão"
]

# Configurações de otimização, definição dos níveis de zoom a baixar (10-13 para boa cobertura sem exagerar no tamanho)
ZOOM_LEVELS = range(10, 14)  

# o OpenStreetMap sempre usa PNG, então não precisa tentar múltiplos formatos

# 1. Lê o GeoJSON local ->esse GeoJSON eu peguei do repo: https://github.com/tbrugz/geodata-br/blob/master/geojson/geojs-43-mun.json
data = json.loads(Path("assets/geojs-43-mun.json").read_text(encoding="utf-8"))
print(f"Total de municípios no arquivo: {len(data['features'])}")

def norm(s):
    import unicodedata
    return unicodedata.normalize('NFD', s).encode('ascii','ignore').decode().lower().strip()

norms = {norm(m) for m in MUNICIPIOS}

# 2. Calcula bounding box real a partir do GeoJSON
lat_min, lat_max = float('inf'), float('-inf')
lng_min, lng_max = float('inf'), float('-inf')

def scan(coords):
    global lat_min, lat_max, lng_min, lng_max
    for c in coords:
        if isinstance(c[0], list): scan(c)
        else:
            lng, lat = c[0], c[1]
            lat_min = min(lat_min, lat); lat_max = max(lat_max, lat)
            lng_min = min(lng_min, lng); lng_max = max(lng_max, lng)

encontrados = []
for f in data['features']:
    nome = f['properties'].get('name', '')
    if norm(nome) in norms:
        encontrados.append(nome)
        scan(f['geometry']['coordinates'])

print(f"Municípios encontrados: {encontrados}")
print(f"Bounding box: LAT {lat_min:.4f}→{lat_max:.4f}, LNG {lng_min:.4f}→{lng_max:.4f}")

if len(encontrados) != len(MUNICIPIOS):
    faltando = [m for m in MUNICIPIOS if norm(m) not in {norm(e) for e in encontrados}]
    print(f"ATENÇÃO - não encontrados: {faltando}")

# 3. Baixa tiles e converte para base64
def lat_to_y(lat, z):
    lr = math.radians(lat)
    n = 2**z
    return int(n*(1-math.log(math.tan(lr)+1/math.cos(lr))/math.pi)/2)

def lng_to_x(lng, z): return int(2**z*(lng+180)/360)

SERVERS = ['a','b','c']
tiles = {}
total = 0
erros = 0

for z in ZOOM_LEVELS:
    x0, x1 = lng_to_x(lng_min, z), lng_to_x(lng_max, z)
    y0, y1 = lat_to_y(lat_max, z), lat_to_y(lat_min, z)
    qtd = (x1-x0+1)*(y1-y0+1)
    print(f"\nZoom {z}: {qtd} tiles ({x0}-{x1}, {y0}-{y1})")
    
    for x in range(x0, x1+1):
        for y in range(y0, y1+1):
            s = SERVERS[total % 3]
            key = f"{z}/{x}/{y}"
            url = f"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            
            try:
                r = requests.get(url, timeout=5,
                                 headers={'User-Agent': 'rotacric-app/1.0 (pedal ifsul)'})
                if r.status_code == 200:
                    tiles[key] = base64.b64encode(r.content).decode()
                    total += 1
                    if total % 50 == 0:
                        size_mb = sum(len(v) for v in tiles.values()) / 1024 / 1024
                        print(f"  {total} tiles ({size_mb:.1f} MB)...")
                else:
                    erros += 1
                time.sleep(0.02)  # limite de 20ms entre as reqs para nao sobrecarregar o servidor
            except Exception as e:
                erros += 1

print(f"\nTotal baixados: {total} tiles, erros: {erros}")
final_size = sum(len(v) for v in tiles.values()) / 1024 / 1024
print(f"Tamanho total dos tiles base64: {final_size:.1f} MB")

# 4. Gera o arquivo JS de forma otimizada
# Se for muito grande, divide em chunks
out = Path("assets/tilesOffline.js")

# Converte para JSON comprimido (sem espaços)
tiles_json = json.dumps(tiles, separators=(',', ':'), ensure_ascii=False)
json_size = len(tiles_json.encode('utf-8')) / 1024 / 1024

print(f"\nTamanho JSON comprimido: {json_size:.1f} MB")

# Se < 5MB, usa um arquivo só; se > 5MB, divide em 2
if json_size < 5:
    out.write_text(
        f"// Gerado automaticamente por scripts/download_tiles.py\n"
        f"// {total} tiles OSM da região carbonífera RS (zooms 10-12)\n"
        f"// Tamanho: {final_size:.1f} MB\n"
        f"const OFFLINE_TILES = {tiles_json};\n"
        f"export default OFFLINE_TILES;\n",
        encoding="utf-8"
    )
    print(f"    Arquivo único: {out} ({out.stat().st_size/1024/1024:.1f} MB)")
else:
    tiles_list = list(tiles.items())
    mid = len(tiles_list) // 2
    tiles1 = dict(tiles_list[:mid])
    tiles2 = dict(tiles_list[mid:])
    
    out1 = Path("assets/tilesOffline_part1.js")
    out2 = Path("assets/tilesOffline_part2.js")
    out_index = Path("assets/tilesOffline.js")
    
    out1.write_text(
        f"const OFFLINE_TILES_PART1 = {json.dumps(tiles1, separators=(',', ':'), ensure_ascii=False)};\n"
        f"export default OFFLINE_TILES_PART1;\n",
        encoding="utf-8"
    )
    out2.write_text(
        f"const OFFLINE_TILES_PART2 = {json.dumps(tiles2, separators=(',', ':'), ensure_ascii=False)};\n"
        f"export default OFFLINE_TILES_PART2;\n",
        encoding="utf-8"
    )
    out_index.write_text(
        f"import OFFLINE_TILES_PART1 from './tilesOffline_part1';\n"
        f"import OFFLINE_TILES_PART2 from './tilesOffline_part2';\n"
        f"const OFFLINE_TILES = {{...OFFLINE_TILES_PART1, ...OFFLINE_TILES_PART2}};\n"
        f"export default OFFLINE_TILES;\n",
        encoding="utf-8"
    )
    
    size1 = out1.stat().st_size / 1024 / 1024
    size2 = out2.stat().st_size / 1024 / 1024
    print(f"    Arquivo dividido em 2 partes:")
    print(f"    Parte 1: {out1} ({size1:.1f} MB)")
    print(f"    Parte 2: {out2} ({size2:.1f} MB)")
    print(f"    Index:   {out_index}")