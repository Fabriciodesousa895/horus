(function readJs(win, doc) {
    'use strict';
    let ID_USU = document.getElementById('ID_USU');
    let btn = document.getElementById('btn');
  
    function sendForm() {
      let ajax = new XMLHttpRequest();
      let data = {
        ID_USU: ID_USU.value
      };
      let jsonData = JSON.stringify(data);
      ajax.open('POST', '/consulta_acessos');
      ajax.setRequestHeader('Content-type', 'application/json');
      ajax.onreadystatechange = function () {
        if (ajax.status === 200) {
          let data = JSON.parse(ajax.responseText);
          const tbody = document.querySelector('tbody');
          tbody.innerText = '';
          data.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
              const cell = document.createElement('td');
  
              // Verifique se o valor é 'S' para criar um checkbox marcado como true
              if (cellData === 'S') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                cell.appendChild(checkbox);
              } else if (cellData === 'N') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                cell.appendChild(checkbox);
              } else {
                cell.innerHTML = cellData;
              }
              row.appendChild(cell);
            });
            tbody.appendChild(row);
          });
        } else {
          swal({
            title: ajax.responseText,
            icon: 'error'
          })
        }
      }
      ajax.send(jsonData);
    }
    btn.addEventListener('click', sendForm, false)
  })(window, document);
  