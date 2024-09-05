import { ActionForm } from "../FormClass/ActionForm.js";         
import { SalvaFiltro } from "../Class/Filtro.js";         
import { Tabela } from "../Class/Tabela.js";         
import { Ajax } from "../Class/Ajax.js";         
new ActionForm('formnatureza','NATUREZA').Insert();
new ActionForm('formnatureza','NATUREZA').delete('IdPknat');
new ActionForm('form_upd_natureza','NATUREZA').Update('IdPknat')

//Usando o filtro
document.getElementById('filtro').addEventListener('click',(e)=>{
    e.preventDefault()
 
    let ObjetoValue = new Tabela().InputsValues(['ID_NAT','NOME_NAT'])
    new SalvaFiltro(381,ObjetoValue.ID_NAT,ObjetoValue.NOME_NAT,'','','','','','','','');
    let data ={
      sql:`SELECT FILTRA_NATUREZA(:ID_NAT,:NOME_NAT) FROM DUAL`,
      binds:ObjetoValue,
      mensagem_error: "Error ao consultar registro",
      USU_LOGADO: false
    };
   new Ajax('/select/universal',data).RequisicaoAjax(false).then((dados)=>{
   new Tabela('Naturezas').InseriRegistros(dados)
   })
  })