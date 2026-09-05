#!/usr/bin/env bash

set -e

echo "================================================="
echo " 🚀 Iniciando Conexão com Banco de Produção"
echo "================================================="

# 1. Liberar a porta local 3307
echo "[1/4] Liberando porta local 3307..."
fuser -k 3307/tcp 2>/dev/null || true

# 2. Descobrir o IP do container database na nuvem
echo "[2/4] Consultando IP do container MySQL na nuvem..."
echo "👉 Digite a senha de rotacric@200.132.47.33 se solicitado:"
REMOTE_IP=$(ssh rotacric@200.132.47.33 "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' database 2>/dev/null || true")

if [ -z "$REMOTE_IP" ]; then
    echo "⚠️ Não foi possível obter o IP via container 'database'. Tentando IP genérico do Docker (172.19.0.3)..."
    REMOTE_IP="172.19.0.3"
fi

echo "✅ IP retornado do MySQL em produção: $REMOTE_IP"

# 3. Abrir o túnel SSH em background
echo "[3/4] Abrindo túnel SSH (Local: 3307 -> Remoto: $REMOTE_IP:3306)..."
echo "👉 Digite a senha de rotacric@200.132.47.33 novamente para iniciar o túnel:"
ssh -f -N -L 3307:${REMOTE_IP}:3306 rotacric@200.132.47.33

sleep 2

if ss -tulpn | grep -q 3307; then
    echo "🎉 Túnel SSH estabelecido com SUCESSO na porta 3307!"
    
    echo "[4/4] Reiniciando backend local no Docker..."
    docker compose restart backend
    
    echo "================================================="
    echo " SUCCESS! O backend local está conectado ao Banco de Produção!"
    echo " Teste agora o aplicativo mobile."
    echo "================================================="
else
    echo "❌ Erro: Não foi possível abrir o túnel SSH na porta 3307."
    exit 1
fi
