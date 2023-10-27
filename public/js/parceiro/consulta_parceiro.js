(function readyJS(win, doc) {
    'use strict';

let ID_PARC = document.getElementById('ID_PARC');
let PARC_NOME = document.getElementById('PARC_NOME');


function sendForm(evento){
      evento.preventDefault();
      //passando os valores para objeto data
      let ajax = new XMLHttpRequest();
      let data = {
        ID_PARC : ID_PARC.value
      };
        //transformando data em JSON
       let jsonData = JSON.stringify(data);

       ajax.open('POST','/consulta_parceiro');
       ajax.setRequestHeader('Content-type', 'application/json');
       ajax.onreadystatechange = function(){
        if(ajax.status === 200 ){

           PARC_NOME.value = ajax.responseText;
           return;
        }else{
          swal({
            title: ajax.responseText,
            icon: "error"
          });
         PARC_NOME.value = '';
         ID_PARC.value   = '';

         }
        
       };
       ajax.send(jsonData);
 
    }
       ID_PARC.addEventListener('change',sendForm,false)
       

})(window,document);
