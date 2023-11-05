let textarea = document.getElementById('sql');
let select = document.getElementById('select');
let SQL_TABLE = document.getElementById('SQL_TABLE');
let NOME = document.getElementById('NOME');
let TIPO = document.getElementById('TIPO');
let NULO = document.getElementById('NULO');
let DESCRICAO = document.getElementById('DESCRICAO');
let DEFAULT = document.getElementById('DEFAULT');
let table_table = document.getElementById('table_table');

select.addEventListener('change', () => {
    textarea.value += select.value;
});


document.getElementById('FORM').addEventListener('submit', (e) => {
    e.preventDefault();
    let nulo = NULO.checked ? ' NULL' : ' NOT NULL'
    if (TIPO.value != '' && NOME.value != '' && DESCRICAO.value != '') {
    SQL_TABLE.value += NOME.value + TIPO.value + nulo + ' DEFAULT ' + `${DEFAULT.value},`  

        let array = []
        let tipo = TIPO.value
        //adiciona os valores dos campos num array,para depois inserir na tabela
        tipo == ' INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY' ? tipo = 'Numero unico ' : tipo
        array.push(NOME.value, tipo, DESCRICAO.value, DEFAULT.value, nulo)
        const tr = document.createElement('tr');

        for (var i = 0; i < array.length; i++) {
            const td = document.createElement('td')
            td.innerText = array[i]
            tr.append(td)
        }
        table_table.appendChild(tr)
        TIPO.value = ''
        NOME.value = ''
        NULO.checked = false
        DESCRICAO.value = ''
        DEFAULT.value = ''
    }
})
