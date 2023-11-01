(function readJS (win,doc){
    'use sctrict';
     let NOME_TABELA = document.getElementById('NOME_TABELA')
      function sendForm(){
        let ajax = new XMLHttpRequest();
        ajax.open('POST','/sql/buscatabela')
        ajax.setRequestHeader('Content-type','application/json');
        let objeto = {NOME_TABELA: NOME_TABELA.value}
        let data = JSON.stringify(objeto)
        ajax.onreadystatechange = ()=>{
         if(ajax.status === 200){
        let tbody = document.getElementById('tbody');
        tbody.innerText = '';


           let data = JSON.parse(ajax.responseText)
           data.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
              const cell = document.createElement('td');
              cell.innerText = cellData;
              row.appendChild(cell);
            });
            tbody.appendChild(row);
          });
         }else{
            swal({
                text: ajax.responseText,
                icon: 'warning'
              })
         }
        }
        ajax.send(data)
      }
      NOME_TABELA.addEventListener('change',sendForm,false)
})(window,document)