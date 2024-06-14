import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
import { SalvaFiltro } from "../Class/Filtro.js";
let form = document.getElementById('form')
//Inserindo um novo registro
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let GRP_NOME = document.getElementById('GRP_NOME');
  let GRP_DESC = document.getElementById('GRP_DESC');
  let data = {
    sql: `BEGIN INSERT INTO GRP_GRUPO(GRP_NOME,GRP_DESC,ID_USU_INCLUSAO,COD_USU_ALTER,DT_INCLU,DT_ALTER) VALUES(UPPER(:GRP_NOME),UPPER(:GRP_DESC),:USU_LOGADO,:USU_LOGADO,SYSDATE,SYSDATE); COMMIT;END;`,
    binds: { GRP_DESC: GRP_DESC.value, GRP_NOME: GRP_NOME.value },
    mensagem_sucess: 'Registro inserido com sucesso!',
    mensagem_error: 'Erro ao inserir registro!',
    USU_LOGADO: true
  };
  if (GRP_NOME.value != '' && GRP_DESC.value != '') {
    new Ajax('/rota/universal', data).RequisicaoAjax(true)
    GRP_NOME.value = '';
    GRP_DESC.value = '';
  }
})

//Filtrando registros
document.getElementById('filtro').addEventListener('click', (e) => {
  e.preventDefault();
  let ValuesCampos = new Tabela().InputsValues(['ID_GRUPO', 'NOME_GRUPO', 'DESCRICAO_GRUPO']);
  new SalvaFiltro(119, ValuesCampos.ID_GRUPO, ValuesCampos.NOME_GRUPO, ValuesCampos.DESCRICAO_GRUPO, '', '', '', '', '', '', '', '', '', '')
  let data = {
    sql: `SELECT FILTRA_GRUPO(:ID_GRUPO,:NOME_GRUPO,:DESCRICAO_GRUPO) FROM DUAL`,
    binds: ValuesCampos
  }
  new Ajax('/select/universal', data).RequisicaoAjax().then((arrya_de_dados) => {
    new Tabela('TabelaGrupo').InseriRegistros(arrya_de_dados);
  })
})

//Deletando registro
document.getElementById('EXCLUIR').addEventListener('click', (e) => {
  let TrSelecionado = document.getElementsByClassName('Selectedtr');
  if(TrSelecionado.length == 1){
    Array.from(TrSelecionado).forEach(element => {
      let td = element.querySelectorAll('td')
      td.forEach((tdcorrent, index) => {
        if (index == 0) {
          let data = {
            sql:`BEGIN DELETE FROM GRP_GRUPO WHERE ID_GRUPO = :ID_GRUPO; COMMIT; END;`,
            binds:{ID_GRUPO:tdcorrent.textContent},
            mensagem_sucess: 'Registro deletado com sucesso!',
            mensagem_error: 'Erro ao deletar registro!',
          }
          new Ajax('/rota/universal',data).RequisicaoAjax(true)
          // element.remove(); // Remove o elemento selecionado da tabela
        }
      })
    });
  } else {
    swal({
      text:'Selecione apenas um registro',
      icon:'error'
    })
  }
});
