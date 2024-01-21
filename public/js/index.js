'use strict';
import { Ajax } from "./Class/Ajax.js";
let divs = document.querySelectorAll('.tarefas');
let MsgFooter = document.getElementById('msg-footer');
let BotaoModal = document.querySelector('.button-modal');
let MsgModal = document.querySelector('.msg_modal');
let INICIO = document.getElementById('INICIO')
let REMETENTE = document.getElementById('REMETENTE')
let PRAZO = document.getElementById('PRAZO')
let ID_TAREFA = document.getElementById('ID_TAREFA')
let srcarquivo = document.getElementById('srcarquivo')
let BtnDowload = document.getElementById('btndowload');

divs.forEach((e) => {
    e.addEventListener('click', () => {
        let ID = e.querySelector('input[type="hidden"]');
        let data = {
            sql: `SELECT
          TF_MSG,
          TO_CHAR(TF_DT_INCLU,'DD/MM/YY HH24:MM') AS DT_INCLU,
          TO_CHAR(TF_DT_PRAZO,'DD/MM/YY HH24:MM') AS PRAZO,
          USU.USU_NOME,
          TF_NIVEL,
          PATH,
          ID_TAREFA
          FROM TF_TAREFA TF
          INNER JOIN USU_USUARIO USU ON USU.ID_USU = TF.ID_USU_REM
          WHERE  ID_TAREFA = :ID`,
            binds: { ID: ID.value },
            mensagem_error: 'Houve um erro ao consultar a tarefa',
            rows: true
        }
        let data2 = {
            sql: `SELECT
          T.ROTA,
          T_NOME          
          FROM ITEM_TAREFA TF
          LEFT JOIN T_TELA T ON T.ID_TELA = TF.ID_TELA
          WHERE  ID_TAREFA = :ID`,
            binds: { ID: ID.value },
            mensagem_error: 'Houve um erro ao consultar a tarefa',
            rows: true
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((dados) => {
            let Array_dados = dados[0];
            MsgModal.innerHTML = Array_dados[0];
            INICIO.innerHTML = Array_dados[1];
            REMETENTE.innerHTML = Array_dados[3];
            PRAZO.innerHTML = Array_dados[2];
            srcarquivo.value = Array_dados[5];
            ID_TAREFA.value = Array_dados[6];
            let color;
            if (Array_dados[4] == 3) {
                color = 'rgb(186, 87, 87)'
            } else if (Array_dados[4] == 2) {
                color = 'rgb(152, 158, 79)'
            } else { color = 'rgb(107, 158, 71)' }
            srcarquivo.value == '' ?  BtnDowload.style.display = 'none' : BtnDowload.style.display = '';
            MsgFooter.style.backgroundColor = color
            new Ajax('/select/universal', data2).RequisicaoAjax(false).then((dados_lista) => {
                for (let i = 0; i < dados_lista.length; i++) {
                    let ul = document.createElement('ul');
                    let li = document.createElement('li');
                    let link = document.createElement('a');

                    link.href = dados_lista[i][0];
                    link.textContent = dados_lista[i][1];
                    link.target = '_blank';
                    link.style.color = 'black'

                    ul.appendChild(li).appendChild(link);
                    MsgModal.appendChild(ul);
                }
            })
            //somente após for feito a busca dos dados é ativado o modal
            BotaoModal.click()
        })
    })
})
BtnDowload.addEventListener('click', () => {
    let b = document.createElement('iframe');
    b.setAttribute('src', 'http://localhost:8050/dowload/img/ploads_tarefa/' + srcarquivo.value);
    document.querySelector('#baixar')
        .appendChild(b)
        .setAttribute('style', 'display:none')
})
document.getElementById('Finalizar').addEventListener('click', () => {
    let data =   {
        sql: `BEGIN UPDATE  TF_TAREFA SET TF_STATUS = 'F',DT_FINA = SYSDATE WHERE ID_TAREFA = :ID_TAREFA; COMMIT; END; `,
        binds: { ID_TAREFA: ID_TAREFA.value },
        mensagem_sucess: 'Tarefa concluida com sucesso!',
        mensagem_error: 'Error ao finalizar tarefa!',
        USU_LOGADO: false}
    new Ajax('/rota/universal',data).RequisicaoAjax(true);
    window.location.href = 'http://localhost:8050/'
})
