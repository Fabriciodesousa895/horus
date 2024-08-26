import { filtra_campo } from "../Class/Filtra_campo.js";
import { ActionForm } from "../FormClass/ActionForm.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";

new filtra_campo('CODPROD_', 'NOMEPROD', 'PRDT_PRODUTO').Filtra();
new filtra_campo('CODPROD_2', 'NOMEPROD_2', 'PRDT_PRODUTO').Filtra();
new filtra_campo('P_PRDT', 'P_PRDT_N', 'PRDT_PRODUTO').Filtra();

new filtra_campo('COD_CAT', 'NOME_CAT', 'CTG_PRODUTO').Filtra();
new filtra_campo('COD_CAT_1', 'NOME_CAT_1', 'CTG_PRODUTO').Filtra();
new filtra_campo('P_CAT', 'P_CAT_N', 'CTG_PRODUTO').Filtra();

let COD_PROD_F = document.getElementById('COD_PROD_F');
let COD_CAT = document.getElementById('COD_CAT');
let DESC_PROD_F = document.getElementById('DESC_PROD_F');


new ActionForm('form', 'PRC_PRECO').Insert()
// Usando filtro
document.getElementById('form_filtro').addEventListener('submit', (e) => {
  e.preventDefault();
  SalvaFiltro(401, COD_PROD_F.value, DESC_PROD_F.value, COD_CAT.value, '', '', '', '', '', '', '');
  let data = {
    sql: `SELECT FILTRA_PRECO(:P_COD,:P_DESC,:P_CAT) FROM DUAL`,
    binds: { P_COD: COD_PROD_F.value, P_DESC: DESC_PROD_F.value, P_CAT: COD_CAT.value },
    USU_LOGADO: false,
    mensage_error: 'Houve um erro ao conultar o registro!'

  }
  new Ajax('/select/universal', data).RequisicaoAjax().then((arraydedados) => {
    new Tabela('TabelaPrecos').InseriRegistros(arraydedados)
  })

})
// Alterando por categoria
document.getElementById('form_categoria').addEventListener('submit', (e) => {
  e.preventDefault();
  let objetos = new Tabela().InputsValues(['COD_CAT_1', 'PERCENTUAL', 'TIPO']);
  let data = {
    sql: `BEGIN
                ALT_PRECO(:TIPO,:PERCENTUAL,:CATEGORIA,:USU_LOGADO);
           END;`,
    binds: { TIPO: objetos.TIPO, PERCENTUAL: objetos.PERCENTUAL, CATEGORIA: objetos.COD_CAT_1 },
    USU_LOGADO: true,
    mensagem_sucess: 'Alteração de preços por categoria feita com sucesso!',
    mensagem_error: 'Erro ao alterar preços!'
  }
  if(objetos.PERCENTUAL != '' && objetos.COD_CAT_1 != '' ){
    new Ajax('/rota/universal', data).RequisicaoAjax(true);
  }
})
// Alterando preço por produto
document.getElementById('form_produto').addEventListener('submit', (e) => {
  e.preventDefault();
  let objetos = new Tabela().InputsValues(['CODPROD_2', 'PRECO_PROD']);
  let data = {
    sql: `BEGIN
                ALT_PRECO_PROD(:CODPROD,:PRECO,:USU_LOGADO);
           END;`,
    binds: { CODPROD: objetos.CODPROD_2, PRECO: objetos.PRECO_PROD },
    USU_LOGADO: true,
    mensagem_sucess: 'Alteração de preço no produto feita com sucesso!',
    mensagem_error: 'Erro ao alterar preços!'
  }
  if( objetos.CODPROD_2 != '' && objetos.PRECO_PROD){
    new Ajax('/rota/universal', data).RequisicaoAjax(true);
  }
})

// let AllTds = document.querySelectorAll('td');
// AllTds.addEventListener('dbclick',(e)=>{
//   console.log('Elemento clicado');
// })

