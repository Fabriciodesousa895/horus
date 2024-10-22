'use scrict';
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { ActionForm } from "../FormClass/ActionForm.js";

new filtra_campo('PRDT_ID_CTG','PRDT_NOME_CTG','CTG_PRODUTO').Filtra();
new filtra_campo('PRDT_MARCA','PRDT_MARCA_NOME','MARCA').Filtra();
new filtra_campo('PRDT_UNIDADE','PRDT_UNIDADE_DESC','UNIDADE_MEDIDA').Filtra();
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

let ActionInstancia = new ActionForm('formproduto','PRDT_PRODUTO')
ActionInstancia.Insert();
ActionInstancia.delete('PRDT_ID'); 

let Data = {
    sql: `SELECT COUNT(*) AS TOTAL,
    C.CTG_NOME 
FROM PRDT_PRODUTO P
LEFT JOIN CTG_PRODUTO C ON C.ID_CATEGORIA = P.PRDT_ID_CTG
GROUP BY C.CTG_NOME`,
    binds: {},
    mensage_error: 'Error ao consultar',
};

new Ajax('/select/universal/objeto', Data).RequisicaoAjax().then((data)=>{
    const ctx = document.getElementById('Grafico');
    let totais = data.map(item => item.TOTAL);
    let categorias = data.map(item => item.CTG_NOME);
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categorias,
        datasets: [{
          label: 'Categoria de produtos',
          data: totais,
          borderWidth: 1
        }]
      }

    });
})