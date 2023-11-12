(function readyJS(win, doc) {
    'use strict';
    let COUNT = 0
    function SendForm(e) {
        e.preventDefault();
        let COD_DOMICILIO_FISCAL = document.getElementById('COD_DOMICILIO_FISCAL')
        let NOME = document.getElementById('NOME');
        if (COD_DOMICILIO_FISCAL.value != '' && NOME.value != '') {
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/rota/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            let data = {
                sql: `BEGIN INSERT INTO CIDADE(NOME,COD_DOMICILIO_FISCAL) VALUES (:NOME,:COD_DOMICILIO_FISCAL); COMMIT; END;`,
                binds: { NOME: NOME.value, COD_DOMICILIO_FISCAL: COD_DOMICILIO_FISCAL.value },
                mensagem_sucess: 'Registro inserido com sucesso!',
                mensagem_error: 'Houve um errro ao inserir o resgitro!',
                USU_LOGADO: false
            };
            let JsonData = JSON.stringify(data)
            ajax.onreadystatechange = () => {
                if (ajax.status === 200) {
                    console.log()
                    swal({
                        text: ajax.responseText,
                        icon: 'warning'
                    })

                    COD_DOMICILIO_FISCAL.value = '';
                    NOME.value = '';
                } else {
                    swal({
                        text: ajax.responseText,
                        icon: 'warning'
                    })

                }
            }
            ajax.send(JsonData)
        }
    }
    function SendFiltro(e) {
        e.preventDefault();
        let FILTRO_COD = document.getElementById('FILTRO_COD')
        let PROGRESSO = document.getElementById('PROGRESSO');
        let FILTRO_NOME = document.getElementById('FILTRO_NOME');
        let tbody = document.getElementById('tabela');
        //mostra ao usuário a barra de progresso
        PROGRESSO.style.opacity = '1'

        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT * FROM CIDADE WHERE  COD_DOMICILIO_FISCAL LIKE  '%${FILTRO_COD.value}%' AND ( NOME LIKE '%${FILTRO_NOME.value}%' OR NOME  IS NULL)`,
            binds: {},
            mensage_error: 'Houve um errro ao consultar so resgitros!',
            USU_LOGADO: false,
            rows: true
        };

        let JsonData = JSON.stringify(data)

        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {

                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';
                tbody.innerText = '';
                let array_registros = JSON.parse(ajax.responseText);

                array_registros.forEach(rowData => {
                    const row = document.createElement("tr");
                    rowData.forEach(cellData => {
                        const cell = document.createElement("td");
                        cell.innerText = cellData;
                        row.appendChild(cell);
                    });
                    tbody.appendChild(row);

                })
                document.getElementById('TOTAL').innerText = array_registros.length
                console.log(array_registros.length)
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'warning'
                })
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';

            }

        }
        ajax.send(JsonData)

    }

    function ImportarDados(e) {
        e.preventDefault();
        let NOME = document.getElementById('NOME');
        if (NOME.value != '') {
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/importar/cod/municipio');
            ajax.setRequestHeader('Content-type', 'application/json');
            let data = { NOME: NOME.value };
            let JsonData = JSON.stringify(data)
            ajax.onreadystatechange = () => {
                if (ajax.status === 200) {
                    console.log()
                    swal({
                        text: ajax.responseText,
                        icon: 'warning'
                    })

                } else {
                    swal({
                        text: ajax.responseText,
                        icon: 'warning'
                    })

                }
            }
            ajax.send(JsonData)
        }
    }





    document.getElementById('SALVA').addEventListener('click', SendForm, false)
    document.getElementById('IMPORTAR').addEventListener('click', ImportarDados, false)
    document.getElementById('Buscar').addEventListener('click', SendFiltro, false)
})(window, document)