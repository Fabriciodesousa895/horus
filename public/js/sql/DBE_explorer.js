(function readJS(win, doc) {
  'use sctrict';
  let sql = document.getElementById('sql')
  let PROGRESSO = document.getElementById('PROGRESSO')
  let query = document.getElementById('query');
  let SQL_TABLE = document.getElementById('SQL_TABLE');
 let table_table = document.getElementById('table_table');
 let NOME_TABLE = document.getElementById('NOME_TABLE');
let DEFAULT = document.getElementById('DEFAULT');



  //quando o usuário estiver na modal de anexos,e dar um duplo clique
  query.addEventListener('dblclick', (e) => {
    //mostra ao usuário a barra de progresso
    PROGRESSO.style.opacity = '1';
    let elementclicado = e.target;
    let elementopai = elementclicado.parentNode;
    let conteudocelula = elementopai.cells[0]
    let ID = conteudocelula.textContent
    let data = {
      sql:`SELECT SQL FROM QUERY_USU WHERE ID_QUERY = :ID_QUERY `,
      binds:{ID_QUERY : ID},
      mensage_error: 'Ocorreu um erro ao procurar este registro!',
      rows: true
    };
    let JsonData = JSON.stringify(data)
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/select/universal');
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.onreadystatechange = () => {
      if (ajax.status === 200) {
 
      let res =    JSON.parse(ajax.responseText)
        sql.value = res[0]

        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0';
        document.getElementById('Salvar').style.display = 'none';
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
        document.getElementById('TOTAL').innerText = array_registros.length
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
          ajax.open('POST', '/rota/universal')
          ajax.setRequestHeader('Content-type', 'application/json');
          let objeto = { 
            sql:  `BEGIN 
            INSERT INTO QUERY_USU (SQL_NOME,ID_USU,SQL,DT_INCLUI,DT_ALTER	) VALUES (:NOME_SQL,:USU_LOGADO,:SQL,SYSDATE,SYSDATE);
            COMMIT;
            END;`,
            binds: {SQL:sql.value,NOME_SQL: name
            } ,
            mensagem_sucess:'Query salva com sucesso',
            mensagem_error: 'Erro ao salvar Query!',
            USU_LOGADO: true  

          }
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
   let data = {
    sql: `BEGIN 
    UPDATE QUERY_USU SET SQL = :QUERY,DT_ALTER = SYSDATE WHERE ID_QUERY = :ID_QUERY;
    COMMIT;
    END;`,
    binds:{ID_QUERY:ID.value,QUERY:sql.value},
    mensagem_sucess:'Query salva com sucesso',
    mensagem_error: 'Erro ao Editar Query!',
    USU_LOGADO:   false
   }
   let JsonData = JSON.stringify(data)

    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/rota/universal');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {
        swal({
          text: ajax.responseText,
          icon: 'success'
        })
        document.getElementById('SalvarEdicao').style.display = 'none';
        document.getElementById('DeletarSQL').style.display = 'none';
        document.getElementById('Salvar').style.display = '';
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
   let data = {
    sql : `BEGIN 
    DELETE FROM QUERY_USU WHERE ID_QUERY = :ID_QUERY;
    COMMIT;
    END;`,
    binds: {ID_QUERY:ID.value},
    mensagem_sucess: 'Registro deletado com sucesso!',
    mensagem_error:'Erro ao ideletar registro!',
    USU_LOGADO: false
   };
   let JsonData = JSON.stringify(data)

    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/rota/universal');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {
        swal({
          text: ajax.responseText,
          icon: 'success'
        })
        document.getElementById('SalvarEdicao').style.display = 'none';
        document.getElementById('DeletarSQL').style.display = 'none';
        document.getElementById('Salvar').style.display = '';
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
  function Novatabela (){
   let data = {
    sql: `${SQL_TABLE.value}`,
    binds:{},
    mensagem_sucess:'Registro inserido com sucesso!',
    mensagem_error:'Erro ao inserir registro!'
  }
   let JsonData = JSON.stringify(data)
    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/rota/universal');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {
        swal({
          text: ajax.responseText,
          icon: 'success'
        })
        table_table.innerText = '';
        NOME_TABLE.value = '';
        SQL_TABLE.value = '';
        DEFAULT.value = '';
        document.getElementById('EXECUTAR').style.display = 'none'
      } else {
        swal({
          text: ajax.responseText,
          icon: 'error'
        })
      }
    }
    ajax.send(JsonData)
  }
  function NovaTabelaNome (){
    let sql = document.getElementById('sql_sql')
   let data = {

    sql: `${sql.value}`,
    binds:{},
    mensagem_sucess:'Registro inserido com sucesso!',
    mensagem_error:'Erro ao inserir registro!'
  }
   let JsonData = JSON.stringify(data)
    let ajax = new  XMLHttpRequest();
    ajax.open('POST','/rota/universal');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = ()=>{
      if (ajax.status === 200) {

        document.getElementById('EXECUTAR').style.display = 'none'
      } else {
        swal({
          text: ajax.responseText,
          icon: 'error'
        })
      }
    }
    ajax.send(JsonData)
  }
        // Array de palavras reservadas do Oracle
        const palavrasReservadas = [
          'ALL', 'ALTER', 'AND', 'ANY', 'AS', 'ASC', 'BETWEEN', 'BY', 'CHAR', 'CHECK',
          'CLUSTER', 'COLUMN', 'COMMENT', 'COMPRESS', 'CONNECT', 'CREATE', 'CURRENT',
          'DATE', 'DECIMAL', 'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE',
          'EXCLUSIVE', 'EXISTS', 'FILE', 'FLOAT', 'FOR', 'FROM', 'GRANT', 'GROUP',
          'HAVING', 'IDENTIFIED', 'IMMEDIATE', 'IN', 'INCREMENT', 'INDEX', 'INITIAL',
          'INSERT', 'INTEGER', 'INTERSECT', 'INTO', 'IS', 'LEVEL', 'LIKE', 'LOCK',
          'LONG', 'MAXEXTENTS', 'MINUS', 'MLSLABEL', 'MODE', 'MODIFY', 'NOAUDIT',
          'NOCOMPRESS', 'NOT', 'NOWAIT', 'NULL', 'NUMBER', 'OF', 'OFFLINE', 'ON',
          'ONLINE', 'OPTION', 'OR', 'ORDER', 'PCTFREE', 'PRIOR', 'PRIVILEGES', 'PUBLIC',
          'RAW', 'RENAME', 'RESOURCE', 'REVOKE', 'ROW', 'ROWID', 'ROWNUM', 'ROWS',
          'SELECT', 'SESSION', 'SET', 'SHARE', 'SIZE', 'SMALLINT', 'START', 'SUCCESSFUL',
          'SYNONYM', 'SYSDATE', 'TABLE', 'THEN', 'TO', 'TRIGGER', 'UID', 'UNION',
          'UNIQUE', 'UPDATE', 'USER', 'VALIDATE', 'VALUES', 'VARCHAR', 'VARCHAR2',
          'VIEW', 'WHENEVER', 'WHERE', 'WITH', 'WORK'
      ];

        // Adiciona um listener para o evento 'input'
      sql.addEventListener('input', function() {
          // Obtém o texto do textarea
          let texto = sql.value;

          // Separa o texto em palavras
          let palavras = texto.split(/\s+/);

          // Itera sobre as palavras do texto
          palavras.forEach(palavra => {
              // Verifica se a palavra está na lista de palavras reservadas
              if (palavrasReservadas.includes(palavra.toUpperCase())) {
                  // Se estiver, envolve a palavra em uma tag <span> com a classe 'reservada'
                  texto = texto.replace(new RegExp('\\b' + palavra + '\\b', 'g'), '<div style="color: red;">' + palavra  + '</div>');
              }
          });
          // Atualiza o conteúdo do textarea com as palavras coloridas
          sql.innerHTML = texto;
      });
  //Quando o usuário clicar em Salvar
  document.getElementById('Salvar').addEventListener('click', sendsalvasql, false)
  //Usando o atalho F8
  window.addEventListener('keydown',(e)=>{if(e.key == 'F8'){sendForm()}})
  //Quando o usuário consutar a query
  document.getElementById('btn').addEventListener('click', sendForm, false)
  //Quando o usuário  cilcar em Salvar query
  document.getElementById('SalvarEdicao').addEventListener('click', salvaEdicao, false)
  //Deletar o registro
  document.getElementById('DeletarSQL').addEventListener('click', Deletar, false)
  //Inclui r uma tabela na base de dados
  document.getElementById('EXECUTAR').addEventListener('click', Novatabela, false)
  document.getElementById('EXECUTAR').addEventListener('click', NovaTabelaNome, false)
})(window, document)