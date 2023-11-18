(function (win, doc) {
    'use strict'
    let bairro = document.getElementById('PARC_BAIRRO')
    let logradouro = document.getElementById('PARC_LOGRA')
    let numero = document.getElementById('PARC_NUM')
    let complemento = document.getElementById('PARC_COMP')
    let cep = document.getElementById('PARC_CEP')
    let nome = document.getElementById('PARC_NOME')
    let fantasia = document.getElementById('PARC_N_RAZAO_SOCIAL')
    let telefone = document.getElementById('PARC_TEL')
    let telefone2 = document.getElementById('PARC_TEL_2')
    let email = document.getElementById('PARC_EMAIL')
    let abertura = document.getElementById('PARC_NASC')
    let UF = document.getElementById('UF')
    function Filtro(e) {
        e.preventDefault();

        let inputs = document.querySelectorAll('input');
        let Select = document.getElementsByTagName("select");
        let Objeto = {};

        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            let id = input.id;
            if (input.type === 'checkbox') {
                let valor = input.checked ? 'S' : '';
                Objeto[id] = valor;
            } else {
                let valor = input.value;
                Objeto[id] = valor;
            }
        }

        // Percorre todos os selects e adiciona suas IDs e valores ao objeto
        for (let i = 0; i < Select.length; i++) {
            let id = Select[i].id;
            let valor = Select[i].value;
            Objeto[id] = valor;
        }

        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');

        let data = {
            sql: `SELECT FILTRO_PARC(:ID,:NOME_F,:CGC,:UF,:IE_RG_F,:ATIVO,:FORNECEDOR,:BLOQUEADOS) FROM DUAL`,
            binds: {
                ID: Objeto.ID,
                NOME_F: Objeto.NOME_F,
                CGC: Objeto.CGC,
                UF: Objeto.UF,
                IE_RG_F: Objeto.IE_RG_F,
                ATIVO: Objeto.ATIVO,
                FORNECEDOR: Objeto.FORNECEDOR,
                BLOQUEADOS: Objeto.BLOQUEADOS
            },
            mensage_error: 'Houve um erro ao consultar registros',
            rows: true,
            USU_LOGADO: false
        };

        let JsonData = JSON.stringify(data);

        ajax.onreadystatechange = () => {
            if (ajax.status === 200) {
                let tbody = document.getElementById('tbody')
                tbody.innerText = ''
                let arraydedados = JSON.parse(ajax.responseText);
                let dados = arraydedados[0][0];

                dados.forEach(Row => {
                    const tr = document.createElement('tr');
                    Row.forEach(Cell => {
                        const td = document.createElement('td');
                        td.innerText = Cell;
                        tr.appendChild(td)
                    })
                    tbody.appendChild(tr)
                });
                document.getElementById('TOTAL').innerText = dados.length

            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        };

        ajax.send(JsonData);

        console.log(Objeto);
    }

    function Importar(e) {
        e.preventDefault()
        let CGC = document.getElementById('PARC_CGC')
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/importar/dados');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = { CGC: CGC.value }
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            let dados = JSON.parse(ajax.responseText)

            if (ajax.status === 200) {
                bairro.value = dados.bairro;
                numero.value = dados.numero;
                complemento.value = dados.complemento;
                logradouro.value = dados.logradouro;
                cep.value = dados.cep;
                nome.value = dados.nome;
                fantasia.value = dados.fantasia;
                email.value = dados.email;
                var data = dados.abertura
                // var dataform = data.split('/');
                // var newdata = new Date(dataform[0],dataform[1]  ,dataform[2])
                // abertura.value = dados.newdata;
                var tel = dados.telefone
                var telNew = tel.split('/');
                telefone.value = telNew[0];
                if (telNew[1]) {
                    telefone2.value = telNew[1];
                }
                var selectedIndex = dados.uf
                UF.value = selectedIndex
                console.log(telNew.length)

            }

            else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        };
        ajax.send(JsonData);
    }
    function filtracidade() {
        let ID_CID = document.getElementById('ID_CID')
        let NOME_CID = document.getElementById('NOME_CID')
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            sql: `SELECT FILTRA_CIDADE(:NOME,:ID) FROM DUAL`,
            binds: {
                ID: ID_CID.value,
                NOME: NOME_CID.value,
            },
            mensage_error: 'Houve um erro ao consultar registros',
            rows: true,
            USU_LOGADO: false
        };
        let JsonData = JSON.stringify(data)
        console.log(ID_CID.value)
        ajax.onreadystatechange = () => {
            if (ajax.status == 200) {
                let res = JSON.parse(ajax.responseText)
                ID_CID.vallue = ''
                NOME_CID.vallue = ''
                swal({
                    text: res[0],
                    icon: 'success'
                });

            } else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        }

        ajax.send(JsonData)
    }

    // Usando o filtro
    document.getElementById('Buscar').addEventListener('click', Filtro, false);
    //importando os dados
    document.getElementById('IMPORTAR').addEventListener('click', Importar, false);
    //filtrando a cidade
    document.getElementById('ID_CID').addEventListener('change', filtracidade, false);
    document.getElementById('NOME_CID').addEventListener('change', filtracidade, false);

})(window, document)