document.getElementById('TDDOPC').addEventListener('change', (e) => {
  let TDDOPC = document.getElementById('TDDOPC').value
  let P_CAT = document.getElementById('P_CAT')
  let P_CAT_N = document.getElementById('P_CAT_N')
  let P_PRDT = document.getElementById('P_PRDT')
  let P_PRDT_N = document.getElementById('P_PRDT_N')
  let DT_ALT_INCLU = document.getElementById('DT_ALT_INCLU')
  if (TDDOPC == 'P') {
    P_CAT.setAttribute('disabled', true);
    P_CAT_N.setAttribute('disabled', true);
    DT_ALT_INCLU.innerHTML = 'Dt. alteração'

  } else {
    P_CAT.removeAttribute('disabled');
    P_CAT_N.removeAttribute('disabled');
  }


  if (TDDOPC == 'A' || TDDOPC == 'D') {
   
    P_PRDT.setAttribute('disabled', true);
    P_PRDT_N.setAttribute('disabled', true);
    DT_ALT_INCLU.innerHTML = 'Dt. alteração'

  } else {
    P_PRDT.removeAttribute('disabled');
    P_PRDT_N.removeAttribute('disabled');
  }

  if (TDDOPC == 'I' || TDDOPC == 'P') {
    P_CAT.setAttribute('disabled', true);
    P_CAT_N.setAttribute('disabled', true);
  } else {
    P_CAT.removeAttribute('disabled');
    P_CAT_N.removeAttribute('disabled');
  }
  if(TDDOPC == 'I'){
    DT_ALT_INCLU.innerHTML = 'Dt. inclusão'
  }else{
     DT_ALT_INCLU.innerHTML = 'Dt. alteração'
  }


})
// Filtrando auditoria de preços
document.getElementById('Auditoria_sql').addEventListener('submit',(e)=>{
  e.preventDefault();
  let objeto = new Tabela().InputsValues(['P_CAT','P_PRDT','TDDOPC','P_INI','P_FIN','ID_USU']);
 
  let data = {
    sql: `SELECT  FILTRA_AUDITORIA( :TDDOPC,:P_INI,:P_FIN,:P_CAT,:P_PRDT,:ID_USU) FROM DUAL`,
    binds:objeto,
    USU_LOGADO: false,
    mensage_error: 'Houve um erro ao conultar o registro!'

  }
  new Ajax('/select/universal', data).RequisicaoAjax().then((arraydedados) => {
    if(objeto.P_INI != '' && objeto.P_FIN != '' && objeto.TDDOPC != ''){
      new Tabela('Tabela_auditoria').InseriRegistros(arraydedados);
    }
  })
})
// Desativando tabela de preço
document.getElementById('EXCLUIR').addEventListener('click',(e)=>{
  let TabelaSelecionada = document.querySelector('.Selectedtr');
  let IdTabelaSelecionada = TabelaSelecionada.querySelector('td').innerText
 swal({
  text:'Deseja desativar a tabela de preço de numero: ' +  IdTabelaSelecionada,
  icon:'warning',
  buttons: true,
  dangerMode:true
 }).then((WillDelete)=>{
  if(WillDelete){
    let data ={
      sql:`DECLARE
        V_COD_PROD INT;
          BEGIN 
          SELECT COD_PROD INTO V_COD_PROD FROM PRC_PRECO WHERE ID = :ID_TAB; 
                  UPDATE PRC_PRECO SET ATIVO = 'N' WHERE ID = :ID_TAB;
                  INSERT INTO LOG_PRECO(DESCRICAO,DT_INCLU,TIPO,USU_INCLU,ID_PROD) VALUES ('Usuario ' || :USU_LOGADO || ' desativou a tabela de preço ' || :ID_TAB || ' no produto ' || V_COD_PROD ,
                                                                              SYSDATE,'P',:USU_LOGADO,V_COD_PROD  );
                                                                              COMMIT;
          END;`,
          USU_LOGADO:true,
          binds:{ID_TAB:IdTabelaSelecionada},
          mensagem_sucess:'Tabela de preço destivada com sucesso!',
          mensagem_error:'Erro ao destivar tabela de preço!'

    }
    new Ajax('/rota/universal',data).RequisicaoAjax(true)
  }
   
 })
})


