import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
class ActionForm{
  constructor(IdForm,TableName){
       this.IdForm = IdForm
       this.TableName = TableName
}
    Insert(){
        let IdForm = document.getElementById(this.IdForm);
        IdForm.addEventListener('submit',(e)=>{
            e.preventDefault();
            let RequiredTrueOrFalse = true;
            let Inputs = IdForm.querySelectorAll('input.TddCam, textarea.TddCam, select.TddCam');
            let ObjetsForms = {};
            //Validando se os campos obrigatórios estão preenchidos
            Inputs.forEach((elementrequired)=>{
               if( elementrequired.required && elementrequired.value == '' || RequiredTrueOrFalse == false){
                RequiredTrueOrFalse = false;
                }
            })
            //Percorrendo pelos campos e pegando os valores
            Inputs.forEach((elementCorrent)=>{
            let ValueInputs;
            let NamesInputs = elementCorrent.name;
            //Campos de flags
            if(elementCorrent.type == 'checkbox' || elementCorrent == 'radio'){
                ValueInputs = elementCorrent.checked ? 'S' : 'N';
            }
            //Campos de data
            if(elementCorrent.type == 'date'){
                let date = elementCorrent.value;
                let datesplit = date.split('-');
                let datafinal = `${datesplit[2]}-${datesplit[1]}-${datesplit[0]}`;
                ValueInputs = datafinal;
            }
            //Campos de string
            if(elementCorrent.type == 'text' || elementCorrent.type == 'number' || elementCorrent.type == 'textarea' || elementCorrent.tagName == 'SELECT' ){
             ValueInputs = elementCorrent.value == '' ? '' : elementCorrent.value;
            }
            //Inserindo os valores no objeto
            ObjetsForms[NamesInputs] = ValueInputs
            })
            //Criando Sql
            let SqlInsert = 'BEGIN \n INSERT INTO ' + this.TableName + '  (';
            for (let key in ObjetsForms) {
                if (ObjetsForms.hasOwnProperty(key)) {
                    SqlInsert += key + ',\n';
                }
            }
            SqlInsert += 'USU_ALTER,USU_INCLU,DT_INCLU,DT_ALTER)'
            // Adicionar a parte VALUES
            SqlInsert += ' VALUES (';
            for (let key in ObjetsForms) {
                if (ObjetsForms.hasOwnProperty(key)) {
                    SqlInsert += ':' + key + ', \n';
                }
            }

            SqlInsert += ':USU_LOGADO,:USU_LOGADO,SYSDATE,SYSDATE)'
            // Fechar a instrução SQL
            SqlInsert += '; \n COMMIT; \n END;';
            let data ={
                sql: SqlInsert,
                mensagem_sucess:'  Registro inserido com sucesso',
                mensagem_error:'Error ao inseri registro',
                binds:ObjetsForms,
                USU_LOGADO: true
            }
            if(RequiredTrueOrFalse){
            let barra_progresso = document.getElementById('PROGRESSO');
            barra_progresso.style.opacity = 1;
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/rota/universal');
            ajax.setRequestHeader('Content-type', 'application/json');
            ajax.onreadystatechange = function () {
                if (ajax.status === 200) {
                    new Tabela().LimpaInputs(IdForm.id);
                    barra_progresso.style.opacity = 0;
                    swal( ajax.response,"","success");
                } else {
                        swal({
                            title: ajax.responseText + ajax.status + '  Error :',
                            icon: 'warning'
                        } )
                        barra_progresso.style.opacity = 0;
                }
            };
            ajax.send(JSON.stringify(data));
            }
        })
    }

