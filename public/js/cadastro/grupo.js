import { filtra_campo } from "../Class/Filtra_campo.js";
import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
let form = document.getElementById('form')

//Inserindo um novo registro
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let GRP_NOME = document.getElementById('GRP_NOME');
    let GRP_DESC = document.getElementById('GRP_DESC');
    let data ={
      sql:`BEGIN INSERT INTO GRP_GRUPO(GRP_NOME,GRP_DESC,ID_USU_INCLUSAO,COD_USU_ALTER,DT_INCLU,DT_ALTER) VALUES(UPPER(:GRP_NOME),UPPER(:GRP_DESC),:USU_LOGADO,:USU_LOGADO,SYSDATE,SYSDATE); COMMIT;END;`,
      binds:{GRP_DESC:GRP_DESC.value,GRP_NOME:GRP_NOME.value},
      mensagem_sucess:'Registro inserido com sucesso!', 
      mensagem_error:'Erro ao inserir registro!',
      USU_LOGADO: true
    };
    if(GRP_NOME.value != '' && GRP_DESC.value != '' ){
      new Ajax('/rota/universal',data).RequisicaoAjax(true)
        GRP_NOME.value = '';
        GRP_DESC.value = '';

    }
  
  })