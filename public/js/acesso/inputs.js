(function readyJS(win, doc) {
    'use strict';
    let ID = document.getElementById('ID_USU');
    let NOME = document.getElementById('USU_NOME');
    let TABELA = document.getElementById('TABELA');
    let PROGRESSO = document.getElementById('PROGRESSO');


    function sendForm() {
        let ajax = new XMLHttpRequest();
        let data = {
            ID: ID.value,
            TABELA: TABELA.value
        };
        let jsonData = JSON.stringify(data);
        ajax.open('POST', '/grupousuario');
        ajax.setRequestHeader('Content-type', 'application/json');
        //mostra ao usuário a barra de progresso
        PROGRESSO.style.opacity = '1'
        ajax.onreadystatechange = function () {
            if (ajax.status === 200) {
                NOME.value = ajax.responseText
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';
            } else {
                swal({
                    title: ajax.responseText,
                    icon: 'error'
                })
                ID.value = '';
                NOME.value = '';
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';
            }
        }
        ajax.send(jsonData)
    }
    ID_USU.addEventListener('change', sendForm, false)
})(window, document);