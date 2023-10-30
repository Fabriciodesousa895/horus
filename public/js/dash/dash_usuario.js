(function readJs(win, doc) {
    'use strict';
    let ID_TELA = document.getElementById('ID_TELA');
    let T_NOME = document.getElementById('T_NOME');
    let dash = document.getElementById('dash');

  
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
                const data = {
                  labels: ['Consulta', 'Altera', 'Deleta', 'Anexa', 'Inclui'],
                  datasets: [{
                    label: 'My First Dataset', // Corrigido para uma única string
                    data: [res[1], res[2],res[3], res[4], [5]],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(255, 159, 64, 0.2)',
                      'rgba(255, 205, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                      'rgb(255, 99, 132)',
                      'rgb(255, 159, 64)',
                      'rgb(255, 205, 86)',
                      'rgb(75, 192, 192)',
                      'rgb(54, 62, 235)',
                    ],
                    borderWidth: 1
                  }]
                };
            
                new Chart(dash, {
                  type: 'bar',
                  data: data,
                  options: {
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }
                });
              }else{
                swal({
                    text:ajax.responseText,
                    icon:'error'
                })
              }
            }
        ajax.send(jsonData);

        }


  
    ID_TELA.addEventListener('change', sendForm, false);
  })(window, document);
  