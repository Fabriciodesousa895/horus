import { Ajax } from "../Class/Ajax.js";
// Carregar dash ao carregar a tela
window.addEventListener('load',()=>{
let BarraProgresso = document.getElementById('PROGRESSO');
BarraProgresso.style.opacity = 1;
const Url = window.location.pathname;
const Parts = Url.split('/');
const IdDash = Parts[Parts.length - 1];
 let data = {
    sql:`SELECT XML FROM T_TELA WHERE ID_TELA = :IdDash`,
    binds:{IdDash:IdDash}
 }

new Ajax('/select/universal/array',data).RequisicaoAjax().then((XmlDash)=>{
   let XlmDash_ = XmlDash[0];
   let XmlTela = XlmDash_[0];
   let Parser = new DOMParser();
   let XmlDoc = Parser.parseFromString(XmlTela,"text/xml");
   
   function GerarDash(XmlDoc){
     let dashboard = document.getElementById('dashboard');
     let cabecalho = XmlDoc.getElementsByTagName("cabecalho")[0];
     let titulo = cabecalho.getElementsByTagName("titulo")[0].textContent;
      dashboard.textContent = titulo;
   }
   GerarDash(XmlDoc)
});
})