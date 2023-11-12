Há uma grande demanda por requisições ajax,logo para cada requisição é feita uma rota POST,
diante desta necessidade foi criado uma rota para requisições mais simples => '/rota/universal'



Durante a requisição ajax no lado do cliente deverá ser passado os seguintes parametros
Um objeto com os seguintes parametros
-- sql => Sql a ser execultado
--binds => Valores a serem lidos
--mensagem_sucess => mesngem de sucesso
--mensagem_error  => mensagem de erro
--USU_LOGADO  => valor boolean,define se deve pegar o uisuario logado ou não

            let data = {
                sql: `BEGIN
                INSERT INTO T_TELA (ROTA,T_NOME,T_DESCRICAO,TIPO) VALUES(:T_ROTA,:T_NOME,:T_DESCRICAO,:TIPO);
                COMMIT;
                END;`,
                binds:{
                    T_ROTA: ROTA.value,
                    T_NOME: T_NOME.value,
                    T_DESCRICAO:  T_DESCRICAO.value,
                    TIPO: TIPO.value
                  },
                  mensagem_sucess:'Registro inserido com sucesso!',
                  mensagem_error:'Erro ao inserir registro!'
            }

    obs: caso o sql envolva informar o usuario logado para colocar
    USU_LOGADO como parametro entre os values

---------------------------------------------------------------------------------------------------
    Da mesma forma esxiste uma rota para select
    -- sql => Sql a ser execultado
--binds => Valores a serem lidos
--mensagem_error  => mensagem de erro 
--rows => valor boolean,define se o valor retornado é somente um array completo com varios registros
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
<%- include('../partials/head'); %>

<%- include('../partials/header'); %>

<%- include('../partials/footer'); %>

