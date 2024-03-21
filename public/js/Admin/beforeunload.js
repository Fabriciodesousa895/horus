'use strict';
window.addEventListener('beforeunload', () => {
    let id_tela =document.getElementById('ID_TELA_ATUAL')
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/beforeunload'); 
    ajax.setRequestHeader('Content-type', 'application/json');
    let data = {  ID_TELA :id_tela.value}; 
    let JsonData = JSON.stringify(data)
     ajax.send(JsonData);
});
