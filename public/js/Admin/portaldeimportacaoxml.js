
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { FiltraCampos} from "../Class/FiltraCampos.js"
let SalvarXml = document.getElementById('SalvarXml');
let filtro = document.getElementById('filtro');
let Relacionamento = document.getElementById('Relacionamento');
let Reprocessar = document.getElementById('Reprocessar');
let CadastroSimplificado = document.getElementById('CadastroSimplificado');
let XmlImportados = document.getElementById('XmlImportados');
let RegistroSelecionado;

SalvarXml.addEventListener('click', (e) => {
    e.preventDefault();
    let ArquivoXml = document.getElementById('ArquivoXml');
    let ArquivoXmlFile = ArquivoXml.files[0];
    if (ArquivoXmlFile) {
        const LerXml = new FileReader();
        LerXml.onload = (e) => {
            const XmlString = e.target.result;
            let data = {
        sql: `DECLARE
              L_CLOB CLOB;
              L_XML XMLTYPE;
              V_ID INT;
              BEGIN
              L_CLOB := :XmlString;
              -- Converter o CLOB para XMLTYPE
              L_XML := XMLTYPE(L_CLOB);
              -- InsirIR o XMLTYPE na tabela
              INSERT INTO XML (XML,USU_INCLU,DT_INCLU) VALUES (L_XML,:USU_LOGADO,SYSDATE)
              RETURNING ID INTO V_ID;
               ENTRADA_XML(V_ID,:USU_LOGADO);
              COMMIT;
              END;
`,
                binds: {XmlString:XmlString},
                USU_LOGADO: true,
                mensagem_sucess:'Xml importado para o sistema!'
            }

            new Ajax('/rota/universal', data).RequisicaoAjax(true);
        }
        LerXml.readAsText(ArquivoXmlFile)

    }
})
Reprocessar.addEventListener('click', (e) => {
    ReprocesarXml(true);    
})
CadastroSimplificado.addEventListener('click', (e) => {
    CadastroSimplificadoFun();  
    RelacionamentoFunc()
})

Relacionamento.addEventListener('click',(e)=>{ 
    RelacionamentoFunc()
})
function ReprocesarXml(valida) {
    let TrSelecionado = XmlImportados.querySelector('.Selectedtr');
    let TdId = TrSelecionado.querySelector('td');
    let Id = TdId.textContent;
    RegistroSelecionado = Id
             let data = {
            sql: `BEGIN
                REPROCESSA_XML(:RegistroSelecionado,:USU_LOGADO);
                COMMIT;
                END;`,
                binds: {RegistroSelecionado:RegistroSelecionado},
                USU_LOGADO: true,
                mensagem_sucess:'Xml validado!'
            }
           if(valida){
            new Ajax('/rota/universal', data).RequisicaoAjax(true);
           }else{
            new Ajax('/rota/universal', data).RequisicaoAjax(false);
           }
}

filtro.addEventListener('click',(e)=>{
    e.preventDefault();
    Reprocessar.setAttribute('disabled',true);
    Relacionamento.setAttribute('disabled',true);
    CadastroSimplificado.setAttribute('disabled',true);
    let Objeto = new Tabela().InputsValues(['ModeloNota','StatusXml','CNPJ_EMIT','NrNota','ChaveAcesso'])
    let data = {
        sql:`SELECT FILTRA_XML(:ChaveAcesso,:NrNota,:CNPJ_EMIT,:StatusXml,:ModeloNota) FROM DUAL`,
        binds:Objeto
    }
    new Ajax('/select/universal',data).RequisicaoAjax().then((dados)=>{
        new Tabela('XmlImportados').InseriRegistros(dados);
        let XmlImportados = document.getElementById('XmlImportados')
        let Trs = XmlImportados.querySelectorAll('tr');
        Trs.forEach((elemento_corrente)=>{
            elemento_corrente.addEventListener('click',(e,index)=>{
                let IdXmlSelecionado = e.target.parentNode.cells[0].textContent;
                let data = {
                    sql:`SELECT FILTRA_XML_ERROR(:IdXml) FROM DUAL`,
                    binds:{IdXml:IdXmlSelecionado}
                }
         
                    new Ajax('/select/universal',data).RequisicaoAjax().then((dados_retornados)=>{
                        document.getElementById('TextArea').value = dados_retornados[0];
                        if(dados_retornados[0][0] == null){
                            CadastroSimplificado.setAttribute('disabled',true);
                            Relacionamento.removeAttribute('disabled')

                        }else{
                            Reprocessar.removeAttribute('disabled')
                            Relacionamento.removeAttribute('disabled')
                            CadastroSimplificado.removeAttribute('disabled')
                        }
                    })
                

        
            })
        })
    })
   
})


