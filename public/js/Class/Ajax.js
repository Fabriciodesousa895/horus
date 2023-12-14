//Esta class só deve ser usada para requisições mais simples e menores do tipo POST

class Ajax {
    constructor(Rota, binds) {
        this.Rota = Rota;
        this.binds = binds;
    }

    RequisicaoAjax() {
        let ajax = new XMLHttpRequest();
        ajax.open('POST', this.Rota);
        ajax.setRequestHeader('Content-type', 'application/json');
        ajax.onreadystatechange = function () {
            if (ajax.status === 200) {
                console.log(array_de_dados);
                return JSON.parse(ajax.responseText)
            } else {
                console.log('ERROR');
                return swal({
                    title: 'Error',
                    icon: 'error'
                });
            }
        };
        let jsonData = JSON.stringify(this.binds);
        ajax.send(jsonData);
    }

}

export { Ajax as Ajax }; 
