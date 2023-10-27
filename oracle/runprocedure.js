const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function runProcedure(sql,param) {
  try {
    const connection = await oracledb.getConnection({
      user: 'system',
      password: 'host2023',
      connectString: 'localhost:1521'
    });

    const result = await connection.execute(sql);
    // await runProcedure('COMMIT');
    console.log(result)
    return result;

    await connection.close();
    
  } catch (err) {
    console.error('Erro ao executar procedure:', err.message);
    console.error('Stack Trace:', err);
    throw err; 
  }
}



module.exports = runProcedure;