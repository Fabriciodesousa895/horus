'use strict';
import { Tabela } from "../Class/Tabela.js";
import { Ajax } from "../Class/Ajax.js";
new Tabela('tabelausuario').VisualizaRegistro('/visualiza_usuario/', 1);
function sendForm() {
    new Ajax('/filtro_usuario',(new Tabela('tabelausuario').InputsValues(['ID_GRUPO_F', 'nome', 'adm', 'ativo']))).RequisicaoAjax(false).then((array_de_dados) => {
    new Tabela('tabelausuario').InseriRegistros(array_de_dados);
    })
}
document.getElementById('filtro').addEventListener('click', sendForm, false);
