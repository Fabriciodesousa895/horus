// (function readyJS(win, doc) {
//     'use strict';

//     win.addEventListener("beforeunload", () => {

//         let ajax = new XMLHttpRequest();
//         ajax.open('POST', '/onloadusuario', false);  // O terceiro parâmetro é 'false' para tornar a solicitação síncrona
//         ajax.setRequestHeader('Content-type', 'application/json');
//         ajax.send();
//         console.log('Usuário está saindo da tela.');

//         // Você pode verificar o status da solicitação aqui, se necessário
//         if (ajax.status == 200) {
//             console.log('Solicitação AJAX concluída com sucesso.');
//         }
//     }, false);

// })(window, document);
