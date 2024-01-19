'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
function Filtra() {
    let dados = new Tabela('tabelatoken').InputsValues(['ID_TELA', 'NOME_USU', 'P_FIM', 'P_INICIO'], false)
    let data = {
        sql: 'SELECT FILTRA_HIST(:ID_TELA,:NOME_USU,:P_INICIO,:P_FIM)  FROM DUAL',
        binds: dados,
        mensagem_error: 'Error ao consultar registros',
        rows: true,
        USU_LOGADO: false
    }
    let conection = new Ajax('/select/universal', data).RequisicaoAjax(true)
    conection.then((array_de_dados) => {
        let dados = array_de_dados[0][0];
        new Tabela('tabelatoken').InseriRegistros(dados)
    })
}
document.getElementById('Buscar').addEventListener('click', (e) => {
    e.preventDefault()
    Filtra()
    console.log(new Tabela('tabelatoken').InputsValues(['ID_TELA', 'NOME_USU', 'P_FIM', 'P_INICIO'], false))
}, false)