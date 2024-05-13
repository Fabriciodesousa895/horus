'use strict';
import { SalvaFiltro } from "../Class/Filtro.js";
import { Tabela } from "../Class/Tabela.js";
import { Ajax } from "../Class/Ajax.js";

    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let DESCRICAO = document.getElementById('DESCRICAO')
    let NOME_TRIGGER = document.getElementById('NOME_TRIGGER')
    let NOME_PROCEDURE = document.getElementById('NOME_PROCEDURE')
    let NOME_VIEW = document.getElementById('NOME_VIEW')
    function Salva() {
        SalvaFiltro(118, NOME_TABELA.value, DESCRICAO.value, NOME_TRIGGER.value, NOME_PROCEDURE.value, NOME_VIEW.value, '', '', '', '', '');
    }
    let Tabela_ = new Tabela('tabeladados');
    Tabela_.VisualizaRegistro('/visualiza/dicionario/dados/', 1)
    Tabela_.ExportarRegistros('exportatabelas')

    let tabelatrigger = new Tabela('tabelatriggerdados');
    tabelatrigger.VisualizaRegistro('/visualiza/dicionario/dados/trigger/', 1);
    tabelatrigger.ExportarRegistros('exportatriggers')

    let proceduredados = new Tabela('proceduredados');
    proceduredados.VisualizaRegistro('/visualiza/dicionario/dados/procedure/', 2);
    proceduredados.ExportarRegistros('exportarprocedures')

    let viewsdados = new Tabela('tabelaviews');
    viewsdados.VisualizaRegistro('/vizualiza/dicionario/dados/views',1);
    viewsdados.ExportarRegistros('exportarview')

    function ConsultaTabela(e) {
        e.preventDefault();
        let data = {
            sql: `SELECT FILTRA_TABELAS(:NOME_,:DESC_) FROM DUAL`,
            binds: {NOME_:NOME_TABELA.value,DESC_:DESCRICAO.value},
            USU_LOGADO:false

        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((arra_de_dados) => {
            Tabela_.InseriRegistros(arra_de_dados)
            Salva()
        })
    }
    function FiltroTrigger(e) {
        e.preventDefault()
        let data = {
            sql: `SELECT FILTRA_TRIGGER(:NOME) FROM DUAL`,
            binds: {NOME:NOME_TRIGGER.value},
            USU_LOGADO:false

        }
       let ReqTrigger = new Ajax('/select/universal', data).RequisicaoAjax(false)
           
        ReqTrigger.then((array_de_dados)=>{
            tabelatrigger.InseriRegistros(array_de_dados)
            console.log(array_de_dados)
            Salva()
        }) 
    }
    function FiltroProcedure() {
        let data = {
            sql: `SELECT FILTRA_PROCEDURES(:NOME) FROM DUAL  `,
            binds: {NOME:NOME_PROCEDURE.value},
            USU_LOGADO:false
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_de_dados) => {
            proceduredados.InseriRegistros(array_de_dados);
            Salva()
        })
    }
    // SELECT FILTRA_VIEW(:NOME) FROM DUAL  NOME_VIEW.value
    function Filtroview() {
        let data = {
            sql: `SELECT FILTRA_VIEW(:NOME) FROM DUAL`,
            binds: {NOME:NOME_VIEW.value},
            USU_LOGADO:false
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_de_dados) => {
            viewsdados.InseriRegistros(array_de_dados);
            Salva()
        })
    }
    document.getElementById('BuscarFiltro').addEventListener('click', ConsultaTabela, false)
    document.getElementById('BuscarTrigger').addEventListener('click', FiltroTrigger, false)
    document.getElementById('Buscarprocedure').addEventListener('click', FiltroProcedure, false)
    document.getElementById('Buscarview').addEventListener('click', Filtroview, false)