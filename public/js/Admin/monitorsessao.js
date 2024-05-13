'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
document.getElementById('Atualizar').addEventListener('click',()=>{
 Atualizar()
})

function Atualizar(){
    let data ={
        sql:`SELECT MONITOR_SESSAO FROM DUAL`,
        binds:{}
    }
    new Ajax('/select/universal',data).RequisicaoAjax().then((dados)=>{
   new Tabela('monitor').InseriRegistros(dados);
 })
}

document.getElementById('monitor').addEventListener('dblclick',(e)=>{
    let cell = ( e.target.parentNode.cells[0].textContent)
    console.log(cell);
    swal({
        title:'Finalizar sessão deste usuário?',
        text:'Realmente deseja finalizar a sessão deste usuário?',
        icon:'warning',
        buttons:true,
        dangerMode:true
    }).then((willDelete)=>{
        if(willDelete){
            let data = {
                sql : `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE,KILL = 'S' WHERE ID = :ID;COMMIT;END;`,
                binds:{ID:cell},
                mensagem_sucess:'Sessão finalizada com sucesso!'
            }
            new Ajax('/rota/universal',data).RequisicaoAjax(true);
            setTimeout((()=>{Atualizar()}),1000)
             
        }
    })
})
