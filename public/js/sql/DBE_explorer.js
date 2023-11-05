(function readJS(win, doc) {
  'use sctrict';
  let sql = document.getElementById('sql')
  let PROGRESSO = document.getElementById('PROGRESSO')
  let query = document.getElementById('query');

  //quando o usuário estiver na modal de anexos,e dar um duplo clique
  query.addEventListener('dblclick', (e) => {
    //mostra ao usuário a barra de progresso
    PROGRESSO.style.opacity = '1';
    let elementclicado = e.target;
    let elementopai = elementclicado.parentNode;
    let conteudocelula = elementopai.cells[0]
    let ID = conteudocelula.textContent
    let data = { ID: ID }
    let JsonData = JSON.stringify(data)
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/sql/sql_id');
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.onreadystatechange = () => {
      if (ajax.status === 200) {
 
      let res =    JSON.parse(ajax.responseText)
        sql.value = res[0]

        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0';
        document.getElementById('Salvar').style.opacity = '0';
        document.getElementById('SalvarEdicao').style.display = '';
        document.getElementById('DeletarSQL').style.display = '';
        document.getElementById('ID_SQL').value = ID
      } else {
        swal({
          text: ajax.responseText,
          icon: 'warning'
        })
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0';
      }
    }
    ajax.send(JsonData)
  })

  //Quando o usuário consutar a query
  function sendForm() {
    //mostra ao usuário a barra de progresso
    PROGRESSO.style.opacity = '1';
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/sql/DBE_explorer')
    ajax.setRequestHeader('Content-type', 'application/json');
    let objeto = { sql: sql.value }
    let data = JSON.stringify(objeto)
    ajax.onreadystatechange = () => {
      if (ajax.status == 200) {
        //pega o nome das colunas
        let array_colunas = JSON.parse(ajax.responseText).array_colunas;
        let array_registros = JSON.parse(ajax.responseText).array_registros;
        // let tr = document.getElementById('colunas');
        let tbody = document.getElementById('dados');
        let thead = document.getElementById('cabecalho');
        //retira a tabela existente
        tbody.innerText = '';
        thead.innerText = '';
        //faz um laço e inserio cabeçalho
        let tr = document.createElement('tr')
        for (var i = 0; i < array_colunas.length; i++) {
          var th = document.createElement('td');
          th.textContent = array_colunas[i];
          tr.appendChild(th);
        }
        //adiciona a linha no cabeçalho;
        thead.appendChild(tr)
        //percorre o array de array e inseri os dados da query
        array_registros.forEach(rowData => {
          const row = document.createElement('tr');
          rowData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.innerText = cellData;
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        });
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0';

      } else {
        swal({
          text: ajax.responseText,
          icon: 'warning'
        })
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0';
      }
    }
    ajax.send(data)
  }

  //Quando o usuário clicar em Salvar

  function sendsalvasql() {
    if (sql.value != '') {
      swal({
        text: 'Informe um nome para sua query',
        content: {
          element: "input",
          attributes: {
            placeholder: "Nome da query",
            type: "text"
          },
        },
        buttons: {
          cancel: true,
          confirm: true,
        },
      }).then(name => {
        // Aqui estamos acessando o valor do input
        if (name != null) {
          let ajax = new XMLHttpRequest();
          ajax.open('POST', '/sql/salvasql')
          ajax.setRequestHeader('Content-type', 'application/json');
          let objeto = { sql: sql.value, NOME_SQL: name }
          let data = JSON.stringify(objeto)
          ajax.onreadystatechange = () => {
            if (ajax.status === 200) {
              swal({
                text: ajax.responseText,
                icon: 'success'
              })
              sql.value = ''
            } else {
              swal({
                text: ajax.responseText,
                icon: 'error'
              })
            }

          }
          ajax.send(data)

        }else{
          alert('error')
        }



      })

    }

  }
  //Quando o usuário  cilcar em Salvar query
  function salvaEdicao (){
   let ID = document.getElementById('ID_SQL');
   let data = {ID:ID.value,QUERY:sql.value}
   let JsonData = JSON.stringify(data)

    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/sql/salvaedicao');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {
        swal({
          text: ajax.responseText,
          icon: 'success'
        })
        document.getElementById('SalvarEdicao').style.display = 'none';
        document.getElementById('DeletarSQL').style.display = 'none';
        document.getElementById('Salvar').style.opacity = '1';
        document.getElementById('ID_SQL').value ='0'
        sql.value = ''

      } else {
        swal({
          text: ajax.responseText,
          icon: 'error'
        })
      }
    }

    ajax.send(JsonData)

  }
  //Deletar registro
  function Deletar (){
   let ID = document.getElementById('ID_SQL');
   let data = {ID:ID.value}
   let JsonData = JSON.stringify(data)

    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/sql/deleta');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {
        swal({
          text: ajax.responseText,
          icon: 'success'
        })
        document.getElementById('SalvarEdicao').style.display = 'none';
        document.getElementById('DeletarSQL').style.display = 'none';
        document.getElementById('Salvar').style.opacity = '1';
        document.getElementById('ID_SQL').value ='0'
        sql.value = ''

      } else {
        swal({
          text: ajax.responseText,
          icon: 'error'
        })
      }
    }

    ajax.send(JsonData)

  }
  //Quando o usuário clicar em Salvar

  document.getElementById('Salvar').addEventListener('click', sendsalvasql, false)
  //Quando o usuário consutar a query
  document.getElementById('btn').addEventListener('click', sendForm, false)
  //Quando o usuário  cilcar em Salvar query
  document.getElementById('SalvarEdicao').addEventListener('click', salvaEdicao, false)
  //Deletar o registro
  document.getElementById('DeletarSQL').addEventListener('click', Deletar, false)
})(window, document)