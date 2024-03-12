'use scrict';
import { SalvaFiltro } from "../Class/Filtro.js";
import {Ajax} from "../Class/Ajax.js"
import { Tabela } from "../Class/Tabela.js";
let CodNcm = document.getElementById('COD');
let Ncmdescricao = document.getElementById('NCM');
let COD_NCM_ = document.getElementById('COD_NCM_');
let NCM_DESC = document.getElementById('NCM_DESC');
let filtro = document.getElementById('filtro');
let form = document.getElementById('form');


//Usando o filtro
filtro.addEventListener('click',(e)=>{

  let data ={
    sql:`SELECT FILTRA_NCM(:COD_NCM_,:NCM_DESC) FROM DUAL`,
    binds:{NCM_DESC:Ncmdescricao.value,COD_NCM_:CodNcm.value},
    mensagem_error: "Error ao consultar registro",
    USU_LOGADO: false
  };
 new Ajax('/select/universal',data).RequisicaoAjax(false).then((dados)=>{
 new Tabela('Ncm').InseriRegistros(dados)
 })

    e.preventDefault();
    SalvaFiltro(162,CodNcm.value,Ncmdescricao.value,'','','','','','','','')

})
//Inserindo um novo registro
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  let data ={
    sql:`BEGIN INSERI_NCM(:COD_NCM_,:NCM_DESC,:USU_LOGADO); END;`,
    binds:{NCM_DESC:COD_NCM_.value,COD_NCM_:NCM_DESC.value},
    mensagem_sucess:'Registro inserido com sucesso!', 
    mensagem_error:'Erro ao inserir registro!',
    USU_LOGADO: true
  };
  new Ajax('/rota/universal',data).RequisicaoAjax(true)
  NCM_DESC.value = ''
  COD_NCM_.value = ''
  console.log(data)
})

new Tabela('Ncm').VisualizaRegistro('/VisualizaNcm/',1);