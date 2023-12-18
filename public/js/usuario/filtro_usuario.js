'use strict';
import { Tabela } from "../Class/Tabela.js";
import { Ajax } from "../Class/Ajax.js";
    let gruposelct = document.getElementById('ID_GRUPO_FILTRO');
    let form = document.getElementById('filtro');
    let nome = document.getElementById('nome');
    let adm = document.getElementById('adm');
    let ativo = document.getElementById('ativo');
     new   Tabela('tabelausuario').VisualizaRegistro('/visualiza_usuario/',1);
    //  new Tabela('tabelausuario').ExportarRegistros('Buscar');
    
    function sendForm(evento) {
        evento.preventDefault();
        let selectedgrup = gruposelct.options[gruposelct.selectedIndex].value;
        let data = {
            P_NOME: nome.value,
            P_ADM: adm.checked ? 'S' : '',
            P_STATUS: ativo.checked ? 'S' : '',
            P_GRUPO: selectedgrup
        };
               new   Ajax('/filtro_usuario',data).RequisicaoAjax(false).then((array_de_dados)=>{
               new   Tabela('tabelausuario').InseriRegistros(array_de_dados)
              })
 
    }

    form.addEventListener('click', sendForm, false);
