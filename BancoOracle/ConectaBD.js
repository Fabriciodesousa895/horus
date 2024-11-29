const oracledb = require('oracledb');

const dbconfig = {
  user: process.env.SYSTEM,
  password: process.env.PASSWORD,
  connectString: process.env.CONNECT
}

async function conectarbd(sql, binds, options) {
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`, binds, options);
  return result.rows;
}
async function conectar(sql, binds) {
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`, binds);
  return result;
}

//resultado vem em array de array
const options = {
  autoCommit: true,
  outFormat: oracledb.OUT_FORMAT_ARRAY
}
//resultado vem em array de objeto
const options_objeto = {
  autoCommit: true,
  outFormat: oracledb.OUT_FORMAT_OBJECT
}

module.exports = {conectar,conectarbd,options,options_objeto,oracledb}