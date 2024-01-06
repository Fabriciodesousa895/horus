//Esta class só deve ser usada para requisições mais simples e menores do tipo POST
class Ajax {
    constructor(Rota, binds) {
        this.Rota = Rota;
        this.binds = binds;
    }
    //Método para requisções ajax do método POST
    //Parametro Info informa se deve ou não informar o resultado da requisição,aceitando apenas valores booleanos
    RequisicaoAjax(Info) {
        let barra_progresso = document.getElementById('PROGRESSO');
        barra_progresso.style.opacity = 1
        return new Promise((resolve, reject) => {
            let ajax = new XMLHttpRequest();
            ajax.open('POST', this.Rota);
            ajax.setRequestHeader('Content-type', 'application/json');
            ajax.onreadystatechange = function () {
                if (ajax.status === 200) {
                    if (Info) {
                        resolve(
                            swal({
                                title: ajax.responseText,
                                icon: 'info'
                            }
                            ));
                        barra_progresso.style.opacity = 0

                    } else {
                        resolve(JSON.parse(ajax.responseText));
                        barra_progresso.style.opacity = 0

                    }

                } else {

                    reject(
                        swal({
                            title: ajax.responseText + 'Error',
                            icon: 'error'
                        }
                        ));
                    barra_progresso.style.opacity = 0

                }
            };
            let jsonData = JSON.stringify(this.binds);
            ajax.send(jsonData);
        })

    }

}

export { Ajax as Ajax }; 
