(function readJS(win,doc){
  'use strict';
  let DELETA = document.getElementById('DELETA');
  let ID_USU = document.getElementById('ID_USU');

  function sendForm(){
  let ajax = new XMLHttpRequest();
  let data = {
    ID_USU: ID_USU.value
  }
  let jsondata = JSON.stringify(data)
    ajax.open('POST','/delete_usu');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = function (){
      if(ajax.status == 200){
        swal({
          title: ajax.response,
          icon: 'warning'
         })
      }else{
     swal({
      title: ajax.response,
      icon: 'error'
     })

      }
    }
    ajax.send(jsondata)

  };
  
  DELETA.addEventListener('click',sendForm,false)
})(window,document)