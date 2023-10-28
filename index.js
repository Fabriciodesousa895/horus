const express = require("express");
const app = express();

'use strict';
//view engine
app.set("view engine", "ejs");
//static public
app.use(express.static("public"));
//body-parser
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
//sessao de cookies
const cookieparser = require('cookie-parser');
app.use(cookieparser());
//bycrypt para hash
const bycrypt = require('bcrypt');
const secret = 'M987ggjjj@583';
//jsonwebtoken
const jwt = require('jsonwebtoken');
//configurando cors
const cors = require('cors');
let urlencodedParser = bodyparser.urlencoded({extended:false});
app.use(cors());
//middleware
app.use((req,res,next)=>{
   console.log('Entre cliente e servidor!')
   next();
})
//middleware de autenticação;
function auth (req,res,next){
  const token = req.cookies.jwt;

  if(!token){
    res.status(500).send('Token inválido,faça login novamente!');
  }else{
    const decoded = jwt.verify(token,secret);
    req.ID_USUARIO = decoded;
    next();
  }
}
//fazendo a chamaa do banco
const oracledb = require('oracledb');
const dbconfig = {
  user:'SYSTEM',
  password:'host2023',
  connectString:'localhost:1521'
}

async function conectarbd(sql,binds,options){
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`,binds,options);
  return result.rows;
}
async function conectar(sql,binds){
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`,binds);
  return result;
}
//resultado vem em array de array
const options = {
  autoCommit: true,
  outFormat: oracledb.OUT_FORMAT_ARRAY
}
//resultado vem em array de objeto
const options_objeto = {
  autoCommit: true,
  outFormat: oracledb.OUT_FORMAT_OBJECT
}

//login
app.get('/login',(req,res)=>{
  res.render('./usuario/login')
})
app.post('/login', async (req, res) => {
  let USU_SENHA = req.body.USU_SENHA;
  let USU_NOME = req.body.USU_NOME;
  let sql = `SELECT USU_SENHA, ID_USU FROM USU_USUARIO WHERE USU_NOME = :USU_NOME`;
  let binds = {
    USU_NOME: USU_NOME
  }
  let result = await conectarbd(sql, binds, options);

  // Verifica se o resultado está vazio (nenhum usuário encontrado)
  if (result.length === 0) {
    res.send('Usuário não encontrado ou está inativo');
    return;
  } else {
    let senha_salva = result[0][0];
    let ID_USU = result[0][1];

    // Valida a senha
    bycrypt.compare(USU_SENHA, senha_salva, (err, resultt) => {
      if (resultt) {
        // Gera o token da sessão
        jwt.sign(
          {
            ID_USUARIO: ID_USU
          },
          secret,
          { expiresIn: '10h' },
          (err, token) => {
            if (err) {
              res.send('Ocorreu um erro ao gerar o token da sessão!');
              return;
            } else {
              res.status(200)
              .cookie("jwt", token, { httpOnly: true, maxAge: 8000000 })
              .send('Operação realizada com sucesso');
                
            }
          }
        )

      } else {
        return res.status(505).send('Senha inválida');
      }
    })

  }
})
//usuario desloga

app.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  console.log('Usuário deslogou');
  res.redirect("/login");
});

