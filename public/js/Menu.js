import { Ajax } from "../js/Class/Ajax.js";
const ModalMenu171 = document.getElementById('ModalMenu171');
const Administracao7 = document.getElementById('Administracao7');
const RelatoriosConfigurados8 = document.getElementById('RelatoriosConfigurados8');
const Compras2 = document.getElementById('Compras2');
const Cadastros1 = document.getElementById('Cadastros1');

ModalMenu171.addEventListener("click",(e)=>{
  new Ajax('/Menu/Acessos').RequisicaoAjax().then((Data)=>{

   Cadastros1.innerHTML = '';
   Compras2.innerHTML = '';
   Administracao7.innerHTML = '';
   RelatoriosConfigurados8.innerHTML = '';

     Data.forEach(element => {
 
        let A = document.createElement('a');
        A.href = element.ROTA;
        A.textContent = element.T_NOME;
      //   Adiciona na aba de cadastros
        if(element.GRUPO == 1 ){
         Cadastros1.appendChild(A);
        }
      //   Adiciona na aba de compras
        if(element.GRUPO == 2){
         Compras2.appendChild(A);
        }
      //   Adiciona na aba Administração
        if(element.GRUPO == 7){
         Administracao7.appendChild(A);
        }
      //   Adiciona na aba de relatórios personalizados
        if(element.GRUPO == 8){
         RelatoriosConfigurados8.appendChild(A);
        }
     }); 
  })
});





