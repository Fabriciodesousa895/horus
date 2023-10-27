(function readJS(win,doc){
  'use strict';
  let delet = document.getElementById('delet');

  function sendForm(){
  let ajax = new XMLHttpRequest();

    ajax.open('POST','/delete_usu');
    ajax.setRequestHeader('Content-type','application/json');
    ajax.onreadystatechange = function (){
      alert('tef')
      if(ajax.status == 200){
  alert('teste')

      }else{
        alert('teste errado')

      }
    }

  };
  
  delet.addEventListener('dblclick',sendForm,false)
})(window,document)