import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { ActionForm } from "../FormClass/ActionForm.js";
import { SalvaFiltro } from "../Class/Filtro.js";
//Inserindo um novo registro
let ActionInstancia = new ActionForm('form','GRP_GRUPO');
ActionInstancia.Insert()
ActionInstancia.delete('ID_GRUPO')
//Filtrando registros
document.getElementById('filtro').addEventListener('click', (e) => {
  e.preventDefault();
  let ValuesCampos = new Tabela().InputsValues(['ID_GRUPO', 'NOME_GRUPO', 'DESCRICAO_GRUPO']);
  new SalvaFiltro(119, ValuesCampos.ID_GRUPO, ValuesCampos.NOME_GRUPO, ValuesCampos.DESCRICAO_GRUPO, '', '', '', '', '', '', '', '', '', '')
  let data = {
    sql: `SELECT FILTRA_GRUPO(:ID_GRUPO,:NOME_GRUPO,:DESCRICAO_GRUPO) FROM DUAL`,
    binds: ValuesCampos
  }
  new Ajax('/select/universal', data).RequisicaoAjax().then((arrya_de_dados) => {
    new Tabela('TabelaGrupo').InseriRegistros(arrya_de_dados);
  })
})

