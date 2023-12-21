
'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
new filtra_campo('ID_PARC', 'PARC_NOME', 'PRC_PARCEIRO').Filtra()
new filtra_campo('ID_GRUPO', 'NOME_GRUPO', 'GRP_GRUPO').Filtra()
new filtra_campo('ID_VENDEDOR', 'VND_NOME', 'VND_VENDEDOR').Filtra()
new filtra_campo('ID_GRUPO_F', 'NOME_GRUPO_F', 'GRP_GRUPO').Filtra()
let Salvausuario = document.getElementById('Salvausuario')
function sendForm(evento) {
  evento.preventDefault();
  console.log('data')
  // Verificando se os campos obrigatórios estão preenchidos
  // if (USU_NOME.checkValidity() && USU_SENHA.checkValidity() && ID_PARC.checkValidity() && ID_VENDEDOR.checkValidity ) {
  let Ajax_res = new Ajax('/usuario', (new Tabela('tabelausuario')
    .InputsValues(['USU_NOME', 'ID_GRUPO', 'USU_SENHA', 'ID_VENDEDOR', 'ID_PARC',
    'CFG_USU_ALT_PARC', 'CFG_USU_CONF_CONFERE_CAIXA', 'CFG_USU_EXC_FIN', 'CFG_USU_FECHA_CAIXA',
    'CFG_USU_LIB_BLOQ_PARC', 'USU_ADM'])))
  Ajax_res.RequisicaoAjax(true)

  // }
  // 
}
Salvausuario.addEventListener('click', sendForm, false);

