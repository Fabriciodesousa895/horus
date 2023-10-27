    (function readJs(win,doc){
          'use strict';
          let ID_FORNECE = document.getElementById('ID_FORNECE');
          let btn = document.getElementById('btn');
          let tabelaacesso = document.getElementById('tabelaacesso');

          function sendForm(e){
               let ajax =  new XMLHttpRequest();
               let data = {
                ID_USU: ID_FORNECE.value
               };
               let jsonData = JSON.stringify(data);
            ajax.open('POST','/consulta_acessos')
            ajax.setRequestHeader('Content-type','application/json');
            ajax.onreadystatechange = function(){
                if(ajax.status === 200){
                           let data = JSON.parse(ajax.responseText);
                           const tbody = document.querySelector('tbody');
                           tbody.innerText = ''
                           data.forEach(rowData =>{
                            const row = document.createElement('tr');
                            rowData.forEach(cellData =>{
                                const cell = document.createElement('td');
                                cell.innerHTML = cellData;
                                row.appendChild(cell);
                            })
                            tbody.appendChild(row);
                           })
            }else{
                swal({
                    title: ajax.responseText,
                    icon: 'error'
                })  
            }
            }
            ajax.send(jsonData);
          }
        btn.addEventListener('click',sendForm,false)
    })(window,document)