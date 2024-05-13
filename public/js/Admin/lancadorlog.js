
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";

function limpatbody (){
    let tbodies = document.querySelectorAll('tbody');
    tbodies.forEach((tbody) => {
        tbody.innerHTML = ''; // Limpa o conteúdo de cada tbody
    });
    console.log('-----------------------')
}

document.getElementById('NOME_TABELA').addEventListener('change', (() => {
    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let data = {
        sql: `SELECT FILTRA_TABL_2(:NOMETABELA) FROM DUAL`,
        binds: { NOMETABELA: NOME_TABELA.value },
        USU_LOGADO: false
    }
    new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_dados) => {
        limpatbody()
        new Tabela('dadostables').InseriRegistros(array_dados)
  
    })
}))

document.addEventListener('dragstart', (e) => {
    e.target.classList.add("dragging")
})

document.addEventListener('dragend', (e) => {
    e.target.classList.remove("dragging")
})

let tables = document.querySelectorAll('table');

tables.forEach((element) => {
    element.addEventListener('dragover', (e) => {
        const dragging = document.querySelector('.dragging');
        const applAfter = GetNewPosition(element, e.clientY);
        if (applAfter) {
            applAfter.inserAdjacentElement('afterend');
        } else {
            element.prepend(dragging)
        }

    })
})

function GetNewPosition(collun, posy) {
    const tables = collun.querySelectorAll(".item:not(.draggin)");
    let result;
    for (let refer_table of tables) {
        const box = refer_table.getBoundingClientRect();
        const boxCenter = box.y + box.heigth / 2;
        if (posy >= boxCenter) result = refer_table;
    }
    return result
}
function GerarLog() {
    document.getElementById('GerarLog').addEventListener('click', (e) => {

        let ID_REGISTRO = document.getElementById('ID_REGISTRO');
        let ID_USU_ALT = document.getElementById('ID_USU_ALT');
        let T_ID_REGISTRO = ID_REGISTRO.querySelectorAll('tr');
        let T_ID_USU_ALT = ID_USU_ALT.querySelectorAll('tr');

        let TableCamposLog = document.getElementById('TableCamposLog');
        let NOME_TRIGGER = document.getElementById('NOME_TRIGGER');
        let NOME_TABELA = document.getElementById('NOME_TABELA');
        let TABELA_LOG = document.getElementById('TABELA_LOG');
        let dadostables = document.getElementById('dadostables');
        let CamposLog = TableCamposLog.querySelectorAll('tr');


        if (T_ID_REGISTRO.length > 2) {
            swal({
                text: 'Selecione apenas um campo para ser o ID do registro!',
                icon: 'info'
            })
        } else {
            if (T_ID_USU_ALT.length > 2) {
                swal({
                    text: 'Selecione apenas um campo para ser o ID do usuário de alteração!',
                    icon: 'info'
                })
            } else {
                let ID_ALT = ''
                T_ID_USU_ALT.forEach((e) => {
                    if (e.innerText != 'Campo') {
                        ID_ALT += e.textContent
                    }
                });
                let ID_REGISTRO = ''
                T_ID_REGISTRO.forEach((e) => {
                    if (e.innerText != 'Campo') {
                        ID_REGISTRO += e.textContent
                    }
                });
                let CreatTable = `CREATE TABLE ${TABELA_LOG.value} (
                    CAMPO VARCHAR2(300),
                    VALOR_NOVO VARCHAR2(300), 
                    VALOR_ANTIGO VARCHAR2(300),
                    ID_REGISTRO INTEGER,
                    ID_USU_ALT INTEGER,
                    DT_ALTER TIMESTAMP
                ) `
                let CamposlogObjeto = ` 
                    CREATE  TRIGGER ${NOME_TRIGGER.value} \n BEFORE UPDATE ON ${NOME_TABELA.value} \n
                                         FOR EACH ROW 
                                         BEGIN  `
                CamposLog.forEach((element) => {
                    if (element.innerText != 'Campo') {
                        CamposlogObjeto += `\n IF :OLD.${element.textContent} <> :NEW.${element.textContent} THEN
                            INSERT INTO ${TABELA_LOG.value} (CAMPO,VALOR_ANTIGO,VALOR_NOVO,ID_REGISTRO,ID_USU_ALT,DT_ALTER) 
                            VALUES      ('${element.textContent}',:OLD.${element.textContent},:NEW.${element.textContent},:OLD.${ID_REGISTRO},:NEW.${ID_ALT},SYSDATE);
                            END IF; \n\n`
                    }

                })
                CamposlogObjeto += 'END;'
                console.log(CamposlogObjeto )
                let data = {
                    sql: CreatTable,
                    binds:{},
                    mensagem_sucess: 'Objeto gerado com sucesso',
                    mensagem_error:'Error',
                    USU_LOGADO: false
                }

            // new Ajax('/rota/universal',data).RequisicaoAjax()

            let data2 = {
                sql: CamposlogObjeto,
                binds:{},
                mensagem_sucess: 'Objeto gerado com sucesso',
                mensagem_error:'Error',
                USU_LOGADO: false
            }

            // new Ajax('/rota/universal',data2).RequisicaoAjax(true);
            TABELA_LOG.value = '';
            NOME_TRIGGER.value = '';
            NOME_TABELA.value = '';
            limpatbody()
            }
        }

    });
}

GerarLog()
