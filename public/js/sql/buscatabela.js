(function readJS(win, doc) {
    'use sctrict';
    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let PROGRESSO = document.getElementById('PROGRESSO')
    //quando houver um change no input,é feita a consulta da tabela na base de dados
    function sendForm() {
        //mostra ao usuário a barra de progresso
        PROGRESSO.style.opacity = '1';
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/sql/buscatabela')
        ajax.setRequestHeader('Content-type', 'application/json');
        let objeto = { NOME_TABELA: NOME_TABELA.value }
        let data = JSON.stringify(objeto)

        ajax.onreadystatechange = () => {
            if (ajax.status === 200) {
                let tbody = document.getElementById('tbody');
                tbody.innerText = '';
                let data = JSON.parse(ajax.responseText)
                data.forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const cell = document.createElement('td');
                        cell.innerText = cellData;
                        row.appendChild(cell);
                    });
                    tbody.appendChild(row);
                });
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';

            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'warning'
                })
                //omite do usuário a barra de progresso

                PROGRESSO.style.opacity = '0';

            }
        }
        ajax.send(data)
    }
    NOME_TABELA.addEventListener('change', sendForm, false)
})(window, document)