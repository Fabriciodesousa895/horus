(function readyJS(win,doc){
'use strict';
let USU_SENHA = document.getElementById('USU_SENHA');
let USU_NOME = document.getElementById('USU_NOME');
let btn = document.getElementById('btn');

function sendForm(evento){
    evento.preventDefault();
    if(USU_SENHA.checkValidity() && USU_NOME.checkValidity()){
       let ajax = new XMLHttpRequest();
       let data = {
        USU_SENHA : USU_SENHA.value,
        USU_NOME : USU_NOME.value
       };
       let jsonData = JSON.stringify(data);
       ajax.open('POST', '/login');       
       ajax.setRequestHeader('Content-type', 'application/json');
       ajax.onreadystatechange = function (){
        if (ajax.status === 200 ) {
            swal({
              title: ajax.response,
              icon:'warning'
            });
            setInterval(() => {
                location.href = '/usuario'
            }, 3000);
           
  }else{
    swal({
      title: ajax.response,
      icon:'error'
    }) 
    setInterval(() => {
      location.href = '/usuario'
  }, 3000);
  }
       }    
       
       ajax.send(jsonData);
       
    }else{
        swal({
            title:'Preencha usuário e senha!',
            icon: 'warning'
        })
    }
}

btn.addEventListener('click',sendForm,false);
}) (window,document);