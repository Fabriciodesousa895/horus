'use strict';
import { Ajax } from "./Class/Ajax.js";
document.getElementById("inputText").addEventListener('input',()=>{
new Ajax('/filtra/acesso',[]).RequisicaoAjax(false).then((dados_array)=>{
    console.log(dados_array)
    var inputText = document.getElementById("inputText").value.toLowerCase();
    var selectElement = document.getElementById("meuSelect");
    
    // Limpar as opções atuais
    selectElement.innerHTML = "";
    // Filtrar opções baseadas no texto digitado
    var filteredOptions = dados_array.filter((option)=> {
    return option[0].toLowerCase().includes(inputText);
    });
    
    // Adicionar opções filtradas ao select
    filteredOptions.forEach((e)=> {
    var optionElement = document.createElement("option");
    optionElement.value = e[1];
    optionElement.innerHTML = e[0];
    selectElement.appendChild(optionElement);
    });
})


})