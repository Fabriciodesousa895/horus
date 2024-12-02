const  XLSX  = require('xlsx');
const { conectar, conectarbd, options, options_objeto } = require("../../BancoOracle/ConectaBD");


function LerPlanilha(CaminhoArquivo) {
   let workhook = XLSX.readFile(CaminhoArquivo);
   let SheetName = workhook.SheetNames[0];
   let WorkSheet = workhook.Sheets[SheetName];
   let Data = XLSX.utils.sheet_to_json(WorkSheet);
   let Json = Data.slice(2)
   console.log(Json);
   return Data;
}

module.exports = {LerPlanilha}
