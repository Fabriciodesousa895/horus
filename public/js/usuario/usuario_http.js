
'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { filtra_campo } from "../Class/Filtra_campo.js";

new filtra_campo('ID_PARC', 'PARC_NOME', 'PRC_PARCEIRO').Filtra()
new filtra_campo('ID_GRUPO', 'NOME_GRUPO', 'GRP_GRUPO').Filtra()
new filtra_campo('ID_VENDEDOR', 'VND_NOME', 'VND_VENDEDOR').Filtra()

let USU_NOME = document.getElementById('USU_NOME');
let ID_GRUPO = document.getElementById('ID_GRUPO');
let USU_SENHA = document.getElementById('USU_SENHA');
let ID_VENDEDOR = document.getElementById('ID_VENDEDOR');
let ID_PARC = document.getElementById('ID_PARC');
let CFG_USU_ALT_PARC = document.getElementById('CFG_USU_ALT_PARC');
let CFG_USU_CONF_CONFERE_CAIXA = document.getElementById('CFG_USU_CONF_CONFERE_CAIXA');
let CFG_USU_EXC_FIN = document.getElementById('CFG_USU_EXC_FIN');
let CFG_USU_FECHA_CAIXA = document.getElementById('CFG_USU_FECHA_CAIXA');
let CFG_USU_LIB_BLOQ_PARC = document.getElementById('CFG_USU_LIB_BLOQ_PARC');
let USU_ADM = document.getElementById('USU_ADM')
let BLOB = document.getElementById('BLOB')
let Salvausuario = document.getElementById('Salvausuario')

// Envia o formulário para o servidor em formato JSON
function sendForm(evento) {
  evento.preventDefault();
  console.log('data')
  // Verificando se os campos obrigatórios estão preenchidos
  // if (USU_NOME.checkValidity() && USU_SENHA.checkValidity() && ID_PARC.checkValidity() && ID_VENDEDOR.checkValidity ) {
  let data = {
    USU_NOME: USU_NOME.value,
    USU_SENHA: USU_SENHA.value,
    ID_VENDEDOR: ID_VENDEDOR.value,
    ID_GRUPO: ID_GRUPO.value,
    ID_PARC: ID_PARC.value,
    CFG_USU_ALT_PARC: CFG_USU_ALT_PARC.checked ? 'S' : 'N',
    CFG_USU_CONF_CONFERE_CAIXA: CFG_USU_CONF_CONFERE_CAIXA.checked ? 'S' : 'N',
    CFG_USU_LIB_BLOQ_PARC: CFG_USU_LIB_BLOQ_PARC.checked ? 'S' : 'N',
    CFG_USU_FECHA_CAIXA: CFG_USU_FECHA_CAIXA.checked ? 'S' : 'N',
    CFG_USU_EXC_FIN: CFG_USU_EXC_FIN.checked ? 'S' : 'N',
    USU_ADM: USU_ADM.checked ? 'S' : 'N',
    IMG: BLOB

  };
  let info = true
  let Ajax_res = new Ajax('/usuario', data)
  Ajax_res.RequisicaoAjax(info)

  // }
  // 
}

Salvausuario.addEventListener('click', sendForm, false);

