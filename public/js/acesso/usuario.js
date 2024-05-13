(function readJS(win,doc){
let tbody = document.getElementById('tabelaacesso');
let ID = document.getElementById('ID_USU');
let PROGRESSO = document.getElementById('PROGRESSO');


tbody.addEventListener('change', (e) => {
    let checkbox = e.target;
    let cell = checkbox.closest('td'); // célula que contém o checkbox
    if (!cell) {
        return; // Não é uma célula com checkbox
    }
    let cellIndex = cell.cellIndex;
        // Verifica se a célula contém um checkbox (a partir da terceira coluna)
    if (cellIndex >= 2) {
        // Acessa a linha, a primeira célula da linha (ID_TELA)
        let ID_TELA = (cell.parentNode.cells[0]).textContent;
        // Verifica se o checkbox está marcado (true) e recebe S; ou desmarcado (false) recebe N
        let isChecked = (checkbox.checked ? 'S' : 'N');
        let POSICAO;

  let TABELA = document.getElementById('TABELA');
        if(TABELA.value == 'USU_USUARIO'){
            switch (cellIndex) {
                case 2:
                    POSICAO = 'CFU_ALTERA'
                    break;
                case 3:
                    POSICAO = 'CFU_INCLUI'
                    break;
                case 4:
                    POSICAO = 'CFU_DELETA'
                    break;
                case 5:
                    POSICAO = 'CFU_CONSULTA'
                    break;
                
                default:
                    break;
             }
        }
        if(TABELA.value == 'GRP_GRUPO'){
            switch (cellIndex) {
                case 2:
                    POSICAO = 'GRUP_ALTERA'
                    break;
                case 3:
                    POSICAO = 'GRUP_INCLUI'
                    break;
                case 4:
                    POSICAO = 'GRUP_DELETA'
                    break;
                case 5:
                    POSICAO = 'GRUP_CONSULTA'
                    break;
                case 6:
                
                default:
                    break;
             }
        }
        let objeto = {
            ID_TELA: ID_TELA,
            VALOR: isChecked,
            POSICAO: POSICAO,
            ID:ID.value,
            TABELA: TABELA.value
        };
        let ajax = new XMLHttpRequest();
        let jsonData = JSON.stringify(objeto);
        ajax.open('POST', '/usuario_acesso');
        ajax.setRequestHeader('Content-type', 'application/json');
        //mostra ao usuário a barra de progresso
        PROGRESSO.style.opacity = '1'
        ajax.onreadystatechange = function (){
           if(ajax.status === 200){
        //omite do usuário a barra de progresso
        PROGRESSO.style.opacity = '0'
           }else{
            swal({
                title: ajax.responseText,
                icon: 'error'
            })
           }
           PROGRESSO.style.opacity = '0'

        }
        ajax.send(jsonData)
    }
});

})(window,document)