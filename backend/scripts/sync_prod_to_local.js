import mariadb from 'mariadb';

async function syncProdToLocal() {
  const prodPool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3307,
    user: 'rotacric',
    password: 'rotacric',
    database: 'rotacric',
    multipleStatements: true,
  });

  const localPool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3308,
    user: 'root',
    password: 'root',
    database: 'rotacric',
    multipleStatements: true,
  });

  console.log('🔄 Iniciando cópia fiel do banco de Produção (3307) -> Local Docker (3308)...');

  let prodConn, localConn;
  try {
    prodConn = await prodPool.getConnection();
    localConn = await localPool.getConnection();

    await localConn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Obter todas as tabelas de produção
    const tables = await prodConn.query('SHOW TABLES');
    const tableNames = tables.map((r) => Object.values(r)[0]);
    console.log(`📋 Encontradas ${tableNames.length} tabelas em Produção:`, tableNames.join(', '));

    // 2. Apagar tabelas existentes no local
    const localTablesRes = await localConn.query('SHOW TABLES');
    const localTableNames = localTablesRes.map((r) => Object.values(r)[0]);
    for (const t of localTableNames) {
      await localConn.query(`DROP TABLE IF EXISTS \`${t}\``);
    }

    // 3. Replicar cada tabela (DDL + Dados)
    for (const table of tableNames) {
      console.log(`  -> Copiando tabela \`${table}\`...`);
      const createTableRes = await prodConn.query(`SHOW CREATE TABLE \`${table}\``);
      const createTableSql = createTableRes[0]['Create Table'];
      
      await localConn.query(createTableSql);

      // Pular dados de django_session (apenas estrutura necessária)
      if (table === 'django_session') {
        console.log(`     ✅ \`${table}\`: Estrutura criada (dados de sessão ignorados).`);
        continue;
      }

      const rows = await prodConn.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insertSql = `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;

        // Batch insert para maior velocidade
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const chunk = rows.slice(i, i + batchSize);
          for (const row of chunk) {
            const values = columns.map((col) => row[col]);
            await localConn.query(insertSql, values);
          }
        }
        console.log(`     ✅ \`${table}\`: ${rows.length} registros inseridos.`);
      } else {
        console.log(`     ✅ \`${table}\`: 0 registros (tabela vazia).`);
      }
    }

    await localConn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🎉 SUCESSO! O banco Docker local agora é uma cópia fiel de Produção!');
  } catch (err) {
    console.error('❌ Erro na sincronização:', err);
  } finally {
    if (prodConn) prodConn.release();
    if (localConn) localConn.release();
    await prodPool.end();
    await localPool.end();
  }
}

syncProdToLocal();
