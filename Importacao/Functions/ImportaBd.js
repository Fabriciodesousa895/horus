const  XLSX  = require('xlsx');
const { conectar, conectarbd, options, options_objeto } = require("../../BancoOracle/ConectaBD");


function LerPlanilha(CaminhoArquivo) {
   let workhook = XLSX.readFile(CaminhoArquivo);
   let SheetName = workhook.SheetNames[0];
   let WorkSheet = workhook.Sheets[SheetName];
   let Data = XLSX.utils.sheet_to_json(WorkSheet);
   
   // Data.forEach(element => {
   //   console.log(element.Produtos + ' --- ' + element.__EMPTY);
   // let SqlInsert = `INSERT INTO PRDT_PRODUTO () VALUES(:PRDT_ID)`;
   // let Binds = {PRDT_ID:element.Produtos};
   // let Result = conectar(SqlInsert,Binds);
   // });
    console.log(Data);
   return Data;
}

module.exports = {LerPlanilha}
