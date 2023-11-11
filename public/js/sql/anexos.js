(function (win, doc) {
    'use strict';
    let PROGRESSO = document.getElementById('PROGRESSO')

    function sendForm() {
        //mostra ao usuário a barra de progresso
        PROGRESSO.style.opacity = '1'
        let data = {
            sql :`SELECT ID_QUERY,SQL_NOME,SQL,TO_CHAR(DT_INCLUI,'DD/MM/YY HH24:MI'),TO_CHAR(DT_ALTER,'DD/MM/YY HH24:MI') FROM QUERY_USU WHERE ID_USU = :USU_LOGADO`,
            binds:{},
            mensage_error:'Erro ao consultar registro!',
            USU_LOGADO: true,
            rows: true   }
           let JsonData = JSON.stringify(data)
        let ajax = new XMLHttpRequest();
        ajax.open('POST', '/select/universal');
        ajax.setRequestHeader('Content-type', 'application/json');

        ajax.onreadystatechange = () => {
            if (ajax.status === 200) {

                 let tbody = document.getElementById('query');
                 let array_registros = JSON.parse(ajax.responseText)
                 tbody.innerText = '';
                //inseri os registros na tabela
                 array_registros.forEach(RowData =>{
                    const  row = document.createElement('tr');
                    RowData.forEach(cellData =>{
                    const cell = document.createElement('td');
                    cell.innerText = cellData;
                    row.appendChild(cell)

                    })

                
                     tbody.appendChild(row)
                 })
                //pecorre os registros inseridos anteriomente e limita a 40 caracteres
                 let coluna = tbody.querySelectorAll('td');
                 var limit = 40;
                 for(  var i = 0;i < coluna.length;i++){
                     var textoCompleto = coluna[i].textContent;
                     var PreviaTexto   = textoCompleto.slice(0,limit);
                     coluna[i].textContent = PreviaTexto;
             
                     if(textoCompleto.length > limit){
                         coluna[i].textContent += '...'
                     }
                 }
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';
            } else {
                swal({
                    text:'error ' + ajax.responseText,
                    icon: 'warning'
                 })
                //omite do usuário a barra de progresso
                PROGRESSO.style.opacity = '0';
            }
        }
        ajax.send(JsonData)
    }
    //quando o usuario clicar em anexos,chama a função e é feita a consulta das querys que o usuario salvou na base de dados
    document.getElementById('ANEXO').addEventListener('click', sendForm, false);

})(window, document)