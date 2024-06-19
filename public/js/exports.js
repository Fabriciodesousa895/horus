
document.querySelectorAll('.ExportaPdf').forEach((e) => {
    e.addEventListener('click', (k) => {
        let Elementopai = e.parentNode.parentNode;
        let table = Elementopai.querySelector('table');
        let Count = Elementopai.querySelector('.Count').innerHTML;

        function GeraPdf() {
            let table_array = [];
            let th = table.querySelectorAll('th');
            let keys = [];

            // Capturar os cabeçalhos da tabela
            th.forEach((e) => {
                let propriedade = e.textContent.trim();
                keys.push(propriedade);
            });
          console.log(keys);
            // Capturar as linhas da tabela
            let tr = table.querySelectorAll('tbody tr');
            tr.forEach((row) => {
                let table_object = {};
                let tds = row.querySelectorAll('td');
                tds.forEach((td, index) => {
                    let value = td.textContent;
                    let key = keys[index];
                    table_object[key] = value;
                });
                table_array.push(table_object);
            });

            let nametelaatual = document.querySelector('.nametelaatual').value;
            let nameusuarioaatual = document.querySelector('.nameusuarioaatual___').value;
            let data = {
                tela:nametelaatual,
                usuario:nameusuarioaatual,
                dados:table_array
            }
            let barra_progresso = document.getElementById('PROGRESSO');
            barra_progresso.style.opacity = 1
            let ajax = new XMLHttpRequest();
            ajax.open('POST', '/gerapdf', true);
            ajax.setRequestHeader('Content-type', 'application/json');
            ajax.responseType = 'blob';  // Necessário para tratar a resposta como um blob (binário)
            
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    barra_progresso.style.opacity = 0;
                    console.log('testeando 123');
            
                    // Criar um URL para o blob e simular um clique no link de download
                    let blob = ajax.response;
                    let link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = 'Dadosexportados.pdf';
                    link.click();
            
                    // Limpar o URL do objeto
                    window.URL.revokeObjectURL(link.href);
                }
            };
            
            let jsonData = JSON.stringify(data);
            ajax.send(jsonData);
            

        }

        if (Number(Count) > 500) {
            swal({
                icon: 'warning',
                text: 'Deseja exportar mais de 500 registros?',
                buttons: true,
                dangerMode: true
            }).then((willExport) => {
                if (willExport) {
                    GeraPdf();
                }
            });
        } else {
            GeraPdf();
        }
    });
});