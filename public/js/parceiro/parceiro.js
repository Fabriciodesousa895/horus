'use strict';
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
import { ActionForm } from "../FormClass/ActionForm.js";

new filtra_campo('ID_CID', 'NOMECID', 'CIDADE').Filtra()
new filtra_campo('ID_CID_F', 'NOME_CID_F', 'CIDADE').Filtra()
new Tabela('tabeladados').VisualizaRegistro('/visualizaparceiro/', 1)
new ActionForm('FormParceiro','PRC_PARCEIRO').Insert()

let bairro = document.getElementById('PARC_BAIRRO')
let logradouro = document.getElementById('PARC_LOGRA')
let numero = document.getElementById('PARC_NUM')
let complemento = document.getElementById('PARC_COMP')
let cep = document.getElementById('PARC_CEP')
let nome = document.getElementById('PARC_NOME')
let fantasia = document.getElementById('PARC_N_RAZAO_SOCIAL')
let telefone = document.getElementById('PARC_TEL')
let telefone2 = document.getElementById('PARC_TEL_2')
let email = document.getElementById('PARC_EMAIL')
let PARC_NASC = document.getElementById('PARC_NASC')
let UF = document.getElementById('ESTADO')
let NOME_CID = document.getElementById('NOMECID');
let CGC = document.getElementById('CGC')
let UF_ = document.getElementById('UF')
let NOME_F = document.getElementById('NOME_F')
let PARC_CEP = document.getElementById('PARC_CEP')
let ID_CID = document.getElementById('ID_CID')
function Salva() {
    SalvaFiltro(201, ID.value, NOME_F.value, CGC.value, IE_RG_F.value, UF_.value, ATIVO.checked ? 'S' : 'N', FORNECEDOR.checked ? 'S' : 'N', BLOQUEADOS.checked ? 'S' : 'N', '', '');
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

function Filtro() {
    let objeto = new Tabela(tabeladados).InputsValues(['ID', 'NOME_F', 'CGC', 'UF', 'IE_RG_F', 'ATIVO', 'FORNECEDOR', 'BLOQUEADOS'])
    let data = {
        sql: `SELECT FILTRO_PARC(:ID,:NOME_F,:CGC,:UF,:IE_RG_F,:ATIVO,:FORNECEDOR,:BLOQUEADOS) FROM DUAL`,
        binds: objeto,
        USU_LOGADO: false
    };

    let Ajax_res = new Ajax('/select/universal', data).RequisicaoAjax(false)
    Ajax_res.then((dados) => {
        new Tabela('tabeladados').InseriRegistros(dados);
        Salva();

    })

}

function Importar(e) {
    e.preventDefault()
    let CGC = document.getElementById('PARC_CGC_')
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
                setTimeout((() => { document.getElementById('NOMECID').dispatchEvent(evento) }),
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
// Usando o filtro
document.getElementById('Buscar').addEventListener('click', Filtro, false);
//importando os dados
document.getElementById('IMPORTAR').addEventListener('click', Importar, false);
