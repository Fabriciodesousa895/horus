'use strict';
import { Ajax } from "../Class/Ajax.js";
document.getElementById('EDITAR').addEventListener('click',(e)=>{
    e.preventDefault();
    let COD_NCM_NEW = document.getElementById('COD_NCM_NEW');
    let COD_NCM_OLD = document.getElementById('COD_NCM_OLD');
    let NCM_DESC = document.getElementById('NCM_DESC');
    let data ={ 
        sql:`BEGIN ALTERA_NCM(:COD_NCM_OLD,:COD_NCM_NEW,:NCM_DESC,:USU_LOGADO); END;`,
        binds:{COD_NCM_OLD:COD_NCM_OLD.value,COD_NCM_NEW:COD_NCM_NEW.value,NCM_DESC:NCM_DESC.value},
        USU_LOGADO:true,
        mensagem_error:'error',
        mensagem_sucess:'Registro editado com sucesso!'
    }
    new Ajax('/rota/universal',data).RequisicaoAjax(true);

})