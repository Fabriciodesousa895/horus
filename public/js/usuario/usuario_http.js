(function readyJS(win, doc) {
  'use strict';

  let USU_NOME = document.getElementById('USU_NOME');
  let ID_GRUPO = document.getElementById('ID_GRUPO');
  let USU_SENHA = document.getElementById('USU_SENHA');
  let ID_VENDEDOR = document.getElementById('ID_VENDEDOR');
  let ID_PARC = document.getElementById('ID_PARC');
  let CFG_USU_ALT_PARC = document.getElementById('CFG_USU_ALT_PARC');
  let CFG_USU_CONF_CONFERE_CAIXA = document.getElementById('CFG_USU_CONF_CONFERE_CAIXA');
  let CFG_USU_EXC_FIN = document.getElementById('CFG_USU_EXC_FIN');
  let CFG_USU_FECHA_CAIXA = document.getElementById('CFG_USU_FECHA_CAIXA');
  let CFG_USU_LIB_BLOQ_PARC = document.getElementById('CFG_USU_LIB_BLOQ_PARC');
  let USU_ADM = document.getElementById('USU_ADM')

  // Envia o formulário para o servidor em formato JSON
  function sendForm(evento) {
    evento.preventDefault();

    // Verificando se os campos obrigatórios estão preenchidos
    if (USU_NOME.checkValidity() && USU_SENHA.checkValidity() && ID_PARC.checkValidity() && ID_VENDEDOR.checkValidity ) {
      let ajax = new XMLHttpRequest();
      let data = {
        USU_NOME: USU_NOME.value,
        USU_SENHA: USU_SENHA.value,
        ID_VENDEDOR: ID_VENDEDOR.value,
        ID_GRUPO: ID_GRUPO.value,
        ID_PARC : ID_PARC.value,
        CFG_USU_ALT_PARC: CFG_USU_ALT_PARC.checked ? 'S' : 'N',
        CFG_USU_CONF_CONFERE_CAIXA : CFG_USU_CONF_CONFERE_CAIXA.checked ? 'S' : 'N',
        CFG_USU_LIB_BLOQ_PARC : CFG_USU_LIB_BLOQ_PARC.checked ? 'S' : 'N',
        CFG_USU_FECHA_CAIXA : CFG_USU_FECHA_CAIXA.checked ? 'S' : 'N',
        CFG_USU_EXC_FIN : CFG_USU_EXC_FIN.checked ? 'S' : 'N',
        USU_ADM: USU_ADM.checked ? 'S' : 'N'


      };


      let jsonData = JSON.stringify(data);

      ajax.open('POST', '/usuario');
      ajax.setRequestHeader('Content-type', 'application/json');
      ajax.onreadystatechange = function () {
        if (ajax.status === 200 && ajax.readyState === 4) {
                  swal({
                    title: ajax.response,
                    icon:'success'
                  });
                  let inputs = document.querySelectorAll('.insert');
                  ID_PARC.value = '';
                  USU_SENHA.value = '';
                  
                  inputs.forEach((e) => {
                    e.value = '' // Isso adicionará uma borda verde aos elementos
                  });
                  
             
        }else{
          swal({
            title: ajax.response,
            icon:'error'
          }) 
        }
      };
      ajax.send(jsonData);
    } else {
      // Se os campos obrigatórios não estiverem preenchidos informar ao usuario um aviso
      swal({
        text: 'Por favor, preencha todos os campos obrigatórios',
        icon: 'warning'
      });
    }
  }

  document.getElementById('SALVA').addEventListener('click', sendForm, false);

})(window, document);
