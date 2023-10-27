(function readyJS(win,doc){
    'use strict';
  

    let ID_FORNECE = document.getElementById('ID_FORNECE');
    let ID_RECEBE = document.getElementById('ID_RECEBE');
    let BTN_COPIA = document.getElementById('BTN_COPIA');
    let NOME_USU_R = document.getElementById('NOME_USU_R');
    let NOME_USU_F = document.getElementById('NOME_USU_F');


    function sendForm(e){
        if(ID_FORNECE.value != '' && ID_RECEBE.value != ''){
         let ajax = new XMLHttpRequest();
         let data = {
            ID_FORNECE:ID_FORNECE.value,
            ID_RECEBE:ID_RECEBE.value
         };
         let jsonData = JSON.stringify(data);
         ajax.open('POST','/copia_usuario');
         ajax.setRequestHeader('Content-type','application/json');
         ajax.onreadystatechange = function (){
            if(ajax.status == 200){
                swal({
                    title:ajax.responseText,
                    icon: 'success'
                })
                ID_FORNECE.value = '';
                ID_RECEBE.value  = '';
                NOME_USU_R.value = '';
                NOME_USU_F.value = '';
                
            }
         }
         ajax.send(jsonData);
    }
    }
    BTN_COPIA.addEventListener('click',sendForm,false)
})(window,document)