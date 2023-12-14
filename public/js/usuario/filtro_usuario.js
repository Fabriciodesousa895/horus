'use strict';
import { Tabela } from "../Class/Tabela.js";
(function readyJS(win, doc) {

    let gruposelct = document.getElementById('ID_GRUPO_FILTRO');
    let form = document.getElementById('filtro');
    let nome = document.getElementById('nome');
    let adm = document.getElementById('adm');
    let ativo = document.getElementById('ativo');
    new   Tabela('tabelausuario').VisualizaRegistro('/visualiza_usuario/',)
    function sendForm(evento) {
        evento.preventDefault();
        let selectedgrup = gruposelct.options[gruposelct.selectedIndex];
        let grupo = selectedgrup.value;

        let ajax = new XMLHttpRequest();
        let data = {
            P_NOME: nome.value,
            P_ADM: adm.checked ? 'S' : '',
            P_STATUS: ativo.checked ? 'S' : '',
            P_GRUPO: grupo
        };
        let jsonData = JSON.stringify(data);
        ajax.open('POST', '/filtro_usuario');
        ajax.setRequestHeader('Content-type', 'application/json');
  
        ajax.onreadystatechange = function () {
            if (ajax.status === 200) {
                 let array_de_dados = JSON.parse(ajax.responseText);
                 new   Tabela('tabelausuario').InseriRegistros(array_de_dados)
 
            } else {
                swal({
                    title: 'Error',
                    icon: 'error'
                });
            }
        };
        ajax.send(jsonData);
    }

    form.addEventListener('click', sendForm, false);
})(window, document);


// 'use strict';
// import { Tabela } from "../Class/Tabela.js";
// import { Ajax } from "../Class/Ajax.js";
// (function readyJS(win, doc) {

//     let gruposelct = document.getElementById('ID_GRUPO_FILTRO');
//     let form = document.getElementById('filtro');
//     let nome = document.getElementById('nome');
//     let adm = document.getElementById('adm');
//     let ativo = document.getElementById('ativo');
//     new   Tabela('tabelausuario').VisualizaRegistro('/visualiza_usuario/',1)
//     function sendForm(evento) {
//         evento.preventDefault();
//         let selectedgrup = gruposelct.options[gruposelct.selectedIndex];
//         let grupo = selectedgrup.value;

//         let data = {
//             P_NOME: nome.value,
//             P_ADM: adm.checked ? 'S' : '',
//             P_STATUS: ativo.checked ? 'S' : '',
//             P_GRUPO: grupo
//         };
  
//               let Ajax_res =   new   Ajax('/filtro_usuario',data).RequisicaoAjax()
//               console.log(Ajax_res)
//                 //  new   Tabela('tabelausuario').InseriRegistros(array_de_dados)
 
//     }

//     form.addEventListener('click', sendForm, false);
// })(window, document);