//valida se o usuário tem acesso a tela
function valida_acesso(ID_TELA, token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, async (err, data) => {
      if (err) {
        reject('Token inválido!');
      } else {
        let sql = `BEGIN VALIDA_CONSULTAS(:P_ID_USU, :P_ID_TELA, :P_RESULT); END;`;

        let binds = {
          P_ID_USU: data.ID_USUARIO,
          P_ID_TELA: ID_TELA,
          P_RESULT: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        };

        try {
          let result = await conectar(sql, binds);
          resolve(result.outBinds.P_RESULT);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
//valia aspermições na tela em que o usuário está
function permi_usu (ID_TELA,token){

  return new Promise((resolve,reject)=>{
      jwt.verify(token,secret,async(err,data)=>{
        if(err){ reject('token inválido')}
        else{
          //tr´s as permissões do usuario na teala especificada
          let sql = `SELECT
          CASE 
          WHEN ALU.CFU_ALTERA = 'S' OR ALG.GRUP_ALTERA = 'S' OR U.USU_ADM = 'S' THEN 'S' 
          ELSE 'N' 
          END AS ALTERA,
          CASE 
          WHEN DLU.CFU_DELETA = 'S' OR DLG.GRUP_DELETA = 'S' OR U.USU_ADM = 'S' THEN 'S'
          ELSE 'N'
          END AS DELETA,
          CASE 
          WHEN UIN.CFU_INCLUI = 'S' OR GIN.GRUP_INCLUI = 'S' OR U.USU_ADM = 'S' THEN 'S'
          ELSE 'N'
          END AS INCLUI,
          U.USU_ADM
      FROM (
          SELECT CFU_ALTERA
          FROM CONFIG_USU_TELA
          WHERE ID_USU = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) ALU,
      (
          SELECT T.GRUP_ALTERA 
          FROM CONFIG_GRUPO_TELA T
          INNER JOIN USU_USUARIO U ON U.ID_GRUPO = T.ID_GRUPO
          WHERE ID_USU = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) ALG,
      (
          SELECT CFU_DELETA 
          FROM CONFIG_USU_TELA
          WHERE ID_USU  = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) DLU,
      (
          SELECT T.GRUP_DELETA 
          FROM CONFIG_GRUPO_TELA T 
          INNER JOIN USU_USUARIO U ON U.ID_GRUPO = T.ID_GRUPO
          WHERE ID_USU  = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) DLG,
      (
          SELECT CFU_INCLUI 
          FROM CONFIG_USU_TELA
          WHERE ID_USU  = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) UIN,
      (
          SELECT T.GRUP_INCLUI 
          FROM CONFIG_GRUPO_TELA T 
          INNER JOIN USU_USUARIO U ON U.ID_GRUPO = T.ID_GRUPO
          WHERE ID_USU  = :P_ID_USU
          AND ID_TELA = :P_ID_TELA
      ) GIN,
      USU_USUARIO U
      WHERE U.ID_USU = :P_ID_USU`;
          let binds = {P_ID_USU: data.ID_USUARIO,P_ID_TELA:ID_TELA};


          let sql2 = ` SELECT  TL.T_NOME,TL.ROTA
          FROM USU_USUARIO U
          LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
          LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
          LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
             LEFT JOIN (SELECT ID_TELA,COUNT(ID_TELA) AS TOTAL
                   FROM  HIST_TELA WHERE ID_USU = :ID_USU
                  GROUP BY ID_TELA
                  ORDER BY TOTAL DESC ) TT ON TT.ID_TELA = TL.ID_TELA
          WHERE U.ID_USU = :ID_USU
            AND CG.ID_TELA = TL.ID_TELA
            AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S')
            AND TL.TIPO <> 'V'
             ORDER BY TT.ID_TELA`
            let binds2 = {
             ID_USU: data.ID_USUARIO
            }

            let sql3 = `SELECT T_NOME FROM T_TELA WHERE ID_TELA = :ID_TELA`;
            let binds3 = {
              ID_TELA: ID_TELA
             }
               //faz o log de acesso  da tela
             let sql4 = `BEGIN P_HIST_TELA(:ID_TELA,:ID_USU,:TOKEN); END;`;
             let binds4 = {
              ID_TELA: ID_TELA,
              ID_USU: data.ID_USUARIO,
              TOKEN: token
             }
             let sql5 = `SELECT 
             CAMP_1,
             CAMP_2,
             CAMP_3,
             CAMP_4,
             CAMP_5,
             CAMP_6,
             CAMP_7,
             CAMP_8,
             CAMP_9,
             CAMP_10 FROM FILTRO_HISTORICO WHERE ID_TELA = :ID_TELA AND ID_USU = :ID_USU`;
             let binds5 = {
              ID_TELA: ID_TELA,
              ID_USU: data.ID_USUARIO
             }

        try {
          let result  = await conectarbd(sql, binds,options_objeto);
          let result2 = await conectar(sql2,binds2,options);
          let result3 = await conectar(sql3,binds3,options);
          let result4 = await conectar(sql4,binds4,options);
          let result5 = await conectar(sql5,binds5,options);
          let Objeto = {
            P_USU :  result,
            T_USU: result2.rows,
            T_NOME: result3.rows[0][0],
            T_FILTRO: result5.rows
          }
          resolve(Objeto);
        } catch (error) {
          reject(error);
         }
        }
      })
  })

}

//Redirecionado a rota caso haja um erro no lado do servidor
app.get('/erroservidor/:error',(req,res)=>{
  res.send('Ocorreu um erro ! '+ '<br>' + req.params.error)
})


app.get('/usuario', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
      let Acesso = await valida_acesso(1,token);
      let P_USU = await permi_usu(1, token);

      Acesso === 'N' ? res.send('Usuário não tem permissão') :  res.render('./usuario/usuario', { P_USU })
  } catch (error) {
      res.send(error);
      console.log(error)
  }
});

//Salvando novo usuário
app.post('/usuario', urlencodedParser, async (req, res) => {

  const saltRounds = 10;

  const token = req.cookies.jwt;

  jwt.verify(token,secret,async(err,data)=>{
    if(err){
      return res.status(500).send('Token inválido!' + 'Não foi possivel realizar esta operação.')
     
    }else{
      let  USU_NOME = req.body.USU_NOME;
      let  USU_SENHA = req.body.USU_SENHA;
      let  ID_VENDEDOR = req.body.ID_VENDEDOR;
      let  ID_PARC = req.body.ID_PARC
      let  CFG_USU_ALT_PARC = req.body.CFG_USU_ALT_PARC;
      let  CFG_USU_CONF_CONFERE_CAIXA = req.body.CFG_USU_CONF_CONFERE_CAIXA;
      let  CFG_USU_LIB_BLOQ_PARC = req.body.CFG_USU_LIB_BLOQ_PARC;
      let  CFG_USU_EXC_FIN = req.body.CFG_USU_EXC_FIN;
      let  CFG_USU_FECHA_CAIXA = req.body.CFG_USU_FECHA_CAIXA;
      let  USU_ADM = req.body.USU_ADM;
      let  ID_GRUPO  = req.body.ID_GRUPO
      let  USU_LOGADO = data.ID_USUARIO;
    
        // Gerando o hash da senha usando bcrypt 
  const hash = await bycrypt.hash(USU_SENHA,saltRounds);
  let sql =   `BEGIN
   INSERI_USUARIO(:USU_NOME, :USU_SENHA,
                  :ID_VENDEDOR,
                  :ID_PARC,:USU_ADM,:USU_LOGADO, 
                  :ID_GRUPO, :CFG_USU_ALT_PARC, 
                  :CFG_USU_CONF_CONFERE_CAIXA, :CFG_USU_LIB_BLOQ_PARC, 
                  :CFG_USU_EXC_FIN, :CFG_USU_FECHA_CAIXA,:P_RESULTADO);
  END;
  `
  let binds = {
    USU_NOME:      USU_NOME,
    USU_SENHA:     hash,
    ID_VENDEDOR:   ID_VENDEDOR,
    ID_PARC:       ID_PARC,
    USU_ADM:       USU_ADM,
    USU_LOGADO:    USU_LOGADO,
    ID_GRUPO :     ID_GRUPO,
    CFG_USU_ALT_PARC:              CFG_USU_ALT_PARC,
    CFG_USU_CONF_CONFERE_CAIXA:   CFG_USU_CONF_CONFERE_CAIXA,
    CFG_USU_LIB_BLOQ_PARC:        CFG_USU_LIB_BLOQ_PARC,
    CFG_USU_EXC_FIN:              CFG_USU_EXC_FIN,
    CFG_USU_FECHA_CAIXA:          CFG_USU_FECHA_CAIXA,
    P_RESULTADO:{ dir: oracledb.BIND_OUT, type: oracledb.STRING }
  
  }               
  try{
    let result  = await conectar(sql,binds);
    
  //enviando para o usuario a rsposta da requisição
  res.send(result.outBinds.P_RESULTADO);
  
  }catch(err){
  res.status(500).send('Ocorreu um erro!' + err );
    
  }
    }
  })
});

app.get('/visualiza_usuario/:ID_USU',auth,async(req,res)=>{
  let ID_USU = req.params.ID_USU
  let token = req.cookies.jwt;

  let sql = `SELECT U.USU_STATUS,U.ID_USU,U.USU_NOME,
  U.USU_ID_VEND AS ID_VEND,
  U.ID_PARC AS ID_PARC,
  U.ID_GRUPO AS ID_GRUPO,
  G.GRP_NOME AS NOME_GRUPO,
  U.USU_ADM AS ADM,
  US.USU_NOME AS NOME_IN,
  TO_CHAR( U.DT_INCLU, 'DD/MM/YY HH24:MI') AS DATA_IN,
  USU.USU_NOME AS NOME_ALT,
  TO_CHAR(U.DT_ALTER,'DD/MM/YY HH24:MI') AS DATA_ALT,
  CG.CFG_USU_ALT_PARC AS ALT_PARC,
  CG.CFG_USU_CONF_CONFERE_CAIXA AS CF_CAIXA,
  CG.CFG_USU_LIB_BLOQ_PARC AS U_L_PARC,
  CG.CFG_USU_EXC_FIN AS EX_FIN,
  CG.CFG_USU_FECHA_CAIXA AS F_CAIXA,
  P.PARC_NOME,
  V.VND_NOME 
FROM
USU_USUARIO U
INNER JOIN GRP_GRUPO G ON G.ID_GRUPO = U.ID_GRUPO
INNER JOIN USU_USUARIO US ON US.ID_USU = U.ID_USU_INCLUSAO
INNER JOIN USU_USUARIO USU ON USU.ID_USU = U.COD_USU_ALTER
INNER JOIN CONFIG_USU CG ON CG.COD_USU = U.ID_USU
INNER JOIN PRC_PARCEIRO P ON P.ID_PARC = U.ID_PARC
INNER JOIN VND_VENDEDOR V ON V.ID_VENDEDOR = U.USU_ID_VEND 
WHERE U.ID_USU = :ID_USU`;
  let binds = {
    ID_USU : ID_USU
  };
  try{
    let Acesso = await valida_acesso(1, token);
    let P_USU = await permi_usu(1, token);
    let result = await conectarbd(sql,binds,options_objeto);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/visualiza_usuario', { P_USU,result })

  }catch (error){
    res.redirect(`/erroservidor/${error}`);
  }
})

app.post('/filtro_usuario',async(req,res)=>{
  let token = req.cookies.jwt;

  jwt.verify(token,secret,async(err,data)=>{
    if(err){
     return res.send('Token inválido, faça login novamente!')
    }else{
      let nome = req.body.P_NOME;
      let adm = req.body.P_ADM;
      let status = req.body.P_STATUS;
      let grupo = req.body.P_GRUPO;
      let sql = `SELECT FILTRO_USU (:P_NOME,:P_ADM,:P_STATUS,:P_GRUPO) FROM DUAL`
      let sql2 = `BEGIN INSERI_HIST_USU(:P_NOME,:P_ADM,:P_STATUS,:P_GRUPO,:P_ID_USU); END;`
      let binds = {
        P_NOME:   nome,
        P_ADM:    adm,
        P_STATUS: status,
        P_GRUPO:  grupo
    
      }
      let binds2 = {
        P_NOME:   nome,
        P_ADM:    adm,
        P_STATUS: status,
        P_GRUPO:  grupo,
        P_ID_USU: data.ID_USUARIO
      }

      try{
        let result = await conectarbd(sql,binds,options);
        let result2 = await conectarbd(sql2,binds2,options);
        res.send(result[0][0])
      }catch (error){
           res.redirect(`/erroservidor/${error}`);
      }

    }
  })

})

//copia usuario campo para colocar usuario
app.post('/input_usu',async(req,res)=>{
  let ID_USU = req.body.ID_USU;

  let sql = `SELECT USU_NOME FROM USU_USUARIO WHERE ID_USU = :ID_USU `;
  let binds = {ID_USU: ID_USU}

  try{
    let result = await conectarbd(sql,binds, options)
    result.length === 0 ? res.status(505).send('Usuário não encontrado!') :   res.send(result[0][0])
  }catch(error){    res.redirect(`/erroservidor/${error}`); }


})
//rota para alterar o cadastro de usuario
app.post('/update_usuario', async(req,res)=>{
  let token = req.cookies.jwt;
  let saltRounds = 10
  let objeto = req.body; //pegando os dados da requisição ajax
  jwt.verify(token,secret,async(err,data)=>{
     if(err)return res.send('Token inválido,faça login e tente novamente!');

     let sql = `BEGIN ALTERA_USUARIO ( :ID_USU,
      :USU_NOME,
      :ID_PARC,
      :ID_VENDEDOR,
      :ID_GRUPO,
      :USU_SENHA,
      :STATUS,
      :USU_ADM,
      :CFG_USU_LIB_BLOQ_PARC,
      :CFG_USU_FECHA_CAIXA,
      :CFG_USU_EXC_FIN,
      :CFG_USU_CONF_CONFERE_CAIXA,
     :CFG_USU_ALT_PARC,
     :USU_LOGADO,
     :P_MENSAGEM);
      END;`;

let binds = {
ID_USU:   objeto.ID_USU,
USU_NOME: objeto.USU_NOME,
ID_PARC:  objeto.ID_PARC,
ID_VENDEDOR: objeto.ID_VENDEDOR,
ID_GRUPO: objeto.ID_GRUPO,
USU_SENHA: objeto.USU_SENHA ? bycrypt.hashSync(objeto.USU_SENHA, saltRounds) : '',
STATUS:      objeto.STATUS,
USU_ADM: objeto.USU_ADM,
CFG_USU_LIB_BLOQ_PARC: objeto.CFG_USU_LIB_BLOQ_PARC,
CFG_USU_FECHA_CAIXA: objeto.CFG_USU_FECHA_CAIXA,
CFG_USU_EXC_FIN:   objeto.CFG_USU_EXC_FIN,
CFG_USU_CONF_CONFERE_CAIXA:objeto.CFG_USU_CONF_CONFERE_CAIXA,
CFG_USU_ALT_PARC: objeto.CFG_USU_ALT_PARC,
USU_LOGADO: data.ID_USUARIO,
P_MENSAGEM: { dir: oracledb.BIND_OUT, type: oracledb.STRING }

}

// const hash = await 

try{
let  result = await conectar(sql,binds);
console.log(objeto)
res.send(result.outBinds.P_MENSAGEM)
}catch (error){
res.send('Erro no lado do servidor ' + error)
}

  })



})
app.post('/delete_usu',urlencodedParser,async(req,res)=>{
  let ID_USU = req.body.ID_USU;
  console.log(ID_USU)
  let  sql = `BEGIN DELETA_USUARIO(:ID_USU,:P_MENSAGEM); END;`;
  let binds = {ID_USU:ID_USU,P_MENSAGEM: { dir: oracledb.BIND_OUT, type: oracledb.STRING }}
  let result = await conectar(sql,binds)
  res.send(result.outBinds.P_MENSAGEM)
})
// --------------------------------------------------------------------------------------------------------------- //


//acessos
app.get('/acessos',urlencodedParser,auth,async(req,res)=>{
  let token = req.cookies.jwt;
  let Acesso = valida_acesso(2,token)
  let P_USU = await permi_usu(2, token);
  if(Acesso == 'N') return res.status(505).send('Usuário não tem permissão')
  res.render('./acesso/acesso',{P_USU});

})



//Copia permissões
app.post('/copia_usuario',async(req,res)=>{
  let ID_F = req.body.ID_FORNECE;
  let ID_R = req.body.ID_RECEBE;
  let sql = `BEGIN COPIA_CONFIG_USU(:ID_R,:ID_F,:P_RESULTADO); END; `;
  let binds = {
     ID_F:ID_F,
     ID_R:ID_R,
     P_RESULTADO:{ dir: oracledb.BIND_OUT, type: oracledb.STRING }
  };

  try{
    let result = await conectar(sql,binds)
    res.status(200).send(result.outBinds.P_RESULTADO)
  }catch (error){
    res.send('Erro no lado do servidor ' + error)
  }


})
//CONSULTA PERMISSOES DE TODAS AS TELAS
app.post('/consulta_acessos',async(req,res)=>{
  let ID_USU = req.body.ID_USU;

  let sql = `SELECT T.ID_TELA,T.T_NOME,CFU_ALTERA,CFU_INCLUI,CFU_DELETA,CFU_CONSULTA
  FROM
  CONFIG_USU_TELA U
  INNER JOIN T_TELA T ON T.ID_TELA = U.ID_TELA
   WHERE ID_USU = :ID_USU`;
  let binds = {
    ID_USU: ID_USU
  }
   try{
    let result = await conectarbd(sql,binds, options)
    console.log(result)
    result.length === 0 ? res.status(505).send('Usuário não encontrado!') :   res.send(result)
   }catch (error){
    res.send('Erro no lado do servidor ' + error)
   }

    
})


//consulta parceiro
app.post('/consulta_parceiro', urlencodedParser, async (req, res) => {
  let ID_PARC = req.body.ID_PARC;
  let binds = {
    ID_PARC: ID_PARC
  }
  let sql = `SELECT PARC_NOME FROM PRC_PARCEIRO WHERE ID_PARC = :ID_PARC `; 
  
    try{
      let result = await conectarbd(sql,binds, options); 
      result.length === 0 ?  res.status(505).send('Parceiro não existe!') :  res.status(200).send( result[0][0] );
    }catch (error){
      res.send('Erro no lado do servidor ' + error)
    }


});

//consulta vendedor
app.post('/consulta_vendedor',urlencodedParser,async(req,res)=>{
  let ID_VENDEDOR = req.body.ID_VENDEDOR;

  let binds = { ID_VENDEDOR:ID_VENDEDOR};

  let sql = `SELECT VND_NOME FROM VND_VENDEDOR WHERE ID_VENDEDOR = :ID_VENDEDOR `;

  try{
    let result = await conectarbd(sql,binds,options);
    result.length === 0 ?  res.status(505).send('Vendedor não existe!') :   res.status(200).send(result[0][0])
  }catch (error){
    res.send('Erro no lado do servidor ' + error)
  }
})

//consulta grupo
app.post('/consulta_grupo',urlencodedParser,auth,async(req,res)=>{
  // let binds = {ID_GRUPO: ID_GRUPO};
  let sql = `SELECT ID_GRUPO,GRP_NOME FROM GRP_GRUPO`;
  let result = await conectarbd(sql,[],options)
    res.status(200).send(result);
})

app.post('/grupo',urlencodedParser,auth,async(req,res)=>{
  let ID_GRUPO_ = req.body.ID_GRUPO
  let sql = `SELECT ID_GRUPO,GRP_NOME FROM GRP_GRUPO WHERE ID_GRUPO = :ID_GRUPO`;
  let binds = {ID_GRUPO:ID_GRUPO_}
  try{
    let result = await conectarbd(sql,binds,options);
    result.length == 0 ? res.status(400).send('Grupo não existe!') :   res.status(200).send(result[0][1])  
  }catch (error){
    res.send('Erro no lado do servidor ' + error)
  }

})








app.listen(8020, (err) => {
  if (err) {
    console.log("Erro ao iniciar servidor" + err);
  } else {
    console.log("Servidor rodando, localhost:8020");
  }
});