    delete(PkRegistro){
        document.getElementById('EXCLUIR').addEventListener('click', (e) => {
            let TrSelecionado = document.getElementsByClassName('Selectedtr');
            if(TrSelecionado.length == 1){
              Array.from(TrSelecionado).forEach(element => {
                let td = element.querySelectorAll('td')
                td.forEach((tdcorrent, index) => {
                  if (index == 0) {
                    alert(tdcorrent)
                    let data = {
                      sql:`BEGIN DELETE FROM ${this.TableName} WHERE ${PkRegistro} = :PkRegistro; COMMIT; END;`,
                      binds:{PkRegistro:tdcorrent.textContent},
                      mensagem_sucess: 'Registro deletado com sucesso!',
                      mensagem_error: 'Erro ao deletar registro!',
                    }
                    new Ajax('/rota/universal',data).RequisicaoAjax(true)
                    // element.remove(); // Remove o elemento selecionado da tabela
                  }
                })
              });
            } else {
              swal({
                text:'Selecione apenas um registro',
                icon:'error'
              })
            }
          });
          
    }


    Update(IdPk_){
      let IdForm = document.getElementById(this.IdForm);
      let IdPk_registro = document.getElementById(IdPk_);

      IdForm.addEventListener('submit',(e)=>{

          e.preventDefault();
          let RequiredTrueOrFalse = false
          let Inputs = IdForm.querySelectorAll('input.TddCam, textarea.TddCam, select.TddCam');
          let ObjetsForms = {};
          //Validando se os campos obrigatórios estão preenchidos
          RequiredTrueOrFalse = false;
          Inputs.forEach((elementrequired)=>{
             if( elementrequired.required && elementrequired.value == ''){
              RequiredTrueOrFalse = false;
              }else{
                  if(!RequiredTrueOrFalse &&  elementrequired.value == ''){
                      RequiredTrueOrFalse = false;
                  }else{
                      RequiredTrueOrFalse = true
                  }
              }
          })
          //Percorrendo pelos campos e pegando os valores
          Inputs.forEach((elementCorrent)=>{
          let ValueInputs;
          let NamesInputs = elementCorrent.name;
          //Campos de flags
          if(elementCorrent.type == 'checkbox' || elementCorrent == 'radio'){
              ValueInputs = elementCorrent.checked ? 'S' : 'N';
          }
          //Campos de data
          if(elementCorrent.type == 'date'){
              let date = elementCorrent.value;
              let datesplit = date.split('-');
              let datafinal = `${datesplit[2]}-${datesplit[1]}-${datesplit[0]}`;
              ValueInputs = datafinal;
          }
          //Campos de string
          if(elementCorrent.type == 'text' || elementCorrent.type == 'number' || elementCorrent.type == 'textarea' || elementCorrent.tagName == 'SELECT' ){
           ValueInputs = elementCorrent.value == '' ? '' : elementCorrent.value;
          }
          //Inserindo os valores no objeto
          ObjetsForms[NamesInputs] = ValueInputs
  
          })
          //Criando Sql
          let SqlUpdate = 'BEGIN \n UPDATE ' + this.TableName + ' SET '
           SqlUpdate += 'USU_ALTER = :USU_LOGADO,DT_ALTER = SYSDATE, '
          for (let key in ObjetsForms) {
              if (ObjetsForms.hasOwnProperty(key)) {
                  SqlUpdate += key + " = '" +  ObjetsForms[key] +"' , \n" ;
              }
          }
          SqlUpdate =   SqlUpdate.replace(/,(\s*)$/,' ');
          // Fechar a instrução SQL
          SqlUpdate += ' \n WHERE ' + IdPk_registro.name;
          SqlUpdate += " = '"+   + IdPk_registro.value + "'"
          SqlUpdate += '; \n COMMIT; \n END;';
          let data ={
              sql: SqlUpdate,
              mensagem_sucess:'  Registro alterado com sucesso',
              mensagem_error:'Error ao editar registro',
              binds:{},
              USU_LOGADO: true
          }
          if(RequiredTrueOrFalse == true){
               new Ajax('/rota/universal',data).RequisicaoAjax(true)}
                 })
  }


}
export {ActionForm as ActionForm}