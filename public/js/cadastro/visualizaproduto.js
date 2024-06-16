'use scrict';
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Tabela } from "../Class/Tabela.js";
new filtra_campo('PRDT_ID_CTG','PRDT_NOME_CTG','CTG_PRODUTO').Filtra();
new filtra_campo('PRDT_MARCA','PRDT_MARCA_NOME','MARCA').Filtra();
new filtra_campo('PRDT_NCM','PRDT_NCM_DESC','NCM').Filtra();

//Escutador de submit do formulário de produtos
document.getElementById('EDITAR').addEventListener('click',(e)=>{
  let dados =   new Tabela().InputsValues(['PRDT_ID','CARACT_PRDT','PRDT_NOME','PRDT_DESC','PRDT_NR_PECA','PRDT_ID_CTG','PRDT_MARCA','PRDT_USADO_COMO','PRDT_NCM',
                                           'PRDT_EST_MIN','PRDT_EST_MAX','PRDT_P_BRUTO','PRDT_P_LIQUIDO','PRDT_ALTURA','PRDT_LARGURA',
                                           'PRDT_MARGEM_LUCRO','PRDT_COMISSAO_VND','PRDT_COMISSAO_GER','PRDT_CAL_COMISSAO','PRDT_DESC_MAX','PRDT_COD_BARRA','PRDT_STATUS'])
  let data = {
    sql:`BEGIN ALTERA_PRRODUTO(:PRDT_ID,
                               :PRDT_NOME,
                               :PRDT_DESC,
                               :CARACT_PRDT,
                               :PRDT_USADO_COMO,
                               :PRDT_CAL_COMISSAO,
                               :PRDT_NCM,
                               :PRDT_STATUS,
                               :PRDT_EST_MIN,
                               :PRDT_EST_MAX,
                               :PRDT_NR_PECA,
                               :PRDT_MARGEM_LUCRO,
                               :PRDT_COMISSAO_VND,
                               :PRDT_COMISSAO_GER,
                               :PRDT_P_LIQUIDO,
                               :PRDT_P_BRUTO,
                               :PRDT_ID_CTG,
                               :PRDT_COD_BARRA,
                               :PRDT_MARCA,
                               :PRDT_ALTURA,
                               :PRDT_LARGURA,
                               :PRDT_DESC_MAX,
                               :USU_LOGADO); END;`,
    binds:dados,
    mensagem_sucess: 'Registro alterado com sucesso',
    mensagem_error: 'Error',
    USU_LOGADO:true                        
  }
//fazendo a requisição ajax e alterando o registro
console.log(data.binds)
console.log(data.sql)
  new Ajax('/rota/universal',data).RequisicaoAjax(true)

})
document.getElementById('EXCLUIR').addEventListener('click',()=>{
    let data = {
        sql: 'BEGIN DELETE FROM PRDT_PRODUTO WHERE PRDT_ID = :ID; COMMIT;END;',
        binds:{ID: document.getElementById('PRDT_ID').value},
        mensagem_sucess: 'Registro excluido com sucesso',
        mensagem_error: 'Error',
        USU_LOGADO:false   
    }
    new Ajax('/rota/universal',data).RequisicaoAjax(true)

})