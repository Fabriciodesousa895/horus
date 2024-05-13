
'use strict';
import { Ajax } from "../Class/Ajax.js";
let ID_USU = document.getElementById('ID_USU');
let btn = document.getElementById('btn');
let PROGRESSO = document.getElementById('PROGRESSO');
let TABELA = document.getElementById('TABELA');
let PERMI = document.getElementById('PERMI');

function sendForm() {

  let ajax = new XMLHttpRequest();
  let data = {
    ID: ID_USU.value,
    TABELA: TABELA.value

  };
  let jsonData = JSON.stringify(data);
  ajax.open('POST', '/consulta_acessos');
  ajax.setRequestHeader('Content-type', 'application/json');
  //mostra ao usuário a barra de progresso
  PROGRESSO.style.opacity = '1'
  //verifica  a resposta da requisição
  ajax.onreadystatechange = function () {
    if (ajax.status === 200) {
      let data = JSON.parse(ajax.responseText);
      const tbody = document.getElementById('tabelaacesso');
      let CollunExecuta = document.getElementById('CollunExecuta');
      tbody.innerText = '';
      data.forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
          const cell = document.createElement('td');
          // Verifique se o valor é 'S' para criar um checkbox marcado como true
          if (cellData == 'S') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.disabled = (PERMI.value == 'N' ? true : false)
            cell.appendChild(checkbox);
          } else if (cellData == 'N') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.disabled = (PERMI.value == 'N' ? true : false)
            cell.appendChild(checkbox);
          } else {
            cell.innerHTML = cellData;
          }
          row.appendChild(cell);
        });
        if (TABELA.value == 'USU_USUARIO') {
          let Button = document.createElement('button');
          Button.innerHTML = 'Visualizar'
          Button.className = 'btn btn-warning BtnAcoes'
          CollunExecuta.style.display = ''
          row.appendChild(Button);
        } else {
          CollunExecuta.style.display = 'none';
        }
        tbody.appendChild(row);
      });
      document.querySelectorAll('.BtnAcoes').forEach((elemento) => {
        elemento.addEventListener('click', (e) => {
          FiltAcao(e.target.parentNode.cells[0].textContent);
        })
      })

    } else {
      swal({
        text: ajax.responseText,
        icon: 'error'
      })
    }
    PROGRESSO.style.opacity = '0';
  }
  ajax.send(jsonData);
}

btn.addEventListener('click', sendForm, false);


function Liberabloqueiaacao() {
  let tbody = document.getElementById('tabelaacao');
  tbody.addEventListener('change', (e) => {
    let checkbox = e.target;
    let cell = checkbox.closest('td');// célula que contém o checkbox
    if (!cell) {
      return;
    }
    if (cell.cellIndex >= 2) {
      let ID_ACAO = (cell.parentNode.cells[0]).textContent;
      let isChecked = (checkbox.checked ? 'S' : 'N');

      if (TABELA.value == 'USU_USUARIO') {
        let data = {
          sql: `BEGIN
                    UPDATE USU_ACAO SET EXECUTA = :VALUED WHERE ID_USU = :ID AND ID_ACAO = :IDACAO; COMMIT;END;`,
          binds: {
            VALUED: isChecked,
            ID: ID_USU.value,
            IDACAO: ID_ACAO
          },
          mensagem_error: 'Error'
        }
        new Ajax('/rota/universal', data).RequisicaoAjax()
      }
    }
  })
}
function FiltAcao(ID_TELA) {
  let ModalAcao = document.getElementById('ModalAcao');
  let data = {
    sql: `SELECT FILT_ACAO(:ID_TELA,:ID_USU) FROM DUAL`,
    binds: { ID_TELA: ID_TELA,ID_USU:ID_USU.value }
  }
  new Ajax('/select/universal', data).RequisicaoAjax(false).then((array_dados) => {
    if (array_dados.length != 0) {
      let table_ = document.getElementById('IdTableAcao')
      let Tbody = table_.querySelector('tbody')
      Tbody.innerText = '';
      array_dados.forEach(RowData => {
        const row = document.createElement('tr');
        RowData.forEach(cellData => {
          let cell = document.createElement('td');
          if (cellData == 'S') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.disabled = (PERMI.value == 'N' ? true : false)
            cell.appendChild(checkbox);
          } else if (cellData == 'N') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.disabled = (PERMI.value == 'N' ? true : false)
            cell.appendChild(checkbox);
          } else {
            cell.innerHTML = cellData;
          }
          row.appendChild(cell);
        })
        Tbody.appendChild(row);

      })
      ModalAcao.click();
      Liberabloqueiaacao()
    } else {
      swal({ text: 'Não há ações para tela selecionada.', icon: 'info' })
    }

  })


}





