'use strict';

window.addEventListener('beforeunload', () => {
 let url = new URL( window.location.href);
 let path = url.pathname;
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/beforeunload'); 
    ajax.setRequestHeader('Content-type', 'application/json');
    let data = {  url_atual :path}; 
    let JsonData = JSON.stringify(data)
    if (ajax.status === 200) {
        console.log('Saindo da tela!');
    } else {
        console.log('erro')

    }

 

    ajax.send(JsonData);
});
