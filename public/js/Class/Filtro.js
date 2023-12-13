
  function SalvaFiltro (ID_TELA,P_CAMP_1,P_CAMP_2,P_CAMP_3,P_CAMP_4,P_CAMP_5,P_CAMP_6,P_CAMP_7,P_CAMP_8,P_CAMP_9,P_CAMP_10) {
'use strict';
console.log('Tetsando 123')
    let ajax = new XMLHttpRequest();
    ajax.open('POST', '/rota/universal');
    ajax.setRequestHeader('Content-type', 'application/json');
    let data = {
        sql: `BEGIN HIST_FILTROS(:P_ID_TELA,
            :USU_LOGADO,
            :P_CAMP_1,:P_CAMP_2,
            :P_CAMP_3,:P_CAMP_4,
            :P_CAMP_5,:P_CAMP_6,
            :P_CAMP_7,:P_CAMP_8,
            :P_CAMP_9,:P_CAMP_10
            ); END;`,
        binds: {
            P_ID_TELA: ID_TELA,
            P_CAMP_1: P_CAMP_1,P_CAMP_2: P_CAMP_2,
            P_CAMP_3: P_CAMP_3,P_CAMP_4: P_CAMP_4,
            P_CAMP_5: P_CAMP_5,P_CAMP_6: P_CAMP_6,
            P_CAMP_7: P_CAMP_7,P_CAMP_8: P_CAMP_8,
            P_CAMP_9: P_CAMP_9,P_CAMP_10: P_CAMP_10
        },
        mensagem_sucess: 'OK',
        mensagem_error: 'Houve um erro ao salvar os regitros!',
        USU_LOGADO: true
    }
    let JsonData = JSON.stringify(data);
    ajax.onreadystatechange = () => {
        if (ajax.status === 200) {

 
        } else {
            swal({
                text: ajax.responseText,
                icon: 'error'
            });
        }
    }
    ajax.send(JsonData);
    
  }
  module.exports = { SalvaFiltro }