(function readyJS(win,doc){
   'use strict';
   //referenciando campos a uma variavel;
   let ID_VENDEDOR = document.getElementById('ID_VENDEDOR');
   let VND_NOME = document.getElementById('VND_NOME');

   function sendForm(evento){
      //instancia do ajax
     let ajax = new XMLHttpRequest();
     //passando os valores para objeto data;
     let data = {
        sql:`SELECT VND_NOME FROM VND_VENDEDOR WHERE ID_VENDEDOR = :ID_VENDEDOR `,
        binds:{ID_VENDEDOR : ID_VENDEDOR.value},
        mensage_error: 'Vendedor não existe oou não está ativo!',
        rows: false
      };
    //transformando data em JSON;
    let jsonData = JSON.stringify(data);

    ajax.open('POST','/select/universal');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = function(){
        if(ajax.status === 200 ){
            VND_NOME.value =  ajax.responseText;
            return;
        }else{
            swal({
            title: ajax.responseText,
            icon: "warning"
          });
          VND_NOME.value = '';
          ID_VENDEDOR.value = '';
        }
    }
    ajax.send(jsonData);
}

      ID_VENDEDOR.addEventListener('change',sendForm,false);

})(window,document);