
(
    function readyJS(win,doc){
       'use strict';

       let ID_GRUPO = document.getElementById('ID_GRUPO');
       let ID_GRUPO_FILTRO = document.getElementById('ID_GRUPO_FILTRO');
       function sendForm(evento){
        evento.preventDefault();
        let  ajax = new XMLHttpRequest();
        ajax.open('POST','/select/universal');
        let data = {sql : `SELECT ID_GRUPO,GRP_NOME FROM GRP_GRUPO`,binds:{},rows:true,USU_LOGAD0: false}
        let JsonData = JSON.stringify(data)
        ajax.setRequestHeader('Content-type' ,'application/json');
        ajax.onreadystatechange = function(){
            if(ajax.status === 200){
 
       let data = JSON.parse(ajax.responseText);

       ID_GRUPO.innerHTML = ''; // Limpa o select
       ID_GRUPO_FILTRO.innerHTML = ''; // Limpa o select
 
  
        const option = document.createElement("option");
        option.value = ID_GRUPO_FILTRO.value;
        option.text = 'Selecione um grupo';
        ID_GRUPO.appendChild(option);
        ID_GRUPO_FILTRO.appendChild(option);



       data.forEach(item => {
         const option = document.createElement("option");
         option.value = item[0];
         option.text = item[1];
         ID_GRUPO.appendChild(option);
       });
       data.forEach(item => {
         const option = document.createElement("option");
         option.value = item[0];
         option.text = item[1];
         ID_GRUPO_FILTRO.appendChild(option);
       });
  
            }else{
                swal({
                    title: ajax.response ,
                    icon:'error'
                  }) 
            }
        }
        ajax.send(JsonData);
       }
       window.addEventListener('load',sendForm,false)
       
    }

)(window,document);