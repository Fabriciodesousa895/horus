import { Ajax } from "../Class/Ajax.js";
import { Tabela } from "../Class/Tabela.js";
// Carregar dash ao carregar a tela
window.addEventListener('load', () => {
    let BarraProgresso = document.getElementById('PROGRESSO');
    BarraProgresso.style.opacity = 1;
    const Url = window.location.pathname;
    const Parts = Url.split('/');
    const IdDash = Parts[Parts.length - 1];
    let data = {
        sql: `SELECT XML FROM T_TELA WHERE ID_TELA = :IdDash`,
        binds: { IdDash: IdDash }
    }

    new Ajax('/select/universal/array', data).RequisicaoAjax().then((XmlDash) => {
        let XlmDash_ = XmlDash[0];
        let XmlTela = XlmDash_[0];
        // Cria o parser para ler o XML
        let Parser = new DOMParser();
        let XmlDoc = Parser.parseFromString(XmlTela, "text/xml");
        // Função para gerar o dashboard
        function GerarDash(XmlDoc) {
            let dashboard = document.getElementById('dashboard'); // Pega o elemento do dashboard
            let DivTitulo = document.getElementById('titulo'); // Pega o elemento do título
            // título do cabeçalho no XML
            let cabecalho = XmlDoc.getElementsByTagName("cabecalho")[0];
            let titulo = cabecalho.getElementsByTagName("titulo")[0].textContent;
            DivTitulo.textContent = titulo;
            let corpo = XmlDoc.getElementsByTagName("corpo")[0];
            let componentes = corpo.getElementsByTagName("componente");
            // componentes
            for (let i = 0; i < componentes.length; i++) {
                let ComponenteCorrente = componentes[i];
                //Pegando os atributos dos componentes
                let Altura = ComponenteCorrente.getAttribute("Altura");
                let Largura = ComponenteCorrente.getAttribute("Largura");
                let SqlDash = ComponenteCorrente.getAttribute("sql");
                let TipoComponente = ComponenteCorrente.getAttribute("tipo");
                let TipoComponenteTitulo = ComponenteCorrente.getAttribute("titulo");

                let ComponenteElemento = document.createElement('div');
                let ComponenteElementoFiltro = document.createElement('div');
                let Form = document.createElement('form');
                let ComponenteElementoDash = document.createElement('canvas');
                let TipoComponenteTituloH6 = document.createElement('h5');
                ComponenteElementoDash.classList.add('CanvaDash');
                TipoComponenteTituloH6.classList.add('Titulo');

                let Inputsql = document.createElement('input');
                let InpuTipoDash = document.createElement('input');

                Inputsql.value = SqlDash;
                Inputsql.setAttribute("type", 'hidden');
                Inputsql.classList.add('SqlDashs');

                InpuTipoDash.value = TipoComponente;
                InpuTipoDash.setAttribute("type", 'hidden');
                InpuTipoDash.classList.add('InpuTipoDash');

                TipoComponenteTituloH6.textContent = TipoComponenteTitulo;

                ComponenteElemento.classList.add('ComponenteElemento')
                ComponenteElementoFiltro.classList.add('ComponenteElementoFiltro')
                ComponenteElemento.style.width = Largura;
                ComponenteElemento.style.height = Altura;
                ComponenteElementoFiltro.style.height = Altura;
                Form.setAttribute("novalidate","");
                Form.className = 'needs-validation';
                Form.appendChild(Inputsql);
                ComponenteElementoFiltro.appendChild(Form);
                ComponenteElementoFiltro.appendChild(InpuTipoDash);
                ComponenteElemento.appendChild(ComponenteElementoFiltro);
                ComponenteElemento.appendChild(TipoComponenteTituloH6);
                ComponenteElemento.appendChild(ComponenteElementoDash);
             

                //Adiciona os filtros
                let filtro = ComponenteCorrente.getElementsByTagName("filtro")[0];
                if (filtro) {
                    let inputs = filtro.getElementsByTagName("input");
                    for (let i = 0; i < inputs.length; i++) {
                        let InputCorrente = inputs[i];
                        //Atributos 
                        let nome = InputCorrente.getAttribute("nome");
                        let tipo = InputCorrente.getAttribute("tipo");
                        let Id = InputCorrente.getAttribute("id");
                        let Sql = InputCorrente.getAttribute("sql");
                        let requerid = InputCorrente.getAttribute("requerid");
                        let lista = InputCorrente.getAttribute("lista");
                        //Criando elementos
                        let h5 = document.createElement('h6');
                        //Adicionando atributos
                        h5.textContent = nome;
                        //Input do tipo lista
                         
                        if (tipo == 'lista') {
                            let InputElementSelect = document.createElement('select');
                             let List = lista.split('/');
                             for (let i = 0;i< List.length;i++){
                                let TddOpc = List[i].split('=');
                                   for(let i = 0;i< TddOpc.length;i++){
                                    if(TddOpc[i] != undefined && TddOpc[i - 1] != undefined ){
                                        console.log(TddOpc[i - 1] + '-------' +TddOpc[i] );
                                    let InputElementOption = document.createElement('option');
                                    InputElementOption.value = TddOpc[i - 1];
                                    InputElementOption.textContent = TddOpc[i];
                                    InputElementSelect.classList.add('mt-1');
                                    InputElementSelect.classList.add('form-control');
                                    InputElementSelect.id = Id;
                                    InputElementSelect.setAttribute("required", requerid);
                                    InputElementSelect.appendChild(InputElementOption);
                                    }
                                   }
                             }      
            
                            ComponenteElementoFiltro.appendChild(h5);
                            ComponenteElementoFiltro.appendChild(InputElementSelect);
                        }
                        //Input do tipo select
                        if (tipo == 'select') {
                            console.log('---Tipo Select----')

                            let InputElementSelect = document.createElement('select');
                            let data = {
                                sql: `${Sql}`,
                                binds: {}
                            }
                            new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((ObjectsValues) => {
                                ObjectsValues.forEach(element => {
                                    let InputElementOption = document.createElement('option');
                                    InputElementOption.value = element.VALOR
                                    InputElementOption.textContent = element.LABEL
                                    InputElementSelect.classList.add('mt-1');
                                    InputElementSelect.classList.add('form-control');
                                    InputElementSelect.id = Id;
                                    InputElementSelect.setAttribute("required", true);
                                    InputElementSelect.appendChild(InputElementOption);
                                });
                            });
                            ComponenteElementoFiltro.appendChild(h5);
                            ComponenteElementoFiltro.appendChild(InputElementSelect);
                        }
                        //Input do tipo texto
                        if (tipo == 'text') {

                            let InputElement = document.createElement('input');
                            InputElement.setAttribute("type", tipo);
                            InputElement.setAttribute("placeholder", nome);
                            InputElement.classList.add('form-control');
                            InputElement.classList.add('mt-1');
                            InputElement.id = Id;
                            InputElement.setAttribute("required", requerid);
                            ComponenteElementoFiltro.appendChild(h5);
                            ComponenteElementoFiltro.appendChild(InputElement);
                        }

                        //Input do tipo data
                        if (tipo == 'date') {
                            let InputElement = document.createElement('input');
                            InputElement.setAttribute("type", 'date');
                            InputElement.classList.add('form-control');
                            InputElement.classList.add('mt-1');
                            InputElement.id = Id;
                            InputElement.setAttribute("required", requerid);
                            ComponenteElementoFiltro.appendChild(h5);
                            ComponenteElementoFiltro.appendChild(InputElement);
                        }
                        //Input do tipo checkbox
                        if (tipo == 'checkbox') {
                            let InputElementDiv = document.createElement('div');
                            let InputElementcheckbox = document.createElement('input');
                            let InputElementLabel = document.createElement('label');

                            InputElementDiv.classList.add('custom-control');
                            InputElementDiv.classList.add('custom-checkbox');

                            InputElementcheckbox.classList.add('custom-control-input');
                            InputElementcheckbox.id = Id;
                            InputElementcheckbox.name = Id;
                            InputElementcheckbox.setAttribute("type", 'checkbox');

                            InputElementLabel.classList.add('custom-control-label');
                            InputElementLabel.setAttribute('for', Id);
                            InputElementLabel.textContent = nome;

                            InputElementDiv.appendChild(InputElementcheckbox);
                            InputElementDiv.appendChild(InputElementLabel);
                            ComponenteElementoFiltro.appendChild(InputElementDiv);
                        }
                    }
                }
                //Adiciona o botão de consultar
                let Button = document.createElement('button');
                Button.type = 'submit';
                Button.classList.add('btn-primary');
                Button.classList.add('mt-2');
                Button.classList.add('ButtonFiltro');
                Button.textContent = 'Consultar'
                Button.style.width = '100px'
                ComponenteElementoFiltro.appendChild(Button);
                // Adiciona o componente ao dashboard
                dashboard.appendChild(ComponenteElemento);
            }

        }
        function CarregaDash() {
            let ComponentesCriados = document.querySelectorAll('.ComponenteElemento');
            ComponentesCriados.forEach((DashCorrente) => {
                let ButtonFiltro = DashCorrente.querySelector('.ButtonFiltro');

                let Inputs = DashCorrente.querySelectorAll('input:not([type="hidden"])');
                let Selects = DashCorrente.querySelectorAll('select');
                //Array com os IDs dos campos de filtro
                let ArrayIds = []
                Inputs.forEach((element) => {
                    ArrayIds.push(element.id);
                })
                Selects.forEach((element) => {
                    ArrayIds.push(element.id);
                })
                let Binds = new Tabela().InputsValues(ArrayIds);
                let SqlDashs = DashCorrente.querySelector('.SqlDashs')
                let data = {
                    sql: `${SqlDashs.value}`,
                    binds: Binds
                };
                let InpuTipoDash = DashCorrente.querySelector('.InpuTipoDash');
                let ctx = DashCorrente.querySelector('.CanvaDash');
                let MyChartPizza
                if (InpuTipoDash.value == 'Pizza') {
                    new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                        let Totais = datas.map(item => item.TOTAL);
                        let Descricao = datas.map(item => item.DESCRICAO);

                        MyChartPizza = new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: Descricao,
                                datasets: [{
                                    label: 'Qtd ',
                                    data: Totais,
                                    borderWidth: 1
                                }]
                            },


                        });
                        //Escutador no button do filtro
                        ButtonFiltro.addEventListener('click', (e) => {
                            let SqlDashs = DashCorrente.querySelector('.SqlDashs');
                            let Binds = new Tabela().InputsValues(ArrayIds);
                            let Data = {
                                sql: `${SqlDashs.value}`,
                                binds: Binds
                            };
                            new Ajax('/select/universal/objeto', Data).RequisicaoAjax().then((datas) => {
                                let Totais = datas.map(item => item.TOTAL);
                                let Descricao = datas.map(item => item.DESCRICAO);
                                MyChartPizza.destroy();
                                MyChartPizza = new Chart(ctx, {
                                    type: 'pie',
                                    data: {
                                        labels: Descricao,
                                        datasets: [{
                                            label: 'Qtd ',
                                            data: Totais,
                                            borderWidth: 1
                                        }]
                                    },


                                });
                            })
                        })
                    })

                }

                if (InpuTipoDash.value == 'Tabela') {
                    // Escutador no button do filtro

                    ButtonFiltro.addEventListener('click', (e) => {
                        let RequiredTrueOrFalse = false;
                        //Validando se os campos obrigatórios estão preenchidos
                        Inputs.forEach((elementRequerid)=>{
                            if(elementRequerid.required && elementRequerid.value == ''){
                                RequiredTrueOrFalse = false;
                            }else{
                              if(!RequiredTrueOrFalse && elementRequerid == ''){
                                RequiredTrueOrFalse = false;
                              }else{
                                RequiredTrueOrFalse = true;
                              }
                            };
                        })
                        if(RequiredTrueOrFalse){

                        let SqlDashs = DashCorrente.querySelector('.SqlDashs');
                        let Binds = new Tabela().InputsValues(ArrayIds);
                        let Data = {
                            sql: `${SqlDashs.value}`,
                            binds: Binds
                        };
                            new Ajax('/DashTabela', Data).RequisicaoAjax().then((datas) => {
                                let tableExists = DashCorrente.querySelector('table');
    
                                // Se uma tabela já existe
                                if (tableExists) {
                                    DashCorrente.removeChild(tableExists);
                                }
    
                                let table = document.createElement('table');
                                let thead = document.createElement('thead');
                                let tbody = document.createElement('tbody');
                                let tr = document.createElement('tr');
                                let array_colunas = datas.array_colunas;
                                let array_registros = datas.array_registros;
    
                                // Criação do cabeçalho da tabela
                                for (let i = 0; i < array_colunas.length; i++) {
                                    let th = document.createElement('th');
                                    let NovoValor = array_colunas[i].replace(/_/g ,' ');
                                    th.textContent = NovoValor
                                    tr.appendChild(th);
                                }
    
                                table.style.width = '100%';
                                table.style.borderCollapse = 'collapse';
                                table.className = 'Tabela table table-hover';
    
                                thead.appendChild(tr);
                                table.appendChild(thead);
    
                                // Preenche as linhas da tabela com os dados
                                array_registros.forEach(rowData => {
                                    const row = document.createElement('tr');
                                    rowData.forEach(cellData => {
                                        const cell = document.createElement('td');
                                        cell.innerText = cellData;
                                        row.appendChild(cell);
                                    });
                                    tbody.appendChild(row);
                                });
    
                                table.appendChild(tbody);
                                DashCorrente.appendChild(table);
                                console.log(datas.array_colunas);
                            });
                        }else{
                             swal({
                                text:'Preencha todos os campos obrigatórios',
                                icon:'warning'
                             })
                        }
          
                    });

                    // ---------------------
                }



                let MyChartLine
                if (InpuTipoDash.value == 'Line') {
                    new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                        let Totais = datas.map(item => item.TOTAL);
                        let Descricao = datas.map(item => item.DESCRICAO);

                        MyChartLine = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: Descricao,
                                datasets: [{
                                    label: 'Qtd ',
                                    data: Totais,
                                    borderWidth: 1
                                }]
                            },


                        });
                        //Escutador no button do filtro
                        ButtonFiltro.addEventListener('click', (e) => {
                            let SqlDashs = DashCorrente.querySelector('.SqlDashs');
                            let Binds = new Tabela().InputsValues(ArrayIds);
                            let Data = {
                                sql: `${SqlDashs.value}`,
                                binds: Binds
                            };
                            new Ajax('/select/universal/objeto', Data).RequisicaoAjax().then((datas) => {
                                let Totais = datas.map(item => item.TOTAL);
                                let Descricao = datas.map(item => item.DESCRICAO);
                                MyChartLine.destroy();
                                MyChartLine = new Chart(ctx, {
                                    type: 'line',
                                    data: {
                                        labels: Descricao,
                                        datasets: [{
                                            label: 'Qtd ',
                                            data: Totais,
                                            borderWidth: 1
                                        }]
                                    },


                                });
                            })
                        })
                    })

                }


                let MyChart;
                if (InpuTipoDash.value == 'Coluna') {
                    new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                        let Totais = datas.map(item => item.TOTAL);
                        let Descricao = datas.map(item => item.DESCRICAO);
                        let BackgroundColor = [];

                        // Função para gerar cores aleatórias com opacidade
                        function getRandomColor(opacity) {
                            const r = Math.floor(Math.random() * 255);
                            const g = Math.floor(Math.random() * 255);
                            const b = Math.floor(Math.random() * 255);
                            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        }

                        // Gerar cor aleatória para cada item
                        for (let i = 0; i < Totais.length; i++) {
                            BackgroundColor.push(getRandomColor(0.75));
                        }

                        // Criar novo gráfico de barras
                        MyChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: Descricao,
                                datasets: [{
                                    label: 'Qtd',
                                    data: Totais,
                                    backgroundColor: BackgroundColor,
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true, // Garantir que o gráfico seja responsivo
                                scales: {
                                    y: {
                                        beginAtZero: true // Iniciar o eixo Y no zero
                                    }
                                }
                            }
                        });
                        ButtonFiltro.addEventListener('click', (e) => {
                            let SqlDashs = DashCorrente.querySelector('.SqlDashs');
                            let Binds = new Tabela().InputsValues(ArrayIds);
                            let Data = {
                                sql: `${SqlDashs.value}`,
                                binds: Binds
                            };
                            new Ajax('/select/universal/objeto', Data).RequisicaoAjax().then((datas) => {
                                let Totais = datas.map(item => item.TOTAL);
                                let Descricao = datas.map(item => item.DESCRICAO);
                                let BackgroundColor = [];

                                // Gerar cor aleatória para cada item
                                for (let i = 0; i < Totais.length; i++) {
                                    BackgroundColor.push(getRandomColor(0.75));
                                }
                                MyChart.destroy();
                                MyChart = new Chart(ctx, {
                                    type: 'bar',
                                    data: {
                                        labels: Descricao,
                                        datasets: [{
                                            label: 'Qtd',
                                            data: Totais,
                                            backgroundColor: BackgroundColor,
                                            borderWidth: 1
                                        }]
                                    },
                                    options: {
                                        responsive: true, // Garantir que o gráfico seja responsivo
                                        scales: {
                                            y: {
                                                beginAtZero: true // Iniciar o eixo Y no zero
                                            }
                                        }
                                    }
                                });

                            })
                        })


                    });

                }
                let MyChartAreaPolar;
                if (InpuTipoDash.value == 'polarArea') {
                    new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                        let Totais = datas.map(item => item.TOTAL);
                        let Descricao = datas.map(item => item.DESCRICAO);
                        let BackgroundColor = [];

                        // Função para gerar cores aleatórias com opacidade
                        function getRandomColor(opacity) {
                            const r = Math.floor(Math.random() * 255);
                            const g = Math.floor(Math.random() * 255);
                            const b = Math.floor(Math.random() * 255);
                            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        }

                        // Gerar cor aleatória para cada item
                        for (let i = 0; i < Totais.length; i++) {
                            BackgroundColor.push(getRandomColor(0.75));
                        }

                        // Criar novo gráfico de barras
                        MyChartAreaPolar = new Chart(ctx, {
                            type: 'polarArea',
                            data: {
                                labels: Descricao,
                                datasets: [{
                                    label: 'Qtd',
                                    data: Totais,
                                    backgroundColor: BackgroundColor,
                                    borderWidth: 1
                                }]
                            }
                        });
                        ButtonFiltro.addEventListener('click', (e) => {
                            let SqlDashs = DashCorrente.querySelector('.SqlDashs');
                            let Binds = new Tabela().InputsValues(ArrayIds);
                            let Data = {
                                sql: `${SqlDashs.value}`,
                                binds: Binds
                            };
                            new Ajax('/select/universal/objeto', Data).RequisicaoAjax().then((datas) => {
                                let Totais = datas.map(item => item.TOTAL);
                                let Descricao = datas.map(item => item.DESCRICAO);
                                let BackgroundColor = [];

                                // Gerar cor aleatória para cada item
                                for (let i = 0; i < Totais.length; i++) {
                                    BackgroundColor.push(getRandomColor(0.75));
                                }
                                MyChartAreaPolar.destroy();
                                MyChartAreaPolar = new Chart(ctx, {
                                    type: 'polarArea',
                                    data: {
                                        labels: Descricao,
                                        datasets: [{
                                            label: 'Qtd',
                                            data: Totais,
                                            backgroundColor: BackgroundColor,
                                            borderWidth: 1
                                        }]
                                    }
                                });

                            })
                        })


                    });
                }

            })
        }
         GerarDash(XmlDoc);
         setTimeout(( )=>{CarregaDash()},2000)
       
    });


})

