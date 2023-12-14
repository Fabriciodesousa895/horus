'use strict';
import { SalvaFiltro } from "../Class/Filtro.js";
import { Tabela } from "../Class/Tabela.js";

(function (win, doc) {
    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let DESCRICAO = document.getElementById('DESCRICAO')
    let NOME_TRIGGER = document.getElementById('NOME_TRIGGER')
    let NOME_PROCEDURE = document.getElementById('NOME_PROCEDURE')
    function Salva (){
        SalvaFiltro(118, NOME_TABELA.value, DESCRICAO.value,NOME_TRIGGER.value,NOME_PROCEDURE.value,'','','','','','');
    }
    new   Tabela('TABELA').VisualizaRegistro('/visualiza/dicionario/dados/',1);
    new   Tabela('tabelatrigger').VisualizaRegistro('/visualiza/dicionario/dados/trigger/',1);


    function ConsultaTabela(e) {
        e.preventDefault();
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
                new   Tabela('TABELA').InseriRegistros(array_dados)
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                })
            }
        };
        ajax.send(JsonData);
        Salva()
    }
    function FiltroTrigger(e) {
        e.preventDefault()
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT TRIGGER_NAME,TRIGGER_TYPE,TRIGGERING_EVENT,TABLE_NAME,STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME LIKE '%${NOME_TRIGGER.value}%'`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        let JsonData = JSON.stringify(data);
        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {
                let array_dados = JSON.parse(ajax.responseText);
                new   Tabela('tabelatrigger').InseriRegistros(array_dados)
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                })
            }
        }
        ajax.send(JsonData);
        Salva()
    }
    function FiltroProcedure(e) {
        e.preventDefault()
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT OBJECT_NAME FROM ALL_PROCEDURES AL,USER_PROCEDURES US WHERE AL.OBJECT_NAME = US.OBJECT_NAME AND US.OBJECT_TYPE= 'PROCEDURE' AND AL.OWNER = 'SYSTEM' AND  US.OBJECT_NAME LIKE   '%${NOME_PROCEDURE.value}%'`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        let JsonData = JSON.stringify(data);
        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {
                console.log(ajax.responseText)
                let array_dados = JSON.parse(ajax.responseText);
                let tbody = document.getElementById('tabelaprocedure');
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
        ajax.send(JsonData);
        Salva()
    }

    document.getElementById('BuscarFiltro').addEventListener('click', ConsultaTabela, false)
    document.getElementById('BuscarTrigger').addEventListener('click', FiltroTrigger, false)
    document.getElementById('Buscarprocedure').addEventListener('click', FiltroProcedure, false)
})(window, document)