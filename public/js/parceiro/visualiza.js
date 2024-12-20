'use strict'
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Ajax } from "../Class/Ajax.js";
let PARC_CEP = document.getElementById('PARC_CEP')
let complemento = document.getElementById('PARC_COMP')
let ID_CID = document.getElementById('ID_CID')
let UF = document.getElementById('UF')

let bairro = document.getElementById('PARC_BAIRRO')
let logradouro = document.getElementById('PARC_LOGRA')
let numero = document.getElementById('PARC_NUM')
let cep = document.getElementById('PARC_CEP')
let nome = document.getElementById('PARC_NOME')
let fantasia = document.getElementById('PARC_N_RAZAO_SOCIAL')
let telefone = document.getElementById('PARC_TEL')
let telefone2 = document.getElementById('PARC_TEL_2')
let email = document.getElementById('PARC_EMAIL')
let PARC_NASC = document.getElementById('PARC_NASC')
let NOME_CID = document.getElementById('NOME_CID');
let UF_ = document.getElementById('ESTADO')
let NOME_F = document.getElementById('NOME_F')

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
function Importar(e) {
    e.preventDefault();
    let CGC = document.getElementById('PARC_CGC_');

    if( CGC.value.length == 14){
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/importar/dados');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = { CGC: CGC.value }
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            let dados = JSON.parse(ajax.responseText)
    
            if (ajax.status === 200) {
    
                bairro.value = dados.bairro;
                numero.value = dados.numero;
                complemento.value = dados.complemento;
                logradouro.value = dados.logradouro;
                cep.value = dados.cep;
                nome.value = dados.nome;
                fantasia.value = dados.fantasia;
                email.value = dados.email;
                var data = dados.abertura
                var dataform = data.split('/');
                var newdata = dataform[2] + '-' + dataform[1] + '-' + dataform[0]
                PARC_NASC.value = newdata;
                var tel = dados.telefone
                var telNew = tel.split('/');
                telefone.value = telNew[0];
                if (telNew[1]) {
                    telefone2.value = telNew[1];
                }
                var selectedIndex = dados.uf
                UF.value = selectedIndex
                NOME_CID.value = dados.municipio
                let evento = new Event('change');
                // PARC_CEP.dispatchEvent(evento)
                setTimeout((() => { document.getElementById('NOME_CID').dispatchEvent(evento) }),
                    1000)
    
            }
            else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        };
        ajax.send(JsonData);
    }else{
        swal({
            text:'CNPJ deve ter  14 digitos!',
            icon:'warning'
        })
    }
 
}
PARC_CEP.addEventListener('change', async() => {
    let CepFormatado = PARC_CEP.value.replace(/\D/g, "");
    let ValApi = {sql:`SELECT FILT_API FROM DUAL`,binds:{}};
    new Ajax('/select/universal',ValApi).RequisicaoAjax(false).then(async(response)=>{
        if (response[0] == 'S' ){
            if (CepFormatado.length == 8) {
            let data = {CEP:CepFormatado}
              await  new Ajax('/api/via/cep', data).RequisicaoAjax(false)
                await   new  Ajax('/select/universal',{sql:`SELECT FILT_CEP(:CEP) FROM DUAL`,binds:{CEP:CepFormatado}}).RequisicaoAjax(false)
                    .then((response)=>{
                      if(response.length != 0){
                        let event = new Event('change')
                        UF.value = response[0][2]
                        ID_CID.value = response[0][0]
                        bairro.value = response[0][1]
                        complemento.value = response[0][3];
                        ID_CID.dispatchEvent(event);
                      }
      })       
   
            } else {
                swal({
                    info: 'info',
                    title: 'Cep deve conter 8 digitos!'
                })
            }
        }
    });

})



document.getElementById('EDITAR').addEventListener('click', Salvar, false);
document.getElementById('EXCLUIR').addEventListener('click', Deletar, false);
document.getElementById('IMPORTAR').addEventListener('click', Importar, false);
