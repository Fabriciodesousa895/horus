'use strict'
import { Ajax } from "../Class/Ajax.js";
document.getElementById('REINCIAR')
  .addEventListener('click', (e) => {
    swal({
      title: 'Reinicializar o sistema?',
      text: 'Ao reinicializar será finalizado todas as sessões, e em alguns instantes a aplicação estará disponivel!',
      buttons: true,
      dangerMode: true,
      icon: 'warning'
    }).then((willDelete) => {
      if (willDelete) {
        console.log('Sim');
        new Ajax('/ReiniciarAplicacao', []).RequisicaoAjax(false);
      }
    })
  })
function SalvaInput(ID_INPUT) {
  let Campo = document.getElementById(ID_INPUT);
  Campo.addEventListener('change', () => {
    let Valores

    if (Campo.type == 'number' ) {
      Valores = Campo.value 
    } else if (Campo.type == 'checkbox') {
      Valores = Campo.checked ? 'S' : 'N'
    }
    let data = {
      sql: `BEGIN UPDATE PREFERENCES SET ${ID_INPUT} = '${Valores}'; COMMIT;END; `,
      binds: {},
      USU_LOGADO: false

    }
    console.log(data)
    new Ajax('/rota/universal', data).RequisicaoAjax(false)
    setInterval((() => { document.getElementById('PROGRESSO').style.opacity = 0 }), 1000)
  })


}
SalvaInput('USU_ALT_USU');
SalvaInput('VAL_CGC');
SalvaInput('TEMPO_S_INATIVA');
SalvaInput('D_USU_INAT');
SalvaInput('DIAS_ATUALIZAR_PARC');
SalvaInput('CORRIGE_CID');
SalvaInput('VIA_CEP');







document.getElementById('AtualizaLicenca').addEventListener('click', () => {
  swal({
    title: 'Atualizar licença?',
    text: 'Tenha o token correto em mãos!',
    buttons: true,
    dangerMode: true,
    icon: 'warning'
  }).then((willDelete) => {
    if (willDelete) {
      swal("Infome o token da licença!", {
        content: 'input',
        dangerMode: true,
        buttons: true
      }).then((value) => {
        console.log(value)
        let data = { Token: value }
        if (value != null && value != '') {
          new Ajax('/AtualizaLicenca', data).RequisicaoAjax(true)
        } else {
          swal({
            text: "Informe token para prosseguir!",
            icon: "warning"
          })
        }
      })
    }
  })
})


