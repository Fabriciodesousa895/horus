(function readyJS(win,doc){
    'use strict';
    let ID_USU = document.getElementById('ID_FORNECE');
    let USU_NOME = document.getElementById('NOME_USU_F');

    function sendForm(){
        let ajax = new XMLHttpRequest();
        let data = {
            ID_USU:ID_USU.value
        };
        let jsonData = JSON.stringify(data);
        ajax.open('POST','/input_usu');
        ajax.setRequestHeader('Content-type','application/json');
        ajax.onreadystatechange = function(){
            if(ajax.status === 200){
                USU_NOME.value = ajax.responseText 
            }else{
                swal({
                    title: ajax.responseText,
                    icon: 'error'
                })  
                ID_USU.value = '';
                USU_NOME.value = '';
            }
        }
     ajax.send(jsonData)
    }
    ID_USU.addEventListener('change',sendForm,false)
})(window,document);