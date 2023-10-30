(function readJs(win, doc) {
    'use strict';
    let ID_TELA = document.getElementById('ID_TELA');
    let T_NOME = document.getElementById('T_NOME');
    let dash = document.getElementById('dash');
    let valores =[0,0,0,0,0]

    let inserigrafico = new Chart(dash, {
      type: 'bar',
      data: {
        labels: ['Consulta', 'Altera', 'Deleta', 'Anexa', 'Inclui'],
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
  