// (function readJS(win, doc) {
//     'use strict';


//     function sendForm() {

//             //mostra ao usuário a barra de progresso
//             PROGRESSO.style.opacity = '1'

//             let ajax = new XMLHttpRequest();
//             ajax.open('POST', '/teste');
//             ajax.setRequestHeader('Content-type', 'application/json');
//             //pega os dados dos inputs e adiciona num objeto
//             let data = {
//                 ROTA: ROTA.value,
//                 T_NOME: T_NOME.value,
//                 T_DESCRICAO: T_DESCRICAO.value,
//                 TIPO: TIPO.value
//             }
//             //transforma objeto em json
//             let jsonData = JSON.stringify(data)
//             ajax.onreadystatechange = () => {
//                 if (ajax.status === 200) {
//                     swal({
//                         text: ajax.responseText,
//                         icon: 'success'
//                     })
//                 } else {
//                     swal({
//                         text: ajax.responseText,
//                         icon: 'error'
//                     })
//                 }
//             }
//     }



//     document.getElementById('SALVAR').addEventListener('click', sendForm, false)
// })(window, document)
fetch('/teste')
.then(response => response.text())
.then(base64Data => {
    const imagem = document.getElementById('imagem');
    imagem.src = 'data:image/jpeg;base64,' + base64Data;
});