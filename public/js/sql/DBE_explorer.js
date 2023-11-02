(function readJS(win, doc) {
  'use sctrict';
  let sql = document.getElementById('sql')
  let PROGRESSO = document.getElementById('PROGRESSO')


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
      }).then(name => {
        // Aqui estamos acessando o valor do input
        console.log(name);
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
          } else {
            swal({
              text: ajax.responseText,
              icon: 'error'
            })
          }

        }

        ajax.send(data)
      })

    }

  }

  document.getElementById('Salvar').addEventListener('click', sendsalvasql, false)
  document.getElementById('btn').addEventListener('click', sendForm, false)
})(window, document)