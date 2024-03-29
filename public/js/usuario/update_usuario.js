'use strict';
import { Ajax } from "../Class/Ajax.js";
  function sendForm() {
    // Seleciona todos os inputs da página
    var inputs = document.querySelectorAll("input[type='text']");
    var checkbox = document.querySelectorAll("input[type='checkbox']");
    var Select = document.getElementsByTagName("select");
    // Inicializa um objeto vazio
    var objeto = {};
    // Percorre todos os inputs e adiciona suas IDs e valores ao objeto
    for (var i = 0; i < inputs.length; i++) {
      var id = inputs[i].id;
      var valor = inputs[i].value;
      objeto[id] = valor;
    }
    //Percorre todos os checkbox e adiociona se é true ou false
    for (var i = 0; i < checkbox.length; i++) {
      var id = checkbox[i].id;
      var valor = (checkbox[i].checked ? 'S' : 'N');//Valida se a flag está marcada ou não
      objeto[id] = valor;
    }
    // Percorre todos os selects e adiciona suas IDs e valores ao objeto
    for (var i = 0; i < Select.length; i++) {
      var id = Select[i].id;
      var valor = Select[i].value;
      objeto[id] = valor;
    }
    let data = JSON.stringify(objeto);
    console.log(objeto);
    new Ajax('/update_usuario',objeto).RequisicaoAjax(true)
  }
  //Quando o botão de salvar é chamado a funcao sendForm para fazer a requisição ajax;
  document.getElementById('EDITAR').addEventListener('click', sendForm, false);


  



