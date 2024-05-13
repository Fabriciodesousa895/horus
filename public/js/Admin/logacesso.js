'use strict';
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
function Filtra() {
    let dados = new Tabela('tabelatoken').InputsValues(['NOME_USU', 'P_FIM', 'P_INICIO'], false);
    let P_INI = (dados.P_INICIO).split('-');
    let P_INI_SPLIT = `${P_INI[2]}-${P_INI[1]}-${P_INI[0]}`
    let P_FIM = (dados.P_FIM).split('-');
    let P_FIM_SPLIT = `${P_FIM[2]}-${P_FIM[1]}-${P_FIM[0]}`

    new SalvaFiltro(222,dados.NOME_USU,P_INI_SPLIT,P_FIM_SPLIT,'','','','','','','')
    let data = {
        sql: 'SELECT FILTRA_HIST(:P_NOME_USU,:P_INICIO,:P_FIM)  FROM DUAL',
        binds: {P_FIM:dados.P_FIM,P_INICIO:dados.P_INICIO,P_NOME_USU:dados.NOME_USU},
        mensagem_error: 'Error ao consultar registros',
        rows: true,
        USU_LOGADO: false
    }
    let conection = new Ajax('/select/universal', data).RequisicaoAjax(false)
    conection.then((array_de_dados) => {

        new Tabela('tabelatoken').InseriRegistros(array_de_dados)
    })
}
document.getElementById('Buscar').addEventListener('click', (e) => {
    e.preventDefault();
    Filtra();
    selecionasessao();
}, false);

function selecionasessao() {
    let table = document.getElementById('tabelatoken');
      table.addEventListener('click',(e)=>{
        let data = {
            sql: 'SELECT FILTRA_TELA(:P_ID) FROM DUAL',
            binds: {P_ID:e.target.parentNode.cells[0].textContent},
            mensagem_error: 'Error ao consultar registros',
            rows: true,
            USU_LOGADO: false
        }
        new Ajax('/select/universal',data).RequisicaoAjax().then((array_de_dados)=>{
            new Tabela('tabeladados').InseriRegistros(array_de_dados)
        })
        console.log(e.target.parentNode.cells[0].textContent);
      })
};


