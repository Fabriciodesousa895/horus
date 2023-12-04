let table = document.getElementById('tabeladados');
let exportbtn = document.querySelector('[data-js="export-table-btn"]');
exportbtn.addEventListener('click', (() => {
    console.log(table.rows.length)
    if (table.rows.length != 0) {
        let tablerows = table.querySelectorAll('tr')
        let CSV = Array.from(tablerows)
            .map(row => Array.from(row.cells)
                .map(cell => cell.textContent).join(',')).join('\n')
        exportbtn.setAttribute('href', `data:text/csvcharset=utf-8,${encodeURIComponent(CSV)}`);
        exportbtn.setAttribute('download', 'Dadosexportados.csv');
    }

}))