'use strict'
import { Ajax } from "../Class/Ajax.js";
import { filtra_campo } from "../Class/Filtra_campo.js";
new filtra_campo('ID_GRUPO', 'NOME_GRUPO', 'GRP_GRUPO').Filtra()
new filtra_campo('ID_USU', 'NOME_USU', 'USU_USUARIO').Filtra()
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
SalvaInput('CORRIGE_CID');
SalvaInput('VIA_CEP');
let Select = document.getElementById('Destino')
let EnviaGrupo = document.getElementById('EnviaGrupo')
let ListUser = document.getElementById('ListUser')
let TableForm = document.getElementById('TableForm')
let Adicionar = document.getElementById('Adicionar');
let ID_USU = document.getElementById('ID_USU');
let NOME_USU = document.getElementById('NOME_USU');
let ListUsersEnv = [];

TableForm.addEventListener('dblclick', (e) => {
  let indexvalue = ListUsersEnv.indexOf((((e.target).parentNode).cells[0]).textContent);
  if (indexvalue !== -1) {
    ListUsersEnv.splice(indexvalue, 1);
    (e.target).parentNode.remove();
  }

});


Adicionar.addEventListener('click', () => {
  if (NOME_USU.value != '' && ID_USU.value != '') {
    if (ListUsersEnv.includes(ID_USU.value)) {
      swal({ text: 'Usuário já inserido!', icon: 'error' });
      ID_USU.value = '';
      NOME_USU.value = '';
    } else {
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      let td2 = document.createElement('td');
      td.innerHTML = ID_USU.value;
      td2.innerHTML = NOME_USU.value;
      tr.appendChild(td);
      tr.appendChild(td2);
      TableForm.appendChild(tr)
      ListUsersEnv.push(ID_USU.value);
      ID_USU.value = '';
      NOME_USU.value = '';
    }

  }
})
document.getElementById('Destino').addEventListener('change', () => {
  if (Select.value == 'Grup') {
    EnviaGrupo.style.display = 'flex'
  } else {
    EnviaGrupo.style.display = 'none'
    ID_GRUPO.value = ''
    NOME_GRUPO.value = ''
  }
  if (Select.value == 'User') {
    ListUser.style.display = 'flex'
    TableForm.style.display = ''
  } else {
    ListUser.style.display = 'none'
    TableForm.style.display = 'none'
    document.getElementById('tbody').innerHTML = ''

  }
})

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

let textareamensage = document.getElementById('textareamensage')
let Destino = document.getElementById('Destino')
let Icon = document.getElementById('Icon')
let ID_GRUPO = document.getElementById('ID_GRUPO')
let NOME_GRUPO = document.getElementById('NOME_GRUPO')
let Repit = document.getElementById('Repit')
let Interval = document.getElementById('Interval')

var socket = io('https://grub-pumped-quietly.ngrok-free.app/');
document.getElementById('chat').addEventListener('click', (event) => {
  event.preventDefault();
  if (Icon.value != '' && textareamensage.value != '') {

    var messageObject = {
      message: textareamensage.value,
      icon: Icon.value,
      destinatario: Destino.value,
      Repit:Repit.value,
      Interval:Interval.value
    }
    let data = {
      sql: `BEGIN INSERT INTO INFO_ADM(MSG,DT_ENVIO,ICON,DEST,USU_ENV)
                     VALUES(:MSG,SYSDATE,:ICON,:DEST,:USU_LOGADO);COMMIT;END;`,
      binds: { MSG: textareamensage.value, ICON: Icon.value, DEST: Destino.value },
      USU_LOGADO: true,
      mensagem_sucess: ''
    }
    if (Destino.value == 'AllUsers') {
   let ReqAll =    new Ajax('/rota/universal', data).RequisicaoAjax()

  socket.emit('AllUsers', messageObject);

    }
    if (Destino.value == 'Grup'  ) {
      if(ID_GRUPO.value != ''){
        var messageObject = {
          message: textareamensage.value,
          icon: Icon.value,
          destinatario: Destino.value,
          grup: ID_GRUPO.value,
          Repit:Repit.value,
          Interval:Interval.value
        }
      new Ajax('/rota/universal', data).RequisicaoAjax().then(()=>{
        socket.emit('EnviGrupo', messageObject);
      });
      }else{
        swal({text:'Informe grupo',icon:'warning'})
      }
    }

    if (Destino.value == 'User'  ) {
      if(ListUser.length > 0 ){
        alert(ListUsersEnv.length)
        var messageObject = {
          message: textareamensage.value,
          icon: Icon.value,
          destinatario: Destino.value,
          ArryaUsers: ListUsersEnv,
          Repit:Repit.value,
          Interval:Interval.value
        }
        let data = {
          sql: `BEGIN INSERT INTO INFO_ADM(MSG,DT_ENVIO,ICON,DEST,LIST_USER,USU_ENV)
                         VALUES(:MSG,SYSDATE,:ICON,:DEST,:LIST_USER,:USU_LOGADO);COMMIT;END;`,
          binds: { MSG: textareamensage.value, ICON: Icon.value, DEST: Destino.value, LIST_USER: ListUsersEnv.toString() },
          USU_LOGADO: true,
          mensagem_sucess: ''
        }
        socket.emit('EnviUsers', messageObject);
        new Ajax('/rota/universal', data).RequisicaoAjax();
      }else{
        swal({text:'Informe os usuários.',icon:'warning'})
  
      }


    }

  }

})


var input = document.getElementById('chat');

// Variáveis para guardar a posição inicial e posição do mouse
var posicaoInicialX, posicaoInicialY, posicaoMouseX, posicaoMouseY;

// Adiciona um evento de mouse pressionado no input
input.addEventListener('dragstart', function(event) {
    // Obtém a posição inicial do input
    posicaoInicialX = input.offsetLeft;
    posicaoInicialY = input.offsetTop;

    // Obtém a posição do mouse
    posicaoMouseX = event.clientX;
    posicaoMouseY = event.clientY;

    // Adiciona um evento de movimento do mouse no documento
    document.addEventListener('mousemove', movimentaInput);
});

// Adiciona um evento de mouse solto no documento
document.addEventListener('mouseup', function() {
    // Remove o evento de movimento do mouse
    document.removeEventListener('mousemove', movimentaInput);
});

// Função para mover o input com base na posição do mouse
function movimentaInput(event) {
    // Calcula a nova posição do input com base na diferença entre a posição do mouse e a posição inicial
    var novaPosicaoX = posicaoInicialX + (event.clientX - posicaoMouseX);
    var novaPosicaoY = posicaoInicialY + (event.clientY - posicaoMouseY);

    // Define a nova posição do input
    input.style.left = novaPosicaoX + 'px';
    input.style.top = novaPosicaoY + 'px';
}