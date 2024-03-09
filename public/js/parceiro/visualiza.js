'use strict'
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Ajax } from "../Class/Ajax.js";


new filtra_campo('ID_CID', 'NOME_CID', 'CIDADE').Filtra()
let evento = new Event('change')
document.getElementById('ID_CID').dispatchEvent(evento)

new filtra_campo('ID_CID_F', 'NOME_CID_F', 'CIDADE').Filtra()
let evento2 = new Event('change')
document.getElementById('ID_CID_F').dispatchEvent(evento2)

//Ao carregar a página é selecionado o estado do parceiro
window.addEventListener('load', (e) => {
    document.getElementById('ESTADO').value = document.getElementById('UF_ESTADO').value;
    //formatando data
    let data = document.getElementById('DT_FORMATA').value
    let datasplit = data.split('-');
    let datanova = datasplit[0] + '-' + datasplit[1] + '-' + datasplit[2]
    document.getElementById('PARC_NASC').value = datanova

})

function Salvar(e) {
    e.preventDefault();
    let form = document.getElementById('form');
    let inputs = form.querySelectorAll('input');
    let UF = document.getElementById('ESTADO')
    let Data =  document.getElementById('PARC_ADMISSAO') ;
    let PARC_NASC =  document.getElementById('PARC_NASC') ;
    let PARC_CGC_ =  document.getElementById('PARC_CGC_') ;

    let Objeto = {};
    for (let i = 0; i < inputs.length; i++) {
        let id = inputs[i].id;
        let value;
        if (inputs[i].type == 'checkbox') {
            value = inputs[i].checked ? 'S' : 'N';
        } else {
            value = inputs[i].value;
        }
        Objeto[id] = value;
    }
    let data = {
        sql: `BEGIN
          UPDATE PRC_PARCEIRO SET 
          PARC_NOME              = '${Objeto.PARC_NOME}',
          PARC_N_RAZAO_SOCIAL = '${Objeto.PARC_N_RAZAO_SOCIAL}',
          PARC_CGC_ = '${PARC_CGC_.value}',
          IE_RG = '${Objeto.PARC_IR_RG}',
          PARC_EMAIL = '${Objeto.PARC_EMAIL}',
          PARC_NASC =  TO_DATE('${PARC_NASC.value}','YYYY-MM-DD'),
          PARC_TEL         = '${Objeto.PARC_TEL}',
          PARC_TEL_2               = '${Objeto.PARC_TEL_2}',
          PARC_TRABALHO_N          = '${Objeto.PARC_TRABALHO_N}',
          PARC_CEP_T               = '${Objeto.PARC_CEP_T}',
          PARC_BAIRRO_T            = '${Objeto.PARC_BAIRRO_T}',
          PARC_CID_F               =  '${Objeto.ID_CID_F}',
          PARC_LOGRA_T             = '${Objeto.PARC_LOGRA_T}',
          PARC_COMP_T              =  '${Objeto.PARC_COMP_T}',
          PARC_TEL_T               =  '${Objeto.PARC_TEL_T}',
          PARC_SALARIO             =  '${Objeto.PARC_SALARIO}',
          PARC_ADMISSAO            =  TO_DATE('${Data.value}','YYYY-MM-DD'),
          PARC_CEP                 =  '${Objeto.PARC_CEP}',
          UF                       =  '${UF.value}',
          ID_CIDADE                =   '${Objeto.ID_CID}',
          PARC_BAIRRO              =  '${Objeto.PARC_BAIRRO}',
          PARC_LOGRA               =  '${Objeto.PARC_LOGRA}',
          PARC_NUM                 =  '${Objeto.PARC_NUM}',
          PARC_COMP                = '${Objeto.PARC_COMP}',
          PARC_FORNEC              =  '${Objeto.PARC_FORNEC}',         
          PARC_NUM_T               =  '${Objeto.PARC_NUM_T}',
          PARC_BLOQUEADO               =  '${Objeto.PARC_BLOQUEADO}',
          PARC_STATUS               =  '${Objeto.PARC_STATUS}',
          USU_ALTER                = :USU_LOGADO,
          DT_ALTER                 =  SYSDATE         
          WHERE ID_PARC            =  ${Objeto.ID};

          COMMIT;
    END;`,
        binds: {},
        USU_LOGADO: true,
        mensagem_error: 'Error ao inserir registro!',
        mensagem_sucess: 'Registro alterado com sucesso!'
    }
    new Ajax('/rota/universal', data).RequisicaoAjax(true);
}
function Deletar (e){
    e.preventDefault();
    let ID = document.getElementById('ID');
    let data ={
        sql:`BEGIN 
         DELETE PRC_PARCEIRO WHERE ID_PARC = :ID;
         COMMIT;
        END;`,
    binds:{ID:ID.value},
    USU_LOGADO:false,
    mensagem_error: 'Error ao deletar registro!',
    mensagem_sucess: 'Registro deletado com sucesso!'
    }
    new Ajax('/rota/universal',data).RequisicaoAjax(true)
    setTimeout(function(){location.reload()} ,5000)
    

}


document.getElementById('EDITAR').addEventListener('click', Salvar, false)
document.getElementById('EXCLUIR').addEventListener('click', Deletar, false)