function EscutadorFiltroDash() {
    let ComponentesCriados = document.querySelectorAll('.ComponenteElemento');
    ComponentesCriados.forEach((DashCorrente) => {
        let ButtonFiltro = DashCorrente.querySelector('.ButtonFiltro');
        ButtonFiltro.addEventListener('click', (e) => {

            let Inputs = DashCorrente.querySelectorAll('input:not([type="hidden"])');
            let Selects = DashCorrente.querySelectorAll('select');
            //Array com os IDs dos campos de filtro
            let ArrayIds = []
            Inputs.forEach((element) => {
                ArrayIds.push(element.id);
            })
            Selects.forEach((element) => {
                ArrayIds.push(element.id);
            })
            let Binds = new Tabela().InputsValues(ArrayIds);
            let SqlDashs = DashCorrente.querySelector('.SqlDashs')
            let data = {
                sql: `${SqlDashs.value}`,
                binds: Binds
            };
            let InpuTipoDash = DashCorrente.querySelector('.InpuTipoDash');
            let ctx = DashCorrente.querySelector('.CanvaDash');

            if (InpuTipoDash.value == 'Pizza') {
                new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                    let Totais = datas.map(item => item.TOTAL);
                    let Descricao = datas.map(item => item.DESCRICAO);


                    MyChart.data.labels = Descricao;
                    Mychart.data.datasets[0].data = Totais;
                    MyChart.update();
                })

            }

            if (InpuTipoDash.value == 'Coluna') {
                new Ajax('/select/universal/objeto', data).RequisicaoAjax().then((datas) => {
                    let Totais = datas.map(item => item.TOTAL);
                    let Descricao = datas.map(item => item.DESCRICAO);
                    let BackgroundColor = [];

                    // Função para gerar cores aleatórias com opacidade
                    function getRandomColor(opacity) {
                        const r = Math.floor(Math.random() * 255);
                        const g = Math.floor(Math.random() * 255);
                        const b = Math.floor(Math.random() * 255);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    }

                    // Gerar cor aleatória para cada item
                    for (let i = 0; i < Totais.length; i++) {
                        BackgroundColor.push(getRandomColor(0.75));
                    }

                    // Criar novo gráfico de barras
                    MyChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: Descricao,
                            datasets: [{
                                label: 'Qtd',
                                data: Totais,
                                backgroundColor: BackgroundColor,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true, // Garantir que o gráfico seja responsivo
                            scales: {
                                y: {
                                    beginAtZero: true 
                                }
                            }
                        }
                    });

                });
            }

        })
    })
}