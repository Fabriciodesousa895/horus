import { Tabela } from "./Tabela.js";
class filtra_campo{
    constructor(CAMPO_1,CAMPO_2,TABELA){
    this.CAMPO_1= CAMPO_1;
    this.CAMPO_2= CAMPO_2;
    this.TABELA= TABELA;
    }
    FiltraVersaoAnterior(){
  
        let CAMP_1 = document.getElementById(this.CAMPO_1);
        let CAMP_2 = document.getElementById(this.CAMPO_2);
        CAMP_1.addEventListener('change',()=>{
        let BarraProgresso = document.getElementById('PROGRESSO');
        BarraProgresso.style.opacity = '1';
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/select/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            let data = {
                sql: `SELECT FILTRA_CAMPO(:CAMP_1, :CAMP_2,:TABELA) FROM DUAL`,
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
                        CAMP_1.value = arraydedados[0][0];
                        CAMP_2.value = arraydedados[0][1];
                        
                    } else {
                        CAMP_1.value = '';
                        CAMP_2.value = 'nao';
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


            CAMP_2.addEventListener('change',()=>{
                let ajax = new XMLHttpRequest();
                ajax.open('POST', '/select/universal');
                ajax.setRequestHeader('Content-type', 'application/json');
                let data = {
                    sql: `SELECT FILTRA_CAMPO(:CAMP_1, :CAMP_2,:TABELA) FROM DUAL`,
                    binds: {
                        CAMP_1:'' ,
                        CAMP_2: CAMP_2.value,
                        TABELA: this.TABELA
                    },
                    mensage_error: 'Houve um erro ao consultar registros',
                    rows: true,
                    USU_LOGADO: false
                };
                let JsonData = JSON.stringify(data);
                ajax.onload = function () {
                    if (ajax.status === 200) {

                let arraydedados = JSON.parse(ajax.responseText);

                        if (arraydedados) {
                            CAMP_1.value = arraydedados[0][0];
                            CAMP_2.value = arraydedados[0][1];
                     
                       
                        } else {
                            CAMP_1.value = '';
                            CAMP_2.value = '';
                        }
                    } else {
                        swal({
                            text: ajax.responseText,
                            icon: 'info'
                        });
                    }
                };
                ajax.send(JsonData);
        })



}
    Filtra(){
  
        let CAMP_1 = document.getElementById(this.CAMPO_1);
        let CAMP_2 = document.getElementById(this.CAMPO_2);
        // CAMP_1.addEventListener('change',()=>{
        // let BarraProgresso = document.getElementById('PROGRESSO');
        // BarraProgresso.style.opacity = '1';
        //     let ajax = new XMLHttpRequest();
        //     ajax.open('POST', '/select/universal');
        //     ajax.setRequestHeader('Content-type', 'application/json');
        //     let data = {
        //         sql: `SELECT FILTRA_CAMPO(:CAMP_1, :CAMP_2,:TABELA) FROM DUAL`,
        //         binds: {
        //             CAMP_1:CAMP_1.value ,
        //             CAMP_2: '',
        //             TABELA: this.TABELA
        //         },
        //         USU_LOGADO: false
        //     };
        //     let JsonData = JSON.stringify(data);
        //     ajax.onload = function () {
        //         if (ajax.status === 200) {
        //             let arraydedados = JSON.parse(ajax.responseText);
        //             if (arraydedados) {
        //                 CAMP_1.value = arraydedados[0][0];
        //                 CAMP_2.value = arraydedados[0][1];
                        
        //             } else {
        //                 CAMP_1.value = '';
        //                 CAMP_2.value = 'nao';
        //             }
        //         } else {
        //             swal({
        //                 text: ajax.responseText,
        //                 icon: 'info'
        //             });
        //         }
        //         BarraProgresso.style.opacity = '0';
              
        //     };
        //     ajax.send(JsonData);
        
        // })


            CAMP_2.addEventListener('keyup',()=>{

             document.getElementById('modalfiltro000').click();
             let InpuSearch =  document.getElementById('CampoFitroFK001');
             let BodyFiltro003 =  document.getElementById('BodyFiltro003');
             BodyFiltro003.innerText = '';
             InpuSearch.value = '';
             InpuSearch.addEventListener('keyup',(e)=>{
             let InpuSearch =  document.getElementById('CampoFitroFK001')
             let TabelaFiltro002 =  document.getElementById('TabelaFiltro002')

                let ajax = new XMLHttpRequest();
                ajax.open('POST', '/select/universal');
                ajax.setRequestHeader('Content-type', 'application/json');
                let data = {
                    sql: `SELECT FILTRA_CAMPO(:CAMP_1, :CAMP_2,:TABELA) FROM DUAL`,
                    binds: {
                        CAMP_1:'' ,
                        CAMP_2: InpuSearch.value,
                        TABELA: this.TABELA
                    },
                    mensage_error: 'Houve um erro ao consultar registros',
                    rows: true,
                    USU_LOGADO: false
                };
                let JsonData = JSON.stringify(data);
                ajax.onload = function () {
                    if (ajax.status === 200) {

                let arraydedados = JSON.parse(ajax.responseText);
              
               new Tabela('TabelaFiltro002').InseriRegistros(arraydedados);
               TabelaFiltro002.addEventListener('dblclick', (e) => {
                let elementoclicado = e.target;
                let elementopai = elementoclicado.parentNode
                // let posicao = (Coluna == 0 ? Coluna = 0 : Coluna - 1)
                let conteudocelula0 = elementopai.cells[0];
                let conteudocelula1 = elementopai.cells[1];
                let Celula0 = conteudocelula0.textContent;
                let Celula1 = conteudocelula1.textContent;
                CAMP_1.value = Celula0;
                CAMP_2.value = Celula1;
                document.getElementById('baixar').click();

                    });
                    } else {
                        swal({
                            text: ajax.responseText,
                            icon: 'info'
                        });
                    }
                };
                ajax.send(JsonData);
             })

        })



}


}
export { filtra_campo as filtra_campo }; 
