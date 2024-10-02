import { ActionForm } from "../FormClass/ActionForm.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
import { Tabela } from "../Class/Tabela.js";
import { Ajax } from "../Class/Ajax.js";

new filtra_campo('ID_EMPRESA','NOME_EMPRESA','EMPRESAS').Filtra();
new filtra_campo('ID_GRUPO','NOME_GRUPO','GRP_GRUPO').Filtra();
new filtra_campo('ID_USUARIO','NOME_USUARIO','USU_USUARIO').Filtra();
new filtra_campo('ID_PARCEIRO','NOME_PARCEIRO','PRC_PARCEIRO').Filtra();
new filtra_campo('ID_NATUREZA','NOME_NATUREZA','NATUREZA').Filtra();

let ORCAMENTO = document.getElementById('ORCAMENTO');
let RESERVA_SALVAR = document.getElementById('RESERVA_SALVAR');
let ESTOQUE = document.getElementById('ESTOQUE');
let FINANCEIRO = document.getElementById('FINANCEIRO');
let BONIFICACAO = document.getElementById('BONIFICACAO');
let ID_EMPRESA = document.getElementById('ID_EMPRESA');
let TD_EMPRESAS = document.getElementById('TD_EMPRESAS');
let CARD_EMP = document.getElementById('CARD_EMP');

window.addEventListener('change',(e)=>{
    if(ORCAMENTO.checked){
        BONIFICACAO.checked = false;
        RESERVA_SALVAR.setAttribute('disabled',true)
        RESERVA_SALVAR.checked = false;
        ESTOQUE.setAttribute('disabled',true);
        ESTOQUE.value    = 'N';
        FINANCEIRO.setAttribute('disabled',true);
        FINANCEIRO.value = 'N';
    }else{
        RESERVA_SALVAR.removeAttribute('disabled')
        ESTOQUE.removeAttribute('disabled');
        FINANCEIRO.removeAttribute('disabled');
    }
})

window.addEventListener('change',(e)=>{
    if(BONIFICACAO.checked){
        ORCAMENTO.checked = false;
        ESTOQUE.setAttribute('disabled',true);
        ESTOQUE.value    = 'B';
        FINANCEIRO.setAttribute('disabled',true);
        FINANCEIRO.value = 'GFP';
    }
})

window.addEventListener('change',(e)=>{
    if(TD_EMPRESAS.checked){
        CARD_EMP.style.opacity = '0';
    }
    if(TD_EMPRESAS_ESP.checked){
        CARD_EMP.style.opacity = '1';
    }
})

new ActionForm('SalvarTop','TOP_MOVIMENTO').Insert();


let filtro = document.getElementById('filtro');
filtro.addEventListener('click',(e)=>{
    e.preventDefault();
    let objeto = new Tabela().InputsValues(['ID_FILTRO','DESC_FILTRO'])
    let data = {
        sql:`SELECT FILTRA_TOP(:ID_FILTRO,:DESC_FILTRO) FROM DUAL`,
        binds:objeto
    }
    new Ajax('/select/universal',data).RequisicaoAjax().then((dados_retornados)=>{
        new Tabela('Tops').InseriRegistros(dados_retornados);
    })
})

let ModalExcesaoRestricao = document.getElementById('ModalExcesaoRestricao');

