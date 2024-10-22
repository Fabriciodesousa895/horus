import { Ajax } from "../Class/Ajax.js";
import {  Tabela } from "../Class/Tabela.js";
let Consultar = document.getElementById('Consultar');
let AdicionarComponente = document.getElementById('AdicionarComponente');

Consultar.addEventListener('click',(e)=>{
let Sql = document.getElementById('Sql');

 new Ajax('/sql/DBE_explorer',{sql:Sql.value}).RequisicaoAjax().then((Data=>{
    let Colunas = document.getElementById('Colunas');
    let Dadosolunas = Data.array_colunas;
    let DadoRegistros = Data.array_registros;
  Colunas.innerHTML = '';
    for (let i =0;i < Dadosolunas.length;i++){
        let ColunaNome = document.createElement('th');
        let NovoValor = Dadosolunas[i].replace(/_/g ,' ');
        ColunaNome.textContent = NovoValor;
      
        Colunas.appendChild(ColunaNome);
    }
   new Tabela('RegistrosSql').InseriRegistros(DadoRegistros,15);
 }))
})
let Count = 0;
let XmlComponente = '';

AdicionarComponente.addEventListener('click',(e)=>{

    let PainelPrincipal = document.getElementById('PainelPrincipal');
    let TipoDash = document.getElementById('TipoDash');
    let Sql = document.getElementById('Sql');
    let Altura = document.getElementById('Altura');
    let Largura = document.getElementById('Largura');
    let Titulo = document.getElementById('Titulo');
    if(TipoDash.value != '' && Sql.value != '' ){
        Sql.style.border = ''

        let DivDash = document.createElement('div');
        DivDash.className = 'DivDash';
        DivDash.textContent = Titulo.value + '\n' + TipoDash.options[TipoDash.selectedIndex].text 
        Count += 1;
        PainelPrincipal.appendChild(DivDash)
        XmlComponente +=  ` <componente Altura="${Altura.value}" Largura="${Largura.value}" tipo="${TipoDash.value}" sql="${Sql.value}" titulo="${Titulo.value}"></componente> \n`
        console.log(XmlComponente)
        // PainelPrincipal.textContent = PainelPrincipal.textContent + '--teste---'
    }else{
        Sql.style.border = '1px solid red'
    }
 
})