function RelacionamentoFunc () {
    let  RegistroSelecionado = RegistroSelecionado_();
    let data = {
    sql:`SELECT FILTRA_RELACIONAMENTO(:IdXml) FROM DUAL`,
    binds:{IdXml:RegistroSelecionado}
}
 new Ajax('/select/universal',data).RequisicaoAjax().then((dados_retornados)=>{
    // console.table(dados_retornados)
    let table_ = document.getElementById('RelacionamentoTabela')
    let Tbody = table_.querySelector('tbody')
    Tbody.innerText = '';
    dados_retornados.forEach((RowData,index) => {
      const row = document.createElement('tr');
      RowData.forEach((cellData,indexecell) => {
        let cell = document.createElement('td');
        let input = document.createElement('input');
         if (indexecell == 0 || indexecell == 1 || indexecell == 2 ){
           input.disabled = true
        }
        input.type = 'text';
        input.value = cellData;
        input.className = 'form-control';
        cell.appendChild(input)
        row.appendChild(cell);
      })
      Tbody.appendChild(row);
    })
    

 })
}



document.getElementById('SalvaRel').addEventListener('click',(e)=>{
        let ArrayRelacionamento = [];
        let Tbody = document.getElementById('RelacionamentoTbody');
        let Trs = Tbody.querySelectorAll('tr');
       //percorrendo todas as linhas
        Trs.forEach((TrCorrente) => {
            let ObjetoRelacionamento = {}; 
            let Tds = TrCorrente.querySelectorAll('td');
            //Percorrendo cada TD
            Tds.forEach((TdCorrente, index) => {
                //Selecionando o id do relacionamento
                if(index == 0){
                    ObjetoRelacionamento['ID'] = TdCorrente.querySelector('input').value;
                }
                //Selecionando o  codigo original do produto
                if(index == 1){
                    ObjetoRelacionamento['COD_ORIGINAL'] = TdCorrente.querySelector('input').value;
                }
                //Selecionando o  codigo do produto
                if(index == 3){
                    ObjetoRelacionamento['COD_PRODUTO'] = TdCorrente.querySelector('input').value;
                }
            });
            //Adicionando o objeto no array
            ArrayRelacionamento.push(ObjetoRelacionamento); // Adiciona o novo objeto ao array
        });
        ArrayRelacionamento.forEach((RegistroCorrente)=>{
            let data = {
                sql:`DECLARE
                     V_COUNT INT ; 
                     BEGIN
                     SELECT COUNT(*) INTO V_COUNT FROM RELACIONAMENTO_ENTRADA WHERE ID = :ID;
                     IF V_COUNT = 0 THEN
                     INSERT INTO RELACIONAMENTO_ENTRADA(ID_FORNECEDOR,ID_PRODUTO,COD_ORIGINAL) VALUES((SELECT P.ID_PARC FROM PRC_PARCEIRO P WHERE P.PARC_CGC_ = (SELECT  E.CNPJ FROM XML E WHERE E.ID = :ID_REL )),:ID_PRODUTO,:COD_ORIGINAL);
                     COMMIT;
                     END IF;
                     IF V_COUNT > 0 THEN
                     UPDATE RELACIONAMENTO_ENTRADA SET ID_PRODUTO = :ID_PRODUTO WHERE ID = :ID;
                     COMMIT;
                     END IF;
                     END;`,
                binds:{ID_PRODUTO:RegistroCorrente.COD_PRODUTO,ID:RegistroCorrente.ID,COD_ORIGINAL:RegistroCorrente.COD_ORIGINAL,ID_REL:RegistroSelecionado},
                mensagem_sucess:'Relacionamento salvo com sucesso'
            }
           if (RegistroCorrente.COD_PRODUTO != ''){
                new Ajax('/rota/universal',data).RequisicaoAjax(true);
                ReprocesarXml(false);
            }


        })

    
}) ;

function CadastroSimplificadoFun() {
  let  RegistroSelecionado = RegistroSelecionado_();
  let data = {
    sql: `BEGIN
        CADASTRO_SIMPLIFICADO_PRODUTO(:RegistroSelecionado,:USU_LOGADO);
        COMMIT;
        END;`,
        binds: {RegistroSelecionado:RegistroSelecionado},
        USU_LOGADO: true,
        mensagem_sucess:'Relacionamentos criados com sucesso!'
    }
    new Ajax('/rota/universal',data).RequisicaoAjax(true);
    CadastroSimplificado.setAttribute('disabled',true)
}

function RegistroSelecionado_() {
    let TrSelecionado = XmlImportados.querySelector('.Selectedtr');
    let TdId = TrSelecionado.querySelector('td');
    let Id = TdId.textContent;
    RegistroSelecionado = Id
    return RegistroSelecionado
}
// REPROCESSA_