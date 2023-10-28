(function readyJS(win, doc) {
    'use strict';

let ID_GRUPO = document.getElementById('ID_GRUPO');
let NOME_GRUPO = document.getElementById('NOME_GRUPO');


function sendForm(evento){
      evento.preventDefault();
      //passando os valores para objeto data
      let ajax = new XMLHttpRequest();
      let data = {
        ID_GRUPO : ID_GRUPO.value
      };
        //transformando data em JSON
       let jsonData = JSON.stringify(data);

       ajax.open('POST','/grupo');
       ajax.setRequestHeader('Content-type', 'application/json');
       ajax.onreadystatechange = function(){
        if(ajax.status === 200 ){

           NOME_GRUPO.value = ajax.responseText
           return;
        }else{
          swal({
            title: ajax.responseText,
            icon: "error"
          });
         NOME_GRUPO.value = '';
         ID_GRUPO.value   = '';

         }
        
       };
       ajax.send(jsonData);
 
    }
       ID_GRUPO.addEventListener('change',sendForm,false)
       

})(window,document);
