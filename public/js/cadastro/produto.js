'use scrict';
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";

new filtra_campo('PRDT_ID_CTG','PRDT_NOME_CTG','CTG_PRODUTO').Filtra();
new filtra_campo('PRDT_MARCA','PRDT_MARCA_NOME','MARCA').Filtra();
new filtra_campo('PRDT_NCM','PRDT_NCM_DESC','NCM').Filtra();
new Tabela('TabelaProduto'). VisualizaRegistro('/visualizaproduto/',1)
//Escutador de submit do formulário de filtro
document.getElementById('FormFiltro').addEventListener('submit', (e) => {
    e.preventDefault();
    let dados = new Tabela().InputsValues(['COD','NOME','DESCRICAO','CARACT','USADO','STATUS','NCM']);
    let data = {
        sql: `SELECT FILTRA_PRODUTO(:COD,:NOME,:DESCRICAO,:CARACT,:USADO,:STATUS,:NCM) FROM DUAL`,
        binds: dados,
        mensage_error: 'Error ao consultar',
    };
// Salvando filtro
   new SalvaFiltro(281,dados.COD,dados.NOME,dados.DESCRICAO,dados.CARACT,dados.USADO,dados.STATUS,dados.NCM,'','','')
//fazendo a requisição ajax e inserindo na tabela
    new Ajax('/select/universal', data).RequisicaoAjax().then((array_dados)=>{
    new Tabela('TabelaProduto').InseriRegistros(array_dados);
   })
})
//Escutador de submit do formulário de produtos
document.getElementById('formproduto').addEventListener('submit',(e)=>{
    e.preventDefault();
  let dados =   new Tabela().InputsValues(['CARACT_PRDT','PRDT_NOME','PRDT_DESC','PRDT_NR_PECA','PRDT_ID_CTG','PRDT_MARCA','PRDT_USADO_COMO','PRDT_NCM',
                                           'PRDT_EST_MIN','PRDT_EST_MAX','PRDT_P_BRUTO','PRDT_P_LIQUIDO','PRDT_ALTURA','PRDT_LARGURA',
                                           'PRDT_MARGEM_LUCRO','PRDT_COMISSAO_VND','PRDT_COMISSAO_GER','PRDT_CAL_COMISSAO','PRDT_DESC_MAX','PRDT_COD_BARRA'])
  let data = {
    sql:`BEGIN INSERI_PRODUTO(:PRDT_NOME,:PRDT_DESC,:CARACT_PRDT,:PRDT_USADO_COMO,:PRDT_CAL_COMISSAO,:PRDT_NCM,:PRDT_EST_MIN,:PRDT_EST_MAX,:PRDT_NR_PECA,
                             :PRDT_MARGEM_LUCRO,:PRDT_COMISSAO_VND,:PRDT_COMISSAO_GER,:PRDT_P_LIQUIDO,:PRDT_P_BRUTO,:PRDT_ID_CTG,:PRDT_COD_BARRA,:PRDT_MARCA,
                             :PRDT_ALTURA,:PRDT_LARGURA,:PRDT_DESC_MAX,:USU_LOGADO); END;`,
    binds:dados,
    mensagem_sucess: 'Registro inserido com sucesso',
    mensagem_error: 'Error',
    USU_LOGADO:true                        
  }
//fazendo a requisição ajax e inserindo o registro
  new Ajax('/rota/universal',data).RequisicaoAjax(true,'formproduto')

})
