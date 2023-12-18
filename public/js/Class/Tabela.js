class Tabela {
  //Requer o id do tbody da tabela
  constructor(ID_TABELA) { this.ID_TABELA = ID_TABELA; }

  //Métodos

  //inseri os registros na tabela
  //array_de_dados => um array de array com os registros a serem inseridos
  InseriRegistros(array_de_registros) {
    let table_ = document.getElementById(this.ID_TABELA)
    let Tbody = table_.querySelector('tbody')
    Tbody.innerText = '';
    array_de_registros.forEach(RowData => {
      const row = document.createElement('tr');
      RowData.forEach(cellData => {
        let cell = document.createElement('td');
        cell.innerText = cellData;
        row.appendChild(cell);
      })
      Tbody.appendChild(row);
    })
  }

  //quando o usuário clicar em uma linha da tabela irá redirecionar para outra pagina passando a uma  celula como parametro;
  VisualizaRegistro(Rota, Coluna) {
    //Rota =>  a rota a ser direcionado exemplo: /visualiza_usuario/
    //Coluna => Coluna que irá fornecer o parametro,começa a partir de 1 adiante.Caso seja 1 pegará o valor da primeira celula e assim por diante
    let table_ = document.getElementById(this.ID_TABELA);
    let table = table_.querySelector('tbody');
    table.addEventListener('dblclick', (e) => {
      let elementoclicado = e.target;
      let elementopai = elementoclicado.parentNode
      let posicao = (Coluna == 0 ? Coluna = 0 : Coluna - 1)
      let conteudocelula = elementopai.cells[posicao]
      let Celula = conteudocelula.textContent
      location.href = `${Rota}${Celula}`

    })

  }
  //Exportando os registros da tabela
  ExportarRegistros(ID_BUTTON) {
    let table_ = document.getElementById(this.ID_TABELA)
    let table = table_.querySelector('tbody')
    let exportbtn = document.getElementById(ID_BUTTON);
    exportbtn.addEventListener('click', (() => {
      if (table.rows.length != 0) {
        let tablerows = table.querySelectorAll('tr')
        let CSV = Array.from(tablerows)
          .map(row => Array.from(row.cells)
            .map(cell => cell.textContent).join(',')).join('\n')
        exportbtn.setAttribute('href', `data:text/csvcharset=utf-8,${encodeURIComponent(CSV)}`);
        exportbtn.setAttribute('download', 'Dadosexportados.csv');
      }

    }))
  }


}

export { Tabela as Tabela }; 
