'use strict';
import { SalvaFiltro } from "../Class/Filtro.js";

(function readyJS(win, doc) {
    let FILTRO_NOME = document.getElementById('FILTRO_NOME');
    let FILTRO_COD = document.getElementById('FILTRO_COD')
    function Salva (){
        SalvaFiltro(181, FILTRO_NOME.value, FILTRO_COD.value,'','','','','','','','');
    }
    let tbody = document.getElementById('tabela');
    let NOME_UP = document.getElementById('NOME_UP');
    let ID_SELECIONADO = document.getElementById('ID_SELECIONADO');
    let COD_UP = document.getElementById('COD_UP');
    let EXCLUIR = document.getElementById('EXCLUIR')
    let DELETE = document.getElementById('DELETE_TOTAL')
    function SendForm(e) {
        e.preventDefault();
        let COD_DOMICILIO_FISCAL = document.getElementById('COD_DOMICILIO_FISCAL')
        let NOME = document.getElementById('NOME');
        if (COD_DOMICILIO_FISCAL.value != '' && NOME.value != '') {
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/rota/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            let data = {
                sql: `BEGIN INSERT INTO CIDADE(NOME,COD_DOMICILIO_FISCAL,ID_USU_INCLU,ID_USU_ALTER,DT_INCLUSAO,DT_ALTERACAO) VALUES (:NOME,:COD_DOMICILIO_FISCAL,:USU_LOGADO,:USU_LOGADO,SYSDATE,SYSDATE); COMMIT; END;`,
                binds: { NOME: NOME.value, COD_DOMICILIO_FISCAL: COD_DOMICILIO_FISCAL.value },
                mensagem_sucess: 'Registro inserido com sucesso!',
                mensagem_error: 'Houve um errro ao inserir o resgitro!',
                USU_LOGADO: true
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
        let FILTRO_NOME = document.getElementById('FILTRO_NOME');
        let FILTRO_COD = document.getElementById('FILTRO_COD')
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT FITRA_CIDADE(:FILTRO_COD,:FILTRO_NOME) FROM DUAL`,
            binds: {FILTRO_COD:FILTRO_COD.value,FILTRO_NOME:FILTRO_NOME.value},
            USU_LOGADO: false,
        };
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {
                tbody.innerText = '';
                let array_registros = JSON.parse(ajax.responseText);
                array_registros.forEach(rowData => {
                    const row = document.createElement("tr");
                    rowData.forEach(cellData => {
                        const cell = document.createElement("td");
                        cell.innerText = cellData;
                        row.appendChild(cell);
                    });
                    const cell = document.createElement("td");
                    const check = document.createElement('input');
                    check.type = 'checkbox';
                    cell.appendChild(check);
                    row.appendChild(cell);
                    tbody.appendChild(row);

                })
                document.getElementById('TOTAL').innerText = array_registros.length
            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'warning'
                })
        }
   
    }
    ajax.send(JsonData);
    Salva();
    }
  
    function Editaregistro(e) {
        e.preventDefault();
        if (NOME_UP.value != '' && COD_UP.value != '') {
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/rota/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            let data = {
                sql: `BEGIN UPDATE CIDADE SET NOME = '${NOME_UP.value}',
                                              COD_DOMICILIO_FISCAL = '${COD_UP.value}' ,
                                              ID_USU_ALTER = :USU_LOGADO,
                                              DT_ALTERACAO =  SYSDATE 
                                              WHERE ID = ${ID_SELECIONADO.value};COMMIT; END; `,
                binds: {},
                mensagem_error: "Error ao editar registro",
                mensagem_sucess: "Registro editado com sucesso!",
                USU_LOGADO: true
            };
            let JsonData = JSON.stringify(data)
            ajax.onreadystatechange = () => {
                if (ajax.status === 200) {
                    console.log()
                    swal({
                        text: ajax.responseText,
                        icon: 'warning'
                    })
                    NOME_UP.value = '';
                    ID_SELECIONADO.value = '';
                    COD_UP.value = '';

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
    function Excluiregistro(e) {
        e.preventDefault();
        let registros = [];
        let tr = document.querySelectorAll('tr');

        tr.forEach((e,index) => {
            if(index != 0){
                let checks = e.cells[3].querySelector('input[type="checkbox"]')
                let ID = e.cells[0].innerText
                checks.checked ? registros.push(ID) :     console.log('-');
            }
        })

        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/rota/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `BEGIN
            DELETE FROM CIDADE WHERE ID IN (${registros});
            COMMIT;
           END; `,
            binds: {},
            mensagem_error: "Error ao deletar registro",
            mensagem_sucess: "Registro(s) deletado(s) com sucesso!",
            USU_LOGADO: false
        };
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            if (ajax.status === 200) {
                swal({
                    text: ajax.responseText,
                    icon: 'warning'
                })
 
                tr.forEach((e, index) => {
                    if (index !== 0) { // Certifique-se de não remover o cabeçalho da tabela (linha 0).
                        let ID = e.cells[0].innerText;
                        if (ID.includes(registros)) {
                            e.remove();
                        }
                    }
                });

            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'warning'
                })

            }
        }
        ajax.send(JsonData)

    }

    tbody.addEventListener('dblclick', (e) => {
        let editar = document.getElementById('EDITAR');
        let elementoclicado = e.target;
        let elementopai = elementoclicado.parentNode;
        let ID = (elementopai.cells[0]).innerText
        let Nome = (elementopai.cells[1]).innerText
        let COD = (elementopai.cells[2]).innerText
        NOME_UP.value = Nome;
        ID_SELECIONADO.value = ID;
        COD_UP.value = COD;
        editar.click();
    })

    DELETE.addEventListener('change', () => {
        let checks = document.querySelectorAll('input[type="checkbox"]');

        checks.forEach((elemento) => {
            if (DELETE.checked) {
                elemento.checked = true; // Desmarque os checkboxes que estão marcados
            }
            if (!DELETE.checked) {
                elemento.checked = false; // Desmarque os checkboxes que estão marcados
            }
        });
    });



    document.getElementById('SALVA').addEventListener('click', SendForm, false)
    //Usando o filtro e inserindo os dados na tabela
    document.getElementById('Buscar').addEventListener('click', SendFiltro, false)
    //Para o usuário editar o registro
    document.getElementById('SALVA_EDICAO').addEventListener('click', Editaregistro, false)
    EXCLUIR.addEventListener('click', Excluiregistro, false)
})(window, document)