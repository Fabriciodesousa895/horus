
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
let SalvarXml = document.getElementById('SalvarXml');
let filtro = document.getElementById('filtro');
let Relacionamento = document.getElementById('Relacionamento');
let Reprocessar = document.getElementById('Reprocessar');


SalvarXml.addEventListener('click', (e) => {
    e.preventDefault();
    let ArquivoXml = document.getElementById('ArquivoXml');
    let ArquivoXmlFile = ArquivoXml.files[0];
    if (ArquivoXmlFile) {
        const LerXml = new FileReader();
        LerXml.onload = (e) => {
            const XmlString = e.target.result;
            console.log(XmlString)
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

            new Ajax('/rota/universal', data).RequisicaoAjax(true)
        }
        LerXml.readAsText(ArquivoXmlFile)

    }
})

filtro.addEventListener('click',(e)=>{
    e.preventDefault();
    Reprocessar.setAttribute('disabled',true);
    Relacionamento.setAttribute('disabled',true);
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
                        console.log(dados_retornados[0][0])
                        if(dados_retornados[0][0] = ''){
                            alert( 'ok')
                        }else{
                            Reprocessar.removeAttribute('disabled')
                            Relacionamento.removeAttribute('disabled')
                        }
                    })
                

        
            })
        })
    })
   
})

Relacionamento.addEventListener('click',(e)=>{
    let TrSelecionado = document.querySelector('.Selectedtr');
    let TdId = TrSelecionado.querySelector('td');
    let Id = TdId.textContent;
    let data = {
    sql:`SELECT FILTRA_RELACIONAMENTO(:IdXml) FROM DUAL`,
    binds:{IdXml:Id}
}
 new Ajax('/select/universal',data).RequisicaoAjax().then((dados_retornados)=>{
    new Tabela('RelacionamentoTabela').InseriRegistros(dados_retornados);
 })

})

