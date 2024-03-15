                                    => Link para acessar o projeto  <=
                                       https://marlin-quality-nicely.ngrok-free.app
                                       OBS:solicitar usuario e senha
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
--mensagem_error  => mensagem de erro 
--rows => valor booleano,define se o valor retornado é somente somente a primeira psoição do array ou um array completo
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
        mensage_error: 'Houve um erro ao conultar o registro!',
        rows: true
        USU_LOGADO,true
      };
      OBS: rows =  true irá retornar um array com os registros
<!-- --------------------------------------------------------------------------------------------------------------------------------------------- -->
                                 => Componentes para header,body e footer <= 

Toda pagina html dever ser informado os componentes abaixo,caso não informe deverá escrever o html próprio(cabeçalho,corpo e footer);

<%- include('../partials/head'); %>

<%- include('../partials/header'); %>

html a ser exibido ao usuário

<%- include('../partials/footer'); %>

OBS: Na pasta views/components há arquivos quem são componentes que podem ser usados nas páginas html =>    <%-include('../components/csv.ejs')%>

--------------------------------------------------------------------------------------------------------------------------------------------------
                                    => Componente para exportar Tabelas para CSV <= 


-É preicso definir o ID da tabela como => id="tabeladados"
-Referenciar o script que gera o CSV no no final da página html => <script src="/js/exportar/csv.js"></script>
-Incluir componente  botão => <%-include('../components/csv.ejs')%>

-Desta forma ao clicar no botão,será gerado um arquivo.csv com os dados da tabela referenciada.

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

-----------------------------------------------------------------------------------------------------------------------------
                                        => Certificado <=

Na pasta raiz da aplicacão há um arquivo chamadado certificado.json,no qual é passado algumas informações sobre a licença atual.

cnpj: 'cnpj da empresa'
razao_social:'rasao  social da empresa'
token:'token da licenca'

Ainda na raiz da aplicação no arquivo principal index.js e feito a leitura da licenca e  faz a comunicação com o gerenciador de licença
 e faz uma validação a cada 1h(3600000 milissegundos).

Será retornado um objeto com dos valores.

status  => caso seja 200 a aplicação segue adiante,sendo outros status será informado ao usuário uma mensagem sobre a situação da licença
mensage => mesagem sobre a situação da licença

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
                                             => Trabalhas com tabelas <=  

Foi desenvolvida uma class para tarabalhar com tabelas.Basta importar e chamar os metodos.
Requer dois parametros,o primeiro é o id da tboby e o segundoo array de registros.

'use strict';
import { SalvaFiltro } from "../Class/Tabela.js";

 new   Tabela('tabelausuario',array_de_dados).InseriRegistros()



----------------------------------------------------------------------------------------------------------------------------------








































