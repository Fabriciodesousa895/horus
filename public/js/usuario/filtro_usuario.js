(function readyJS(win, doc) {
    'use strict';

    let gruposelct = document.getElementById('ID_GRUPO_FILTRO');
    let form = document.getElementById('filtro');
    let nome = document.getElementById('nome');
    let adm = document.getElementById('adm');
    let ativo = document.getElementById('ativo');
    let linha = document.getElementById('linha');

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
 

                 let data = JSON.parse(ajax.responseText);

                 const tbody = document.querySelector("tbody");
                 tbody.innerText = ''

                 data.forEach(rowData => {
                     const row = document.createElement("tr");
                     rowData.forEach(cellData => {
                         const cell = document.createElement("td");
                         cell.innerText = cellData;
                         row.appendChild(cell);
                     });
                         const cell = document.createElement("td");
                         cell.innerText = '';
                         row.appendChild(cell);




                     tbody.appendChild(row)
                  ;})
                


            } else {
                swal({
                    title: 'Error',
                    icon: 'error'
                });
            }
        };
        ajax.send(jsonData);
    }

    form.addEventListener('submit', sendForm, false);
})(window, document);