ModalExcesaoRestricao.addEventListener('click',(e)=>{
    let tableTop = document.getElementById('TABLE_TOP')
    let RegistroSelecionado = tableTop.querySelector('.Selectedtr')
    let TdId = RegistroSelecionado.querySelector('td');
    let Id = TdId.textContent;
        
    let data = {
        sql:`SELECT  
        C.EMPRESA,
        C.USUARIO,
        C.GRUPO,
        C.PARCEIRO,
        C.NATUREZA 
         FROM TOP_CONFIG C
       WHERE C.ID_TOP = :P_ID`,
        binds:{P_ID:Id}
    }
    let DataAcesso = {
        sql:`
          SELECT 
           T.ID_TOP,
           T.ID_TIPO,
           T.TIPO,
           CASE
           WHEN T.TIPO = 'EMPRESA' THEN  (SELECT EMP.EMP_NOME FROM EMPRESAS EMP WHERE EMP.EMP_ID =   T.ID_TIPO  ) 
           WHEN T.TIPO = 'GRUPO'   THEN  (SELECT G.GRP_NOME FROM GRP_GRUPO G WHERE G.ID_GRUPO = T.ID_TIPO )
           WHEN T.TIPO = 'USUARIO' THEN  (SELECT U.USU_NOME FROM USU_USUARIO U WHERE U.ID_USU = T.ID_TIPO)
           WHEN T.TIPO = 'NATUREZA' THEN (SELECT N.NOME FROM NATUREZA N WHERE N.CODNAT = T.ID_TIPO)
           WHEN T.TIPO = 'PARCEIRO' THEN (SELECT P.PARC_NOME FROM PRC_PARCEIRO P WHERE P.ID_PARC = T.ID_TIPO)   
            ELSE 'SEM DEFINIÇÃO' END AS NOME_CAMPO
        FROM ACESSO_TOP T
       WHERE T.ID_TOP = :P_ID`,
        binds:{P_ID:Id}
    }
    function InseriRegistros(){
        new Ajax('/select/universal/objeto',DataAcesso).RequisicaoAjax().then((dados)=>{
            let EMPRESAS_TABLE = document.getElementById('EMPRESAS_TABLE');
            let USUARIOS_TABLE = document.getElementById('USUARIOS_TABLE');
            let GRUPO_TABLE = document.getElementById('GRUPO_TABLE');
            let PARCEIRO_TABLE = document.getElementById('PARCEIRO_TABLE');
            let NATUREZA_TABLE = document.getElementById('NATUREZA_TABLE');
            EMPRESAS_TABLE.innerHTML = ''
            USUARIOS_TABLE.innerHTML = ''
            GRUPO_TABLE.innerHTML = ''
            PARCEIRO_TABLE.innerHTML = ''
            NATUREZA_TABLE.innerHTML = ''
            dados.forEach(element => {
                if(element.TIPO == 'EMPRESA'){
                    let Tr = document.createElement('tr');
                    let Td = document.createElement('td');
                    let Td2 = document.createElement('td');
                    Td.textContent = element.ID_TIPO
                    Td2.textContent = element.NOME_CAMPO
                    Tr.appendChild(Td);
                    Tr.appendChild(Td2);
                    EMPRESAS_TABLE.appendChild(Tr);
                }
                if(element.TIPO == 'USUARIO'){
                    let Tr = document.createElement('tr');
                    let Td = document.createElement('td');
                    let Td2 = document.createElement('td');
                    Td.textContent = element.ID_TIPO
                    Td2.textContent = element.NOME_CAMPO
                    Tr.appendChild(Td);
                    Tr.appendChild(Td2);
                    USUARIOS_TABLE.appendChild(Tr);
                }
                if(element.TIPO == 'GRUPO'){
                    let Tr = document.createElement('tr');
                    let Td = document.createElement('td');
                    let Td2 = document.createElement('td');
                    Td.textContent = element.ID_TIPO
                    Td2.textContent = element.NOME_CAMPO
                    Tr.appendChild(Td);
                    Tr.appendChild(Td2);
                    GRUPO_TABLE.appendChild(Tr);
                }
                if(element.TIPO == 'PARCEIRO'){
                    let Tr = document.createElement('tr');
                    let Td = document.createElement('td');
                    let Td2 = document.createElement('td');
                    Td.textContent = element.ID_TIPO
                    Td2.textContent = element.NOME_CAMPO
                    Tr.appendChild(Td);
                    Tr.appendChild(Td2);
                    PARCEIRO_TABLE.appendChild(Tr);
                }
                if(element.TIPO == 'NATUREZA'){
                    let Tr = document.createElement('tr');
                    let Td = document.createElement('td');
                    let Td2 = document.createElement('td');
                    Td.textContent = element.ID_TIPO
                    Td2.textContent = element.NOME_CAMPO
                    Tr.appendChild(Td);
                    Tr.appendChild(Td2);
                    NATUREZA_TABLE.appendChild(Tr);
                }
    
            });
            let Val ={
              sql:`SELECT * FROM TOP_CONFIG T WHERE T.ID_TOP =  :Id`,
              binds:{Id:Id}
            }
            new Ajax('/select/universal/objeto',Val).RequisicaoAjax().then((dados)=>{
                let TD_EMPRESAS = document.getElementById('TD_EMPRESAS');
                let TD_EMPRESAS_ESP = document.getElementById('TD_EMPRESAS_ESP');
                let CARD_EMP = document.getElementById('CARD_EMP');
                console.table(dados[0])
                dados.forEach((e)=>{
                console.table(e.EMPRESA)
                if(e.EMPRESA == 'T'){
                     TD_EMPRESAS.checked = true;
                }
                if(e.EMPRESA == 'S'){
                     TD_EMPRESAS.checked = false;
                     TD_EMPRESAS_ESP.checked = true;
                     CARD_EMP.style.opacity = '0'

                }

                })



            })

    })};
    InseriRegistros();

// Adicionar registro
            let AD_EMPRESA = document.getElementById('AD_EMPRESA');
            AD_EMPRESA.addEventListener('click',(e)=>{
                let ID_EMPRESA = document.getElementById('ID_EMPRESA');
                let NOME_EMPRESA = document.getElementById('NOME_EMPRESA');
                if(ID_EMPRESA.value != '' && NOME_EMPRESA.value != '' ){
                    let DataInsertEmp = {
                        sql:`DECLARE
                             V_COUNT INT;
                             BEGIN
                             SELECT COUNT(*) INTO V_COUNT FROM ACESSO_TOP WHERE TIPO = 'EMPRESA' AND ID_TOP = :ID AND ID_TIPO = :ID_TIPO;
                             IF V_COUNT = 0 THEN
                             INSERT INTO ACESSO_TOP(ID_TOP,TIPO,ID_TIPO) VALUES(:ID,:TIPO,:ID_TIPO);
                             END IF;
                             COMMIT; 
                             END;`,
                        binds:{
                            ID:Id,
                            TIPO:'EMPRESA',
                            ID_TIPO:ID_EMPRESA.value
                        },
                      mensagem_error:'Erro ao inserir registro!'
                    }
    
                    new Ajax('/rota/universal',DataInsertEmp).RequisicaoAjax()
                    ID_EMPRESA.value = '';
                    NOME_EMPRESA.value = '';
                    InseriRegistros();
    
                            }
    
            })
// Exluir registro
    let EX_EMPRESA = document.getElementById('EX_EMPRESA')
    EX_EMPRESA.addEventListener('click',(e)=>{
        let tableTop = document.getElementById('TABLE_TOP')
        let RegistroSelecionado_ = tableTop.querySelector('.Selectedtr')
        let TdId_ = RegistroSelecionado_.querySelector('td');
        let Id_ = TdId_.textContent;
        let Table = document.getElementById('EMPRESAS_TABLE')
        let RegistroSelecionado = Table.querySelector('.Selectedtr')
        let TdId = RegistroSelecionado.querySelector('td');
        let IdRegistro = TdId.textContent;
        let DataDeleteEmp = {
            sql:`BEGIN
                 DELETE FROM ACESSO_TOP WHERE TIPO = 'EMPRESA' AND ID_TIPO = :ID_TIPO AND ID_TOP = :ID_TOP;
                 COMMIT; 
                 END;`,
            binds:{
                ID_TOP:Id_,
                ID_TIPO:IdRegistro
            },
          mensagem_error:'Erro ao excluir registro!'
        }
        console.log(DataDeleteEmp)
        new Ajax('/rota/universal',DataDeleteEmp).RequisicaoAjax()
        RegistroSelecionado.remove()
     })
})






