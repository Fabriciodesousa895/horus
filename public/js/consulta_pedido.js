//carrega na tela somente a movimentação do dia



//------------------------------------------------------//
const inputsdate = document.querySelectorAll('input[type="date"]')

const data = new Date();
const dia = String(data.getDate()).padStart(2,'0');
const mes = String(data.getMonth() + 1).padStart(2,'0');
const ano = String(data.getFullYear());
const dataatual = `${ano}-${mes}-${dia}` 

for(let i = 0;i < inputsdate.length;i++){
      inputsdate[i].value = dataatual
      inputsdate[i].max = dataatual
}

//---------------------------------------------------------//

const text = document.getElementById('text')
const movimento = document.getElementById('movimento')
const tipo = document.getElementById('tipo')
const datainicial = document.getElementById('datainicial')
// const datafinal = document.getElementById('datafinal')
const tabelapedido = document.getElementById('tabelapedidos')
const linha = tabelapedido.getElementsByTagName('tr')
function filtro() {
      // const datafin = datafinal.value;
      // const mod = datafin.split('-');
      // const datafinalinvertida = `${mod[2]}/${mod[1]}/${mod[0]}`;
      const dataini = datainicial.value;
      const modini = dataini.split('-');
      const datainicialinvertida = `${modini[2]}/${modini[1]}/${modini[0]}`;
      
      for (let i = 1; i < linha.length; i++) {
        let conteudolinha = linha[i].innerHTML;

          if (true == conteudolinha.toLowerCase().includes(text.value.toLowerCase()) &&
              true == conteudolinha.includes(movimento.value) &&
              true == conteudolinha.includes(tipo.value) &&
             true == conteudolinha.includes(datainicialinvertida) 
          ) {
            linha[i].style.display = '';
          } else {
            linha[i].style.display = 'none';
          }
        }
      }

    
      const contagem = {};
      for(let i = 1; i < tabelapedido.rows.length; i++){
        const tipo = tabelapedido.rows[i].cells[3].textContent;
        if(contagem[tipo]){
          contagem[tipo]++;
        }else{
          contagem[tipo] = 1;
        }
      }
      
            google.charts.load("current", { packages: ["corechart"] });

            function desenharGrafico(){
                  const dados = new google.visualization.DataTable();
                  dados.addColumn("string", "Tipo");
                  dados.addColumn("number", "Quantidade");
            
                  const graficoData = [];


                  for(const tipo in contagem){
                        graficoData.push([tipo,contagem[tipo]]);
                  }
               dados.addRows(graficoData)
                  const opcoes = {
                        title: 'Quantidade de movimentação por tipo',
                        width:1000,
                        heigth:700
                  }
                  const grafico = new google.visualization.PieChart(
                        document.getElementById('grafico')
                  )
                  grafico.draw(dados,opcoes)
            }

            
    google.charts.setOnLoadCallback(desenharGrafico);