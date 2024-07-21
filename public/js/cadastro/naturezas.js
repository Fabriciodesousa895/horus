import { ActionForm } from "../FormClass/ActionForm.js";         
import { SalvaFiltro } from "../Class/Filtro.js";         
import { Tabela } from "../Class/Tabela.js";         
new ActionForm('formnatureza','NATUREZA').Insert();
new ActionForm('form_upd_natureza','NATUREZA').Update('IdPknat')
let ObjetoValue = new Tabela().InputsValues(['ID_NAT','NOME_NAT'])
new SalvaFiltro(381,ObjetoValue.ID_NAT,ObjetoValue.NOME_NAT,'','','','','','','','')