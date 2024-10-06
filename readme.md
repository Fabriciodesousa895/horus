                                    => Link para acessar o projeto  <=
                                      https://ft42zqfb-80.brs.devtunnels.ms/login
                                     Usuário:Admin
                                     Senha:  Admin
                                     => Rota universal <=        

Há uma grande demanda por requisições ajax,logo para cada requisição é feita uma rota POST,
diante desta necessidade foi criado uma rota para requisições mais simples => '/rota/universal'
que pode ser reutilizada.

Durante a requisição ajax no lado do cliente deverá ser passado um objeto com os seguintes parametros
-- sql => Sql a ser execultado
--binds => Valores a serem lidos(parametros)
--mensagem_sucess => mesngem de sucesso
--mensagem_error  => mensagem de erro
--USU_LOGADO  => valor booleano,define se deve pegar o uisuario logado ou não
exemplo:
            let data = {
                sql: `BEGIN
                INSERT INTO T_TELA (ROTA,T_NOME,T_DESCRICAO,TIPO) VALUES(:T_ROTA,:T_NOME,:T_DESCRICAO,:TIPO);
                COMMIT;
                END;`,
                binds:{
                    T_ROTA: ROTA.value,
                    T_NOME: T_NOME.value,
                    T_DESCRICAO:  T_DESCRICAO.value,
                    TIPO: TIPO.value,
                    USU_LOGADO: false
                  },
                  mensagem_sucess:'Registro inserido com sucesso!',
                  mensagem_error:'Erro ao inserir registro!'
            }


----------------------------------------------------------------------------------------------------------------------------------------
                                     => Rota unoversal para selects <=   

Da mesma forma esxiste uma rota para select dentro do banco
-- sql => Sql a ser execultado
--binds => Valores a serem lidos(parametros)


      let data = {
        sql: `  SELECT   U.ID_USU, U.USU_NOME
        FROM USU_USUARIO U
        LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
        LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
        LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
        WHERE CG.ID_TELA = TL.ID_TELA
          AND (CU.${campo} = 'S' OR CG.${campo1} = 'S' OR U.USU_ADM = 'S')
          AND TL.ID_TELA = :ID_TELA
          AND TL.TIPO <> 'V'
          AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S' )
       GROUP BY  U.USU_NOME,U.ID_USU`,
        binds: { ID_TELA: ID_TELA.value },
        USU_LOGADO:true
      };
<!-- ------------------------------------------------------------------------------------ -->
                             =>Rota para pocedure com saida<=
Rota para a chamada de procedures quw possuem um parametro de saida(P_RESULTADO)
-- sql => Sql a ser execultado para chamar a procedure(na chamada da procedure devr ter um parametro :P_RESULTADO)
-- binds => Valores a serem lidos(parametros)
-- USU_LOGADO =>  valor booleano,define se deve pegar o uisuario logado ou não


Procedure de exemplo
CREATE OR REPLACE procedure TESTE_SAIDA2 (
    P_ID IN VARCHAR2,
    P_RESULTADO OUT VARCHAR2
) 
AS
BEGIN
    P_RESULTADO := P_ID; 
END;

Exemplo:

let datad ={
  sql:` BEGIN 
        TESTE_SAIDA2('1-ghgfdhgfhfghgdfhdfhg1',:P_RESULTADO);
        END;`,
  binds:{},
  USU_LOGADO: false
};
new Ajax('/procedure_com_saida',datad).RequisicaoAjax(true);

<!----------------------------------------------------------------------------------------------------------------------------------------------- -->
                                 => Componentes para header,body e footer <= 

Toda pagina html dever ser informado os componentes abaixo,caso não informe deverá escrever o html próprio(cabeçalho,corpo e footer);

<%- include('../partials/head'); %>

html a ser exibido ao usuário

<%- include('../partials/footer'); %>

OBS: Na pasta views/components há arquivos quem são componentes que podem ser usados nas páginas html =>    <%-include('../components/csv.ejs')%>

-------------------------------------------------------------------------------------------------------------------------------------------------
                                     => Padronização de rotas gets <= 

Padronização de rotas get
-Rotas assicronas.
-Middlawre chamado auth.
-Deverá ter uma variável chamada token no qual terá o token da sessão do usuário.
-As açoes devem ser feitas dentro de um try{  } catch (error){res.send(error) } dentro deste try deve ter obrgatoriamente duas variaveis:

 Acesso no qual chama a função valida_acesso que  precisa de dois parametros o primeiro sendo o ID da tela e o segundo o token.Valida se o usuário tem acesso.
 P_USU  no qual chama a função permi_usu que precisa de dois parametros o primeiro sendo o ID da tela e o segundo o token.Manda para a tela as perissões do usuário e o historico de filtros da tela.

-Logo mais abaixo deve ser feita validação de acesso.

app.get('/usuario', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(1, token);
    let P_USU = await permi_usu(1, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/usuario', { P_USU })
  } catch (error) {
    res.send(error);
    console.log(error)
  }
});

----------------------------------------------------------------------------------------------------------------------------------

                                          => Historico de filtros <=

Para poder salvar o historico de filtros de uma tela, é preciso criar importar um módulo SalvaFiltro.

'use strict';
import { SalvaFiltro } from "../Class/Filtro.js";

