let textarea = document.getElementById('sql');
let select = document.getElementById('select');
let SQL_TABLE = document.getElementById('SQL_TABLE');
let NOME = document.getElementById('NOME');
let TIPO = document.getElementById('TIPO');
let tipo = TIPO.options[TIPO.selectedIndex].innerText

let NULO = document.getElementById('NULO');
let DESCRICAO = document.getElementById('DESCRICAO');
let DEFAULT = document.getElementById('DEFAULT');
let table_table = document.getElementById('table_table');

select.addEventListener('change', () => {
    textarea.value += select.value;
});


document.getElementById('FORM').addEventListener('submit', (e) => {
    e.preventDefault();
    let nulo = NULO.checked ? 'NULL' : 'NOT NULL'
    let array = []
    //adiciona os valores dos campos num array,para depois inserir na tabela
    array.push(NOME.value, tipo, DESCRICAO.value, DEFAULT.value, nulo)
    const tr = document.createElement('tr');

    for (var i = 0; i < array.length; i++) {
        const td = document.createElement('td')
        td.innerText = array[i]
        tr.append(td)
    }
    table_table.appendChild(tr)
    console.log(array)

    TIPO.value = ''
    NOME.value = ''
    NULO.checked = false
    DESCRICAO.value = ''
    DEFAULT.value = ''
})
