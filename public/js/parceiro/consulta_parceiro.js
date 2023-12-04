(function readyJS(win, doc) {
    'use strict';

let ID_PARC = document.getElementById('ID_PARC');
let PARC_NOME = document.getElementById('PARC_NOME');


function sendForm(evento){
      evento.preventDefault();
      //passando os valores para objeto data
      let ajax = new XMLHttpRequest();
      let data = {
        sql:`SELECT PARC_NOME FROM PRC_PARCEIRO WHERE ID_PARC = :ID_PARC`,
        binds:{ID_PARC : ID_PARC.value},
        mensage_error: 'Parceiro não existe ou não está ativo!',
        rows: false
      };
        //transformando data em JSON
       let jsonData = JSON.stringify(data);
       ajax.open('POST','/select/universal');
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
