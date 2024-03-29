(function readJs(win, doc) {
  'use strict';
  let ID_TELA = document.getElementById('ID_TELA');
  let T_NOME = document.getElementById('T_NOME');
  let dash = document.getElementById('dash');
  let PROGRESSO = document.getElementById('PROGRESSO');
  PROGRESSO.style.opacity = '0'


  let valores = [0, 0, 0, 0, 0]

  let inserigrafico = new Chart(dash, {
    type: 'bar',
    data: {
      labels: ['Consulta', 'Altera', 'Deleta', 'Inclui', 'Anexa'],
      datasets: [{
        label: 'My First Dataset',
        data: valores,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  //quando o usuario filtar por outra tela,ele esvazia a tabela  
  document.getElementById('ID_TELA').addEventListener('change', () => { document.querySelector('tbody').innerText = '' })


  // Adicione um evento de clique nas barras do gráfico
  dash.addEventListener('click', function (e) {
    const bar = inserigrafico.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);

    if (bar.length > 0) {
      //  o índice da barra clicada
      const index = bar[0].index;
      console.log(index)
      let campo;
      let campo1;
      switch (index) {
        case 0:
          campo = 'CFU_CONSULTA'
          campo1 = 'GRUP_CONSULTA'
          break;
        case 1:
          campo = 'CFU_ALTERA'
          campo1 = 'GRUP_ALTERA'

          break;
        case 2:
          campo = 'CFU_DELETA'
          campo1 = 'GRUP_DELETA'
          break;
        case 3:
          campo = 'CFU_INCLUI'
          campo1 = 'GRUP_INCLUI'
          break;
        case 4:
          campo = 'CFU_ANEXA'
          campo1 = 'GRP_ANEXA'
          break;

        default:
          break;
      }

      let ajax = new XMLHttpRequest()

      ajax.open('POST', '/rota/universal');
      ajax.setRequestHeader('Content-type', 'application/json');
      let data = {
        sql: `  SELECT   U.ID_USU, U.USU_NOME
        FROM USU_USUARIO U
        LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
        LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
        LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
        WHERE CG.ID_TELA = TL.ID_TELA
          AND (CU.${campo} = 'S' OR CG.${campo1} = 'S' OR U.USU_ADM = 'S')
          AND TL.ID_TELA = :ID_TELA
        AND TL.TIPO <> 'V'
      AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S' )
       GROUP BY  U.USU_NOME,U.ID_USU`,
        binds: { ID_TELA: ID_TELA.value },
        mensage_error: 'Houve um erro ao conultar o registro!',
        rows: true
      };
      console.log(data.sql)

      let jsonData = JSON.stringify(data);
      //mostra ao usuário a barra de progresso
      PROGRESSO.style.opacity = '1'
      ajax.onreadystatechange = function () {
        if (ajax.status == 200) {
          //apos a requisição retornar um array de array é foito um forEach para inseririr os registros na tabela
          let dados = JSON.parse(ajax.responseText);//transformando para um objeto
          console.log(dados)
          const tbody = document.getElementById('tbody');
          tbody.innerText = '';
          dados.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
              const cell = document.createElement('td');
              cell.innerText = cellData;
              row.appendChild(cell);
            })
            tbody.appendChild(row)

          })
      console.log(tbody)

          //omite do usuário a barra de progresso
          PROGRESSO.style.opacity = '0'
        } else {
          //Caso a requisão retorne erro ou não haja registros
          T_NOME.value = ''
          ID_TELA.value = ''
          swal({
            text: ajax.responseText,
            icon: 'warning'
          })
          //omite do usuário a barra de progresso
          PROGRESSO.style.opacity = '0'
        }
      }
      ajax.send(jsonData);
    }
  });

  //quando o usuário selecionar uma tela 
  function sendForm() {
    //mostra ao usuário a barra de progresso
    PROGRESSO.style.opacity = '1'
    let ajax = new XMLHttpRequest()
    ajax.open('POST', '/dash_usuario');
    ajax.setRequestHeader('Content-type', 'application/json');
    let data = { ID_TELA: ID_TELA.value };
    let jsonData = JSON.stringify(data);
    ajax.onreadystatechange = function () {
      if (ajax.status == 200) {
        let res = JSON.parse(ajax.responseText)
        T_NOME.value = res[0]
        //resultado da requisição
        valores[0] = res[1];
        valores[1] = res[2];
        valores[2] = res[3];
        valores[3] = res[4];
        valores[4] = res[5];

        inserigrafico.update();
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0'
      } else {
        T_NOME.value = ''
        ID_TELA.value = ''
        //Caso a requisão retorne erro ou não haja registros
        valores = [0, 0, 0, 0, 0]
        inserigrafico.update();
        swal({
          text: ajax.responseText,
          icon: 'warning'
        })
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0'
      }
    }
    ajax.send(jsonData);

  }
  ID_TELA.addEventListener('change', sendForm, false);
  document.getElementById('btn').addEventListener('click', sendForm, false);
})(window, document);
