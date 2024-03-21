'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
function consulta (){
    let data ={
        sql:`SELECT MONITOR_SESSAO FROM DUAL`,
        binds:{},
        mensage_error:'tee',
    }
    new Ajax('/select/universal',data).RequisicaoAjax().then((dados)=>{
   new Tabela('monitor').InseriRegistros(dados);
 })
}

document.getElementById('Atualizar').addEventListener('click',()=>{

    consulta()
})

setInterval(() => {
    consulta()
}, 10000);