Para evitar a repeticão de chamadas da função SalvaFiltro é orientado a criar uma função chamada Salva.

    function Salva (){
        SalvaFiltro(181, FILTRO_NOME.value, FILTRO_COD.value,'','','','','','','','');
    }
OBS:O primeiro parametro é o ID da tela e os demias são os valores a serem salvos

----------------------------------------------------------------------------------------------------------------------------------
                         =>Regra para tabela de preços<=

   O preço o produto é definida por categoria ou por produto

TABELA PRC_PRECO => DEFINE PREÇO DO PRODUTO
TABELA PRC_PRECO_CAT => DEFINE PREÇO DO PRODUTO POR CATEGORIA

PARA PODER FAZER VENDA É PRECISO TER UMA TABELA DE PREÇO ATIVA VINCULDO AO PRODUTO,AO INCLUIR UMA NOVA TABELA DE PREÇO PRA UM PRODUTO 
É VERIFICADO SE HÁ UMA TABELA POR CATEGORIA ATIVA SE CASO TENHA NÃO SERÁ PERMITIDO




---------------------------------------------------------------------------------
                           => Modelo HTML <=




<%-include('../partials/head')%>
<% let P = P_USU.P_USU %>
<% let D = P[0] %>
<!--  -->
<div class="modal fade PRINCIPAL" tabindex="-1" role="dialog" aria-labelledby="myExtraLargeModalLabel" aria-hidden="true" >
    <div class="modal-dialog modal-xl" style="width: 500px;">
      <div class="modal-content">
        <form class="needs-validation" id="form" novalidate>
          <div class="container" style="padding: 40px;" >
              <div class="row">
                <div class="col-sm"  >
                    <label >Descrição</label>
                   <input type="text" class="form-control TddCam"  name="NOME" required>
                </div>
              </div>
          
              </div>
              <button style="margin-left: 40px;" id="Salvar" type="submit" class="btn btn-warning ">Salvar</button>
            </div>
          
          </form>
      </div>
    </div>
  </div>
  <!--editar registro-->
<div class="modal fade EDITAR" tabindex="-1" role="dialog" aria-labelledby="myExtraLargeModalLabel" aria-hidden="true" >
  <div class="modal-dialog modal-xl" style="width: 500px;">
    <div class="modal-content">
      <form class="needs-validation"  novalidate>
        <div class="container" style="padding: 40px;" >
            <div class="row">
              <div class="col-sm"  >
                  <label for="">DESCRIÇÃO CAMPO</label>
                 <input type="text" class="form-control"   required>
                  <label for="">Descrição</label>
                 <input type="text" class="form-control"  required>
              </div>
            </div>
            </div>
            <% if (D.ALTERA == 'N') { %> 
              <button class="btn btn-primary" style="margin-right: 15px;" data-toggle="modal" disabled  >Salvar</button>
          <% }else{ %>
              <button style="margin-left: 40px;" id="SALVA_EDICAO"  class="btn btn-warning ">Salvar</button>

          <%}%> 
          </div>
        
        </form>
    </div>
  </div>
</div>
<!--  -->
<div class="grad" style="display: flex;height: auto;padding: 30px;">
  <div style="width: 300px;height: 400px;">
   <form>
<%let filtro = P_USU.T_FILTRO%> 

    <div class="form-group row">

        <div class="col-sm-10">
            <span >CAMPO DO FILTRO</span>
            <input type="number"  class="form-control" placeholder="ID"  value="<%=filtro[0][0]%>">
        </div>
 
        <div class="col-sm-10">
            <span >CAMPO DO FILTRO</span>
            <input type="text"  class="form-control" placeholder="Descrição" ME" value="<%=filtro[0][1]%>">
        </div>

    </div>

    <button id="filtro" class="btn btn-primary">Buscar</button>

   </form>
   </div>
  <!-- Tabela -->
  <div style="width: 100%;display: block;">

    <table class="table table-hover" id="Marca" style="height: auto;width: 700px;">

      <thead>
          <tr>
              <th>Nome coluna</th>
              <th>Descrição</th>
          </tr>
      </thead>
      <tbod>
          <!-- Dados sendo inseridos automaticamente -->
      </tbody>
    </table>
  </div>
</div>
<%-include('../partials/footer')%>



-------------------------------------------------------------------------------------------

REGRAS DE NEGOCIO DE TOP

ORÇAMENTO   => SE A FLAG ORÇAMENTO ESTIVER MARCADA NÃO SE GERA FINANCEIRO E NEM ATUALIZA ESTOQUE
BONIFICAÇÃO => SE A FLAG BONIFICAÇÃO ESTIVER MARCADA IRA GERAR UM TITULO DE DESPESA E IRÁ ATUALIZAR O ESTOQUE DO PRODUTO

 FLAG (Permite a exclusão de registros confirmados?) => MARCADA IRÁ PERMITIR EXCLUIR OPERAÇOES QUE JÁ FORAM CONFIRMADAS
 FLAG (Permite alterar registros confirmados?) => MARCADA IRÁ PERMITIR ALTERAR OPERAÇOES QUE JÁ FORAM CONFIRMADAS
 FLAG (Reserva estoque ao salvar?) => QUANDO SALVAR O MOVIMENTO IRA RESERVAR O ESTOQUE DOS PRODUTOS

































