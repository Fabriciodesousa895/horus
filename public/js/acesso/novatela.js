(function readJS(win, doc) {
    'use strict';
    let PROGRESSO = document.getElementById('PROGRESSO');
    let T_NOME = document.getElementById('T_NOME');
    let TIPO = document.getElementById('TIPO');
    let PERSONALIZADA = document.getElementById('PERSONALIZADA');
    let T_DESCRICAO = document.getElementById('T_DESCRICAO');
    let ROTA = document.getElementById('ROTA');

    function sendForm() {
        if (T_NOME.value == '' || TIPO.value == '' || T_DESCRICAO.value == '' || ROTA.value == '') {
            swal({
                text: 'Preencha todos os campos!',
                icon: 'error'
            })
        } else {
            //mostra ao usuário a barra de progresso
            PROGRESSO.style.opacity = '1'

            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/rota/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            //pega os dados dos inputs e adiciona num objeto
            let data = {
                sql: `BEGIN
                INSERT INTO T_TELA (ROTA,T_NOME,T_DESCRICAO,TIPO,PERSONALIZADA) VALUES(:T_ROTA,:T_NOME,:T_DESCRICAO,:TIPO,:PERSONALIZADA);
                COMMIT;
                END;`,
                binds:{
                    T_ROTA: ROTA.value,
                    T_NOME: T_NOME.value,
                    T_DESCRICAO:  T_DESCRICAO.value,
                    TIPO: TIPO.value,
                    PERSONALIZADA: PERSONALIZADA.checked ? 'S' : 'N'
                  },
                  mensagem_sucess:'Registro inserido com sucesso!',
                  mensagem_error:'Erro ao inserir registro!',
                  USU_LOGADO: false
            }
            //transforma objeto em json
            let jsonData = JSON.stringify(data)
            ajax.onreadystatechange = () => {
                if (ajax.status === 200) {
                    //omite do usuário a barra de progresso
                    PROGRESSO.style.opacity = '0'
                    swal({
                        text: ajax.responseText,
                        icon: 'success'
                    })
                    //limpa os campos
                    ROTA.value = ''
                    T_DESCRICAO.value = ''
                    TIPO.value = ''
                    T_NOME.value = ''
                } else {
                    swal({
                        text: ajax.responseText,
                        icon: 'error'
                    })
                }
            }
            //envia o objeto no corpo da requisição
            ajax.send(jsonData);
        }

    }



    document.getElementById('SALVAR').addEventListener('click', sendForm, false)
})(window, document)