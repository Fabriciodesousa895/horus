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
            let Data = new Date();
            let Day = Data.getDate().toString().padStart(2, '0');
            let Month = (Data.getMonth() + 1).toString().padStart(2, '0');
            let Year = Data.getFullYear();
            let DataAtual = Day + '-' + Month + '-' + Year;

            const doc = new jsPDF('landscape');
            doc.text('Tela: ' + nametelaatual, 10, 10);
            doc.text('Emitida em: ' + DataAtual, 10, 20);
            doc.text('Usuário: ' + nameusuarioaatual, 10, 30);
            doc.table(150,30,table_array)
            doc.save("DadosExportadosPdf_" + DataAtual + ".pdf");
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