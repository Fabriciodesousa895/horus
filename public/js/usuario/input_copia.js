(function readyJS(win,doc){
    'use strict';
    let ID_FORNECE = document.getElementById('ID_FORNECE');
    let NOME_USU_F = document.getElementById('NOME_USU_F');

    function sendForm(){
        let ajax = new XMLHttpRequest();
        let data = {
            ID_USU:ID_FORNECE.value
        };
        let jsonData = JSON.stringify(data);
        ajax.open('POST','/input_usu');
        ajax.setRequestHeader('Content-type','application/json');
        ajax.onreadystatechange = function(){
            if(ajax.status === 200){
                    NOME_USU_F.value = ajax.responseText 
            }else{
                swal({
                    title: ajax.responseText,
                    icon: 'error'
                })  
                ID_FORNECE.value = '';
                NOME_USU_F.value = '';
            }
        }
     ajax.send(jsonData)
    }
    ID_FORNECE.addEventListener('change',sendForm,false)
})(window,document);