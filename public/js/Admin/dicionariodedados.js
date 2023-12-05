(function (win, doc) {
    'use strict';
    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let DESCRICAO = document.getElementById('DESCRICAO')
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
        salvafiltro();
    }

    function salvafiltro() {
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/rota/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `BEGIN HIST_FILTROS(:P_ID_TELA,
                :USU_LOGADO,
                :P_CAMP_1,
                :P_CAMP_2,
                :P_CAMP_3,
                :P_CAMP_4,
                :P_CAMP_5,
                :P_CAMP_6,
                :P_CAMP_7,
                :P_CAMP_8,
                :P_CAMP_9,
                :P_CAMP_10
                ); END;`,
            binds: {
                P_ID_TELA: 118,
                P_CAMP_1: NOME_TABELA.value,
                P_CAMP_2: DESCRICAO.value,
                P_CAMP_3: '',
                P_CAMP_4: '',
                P_CAMP_5: '',
                P_CAMP_6: '',
                P_CAMP_7: '',
                P_CAMP_8: '',
                P_CAMP_9: '',
                P_CAMP_10: ''
            },
            mensagem_sucess: 'OK',
            mensagem_error: 'Houve um erro ao salvar os regitros!',
            USU_LOGADO: true
        }
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            if (ajax.status === 200) {
     
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        }
        ajax.send(JsonData)
    }

    document.getElementById('Buscar').addEventListener('click', ConsultaTabela, false)
})(window, document)