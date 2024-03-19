'use strict';
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
new filtra_campo('ID_CID', 'NOME_CID', 'CIDADE').Filtra()
new filtra_campo('ID_CID_F', 'NOME_CID_F', 'CIDADE').Filtra()
new Tabela('tabeladados').VisualizaRegistro('/visualizaparceiro/',1)

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
let NOME_CID = document.getElementById('NOME_CID');
let CGC = document.getElementById('CGC')
let UF_ = document.getElementById('UF')
let NOME_F = document.getElementById('NOME_F')
function Salva() {
    SalvaFiltro(201, ID.value, NOME_F.value, CGC.value, IE_RG_F.value, UF_.value, ATIVO.checked ? 'S' : 'N', FORNECEDOR.checked ? 'S' : 'N', BLOQUEADOS.checked ? 'S' : 'N', '', '');
}
function Filtro() {
    let objeto = new Tabela(tabeladados).InputsValues(['ID', 'NOME_F', 'CGC', 'UF', 'IE_RG_F', 'ATIVO', 'FORNECEDOR', 'BLOQUEADOS'])
    let data = {
        sql: `SELECT FILTRO_PARC(:ID,:NOME_F,:CGC,:UF,:IE_RG_F,:ATIVO,:FORNECEDOR,:BLOQUEADOS) FROM DUAL`,
        binds: objeto,
        mensage_error: 'Houve um erro ao consultar registros',
        rows: true,
        USU_LOGADO: false
    };

    let Ajax_res = new Ajax('/select/universal', data).RequisicaoAjax(false)
    Ajax_res.then((array_de_dados) => {
        let dados = array_de_dados[0][0];
        new Tabela('tabeladados').InseriRegistros(dados);
        Salva();

    })

}

function Importar(e) {
    e.preventDefault()
    let CGC = document.getElementById('PARC_CGC_')
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
            // console.log( PARC_NASC.value)

            var tel = dados.telefone
            var telNew = tel.split('/');
            telefone.value = telNew[0];
            if (telNew[1]) {
                telefone2.value = telNew[1];
            }
            var selectedIndex = dados.uf
            UF.value = selectedIndex
            NOME_CID.value = dados.municipio
            let evento =  new Event('change');
            NOME_CID.dispatchEvent(evento);

        }
        else {
            swal({
                text: ajax.responseText,
                icon: 'error'
            });
        }
    };
    ajax.send(JsonData);
}
// Usando o filtro
document.getElementById('Buscar').addEventListener('click', Filtro, false);
//importando os dados
document.getElementById('IMPORTAR').addEventListener('click', Importar, false);

document.getElementById('form').addEventListener('submit', (e)=>{
    e.preventDefault();
     let dados = new Tabela().InputsValues(['PARC_NOME', 'PARC_N_RAZAO_SOCIAL', 'PARC_CGC_', 'PARC_IR_RG', 'PARC_EMAIL','PARC_NASC', 'PARC_TEL', 'PARC_TEL_2', 'PARC_TRABALHO_N',
                 'PARC_CEP_T','PARC_BAIRRO_T','ID_CID_F','PARC_LOGRA_T','PARC_NUM_T','PARC_COMP_T','PARC_TEL_T','PARC_SALARIO','PARC_ADMISSAO',
                 'PARC_CEP','ID_CID','PARC_BAIRRO','PARC_LOGRA','PARC_NUM', 'PARC_COMP','PARC_FORNEC','ESTADO'])
    let data = {
        sql: `BEGIN
             INSERI_PARCEIRO   (:PARC_NOME,:PARC_N_RAZAO_SOCIAL,:PARC_CGC_,:PARC_IR_RG,:PARC_EMAIL,:PARC_NASC,:PARC_TEL,:PARC_TEL_2,
                                      :PARC_TRABALHO_N,:PARC_CEP_T,:PARC_BAIRRO_T,:ID_CID_F,:PARC_LOGRA_T,:PARC_NUM_T,:PARC_COMP_T,:PARC_TEL_T,
                                      :PARC_SALARIO,:PARC_ADMISSAO,:PARC_CEP,:ESTADO,:ID_CID,:PARC_BAIRRO,:PARC_LOGRA,:PARC_NUM,:PARC_COMP,
                                      :PARC_FORNEC,:USU_LOGADO); END;`,
        binds: dados,
        mensagem_error: 'Error ',
        mensagem_sucess: 'Registro inserido com sucesso!',
        USU_LOGADO: true
    };
    console.log(data)

     new Ajax('/rota/universal', data).RequisicaoAjax(true,'form')
});

