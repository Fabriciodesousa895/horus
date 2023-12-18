'use strict';
import { SalvaFiltro } from "../Class/Filtro.js";
import { Tabela } from "../Class/Tabela.js";
import { Ajax } from "../Class/Ajax.js";

    let NOME_TABELA = document.getElementById('NOME_TABELA')
    let DESCRICAO = document.getElementById('DESCRICAO')
    let NOME_TRIGGER = document.getElementById('NOME_TRIGGER')
    let NOME_PROCEDURE = document.getElementById('NOME_PROCEDURE')
    function Salva() {
        SalvaFiltro(118, NOME_TABELA.value, DESCRICAO.value, NOME_TRIGGER.value, NOME_PROCEDURE.value, '', '', '', '', '', '');
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

    function ConsultaTabela(e) {
        e.preventDefault();
        let data = {
            sql: `SELECT * FROM TABELA_BANCO WHERE TAB_NOME LIKE '%${NOME_TABELA.value}%' AND (TAB_DESCRICAO LIKE '%${DESCRICAO.value}%' OR TAB_DESCRICAO IS NULL )`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((arra_de_dados) => {
            Tabela_.InseriRegistros(arra_de_dados)
            Salva()
        })
    }
    function FiltroTrigger(e) {
        e.preventDefault()
        let data = {
            sql: `SELECT TRIGGER_NAME,TRIGGER_TYPE,TRIGGERING_EVENT,TABLE_NAME,STATUS FROM USER_TRIGGERS WHERE TRIGGER_NAME LIKE '%${NOME_TRIGGER.value}%'`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_de_dados) => {
            tabelatrigger.InseriRegistros(array_de_dados)
            Salva()
        })
    }
    function FiltroProcedure() {
        let data = {
            sql: `SELECT US.OBJECT_ID,US.OBJECT_NAME FROM ALL_PROCEDURES AL,USER_PROCEDURES US WHERE AL.OBJECT_NAME = US.OBJECT_NAME AND US.OBJECT_TYPE= 'PROCEDURE' AND AL.OWNER = 'SYSTEM' AND  US.OBJECT_NAME LIKE '%${NOME_PROCEDURE.value}%'`,
            binds: {},
            mensage_error: 'Não foi encontrado registros!',
            rows: true
        }
        new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_de_dados) => {
            proceduredados.InseriRegistros(array_de_dados);
            Salva()
        })
    }
    document.getElementById('BuscarFiltro').addEventListener('click', ConsultaTabela, false)
    document.getElementById('BuscarTrigger').addEventListener('click', FiltroTrigger, false)
    document.getElementById('Buscarprocedure').addEventListener('click', FiltroProcedure, false)