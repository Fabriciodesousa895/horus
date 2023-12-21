
'use strict';
import { filtra_campo } from '../Class/Filtra_campo.js'
let TABELA = document.getElementById('TABELA');
TABELA.addEventListener('change',()=>{
new filtra_campo('ID_USU', 'USU_NOME', `${TABELA.value }`).Filtra();
})