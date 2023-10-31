(function readJs(win, doc) {
    'use strict';
    let ID_TELA = document.getElementById('ID_TELA');
    let T_NOME = document.getElementById('T_NOME');
    let dash = document.getElementById('dash');
    let valores =[0,0,0,0,0]

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


    
    // Adicione um evento de clique nas barras do gráfico
    dash.addEventListener('click', function (e) {
      const bar = inserigrafico.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
    
      if (bar.length > 0) {
        //  o índice da barra clicada
        const index = bar[0].index;
     console.log(index)    
     let campo ;
     let campo1 ;
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
        campo =  'CFU_DELETA' 
        campo1 =  'GRUP_DELETA'
        break;
      case 3:
        campo =  'CFU_INCLUI'
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

      ajax.open('POST', '/dashusuariovisu');
      ajax.setRequestHeader('Content-type', 'application/json');
      let data = {
          ID_TELA: ID_TELA.value,
          campo:campo,
          campo1:campo1
      };
      let jsonData = JSON.stringify(data);
      console.log(jsonData)
      ajax.onreadystatechange = function () {
          if (ajax.status == 200) {

  console.log(ajax.responseText)            //reslutado da requisição
         let dados = JSON.parse(ajax.responseText);

         const tbody = document.querySelector('tbody');
         tbody.innerText = '';

         dados.forEach(rowData =>{
          const row = document.createElement('tr');
          rowData.forEach(cellData =>{
            const cell = document.createElement('td');
            cell.innerText = cellData;
            row.appendChild(cell);
          })
         tbody.appendChild(row)

         })


            }else{
              T_NOME.value = ''
              ID_TELA.value = ''
              swal({
                  text:ajax.responseText,
                  icon:'warning'
              })


   
            }
          }
      ajax.send(jsonData);


      }
    });
    
  
    function sendForm() {

      
 
        let ajax = new XMLHttpRequest()

        ajax.open('POST', '/dash_usuario');
        ajax.setRequestHeader('Content-type', 'application/json');
        let data = {
            ID_TELA: ID_TELA.value
        };
        let jsonData = JSON.stringify(data);
        ajax.onreadystatechange = function () {
            if (ajax.status == 200) {
                let res  = JSON.parse(ajax.responseText)
                T_NOME.value = res[0]
                //reslutado da requisição


                valores[0] = res[1];
                valores[1] = res[2];
                valores[2] = res[3];
                valores[3] = res[4];
                valores[4] = res[5];

                 inserigrafico.update();
              }else{
                T_NOME.value = ''
                ID_TELA.value = ''
                swal({
                    text:ajax.responseText,
                    icon:'warning'
                })
 

     
              }
            }
        ajax.send(jsonData);

        }


  
    ID_TELA.addEventListener('change', sendForm, false);
  })(window, document);
  