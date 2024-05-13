'use scrict';
import { SalvaFiltro } from "../Class/Filtro.js";
import {Ajax} from "../Class/Ajax.js"
import { Tabela } from "../Class/Tabela.js";
let ID_MARCA = document.getElementById('ID_MARCA');
let NOME_DESC = document.getElementById('NOME_DESC');
let NOME = document.getElementById('NOME');
let filtro = document.getElementById('filtro');
let form = document.getElementById('form');
let Marca = document.getElementById('Marca');

//Usando o filtro
filtro.addEventListener('click',(e)=>{
e.preventDefault();
  let data ={
    sql:`SELECT FILTRA_MARCA(:ID_MARCA,:NOME) FROM DUAL`,
    binds:{NOME:NOME.value,ID_MARCA:ID_MARCA.value},
    mensagem_error: "Error ao consultar registro",
    USU_LOGADO: false
  };
 new Ajax('/select/universal',data).RequisicaoAjax(false).then((dados)=>{
 new Tabela('Marca').InseriRegistros(dados);
 let tr = document.querySelectorAll('tr');
 tr.forEach(element => {
   let td = document.createElement('td');
   let check = document.createElement('input');
   check.type = 'checkbox'
   td.appendChild(check)
   element.appendChild(td); // Use element instead of tr
 });
 
 })

    e.preventDefault();
    SalvaFiltro(361,ID_MARCA.value,NOME.value,'','','','','','','','')

})
//Inserindo um novo registro
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  let data ={
    sql:`BEGIN INSERT INTO MARCA(NOME) VALUES(UPPER(:NOME_DESC)); COMMIT;END;`,
    binds:{NOME_DESC:NOME_DESC.value},
    mensagem_sucess:'Registro inserido com sucesso!', 
    mensagem_error:'Erro ao inserir registro!',
    USU_LOGADO: false
  };
  if(NOME_DESC.value != ''){
    new Ajax('/rota/universal',data).RequisicaoAjax(true)
    NOME_DESC.value = ''
  }

})

document.getElementById('EXCLUIR').addEventListener('click',()=>{
    let trselecionada = document.querySelectorAll('.Selectedtr');
    console.log(trselecionada);


    let data ={
        sql:`BEGIN DELETE FROM MARCA WHERE ID_MARCA = :ID_MARCA; COMMIT;END;`,
        binds:{ID_MARCA:NOME_DESC.value},
        mensagem_sucess:'Registro inserido com sucesso!', 
        mensagem_error:'Erro ao inserir registro!',
        USU_LOGADO: false
      };
})

let tbody = document.getElementById('tbodytable')

tbody.addEventListener('dblclick', (e) => {
  let editar = document.getElementById('EDITAR');
  let ID_MARCA_ = document.getElementById('ID_MARCA_');
  let NOME_MARCA = document.getElementById('NOME_MARCA');
  let elementoclicado = e.target;
  let elementopai = elementoclicado.parentNode;
  let ID = (elementopai.cells[0]).innerText
  let Nome = (elementopai.cells[1]).innerText
  NOME_MARCA.value = Nome;
  ID_MARCA_.value = ID;
  editar.click();
})

document.getElementById('SALVA_EDICAO').addEventListener('click',(e)=>{
  e.preventDefault();
  let NOME_MARCA = document.getElementById('NOME_MARCA');
  let ID_MARCA_ = document.getElementById('ID_MARCA_');

  let data ={
    sql:`BEGIN UPDATE MARCA SET NOME = UPPER(:DESC) WHERE ID_MARCA = :ID_MARCA; COMMIT;END;`,
    binds:{DESC:NOME_MARCA.value,ID_MARCA:ID_MARCA_.value},
    mensagem_sucess:'Registro alterado com sucesso!', 
    mensagem_error:'Erro ao inserir registro!',
    USU_LOGADO: false
  };
  new Ajax('/rota/universal',data).RequisicaoAjax(true)

})