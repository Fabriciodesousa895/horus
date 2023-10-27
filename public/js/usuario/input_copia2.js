(function readyJS(win,doc){
    'use strict';
    let ID_RECEBE = document.getElementById('ID_RECEBE');
    let NOME_USU_R = document.getElementById('NOME_USU_R');

    function sendForm(){
        let ajax = new XMLHttpRequest();
        let data = {
            ID_USU:ID_RECEBE.value
        };
        let jsonData = JSON.stringify(data);
        ajax.open('POST','/input_usu');
        ajax.setRequestHeader('Content-type','application/json');
        ajax.onreadystatechange = function(){
            if(ajax.status === 200){
                    NOME_USU_R.value = ajax.responseText 
            }else{
                swal({
                    title: ajax.responseText,
                    icon: 'error'
                })  
                ID_RECEBE.value = ''
            }
        }
     ajax.send(jsonData)
    }
    ID_RECEBE.addEventListener('change',sendForm,false)
})(window,document);