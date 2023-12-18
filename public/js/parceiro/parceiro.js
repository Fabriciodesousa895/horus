'use strict';
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
new filtra_campo('ID_CID','NOME_CID','CIDADE').Filtra()
new filtra_campo('ID_CID_F','NOME_CID_F','CIDADE').Filtra()

    let bairro = document.getElementById('PARC_BAIRRO')
    let logradouro = document.getElementById('PARC_LOGRA')
    let numero = document.getElementById('PARC_NUM')
    let complemento = document.getElementById('PARC_COMP')
    let cep = document.getElementById('PARC_CEP')
    let nome = document.getElementById('PARC_NOME')
    let fantasia = document.getElementById('PARC_N_RAZAO_SOCIAL')
    let telefone = document.getElementById('PARC_TEL')
    let telefone2 = document.getElementById('PARC_TEL_2')
    let email = document.getElementById('PARC_EMAIL')
    let PARC_NASC = document.getElementById('PARC_NASC')
    let UF = document.getElementById('ESTADO')
    let NOME_CID = document.getElementById('NOME_CID');

        let ID = document.getElementById('ID')
        let NOME_F = document.getElementById('NOME_F')
        let CGC = document.getElementById('CGC')
        let IE_RG_F = document.getElementById('IE_RG_F')
        let UF_ = document.getElementById('UF')
        let ATIVO = document.getElementById('ATIVO')
        let FORNECEDOR = document.getElementById('FORNECEDOR')
        let BLOQUEADOS = document.getElementById('BLOQUEADOS')

        function Salva (){
            SalvaFiltro(201, ID.value, NOME_F.value,CGC.value,IE_RG_F.value,UF_.value,ATIVO.checked ?  'S' : 'N',FORNECEDOR.checked ?  'S' : 'N',BLOQUEADOS.checked ?  'S' : 'N','','');
        }
        function Filtro(){


        let inputs = document.querySelectorAll('input');
        let Select = document.getElementsByTagName("select");
        let Objeto = {};
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            let id = input.id;
            if (input.type === 'checkbox') {
                let valor = input.checked ? 'S' : '';
                Objeto[id] = valor;
            } else {
                let valor = input.value;
                Objeto[id] = valor;
            }
        }
        // Percorre todos os selects e adiciona suas IDs e valores ao objeto
        for (let i = 0; i < Select.length; i++) {
            let id = Select[i].id;
            let valor = Select[i].value;
            Objeto[id] = valor;
        }


        let data = {
            sql: `SELECT FILTRO_PARC(:ID,:NOME_F,:CGC,:UF,:IE_RG_F,:ATIVO,:FORNECEDOR,:BLOQUEADOS) FROM DUAL`,
            binds: {
                ID: Objeto.ID,
                NOME_F: Objeto.NOME_F,
                CGC: Objeto.CGC,
                UF: Objeto.UF,
                IE_RG_F: Objeto.IE_RG_F,
                ATIVO: Objeto.ATIVO,
                FORNECEDOR: Objeto.FORNECEDOR,
                BLOQUEADOS: Objeto.BLOQUEADOS
            },
            mensage_error: 'Houve um erro ao consultar registros',
            rows: true,
            USU_LOGADO: false
        };

       let Ajax_res =  new Ajax('/select/universal',data).RequisicaoAjax(false)
       Ajax_res.then((array_de_dados)=>{
        let dados = array_de_dados[0][0];
        new   Tabela('tabeladados').InseriRegistros(dados);
        Salva();

       })

    }
  
    function Importar(e) {
        e.preventDefault()
        let CGC = document.getElementById('PARC_CGC')
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/importar/dados');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = { CGC: CGC.value }
        let JsonData = JSON.stringify(data)
        ajax.onreadystatechange = () => {
            let dados = JSON.parse(ajax.responseText)

            if (ajax.status === 200) {
                bairro.value = dados.bairro;
                numero.value = dados.numero;
                complemento.value = dados.complemento;
                logradouro.value = dados.logradouro;
                cep.value = dados.cep;
                nome.value = dados.nome;
                fantasia.value = dados.fantasia;
                email.value = dados.email;
                var data = dados.abertura
                var dataform = data.split('/');
                var newdata = dataform[2] + '-' +  dataform[1] + '-'  + dataform[0]
                PARC_NASC.value = newdata;
                var tel = dados.telefone
                var telNew = tel.split('/');
                telefone.value = telNew[0];
                if (telNew[1]) {
                    telefone2.value = telNew[1];
                }
                var selectedIndex = dados.uf
                UF.value = selectedIndex
                NOME_CID.value = dados.bairro
                filtracidade();

            }

            else {
                swal({
                    text: ajax.responseText,
                    icon: 'error'
                });
            }
        };
        ajax.send(JsonData);
    }
    function salvardados(e) {
        e.preventDefault();
        let form = document.getElementById('form');
        let inputs = form.querySelectorAll('input');
        let Objeto = {}
        for (let i = 0; i < inputs.length; i++) {
            let id = inputs[i].id
            let value
            if (inputs[i].type == 'checkbox') {
                value = inputs[i].checked ? 'S' : 'N'
            } else {
                value = inputs[i].value
            }
            Objeto[id] = value
        }
        let data = {
            sql: `BEGIN
            INSERT INTO PRC_PARCEIRO(PARC_NOME,PARC_N_RAZAO_SOCIAL,
                                     PARC_CGC,IE_RG,
                                     PARC_EMAIL,PARC_NASC,
                                     PARC_TEL,PARC_TEL_2,
                                     PARC_TRABALHO_N,PARC_CEP_T,
                                     PARC_BAIRRO_T,PARC_CID_F,
                                     PARC_LOGRA_T,PARC_NUM_T,
                                     PARC_COMP_T,PARC_TEL_T,
                                     PARC_SALARIO,PARC_ADMISSAO,
                                     PARC_CEP,UF,
                                     ID_CIDADE,PARC_BAIRRO,
                                     PARC_LOGRA,PARC_NUM,
                                     PARC_COMP,PARC_FORNEC,
                                     USU_INCLUSAO,USU_ALTER,
                                     DT_INCLU,DT_ALTER)
            VALUES                   ('${Objeto.PARC_NOME}','${Objeto.PARC_N_RAZAO_SOCIAL}',
                                      '${Objeto.PARC_CGC}',${Objeto.PARC_IR_RG},
                                      '${Objeto.PARC_EMAIL}',TO_DATE('${Objeto.PARC_NASC}','YYYY-MM-DD'),
                                      '${Objeto.PARC_TEL}',
                                      '${Objeto.PARC_TEL_2}',
                                      '${Objeto.PARC_TRABALHO_N}',
                                      '${Objeto.PARC_CEP_T}',
                                      '${Objeto.PARC_BAIRRO_T}',
                                      ${Objeto.ID_CID_F},
                                      '${Objeto.PARC_LOGRA_T}',
                                      '${Objeto.PARC_NUM_T}',
                                      '${Objeto.PARC_COMP_T}',
                                      '${Objeto.PARC_TEL_T}',
                                      ${Objeto.PARC_SALARIO},
                                      TO_DATE('${Objeto.PARC_ADMISSAO}','YYYY-MM-DD'),
                                      '${Objeto.PARC_CEP}',
                                   '${UF.value}',
                                      ${Objeto.ID_CID},
                                      '${Objeto.PARC_BAIRRO}',
                                      '${Objeto.PARC_LOGRA}',
                                      '${Objeto.PARC_NUM}',
                                      '${Objeto.PARC_COMP}',
                                      '${Objeto.PARC_FORNEC}',
                                      :USU_LOGADO,
                                      :USU_LOGADO,
                                      SYSDATE,
                                      SYSDATE

            );
            
            COMMIT;
          END;`,
            binds: {},
            USU_LOGADO: true,
            mensagem_error: 'Error ao inserir registro!',
            mensagem_sucess: 'Registro inserido com sucesso!'
        };
        new Ajax('/rota/universal',data).RequisicaoAjax(false)
    }
    // Usando o filtro
    document.getElementById('Buscar').addEventListener('click', Filtro, false);
    //importando os dados
    document.getElementById('IMPORTAR').addEventListener('click', Importar, false);
    document.getElementById('SALVAR').addEventListener('click', salvardados, false);


