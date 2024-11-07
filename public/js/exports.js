
document.querySelectorAll('.ExportaXlsx').forEach((e) => {
    e.addEventListener('click', (k) => {
  // Função para baixar o arquivo em xlsx
async function downloadExcel() {
    let Elementopai = e.parentNode.parentNode;
    let tabela = Elementopai.querySelector('table');
    let tbody =  tabela.querySelector('tbody');
    let Trs =  tbody.querySelectorAll('tr');
    let Ths = tabela.querySelectorAll('th')
    let ArrayCabecalho = [];
    let ArrayCabecalho2 = [];
    let ArrayCorpo = [];
    Ths.forEach((e)=>{
      ArrayCabecalho.push(e.innerHTML)
    })
    Trs.forEach((tr) => {
      let tds = tr.querySelectorAll('td');
      let linhaAtual = [];
    
      tds.forEach((td) => {
          linhaAtual.push(td.textContent.trim());
      });
    
      if (linhaAtual.length > 0) {
          ArrayCorpo.push(linhaAtual);
      }
    });
    ArrayCabecalho2.push(ArrayCabecalho)
    let Data = [...ArrayCabecalho2,...ArrayCorpo] 
      try {
        //Validando se há registros para exportar
        if(Data.length > 1){
            const response = await fetch('/download/excel', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                Data: Data
              })
              });
              
              if (!response.ok) {
                throw new Error('Erro ao baixar arquivo');
              }
                  // Converter a resposta para blob
              const blob = await response.blob();
                  // Criar URL do blob e link para download
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'dadosexportados.xlsx';
              document.body.appendChild(a);
              a.click();
                  // Limpar
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
        }else{
            swal({
                title:'Não há registros para exportar',
                icon:'warning'
            })
        }

        
      } catch (error) {
        console.error('Erro:', error);
      }
    }


        downloadExcel();

    });

});