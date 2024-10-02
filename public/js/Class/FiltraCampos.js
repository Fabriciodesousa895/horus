class FiltraCampos{
    constructor(CLASS_CAMPO_1,CLASS_CAMPO_2,TABELA){
    this.CLASS_CAMPO_1 = CLASS_CAMPO_1;
    this.CLASS_CAMPO_2 = CLASS_CAMPO_2;
    this.TABELA= TABELA;
    }
    Filtra(){
  
        let CLASS_CAMPO_1 = Array.from(document.getElementsByClassName(this.CLASS_CAMPO_1));
        // let CAMP_2 = document.getElementById(this.CAMPO_2);
        alert('-------FORA--')
        console.table(CLASS_CAMPO_1)
        
        CLASS_CAMPO_1.forEach((ElementoCorrente)=>{
            alert('----DENTRO-----')
            ElementoCorrente.addEventListener('change',()=>{
                let BarraProgresso = document.getElementById('PROGRESSO');
                BarraProgresso.style.opacity = '1';
                    let ajax = new XMLHttpRequest();
                    ajax.open('POST', '/select/universal');
                    ajax.setRequestHeader('Content-type', 'application/json');
                    let data = {
                        sql: `SELECT FILTRA_CAMPO(:CLASS_CAMPO_1, '',:TABELA) FROM DUAL`,
                        binds: {
                            CAMP_1:CAMP_1.value ,
                            CAMP_2: '',
                            TABELA: this.TABELA
                        },
                        USU_LOGADO: false
                    };
                    let JsonData = JSON.stringify(data);
                    ajax.onload = function () {
                        if (ajax.status === 200) {
                            let arraydedados = JSON.parse(ajax.responseText);
                            if (arraydedados) {
                                // CAMP_1.value = arraydedados[0][0];
                                // CAMP_2.value = arraydedados[0][1];
                                swal({
                                    text: ajax.responseText,
                                    icon: 'success'
                                });
                            } else {
                                // CAMP_1.value = '';
                                // CAMP_2.value = 'nao';
                            }
                        } else {
                            swal({
                                text: ajax.responseText,
                                icon: 'info'
                            });
                        }
                        BarraProgresso.style.opacity = '0';
                      
                    };
                    ajax.send(JsonData);
                
                })
        })





}


}
export { FiltraCampos as FiltraCampos }; 
