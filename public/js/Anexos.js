import { Ajax } from "./Class/Ajax.js";
import { Tabela } from "./Class/Tabela.js";


let BtnModal = document.getElementById('ANEXO');
let Id_Tela = document.getElementById('Id_Tela');
let BtnAnexo = document.getElementById('BtnAnexo');
let AnexoModal = document.getElementById('AnexoModal');
BtnModal.addEventListener('click', () => {
  let data = {
    sql: `SELECT
                ID_ANEXO, NOME,TO_CHAR(DT_INCLU,'DD/MM/YY HH24:MM')
              FROM ANEXO
              WHERE ID_USU  = :USU_LOGADO
               AND  ID_TELA = : ID_TELA`,
    binds: { ID_TELA: Id_Tela.value },
    mensage_error: 'Houve um erro ao conultar os anexos!',
    rows: true,
    USU_LOGADO: true
  }
  new Ajax('/select/universal', data).RequisicaoAjax(false).then((Array_dados) => {
    new Tabela('TabelaAnexo').InseriRegistros(Array_dados);
    console.log(Array_dados);
    let table = document.getElementById('TabelaAnexo');
    let tbody = table.querySelector('tbody');

    let tr = tbody.querySelectorAll('tr');
    tr.forEach((row) => {
      let td = document.createElement('td');
      let button = document.createElement('button');
      button.className = 'btn btn-danger BtnDeletar'
      button.textContent = 'Deletar';
      td.appendChild(button);
      row.appendChild(td);
    });

    let TrBaixar = tbody.querySelectorAll('tr');
    TrBaixar.forEach((row) => {
      let tdb = document.createElement('td');
      let buttonbaixar = document.createElement('button');
      buttonbaixar.textContent = 'Baixar';
      buttonbaixar.className = 'btn btn-info BtnBaixar'
      tdb.appendChild(buttonbaixar);
      row.appendChild(tdb);
    });
    AnexoModal.click();
    EscutadorBaixar();
    EscutadorDelete();

  })
})

function EscutadorBaixar() {
  let BtnBaixar = document.querySelectorAll('.BtnBaixar');
  BtnBaixar.forEach((e) => {
    e.addEventListener('click', (t) => {
      let IdRegistro = ((((t.target).parentNode).parentNode).cells[0]).textContent
      let b = document.createElement('iframe');
      b.setAttribute('src', 'http://localhost:8080/Baixar/Anexo/' + IdRegistro);
      document.querySelector('#baixar')
        .appendChild(b)
        .setAttribute('style', 'display:none')

    })
  })
}
function EscutadorDelete() {
  let BtnBaixar = document.querySelectorAll('.BtnDeletar');
  BtnBaixar.forEach((e) => {
    e.addEventListener('click', (t) => {
      let IdRegistro = ((((t.target).parentNode).parentNode).cells[0]).textContent
        let binds = {
          IdRegistro:IdRegistro
        }
     let Req =  new Ajax('/Deleta/Anexo',binds).RequisicaoAjax(true)
    


    })
  })
}

