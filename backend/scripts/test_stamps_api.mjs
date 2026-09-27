import jwt from 'jsonwebtoken';

async function testAdminStampCreation() {
  console.log('🧪 Testando criação de carimbo por Admin no backend...');

  // Gerar um token JWT válido de Admin (ID 1, rotacric, is_staff: true)
  const secret = '57bb941ff8687ecd9f4a5d7dae62b88781a95e9053720915c5162df9f60ea32e';
  const token = jwt.sign(
    { sub: '1', username: 'rotacric', email: 'vaniuszapalowski@ifsul.edu.br', is_staff: true, is_superuser: true },
    secret,
    { expiresIn: '1h' }
  );

  console.log('🔑 Token de Admin gerado com sucesso!');

  // 1. Criar Carimbo para o Ponto de Apoio ID 1
  try {
    const res = await fetch('http://localhost:3000/api/stamps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        anchor_point_id: 1,
        name: 'Carimbo Oficial Ponto de Apoio 1',
        badge_image: 'stamps/badge_ponto_1.png'
      })
    });
    const stampData = await res.json();
    console.log('✅ POST /api/stamps OK!');
    console.log('   -> Carimbo criado:', stampData);
  } catch (err) {
    console.error('❌ Erro no POST /api/stamps:', err.message);
  }

  // 2. Verificar Bootstrap
  try {
    const res = await fetch('http://localhost:3000/api/sync/bootstrap');
    const data = await res.json();
    console.log('✅ GET /api/sync/bootstrap OK!');
    console.log(`   -> Total de Carimbos Ativos no Bootstrap: ${data.stamps?.length}`);
    console.log('   -> Dados do Carimbo no Bootstrap:', data.stamps[0]);
  } catch (err) {
    console.error('❌ Erro no Bootstrap:', err.message);
  }
}

testAdminStampCreation();
