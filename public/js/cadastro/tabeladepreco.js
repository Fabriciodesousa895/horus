import {  filtra_campo } from "../Class/Filtra_campo.js";
import { ActionForm } from "../FormClass/ActionForm.js";
import { SalvaFiltro } from "../Class/Filtro.js";
// import { Tabela } from "../Class/Tabela.js";

new filtra_campo('CODPROD_','NOMEPROD','PRDT_PRODUTO').Filtra();
new filtra_campo('COD_CAT','NOME_CAT','CTG_PRODUTO').Filtra();
new filtra_campo('COD_CAT_1','NOME_CAT_1','CTG_PRODUTO').Filtra();

let COD_PROD_F = document.getElementById('COD_PROD_F');
let COD_CAT = document.getElementById('COD_CAT');
let DESC_PROD_F = document.getElementById('DESC_PROD_F');


new ActionForm('form','PRC_PRECO').Insert()
new ActionForm('form_categoria','PRC_PRECO_CAT').Insert()

document.getElementById('form_filtro').addEventListener('submit',(e)=>{
    e.preventDefault();
                              
    SalvaFiltro(401,COD_PROD_F.value,DESC_PROD_F.value,COD_CAT.value,'','','','','','','');

})