const Tables = document.querySelectorAll('table');
Tables.forEach((e)=>{

    // const table = document.getElementById('minhaTabela');
    const headers = e.querySelectorAll('th');
    let currentSortCol = null;
    let currentSortOrder = 'asc';

    // Função para converter data brasileira para objeto Date
    function parseDataBR(dataStr) {
        // Verifica se inclui hora
        if (dataStr.includes(':')) {
            const [data, hora] = dataStr.split(' ');
            const [dia, mes, ano] = data.split('/');
            const [horas, minutos] = hora.split(':');
            return new Date(ano, mes - 1, dia, horas, minutos);
        } else {
            const [dia, mes, ano] = dataStr.split('/');
            return new Date(ano, mes - 1, dia);
        }
    }

    // Função para detectar o tipo de conteúdo
    function detectarTipoConteudo(valor) {
        // Verifica se é uma data no formato dd/mm/yyyy ou dd/mm/yyyy hh:mm
        if (/^\d{2}\/\d{2}\/\d{4}(\s\d{2}:\d{2})?$/.test(valor)) {
            return 'data';
        }
        // Verifica se é número
        if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
            return 'numero';
        }
        return 'texto';
    }

    // Função para comparar valores baseado no tipo
    function compararValores(a, b, tipo, ordem) {
        const multiplicador = ordem === 'asc' ? 1 : -1;

        switch (tipo) {
            case 'data':
                const dataA = parseDataBR(a);
                const dataB = parseDataBR(b);
                return multiplicador * (dataA - dataB);
            
            case 'numero':
                return multiplicador * (parseFloat(a) - parseFloat(b));
            
            default: // texto
                return multiplicador * a.localeCompare(b, 'pt-BR');
        }
    }

    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            // Remove classes de ordenação de todos os cabeçalhos
            headers.forEach(h => {
                h.classList.remove('asc', 'desc');
            });

            // Determina a ordem da classificação
            if (currentSortCol === index) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortOrder = 'asc';
                currentSortCol = index;
            }

            // Adiciona classe de ordenação ao cabeçalho atual
            header.classList.add(currentSortOrder);

            // Obtém as linhas da tabela e converte para array
            const tbody = e.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Obtém uma amostra do conteúdo para detectar o tipo
            const amostraConteudo = rows[0].cells[index].textContent;
            const tipoConteudo = detectarTipoConteudo(amostraConteudo);

            // Ordena as linhas
            rows.sort((a, b) => {
                const aValue = a.cells[index].textContent.trim();
                const bValue = b.cells[index].textContent.trim();
                return compararValores(aValue, bValue, tipoConteudo, currentSortOrder);
            });

            // Remove linhas existentes
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }

            // Adiciona linhas ordenadas
            rows.forEach(row => tbody.appendChild(row));
        });
    });

})