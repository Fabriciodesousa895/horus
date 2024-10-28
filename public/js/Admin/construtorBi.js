import { Ajax } from "../Class/Ajax.js";
import {  Tabela } from "../Class/Tabela.js";
let Consultar = document.getElementById('Consultar');
let SalvaFiltro = document.getElementById('SalvaFiltro');
let AdicionarComponente = document.getElementById('AdicionarComponente');
let AdcionarFiltro = document.getElementById('AdcionarFiltro');

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
    let DashFiltro = document.getElementById('DashFiltro');
    let TipoDash = document.getElementById('TipoDash');
    let Sql = document.getElementById('Sql');
    let Altura = document.getElementById('Altura');
    let Largura = document.getElementById('Largura');
    let Titulo = document.getElementById('Titulo');
    if(TipoDash.value != '' && Sql.value != '' ){
        Count += 1;
        Sql.style.border = ''

        let DivDash = document.createElement('div');
        DivDash.className = 'DivDash ' +  'VinculaDashFiltro' + Count;
        DivDash.textContent = Titulo.value + '\n' + TipoDash.options[TipoDash.selectedIndex].text 
        PainelPrincipal.appendChild(DivDash)
        XmlComponente +=  ` <componente Altura="${Altura.value}" Largura="${Largura.value}" tipo="${TipoDash.value}" sql="${Sql.value}" titulo="${Titulo.value}"></componente> \n`
        console.log(XmlComponente)
        // PainelPrincipal.textContent = PainelPrincipal.textContent + '--teste---'
        //Adicionando o dash a lista de filtros
        let Option = document.createElement('option');
 
        Option.value = 'VinculaDashFiltro' + Count;
        Option.textContent = Titulo.value;
        DashFiltro.appendChild(Option);
    }else{
        Sql.style.border = '1px solid red'
    }
 
})
// SalvaFiltro.addEventListener((e)=>{
//     e.preventDefault();
//     let TipoDash = document.getElementById('TipoDash');
//     let NomeCampo = document.getElementById('NomeCampo');
//     let IdCampo = document.getElementById('IdCampo');
//     let Required = document.getElementById('Required');
//     let DashFiltro = document.getElementById('DashFiltro');
//     let TipoCampo = document.getElementById('TipoCampo');
//     let TextArea = 
    
//     document.getElementById('TextArea');





// })

AdcionarFiltro.addEventListener('click',()=>{
        let DivDashs = document.querySelectorAll('.DivDash');
        alert(DivDashs.length);
})