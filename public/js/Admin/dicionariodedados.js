(function (win, doc) {
    'use strict';
    // import {Filtro} from ('../Class/Filtro.js');

    function ConsultaTabela(e) {
        e.preventDefault();
        let NOME_TABELA = document.getElementById('NOME_TABELA')
        let DESCRICAO = document.getElementById('DESCRICAO')
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT * FROM TABELA_BANCO WHERE TAB_NOME LIKE '%${NOME_TABELA.value}%' AND (TAB_DESCRICAO LIKE '%${DESCRICAO.value}%' OR TAB_DESCRICAO IS NULL )`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        let JsonData = JSON.stringify(data);
        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {
                let array_dados = JSON.parse(ajax.responseText);
                let tbody = document.querySelector('tbody');
                tbody.innerText = '';
                array_dados.forEach(RowData => {
                    const row = document.createElement('tr');
                    RowData.forEach(cellData => {
                        let cell = document.createElement('td');
                        cell.innerText = cellData;
                        row.appendChild(cell);
                    })
                    tbody.appendChild(row);
                });
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                })
            }
        };
        ajax.send(JsonData);
        // new Filtro(118, NOME_TABELA.value, DESCRICAO.value).SalvaFiltro();
    }
    function FiltroTrigger(e){
        e.preventDefault()
        let NOME_TRIGGER = document.getElementById('NOME_TRIGGER')
   let ajax = new XMLHttpRequest();
   ajax.open('POST','/select/universal');
   ajax.setRequestHeader('Content-type','application/json');
   let data =  {
    sql: `SELECT TRIGGER_NAME,TRIGGER_TYPE,TRIGGERING_EVENT,TABLE_NAME,STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME LIKE '%${NOME_TRIGGER.value}%'`,
    binds: {},
    mensage_error: 'Não foi encontrado registros!',
    rows: true
}
   let JsonData = JSON.stringify(data);
   ajax.onreadystatechange = ()=>{
    if (ajax.status == 200) {
        console.log(ajax.responseText)
        let array_dados = JSON.parse(ajax.responseText);
        let tbody = document.getElementById('tabelatrigger');
        tbody.innerText = '';
        array_dados.forEach(RowData => {
            const row = document.createElement('tr');
            RowData.forEach(cellData => {
                let cell = document.createElement('td');
                cell.innerText = cellData;
                row.appendChild(cell);
            })
            tbody.appendChild(row);
        });
    } else {
        swal({
            text: ajax.responseText,
            icon: 'error'
        })
    }
   }
   ajax.send(JsonData)
    }

    document.getElementById('BuscarFiltro').addEventListener('click', ConsultaTabela, false)
    document.getElementById('BuscarTrigger').addEventListener('click', FiltroTrigger, false)
})(window, document)