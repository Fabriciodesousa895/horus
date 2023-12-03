let textarea = document.getElementById('sql');
let select = document.getElementById('select');
let SQL_TABLE = document.getElementById('SQL_TABLE');
let NOME = document.getElementById('NOME');
let TIPO = document.getElementById('TIPO');
let NULO = document.getElementById('NULO');
let DEFAULT = document.getElementById('DEFAULT');
let table_table = document.getElementById('table_table');
let NOME_TABLE = document.getElementById('NOME_TABLE');
let DESCRICAO = document.getElementById('DESCRICAO');
let SQL = ''
let count = 0
//Quando o usuário selecionar Numero unico no select
select.addEventListener('change', () => {
    textarea.value += select.value;
});
//Quando o usuário selecionar o tipo de dado do campo
TIPO.addEventListener('change', () => {
    if (TIPO.value == ' INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY') {
        document.getElementById('OMITE').style.display = 'none';
    } else {
        document.getElementById('OMITE').style.display = '';

    }
});

//Quando o usuário inseri um novo campo
document.getElementById('FORM').addEventListener('submit', (e) => {
    e.preventDefault();
    let tipo = TIPO.value;

    let nulo = NULO.checked ? ' NULL' : ' NOT NULL'
    if (TIPO.value != '' && NOME.value != '' && DESCRICAO.value != '' && NOME_TABLE.value != '') {
        if (tipo == ' INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY') {
            SQL += `${NOME.value} ${TIPO.value}  ${nulo},\n `;
        } else {
            SQL += `${NOME.value} ${TIPO.value} DEFAULT '${DEFAULT.value}' ${nulo},\n `;

        }
        let array = [];
        tipo == ' INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY' ? tipo = 'Número único' : tipo;

        array.push(NOME.value, tipo, DESCRICAO.value, DEFAULT.value, nulo);

        const tr = document.createElement('tr');

        for (var i = 0; i < array.length; i++) {
            const td = document.createElement('td')
            td.innerText = array[i]
            tr.append(td)
        }
        table_table.appendChild(tr);
        TIPO.value = '';
        NOME.value = '';
        NULO.checked = false;
        DEFAULT.value = '';
    }

}

)
//Quando o usuário clicar em Gerar DDL 
document.getElementById('GERA_SQL').addEventListener('click', () => {
    if (table_table.rows.length != 0) {
        let ultimaVirgulaIndex = SQL.lastIndexOf(',');
        document.getElementById('EXECUTAR').style.display = ''
        if (ultimaVirgulaIndex !== -1) {
            // Remove a última vírgula
            let textoSemUltimaVirgula = SQL.slice(0, ultimaVirgulaIndex) + SQL.slice(ultimaVirgulaIndex + 1);
            SQL_TABLE.value = ` CREATE TABLE ${NOME_TABLE.value}( ${textoSemUltimaVirgula} )`
            document.getElementById('sql_sql').value = `INSERT INTO TABELA_BANCO (TAB_NOME,TAB_DESCRICAO) VALUES('${NOME_TABLE.value}','${DESCRICAO.value}')`
            DEFAULT.value = '';
        }
    }

})
document.getElementById('LIMPAR').addEventListener('click', () => {
    table_table.innerText = '';
    SQL = '';
    NOME_TABLE.value = '';
    DEFAULT.value = '';
    DESCRICAO.value = '';
    TIPO.value = '';
    NOME.value = '';
    SQL_TABLE.value = '';
})