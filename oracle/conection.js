const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function runQuery(sql) {
  try {
    const connection = await oracledb.getConnection({
      user: 'system',
      password: 'host2023',
      connectString: 'localhost:1521'
    });

    const result = await connection.execute(sql);
    await connection.close();
    console.log(result)
    return result;

  } catch (err) {
    console.error('Erro ao executar a consulta:', err.message);
    console.error('Stack Trace:', err);
    throw err; 
  }
}



module.exports = runQuery;