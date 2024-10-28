const express = require("express");
const app = express();
const server = require('http').createServer(app);
const axios = require('axios');
let packge = require('./package.json');
require('dotenv').config()
'use strict';
//view engine
app.set("view engine", "ejs");
const ratelimit = require('express-rate-limit');
  const limiter = ratelimit({
    window: 15 * 60 * 1000,
    max:100,
    message:'Muitas requisiçoes de um único IP.'
  })
  app.use(limiter)
//static public
app.use(express.static("public"));
//body-parser
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ limit: '2000mb' }));
//sessao de cookies
const cookieparser = require('cookie-parser');
app.use(cookieparser());
//bycrypt para hash
const bycrypt = require('bcrypt');
//jsonwebtoken
const jwt = require('jsonwebtoken');
const multer = require('multer')
const path = require('path')
// Configurando multer para uploads de imagens
const storage = multer.diskStorage({
  destination: (req, file, callback) => { callback(null, path.resolve('./public/img/Anexos')) },
  filename: (req, file, callback) => {
    const time = new Date().getTime();
    callback(null, `${time}__${file.originalname}`);
  }
})
const oracledb = require('oracledb');

const dbconfig = {
  user: process.env.SYSTEM,
  password: process.env.PASSWORD,
  connectString: process.env.CONNECT
}

async function conectarbd(sql, binds, options) {
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`, binds, options);
  return result.rows;
}
async function conectar(sql, binds) {
  let connection = await oracledb.getConnection(dbconfig);
  let result = await connection.execute(`${sql}`, binds);
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




//Esta função recebe o objeto que contém um objeto  com os valores da licença que estão hasheados 
function Deshashea(stringObject) {
  let stringhash = (stringObject).substring(0, stringObject.length - 1)
  let Posisao = stringObject.substring(stringObject.length - 2, stringObject.length)
  let resolvestring = '';
  for (let i = 1; i < stringhash.length; i++) {
    if (i % 2 == 0) { resolvestring += stringObject[i] }
  };
  return `${Posisao.substring(2, 1)}${resolvestring}${Posisao.substring(1, 1)}`
}
const upload = multer({ storage: storage })


//configurando cors
const cors = require('cors');
let urlencodedParser = bodyparser.urlencoded({ extended: false });
app.use(cors());

const fs = require('fs');
const { split, stubString, toInteger } = require("lodash");
// const send = require("send");
// const { tryEach } = require("async");
// const { MAX_LENGTH } = require("picomatch/lib/constants");


app.get('/certificado/validacao', (req, res) => {
  let url = req.params.url;
  console.log(url + '<br>');

  res.render('certificado', { url });
})
//gera log de erros do servidor no geral
function criarlogtxt(log, url) {
  let data = new Date();
  try {
    fs.appendFileSync('logdeerros.txt', `\n${data} -- ${url}  -- ${log}\n`, { encoding: 'utf8' });
    console.log('Arquivo editado com sucesso.');
  } catch (err) {
    console.error('Erro ao escrever no arquivo: ', err);
  }
}
let inactivityTimer;// Função para resetar o temporizador de inatividade
let TempoSessao = 0;
async function resetInactivityTimer(token) {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  let sql = `SELECT TEMPO_S_INATIVA FROM PREFERENCES`;
  let binds = {};
  let consulta = await conectar(sql, binds);
  TempoSessao = consulta.rows[0][0];
  inactivityTimer = setTimeout(() => {
    console.log('Usuário inativo .');
    try {
      let sql = `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE,KILL = 'S' WHERE TOKEN = :TOKEN; COMMIT; END;`;
      let binds = { TOKEN: token };
      conectar(sql, binds);
    } catch (error) {
      let log = error;
      console.log(error);
    }
    console.log(TempoSessao)
  }, TempoSessao * 1000);
}

//middleware de autenticação;
async function auth(req, res, next) {
  let token = req.cookies.jwt;
  resetInactivityTimer(token)

  //Verificando se o metodo é get
  try {
    //SE kill for S a sessão é
    let sql = `SELECT KILL FROM LOG_LOGIN WHERE TOKEN = :TOKEN `;
    let binds = { TOKEN: token };
    let result = await conectarbd(sql, binds, options_objeto);
    let KILL
    result.forEach((e) => { KILL = e.KILL });
    if (KILL == 'S') {
   res.status(500).send('Token inválido!!');


    }else{
      next()
    }

    return;
  } catch (error) {
    console.log(error);
  }



  if (!token) {
   res.status(401)

  } else {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.SECRET);
      req.ID_USUARIO = decoded;
      return next();
    } catch (error) {
      let log = error;
      criarlogtxt(log, req.url);
      console.log(error);
    }
  }
}

app.get('/AdministracaoServidor', auth, async (req, res) => {
  let tokenn = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(324, tokenn);
    let P_USU = await permi_usu(324, tokenn);
    let Sql = `SELECT NVL(USU_ALT_USU,'N') AS USU_ALT_USU ,TEMPO_S_INATIVA,NVL(VAL_CGC,'N') AS VAL_CGC,CORRIGE_CID,VIA_CEP,D_USU_INAT,DIAS_ATUALIZAR_PARC FROM PREFERENCES WHERE ROWNUM < 2`;
    let Sql_results = await conectarbd(Sql, [], options_objeto);
    let Dadoslicenca = {}
    let Token_licenca
    fs.readFile('licenca.json', 'utf-8', async (err, data) => {
      JSON.parse(data).forEach((e) => {
        Token_licenca = e.token;
      })
      let tokensplit = split(atob(Token_licenca), '=')
      Dadoslicenca['DT_LIMITE'] = tokensplit[0];
      Dadoslicenca['SESSOES'] = tokensplit[1];
      Dadoslicenca['CNPJ'] = tokensplit[2];
      Dadoslicenca['USUER_BANCO'] = process.env.SYSTEM;
      Dadoslicenca['RAZAO_SOCIAL'] = tokensplit[3];
      Dadoslicenca['V_NODE'] = process.version;
      Dadoslicenca['V_OS'] = process.platform;
      Dadoslicenca['V_APP'] = packge.version;

      console.log(Sql_results)
      Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/AdministracaoServidor', { P_USU, Dadoslicenca, Sql_results })

    })

  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error);
  }
})
app.post('/AtualizaLicenca', (req, res) => {
  let ArrayToken = []
  let Token = {}
  Token['token'] = Deshashea(req.body.Token)
  ArrayToken.push(Token)
  let Token64 = atob(Deshashea(req.body.Token))
  try {
    console.log(isNaN(Token64.substring(5, 7)))
    if (Token64.length < 40 || isNaN(Token64.substring(0, 4)) || isNaN(Token64.substring(5, 7)) || toInteger(Token64.substring(5, 7)) > 12) {
      return res.status(500).send('Verifique o token,estrutura inválida!');

    } else {
      atob(Deshashea(req.body.Token));
      fs.writeFileSync('licenca.json', JSON.stringify(ArrayToken));
      return res.send('certificado alterado com sucesso');
    }
  } catch (error) {
    res.status(500).send('Error ao atualizar o certificado,verifique seu token')
  }
})

//login
app.get('/login', (req, res) => {
  res.render('./usuario/login')
})

app.post('/login', async (req, res) => {
  console.log('------')

  let USU_SENHA = req.body.USU_SENHA;
  let USU_NOME = req.body.USU_NOME;
  let sql = `SELECT USU_SENHA, ID_USU FROM USU_USUARIO WHERE USU_NOME = :USU_NOME AND USU_STATUS = 'S'`;
  let binds = { USU_NOME: USU_NOME }
  console.log('--242----')
  let result = await conectarbd(sql, binds, options);
  

  //Verifica se há um token,caso haja é finalizado a sessão
  let TOKEN = req.cookies.jwt;
  // t
  try {
    fs.readFile('licenca.json', 'utf-8', async (err, data) => {
      if (err) {
        res.status(500).send('Houve um erro ao ler o token da licença,contactar o departamento de TI')
      } else {
        let tokenLicenca;
        Object(JSON.parse(data)).forEach((key) => {
          tokenLicenca = key.token;
        })

        if (tokenLicenca == undefined || tokenLicenca == '' || tokenLicenca.length < 40) {
          res.status(500).send('Houve um erro ao ler o token da licença,contactar o departamento de TI')
        } else {
          let TokenSplit = split(atob(tokenLicenca), '=')
          let DataAtual = new Date();
          let ano = DataAtual.getFullYear();
          let mes = (DataAtual.getMonth() + 1).toString().padStart(2, '0');
          let dia = DataAtual.getDate().toString().padStart(2, '0');

          let DataFormatada = `${dia}/${mes}/${ano}`;

          if (TokenSplit[0] < new Date()) {
            console.log(new Date())
            return res.status(500).send(`Licenca vencida,favor contactar setor de TI.${TokenSplit[0]} -- ${DataFormatada}`,)
          } else {
            //Se já houver um token de sessao é finalizado a sessão anterior
            if (TOKEN) {
              res.clearCookie("jwt");
              let sql2 = `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE WHERE TOKEN = :TOKEN; COMMIT; END;`;
              let binds2 = { TOKEN: TOKEN }
              conectar(sql2, binds2);
            }
            let SqlNum = `  SELECT COUNT(*) AS COUNT
          FROM LOG_lOGIN
          WHERE DT_SAIDA IS NULL
          AND KILL IS NULL
          AND DT_ENTRADA >=  SYSDATE - INTERVAL '10' HOUR`;
            let NumSession = await conectar(SqlNum, []);
            let LimitSession = Math.ceil(parseInt(TokenSplit[1]) + parseFloat(TokenSplit[1] * 5 / 100))
            //Valida a quantidade de sessoes ativas 
            if (NumSession.rows[0][0] >= LimitSession) {
              //O limite de sessoes foi atingido
              return res.status(500).send('Excedido o limite de usuários logados')
            } else {
              // Verifica se o resultado está vazio (nenhum usuário encontrado)
              if (result.length === 0) {
                return res.status(404).send('Usuário não encontrado ou está inativo');
              }
              // Valida a senha
              try {
                const match = await bycrypt.compare(USU_SENHA, result[0][0]);
                if (match) {
                  // Gera o token da sessão
                  let ID_USUARIO = result[0][1];
                  jwt.sign({ ID_USUARIO }, process.env.SECRET, { expiresIn: '10h' }, (error, token) => {
                    if (error) {
                      return res.status(500).send('Ocorreu um erro ao gerar o token da sessão!');
                    }
                    res.status(200).cookie("jwt", token, { httpOnly: true, maxAge: 36000000 }).send();
                    try {
                      let sql = `BEGIN INSERT INTO LOG_LOGIN (TOKEN,IP_ADRESS,ID_USU,DT_ENTRADA,NAVEGADOR,SO_COMPUTADOR)VALUES(:TOKEN,:IP_ADRESS,:ID_USU,SYSDATE,:NAVEGADOR,:SO_COMPUTADOR); COMMIT; END;`

                      let binds = {
                        TOKEN: token,
                        IP_ADRESS: req.headers['x-forwarded-for'],
                        NAVEGADOR: req.headers['sec-ch-ua'],
                        SO_COMPUTADOR: req.headers['sec-ch-ua-platform'],
                        ID_USU: ID_USUARIO
                      }
                      console.log('------')
                      conectar(sql, binds);
                    } catch (error) {
                      res.status(500).send('Error ', error);
                      console.log('----Error--')
                      console.log(error);
                    }
                  });
                } else {
                  return res.status(401).send('Senha inválida, verifique sua senha e tente novamente!');
                }
              } catch (error) {
                let log = error;
                criarlogtxt(log, req.url);
                res.status(500).send(error);
              }
            }

          }
        }
      }
    });

  } catch (error) {
    res.status(500).send('Houve um erro ao ler o token da licença,contactar o departamento de TI')
  }
});

//usuario desloga
app.post("/logout", (req, res) => {
  try {
    let TOKEN = req.cookies.jwt;
    res.clearCookie("jwt");
    let sql = `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE WHERE TOKEN = :TOKEN; COMMIT; END;`;
    let binds = { TOKEN: TOKEN }
    conectar(sql, binds)
    res.redirect("/login");
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error);
  }

});

//valida se o usuário tem acesso a tela
function valida_acesso(ID_TELA, token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, async (err, data) => {
      if (err) {
        reject('Token inválido!r');
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
          let log = error;
          criarlogtxt(log);
          reject(error);
        }
      }
    });
  });
}
app.post('/filtra/acesso', async (req, res) => {

  let token = req.cookies.jwt;
  jwt.verify(token, process.env.SECRET, async (err, data) => {
    let sql2 = ` SELECT  TL.T_NOME,TL.ROTA
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  WHERE U.ID_USU = :ID_USU
    AND CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S')
    AND TL.TIPO <> 'V'`

    try {
      let binds2 = {
        ID_USU: data.ID_USUARIO
      }
      let result = await conectar(sql2, binds2)
      res.send(result.rows)
    } catch (error) {
      res.redirect('/login')
    }

  })
})

//valia as permições na tela em que o usuário está
function permi_usu(ID_TELA, token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, async (err, data) => {
      if (err) { reject('token inválido') }
      else {
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
          U.USU_ADM,
          U.PATH_IMG AS PATH_IMG,
          U.USU_NOME AS USU_NOME
          
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

        let binds = { P_ID_USU: data.ID_USUARIO, P_ID_TELA: ID_TELA };


        let sql3 = `SELECT T_NOME,T_DESCRICAO,ID_TELA,TABELA FROM T_TELA WHERE ID_TELA = :ID_TELA`;
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
        let sql6 = `SELECT A.DESCRICAO,A.ID_JS 
         FROM ACAO A
         INNER JOIN USU_ACAO U ON  U.ID_ACAO =  A.ID
         WHERE U.ID_USU = :ID_USU
           AND EXECUTA = 'S'
           AND U.ID_TELA = :ID_TELA
           AND A.STATUS = 'A'`
        try {
          let result = await conectarbd(sql, binds, options_objeto);
          let result3 = await conectar(sql3, binds3, options);
          let result4 = await conectar(sql4, binds4, options);
          let result5 = await conectar(sql5, binds5, options);
          let result6 = await conectarbd(sql6, binds5, options_objeto);
          let Objeto = {
            P_USU: result,
            T_NOME: result3.rows[0],
            T_FILTRO: result5.rows,
            T_ACAO: result6
          }
          resolve(Objeto);
        } catch (error) {
          let log = error;
          criarlogtxt(log);
          reject(error);
        }
      }
    })
  })

}
//Redirecionado a rota caso haja um erro no lado do servidor
app.get('/erroservidor/:error', (req, res) => {
  res.send('Ocorreu um erro ! ' + '<br>' + req.params.error)
})
app.get('/logout', (req, res) => {
  res.clearCookie('jwt')
  res.redirect('/login')
})

//tela de inicio
app.get('/', auth, async (req, res) => {
  let token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) {
      console.log('Token inválidfo');
      res.send('Token inválidfo')
    } else {
      let USU_LOGADO = data.ID_USUARIO;
      try {


        let Acesso = await valida_acesso(323, token);

        let P_USU = await permi_usu(323, token);

        res.render('index', { P_USU, })
      } catch (error) {
        let log = error;
        console.error('Erro:', error)
        res.status(500).send(error)
        // res.status(500).send('Erro ao obter os dados');
      }


    }
  })

})
app.get('/cadastro/cidades', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(181, token);
    let P_USU = await permi_usu(181, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./cadastro/cidades', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error);
  }
})
//monitor de sesão
app.get('/monitordesessao', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(301, token);
    let P_USU = await permi_usu(301, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/monitordesessao', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error);
  }
})
//tabela de preço
app.get('/tabela/preco', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(401, token);
    let P_USU = await permi_usu(401, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./cadastro/tabeladepreco', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error);
  }
})

app.get('/usuario', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(1, token);
    let P_USU = await permi_usu(1, token);

    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/usuario', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error)
  }
});
app.get('/dicionario/de/dados', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(118, token);
    let P_USU = await permi_usu(118, token);


    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/dicionariodedados', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
  }
});
app.get('/visualiza/dicionario/dados/procedure/:procedure_name', auth, async (req, res) => {
  let token = req.cookies.jwt;
  let procedure_nome = req.params.procedure_name;
  try {
    let Acesso = await valida_acesso(118, token);
    let P_USU = await permi_usu(118, token);
    let sql = `SELECT   
   ASS.TEXT
    FROM ALL_SOURCE ASS,USER_PROCEDURES US WHERE
    US.OBJECT_NAME = ASS.NAME  AND TYPE = 'PROCEDURE'
   AND OBJECT_NAME = '${procedure_nome}'`;
    let result = await conectarbd(sql, [], options_objeto);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/visualizaprocedure', { P_USU, result });
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error)
  }
});
app.get('/construtor/componente/BI/:ID',async(req,res)=>{
  let ID = req.params.ID;
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(ID, token);
    let P_USU = await permi_usu(ID, token);
    // let Xml = await conectar('SELECT XML FROM T_TELA WHERE ID_TELA = :ID_TELA',{ID_TELA:ID});
    Acesso === 'N' ? res.send('Usuário não tem permissão') :  res.render('./Admin/dashpersonalizado.ejs',{ P_USU });
    // console.log(Xml)
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
  }
})
app.get('/construtor/componente/BI',async(req,res)=>{
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(501, token);
    let P_USU = await permi_usu(501, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') :  res.render('./Admin/construtorBi.ejs',{ P_USU });
    // console.log(Xml)
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
  }
})
//Rota pára gráfico de usuario
app.get('/visualiza/dicionario/dados/:ID', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {

    let Acesso = await valida_acesso(118, token);
    let P_USU = await permi_usu(118, token);


    let sql2 = `SELECT  TT.COLUMN_NAME, 
    TT.DATA_TYPE,
    TT.NULLABLE,
    TT.DATA_LENGTH,
    TT.DATA_DEFAULT,
    CM.COMMENTS
    FROM TABELA_BANCO TB
    INNER JOIN ALL_COL_COMMENTS CM ON CM.TABLE_NAME = TB.TAB_NOME
    INNER JOIN ALL_TAB_COLUMNS TT ON TT.TABLE_NAME = TB.TAB_NOME
    WHERE TT.TABLE_NAME = (SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID})
    AND TT.COLUMN_NAME = CM.COLUMN_NAME  `;

    let sql3 = `SELECT INDEX_NAME,INDEX_TYPE	,CONSTRAINT_INDEX,NUM_ROWS
    FROM DBA_INDEXES WHERE TABLE_NAME = (SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID})`;
    let sql4 = `SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID}`
    let sql5 = `SELECT TRIGGER_NAME,
                       TRIGGERING_EVENT,
                       STATUS
                FROM ALL_TRIGGERS 
                WHERE TABLE_NAME = (SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID})`
    let Objeto = {}
    let sql6 = `SELECT
    UC.CONSTRAINT_NAME AS FK,
    UCC.COLUMN_NAME AS FK_COLUNA,
    CC.TABLE_NAME  AS FK_TABELA,
    CCC.COLUMN_NAME AS COLUNA_REFRENCIADA   
    FROM
    USER_CONSTRAINTS UC
    INNER JOIN   USER_CONS_COLUMNS UCC ON UC.CONSTRAINT_NAME = UCC.CONSTRAINT_NAME
    INNER JOIN  USER_CONSTRAINTS CC ON UC.R_CONSTRAINT_NAME= CC.CONSTRAINT_NAME
    INNER JOIN   USER_CONS_COLUMNS CCC ON CC.CONSTRAINT_NAME= CCC.CONSTRAINT_NAME 
    WHERE    UC.CONSTRAINT_TYPE= 'R' 
    AND    UC.TABLE_NAME = (SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID})`
    const result2 = await conectar(sql2, []);
    const result3 = await conectar(sql3, []);
    const result4 = await conectar(sql4, []);
    const result5 = await conectar(sql5, []);
    const result6 = await conectar(sql6, []);
    let CAMPOS = result2.rows
    let INDEXES = result3.rows
    let TABELA_NOME = result4.rows
    let TRIGGRES = result5.rows
    let FKS = result6.rows
    Objeto = { CAMPOS, INDEXES, TABELA_NOME, TRIGGRES, FKS }
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/visualizadicionariodedados', { P_USU, Objeto })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error)

  }
})
//rota para a consulta e dados no lado do usuário DBE_explorer
app.get('/sql/DBE_explorer', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(141, token);
    let P_USU = await permi_usu(141, token);

    Acesso === 'N' ? res.send('Usuário nao tem,permissão!') : res.render('./sql/DBE_explorer', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error)
  }
})
app.get('/cadastro/parceiro', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(201, token);
    let P_USU = await permi_usu(201, token);
    Acesso === 'N' ? res.send('Usuário nao tem,permissão!') : res.render('./parceiro/cadastroparceiro', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send(error)
  }
})

//Rota para visuaçlizar trigger
app.get('/visualiza/dicionario/dados/trigger/:trigger_name', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  let trigger_name = req.params.trigger_name
  try {
    let Acesso = await valida_acesso(118, token);
    let P_USU = await permi_usu(118, token);
    let sql = `SELECT DESCRIPTION,TRIGGER_BODY FROM USER_TRIGGERS WHERE TRIGGER_NAME = '${trigger_name}' `;
    let result = await conectar(sql, []);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/visualizatrigger', { P_USU, result: result.rows })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send('Error', error)

  }
})
//Tela de log de acesso
app.get('/log/acesso', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(222, token);
    let P_USU = await permi_usu(222, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/logacesso', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error)
    res.status(500).send('Error:' + error)
  }
})
//Tela de portal de importação de XML
app.get('/portal/importacao', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(461, token);
    let P_USU = await permi_usu(461, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/portaldeimportacaoxml', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error)
    res.status(500).send('Error:' + error)
  }
})
app.get('/lancador/log', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(341, token);
    let P_USU = await permi_usu(341, token);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/lancadorlog', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send('Error:' + error)
    res.status(500).send('Error:' + error)
  }
})
//faz a conSulta sql que o usuario digitou 
app.post('/sql/DBE_explorer', auth, urlencodedParser, async (req, res) => {
  try {
    console.log(req.body)
    let result = await conectar(req.body.sql, []);
    let arrayobjetos = result.metaData
    let array_colunas = [];
    let array_registros = []
    array_registros = result.rows;

    arrayobjetos.forEach((e) => { array_colunas.push(e.name) });
    let objeto = {
      array_colunas: array_colunas,
      array_registros: array_registros
    };
console.log(objeto)
    res.send(objeto);
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send('Erro ao execultar sql! ' + error.message);
  }
})
app.post('/DashTabela', auth, async (req, res) => {
  try {
    let Binds = req.body.binds
    let result = await conectar(req.body.sql, Binds);
    let arrayobjetos = result.metaData
    let array_colunas = [];
    let array_registros = []
    array_registros = result.rows;
    arrayobjetos.forEach((e) => { array_colunas.push(e.name) });
    let objeto = {
      array_colunas: array_colunas,
      array_registros: array_registros
    };
    res.send(objeto);
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.status(500).send('Erro ao execultar sql! ' + error.message);
  }
})
//grava log de saida das telas
app.post('/beforeunload', async (req, res) => {
  let ID_TELA = req.body.ID_TELA

  let token = req.cookies.jwt;
  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) {
      console.log('Token inválidogggff');
      return;
    } else {
      let USU_LOGADO = data.ID_USUARIO;
      try {
        let sql4 = `BEGIN HIST_TELA_SAIDA(:P_TOKEN,:ID_TELA,:P_USU_LOGADO); END;`;
        let binds4 = {
          P_TOKEN: token,
          ID_TELA: ID_TELA,
          P_USU_LOGADO: USU_LOGADO
        }
        await conectar(sql4, binds4, options)
        return
      } catch (error) {
        let log = error
        criarlogtxt(log, req.url);
        console.log('Erro ao salvar log de saida: ', error)
      }
    }
  })
})


app.post('/usuario', urlencodedParser, async (req, res) => {

  const saltRounds = 10;

  const token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) {
      return res.status(500).send('Token inválido!f' + 'Não foi possivel realizar esta operação.')

    } else {
      let USU_NOME = req.body.USU_NOME;
      let USU_SENHA = req.body.USU_SENHA;
      let ID_VENDEDOR = req.body.ID_VENDEDOR;
      let ID_PARC = req.body.ID_PARC
      let CFG_USU_ALT_PARC = req.body.CFG_USU_ALT_PARC;
      let CFG_USU_CONF_CONFERE_CAIXA = req.body.CFG_USU_CONF_CONFERE_CAIXA;
      let CFG_USU_LIB_BLOQ_PARC = req.body.CFG_USU_LIB_BLOQ_PARC;
      let CFG_USU_EXC_FIN = req.body.CFG_USU_EXC_FIN;
      let CFG_USU_FECHA_CAIXA = req.body.CFG_USU_FECHA_CAIXA;
      let USU_ADM = req.body.USU_ADM;
      let ID_GRUPO = req.body.ID_GRUPO
      let USU_LOGADO = data.ID_USUARIO;
      let CAIXA = data.CAIXA;
      // Gerando o hash da senha usando bcrypt 
      const hash = await bycrypt.hash(USU_SENHA, saltRounds);
      let sql = `BEGIN
   INSERI_USUARIO(:USU_NOME, :USU_SENHA,
                  :ID_VENDEDOR,
                  :ID_PARC,:USU_ADM,:USU_LOGADO, 
                  :ID_GRUPO, :CFG_USU_ALT_PARC, 
                  :CFG_USU_CONF_CONFERE_CAIXA, :CFG_USU_LIB_BLOQ_PARC, 
                  :CFG_USU_EXC_FIN, :CFG_USU_FECHA_CAIXA,:CAIXA,:P_RESULTADO);
  END;
  `
      let binds = {
        USU_NOME: USU_NOME,
        USU_SENHA: hash,
        ID_VENDEDOR: ID_VENDEDOR,
        ID_PARC: ID_PARC,
        USU_ADM: USU_ADM,
        USU_LOGADO: USU_LOGADO,
        ID_GRUPO: ID_GRUPO,
        CFG_USU_ALT_PARC: CFG_USU_ALT_PARC,
        CFG_USU_CONF_CONFERE_CAIXA: CFG_USU_CONF_CONFERE_CAIXA,
        CFG_USU_LIB_BLOQ_PARC: CFG_USU_LIB_BLOQ_PARC,
        CFG_USU_EXC_FIN: CFG_USU_EXC_FIN,
        CFG_USU_FECHA_CAIXA: CFG_USU_FECHA_CAIXA,
        CAIXA: CAIXA,
        P_RESULTADO: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      }
      try {
        let result = await conectar(sql, binds);

        //enviando para o usuario a rsposta da requisição
        res.send(result.outBinds.P_RESULTADO);

      } catch (err) {
        let log = err;
        criarlogtxt(log, req.url);
        res.status(500).send('Ocorreu um erro!' + err);

      }
    }
  })
});

app.get('/visualiza_usuario/:ID_USU', auth, async (req, res) => {
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
  V.VND_NOME ,
  U.CAIXA AS CAIXA
FROM
USU_USUARIO U
LEFT JOIN GRP_GRUPO G ON G.ID_GRUPO = U.ID_GRUPO
LEFT JOIN USU_USUARIO US ON US.ID_USU = U.USU_INCLU
LEFT JOIN USU_USUARIO USU ON USU.ID_USU = U.USU_ALTER
LEFT JOIN CONFIG_USU CG ON CG.COD_USU = U.ID_USU
LEFT JOIN PRC_PARCEIRO P ON P.ID_PARC = U.ID_PARC
LEFT JOIN VND_VENDEDOR V ON V.ID_VENDEDOR = U.USU_ID_VEND 
WHERE U.ID_USU = :ID_USU AND ROWNUM = 1`;
  let binds = {
    ID_USU: ID_USU
  };
  try {
    let Acesso = await valida_acesso(1, token);
    let P_USU = await permi_usu(1, token);
    let result = await conectarbd(sql, binds, options_objeto);
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/visualiza_usuario', { P_USU, result })

  } catch (error) {
    res.send(error);
  }
})
//Lançador de tarefa
app.get('/lancador/tarefa', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(241, token);
    let P_USU = await permi_usu(241, token);
    res.render('./Admin/lancadortarefa', { P_USU });
  } catch (error) {
    'Error:'
  }


})
app.post('/filtro_usuario', async (req, res) => {
  let token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) {
      return res.send('Token inválido, faça login novamente!')
    } else {
      let nome = req.body.nome;
      let adm = req.body.adm;
      let status = req.body.ativo;
      let grupo = req.body.ID_GRUPO_F;
      let sql = `SELECT FILTRO_USU (:P_NOME,:P_ADM,:P_STATUS,:P_GRUPO) FROM DUAL`
      let sql2 = `BEGIN INSERI_HIST_USU(:P_NOME,:P_ADM,:P_STATUS,:P_GRUPO,:P_ID_USU); END;`
      let binds = {
        P_NOME: nome,
        P_ADM: adm,
        P_STATUS: status,
        P_GRUPO: grupo

      }
      let binds2 = {
        P_NOME: nome,
        P_ADM: adm,
        P_STATUS: status,
        P_GRUPO: grupo,
        P_ID_USU: data.ID_USUARIO
      }

      try {
        let result = await conectarbd(sql, binds, options);
        let result2 = await conectarbd(sql2, binds2, options);
        res.send(result[0][0]);
      } catch (error) {
        let log = error;
        criarlogtxt(log, req.url);
        res.send(error);
      }

    }
  })
})

//rota para alterar o cadastro de usuario
app.post('/update_usuario', async (req, res) => {
  let token = req.cookies.jwt;
  let saltRounds = 10
  let objeto = req.body; //pegando os dados da requisição ajax
  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) return res.send('Token inválido,faça login e tente novamente!');

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
      :CAIXA,
     :USU_LOGADO,
     :P_MENSAGEM);
      END;`;
    let binds = {
      ID_USU: objeto.ID_USU,
      USU_NOME: objeto.USU_NOME,
      ID_PARC: objeto.ID_PARC,
      ID_VENDEDOR: objeto.ID_VENDEDOR,
      ID_GRUPO: objeto.ID_GRUPO,
      USU_SENHA: objeto.USU_SENHA ? bycrypt.hashSync(objeto.USU_SENHA, saltRounds) : '',
      STATUS: objeto.STATUS,
      USU_ADM: objeto.USU_ADM,
      CFG_USU_LIB_BLOQ_PARC: objeto.CFG_USU_LIB_BLOQ_PARC,
      CFG_USU_FECHA_CAIXA: objeto.CFG_USU_FECHA_CAIXA,
      CFG_USU_EXC_FIN: objeto.CFG_USU_EXC_FIN,
      CFG_USU_CONF_CONFERE_CAIXA: objeto.CFG_USU_CONF_CONFERE_CAIXA,
      CFG_USU_ALT_PARC: objeto.CFG_USU_ALT_PARC,
      CAIXA: objeto.CAIXA,
      USU_LOGADO: data.ID_USUARIO,
      P_MENSAGEM: { dir: oracledb.BIND_OUT, type: oracledb.STRING }

    }

    try {
      let result = await conectar(sql, binds);
      res.send(result.outBinds.P_MENSAGEM)
    } catch (error) {
      let log = error;
      criarlogtxt(log, req.url);
      res.status(500).end('Erro : ' + error);

    }
  })
})
app.post('/delete_usu', urlencodedParser, async (req, res) => {
  try {
    let ID_USU = req.body.ID_USU;
    let sql = `BEGIN DELETA_USUARIO(:ID_USU,:P_MENSAGEM); END;`;
    let binds = { ID_USU: ID_USU, P_MENSAGEM: { dir: oracledb.BIND_OUT, type: oracledb.STRING } }
    let result = await conectar(sql, binds)
    res.send(result.outBinds.P_MENSAGEM)
  } catch (error) {
    res.status(500).send('Error' + error)
  }

})
//faz update nas configuraçõesde tela dos usuarios
app.post('/usuario_acesso', async (req, res) => {
  let objeto = req.body
  let token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) { res.send('Token invãlido') } else {
      let sql;
      //verifica se o usuario está alterando um usuario
      if (objeto.TABELA == 'USU_USUARIO') {
        sql = `BEGIN UPD_USUA(:P_POSICAO,:P_VALOR,:USU_LOGADO,:P_ID_TELA,:P_ID);END;`
      }
      if (objeto.TABELA == 'GRP_GRUPO') {
        sql = `BEGIN UPD_GRPA(:P_POSICAO,:P_VALOR,:USU_LOGADO,:P_ID_TELA,:P_ID);END;`
      }
      let binds = {
        P_VALOR: objeto.VALOR,
        P_ID_TELA: objeto.ID_TELA,
        P_ID: objeto.ID,
        USU_LOGADO: data.ID_USUARIO,
        P_POSICAO: objeto.POSICAO
      }
      try {
        let result = await conectar(sql, binds)
        res.send(result);
      } catch (error) {
        res.status(500).send('Error' + error)
      }

    }

  })



})

//Cadastro de produtos
app.get('/produtos', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(281, token);
    let P_USU = await permi_usu(281, token);
    res.render('./cadastro/produto', { P_USU })
  } catch (error) {
    res.status(500).send(error)
  }
})
//Marca de produtos
app.get('/marca/produtos', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(361, token);
    let P_USU = await permi_usu(361, token);
    res.render('./cadastro/marca', { P_USU })
  } catch (error) {
    res.status(500).send(error)
  }
})
//TOP
app.get('/top/tipomovimento', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(481, token);
    let P_USU = await permi_usu(481, token);
    res.render('./Admin/top.ejs', { P_USU })
  } catch (error) {
    res.status(500).send(error)
  }
})
app.get('/natureza/lancamento',auth,async(req,res)=>{
try{
  let token = req.cookies.jwt;
  let Acesso = await valida_acesso(381,token);
  let P_USU = await permi_usu(381, token);
  res.render('./cadastro/naturezas', { P_USU })
}catch (error){
  res.status(500).send(error)
}
})
app.get('/categoria/produtos', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(362, token);
    let P_USU = await permi_usu(362, token);
    res.render('./cadastro/categoriaprodutos', { P_USU })
  } catch (error) {
    res.status(500).send(error)
  }
})

//Visualizar de produtos
app.get('/visualizaproduto/:ID', auth, async (req, res) => {
  let ID = req.params.ID;
  let token = req.cookies.jwt;
  let Acesso = await valida_acesso(281, token);
  let P_USU = await permi_usu(281, token);
  try {
    let sql = `SELECT 
    P.PRDT_ID,
    PRDT_NOME,
    P.PRDT_DESCRICAO,
    P.PRDT_CARACT,
    P.PRDT_USADO_COMO,
    P.PRDT_CAL_COMISSAO,
    P.PRDT_NCM,
    REPLACE(P.PRDT_EST_MIN,'.',',') PRDT_EST_MIN,
    P.PRDT_EST_MAX,
    P.PRDT_NR_PECA,
    REPLACE(P.PRDT_MARGEM_LUCRO,'.',',') PRDT_MARGEM_LUCRO ,
    P.PRDT_COMISSAO_VND,
    P.PRDT_COMISSAO_GER,
    P.PRDT_P_LIQUIDO,
    P.PRDT_P_BRUTO,
    P.PRDT_ID_CTG,
    P.PRDT_COD_BARRA,
    P.PRDT_MARCA,
    P.PRDT_ALTURA,
    P.PRDT_LARGURA,
    P.PRDT_DESC_MAX,
    TO_CHAR(P.DT_INCLU,'DD-MM-YYYY  HH24:MI:SS') AS DT_INCLU,
    TO_CHAR(P.DT_ALTER,'DD-MM-YYYY  HH24:MI:SS') AS DT_ALTER,
    P.USU_ALTER || ' - ' || U.USU_NOME AS ID_USU_ALT ,
    P.USU_INCLU || ' - ' || US.USU_NOME AS ID_USU_INCLU ,
    M.NOME AS MARCA_NOME,
    G.CTG_DESCRICAO,
    P.PRDT_STATUS,
    N.NCM_DESC
    FROM PRDT_PRODUTO P
    LEFT JOIN MARCA M ON M.ID_MARCA = P.PRDT_MARCA 
    LEFT JOIN CTG_PRODUTO G ON G.ID_CATEGORIA = P.PRDT_ID_CTG 
    LEFT JOIN USU_USUARIO U ON U.ID_USU = P.USU_ALTER 
    LEFT JOIN USU_USUARIO US ON US.ID_USU = P.USU_INCLU
    LEFT JOIN NCM N ON N.COD_NCM_ = P.PRDT_NCM 
    WHERE PRDT_ID = :ID`;
    let binds = { ID: ID };
    let result = await conectarbd(sql, binds, options_objeto);
    res.render('./cadastro/visualizaproduto', { P_USU, result });
  } catch (error) {
    res.status(500).send(error)
  }
})
//Cadastro de grupos
app.get('/grupo', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(119, token);
    let P_USU = await permi_usu(119, token);
    res.render('./cadastro/grupo', { P_USU });
  } catch (error) {
    res.status(500).send(error)
  }

})
//Cadastro de ncm
app.get('/ncm', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(162, token);
    let P_USU = await permi_usu(162, token);
    res.render('./cadastro/ncm', { P_USU });
  } catch (error) {
    res.status(500).send(error)
  }

})
//Visulaiza d ncm
app.get('/VisualizaNcm/:cod_ncm', auth, async (req, res) => {
  let ncm = req.params.cod_ncm;
  let sql = `SELECT NCM_DESC,COD_NCM_ AS COD,
             TO_CHAR(N.DT_ALTER,'DD/MM/YYYY HH24:MM:SS') AS DT_ALTER,
             TO_CHAR(N.DT_INCLU,'DD/MM/YYYY HH24:MM:SS') AS DT_INCLU ,
             US.USU_NOME AS USU_ALTER,
             U.USU_NOME AS USU_INCLU
             FROM NCM N
             LEFT JOIN USU_USUARIO U ON U.ID_USU = N.ID_USU_INCLU
             LEFT JOIN USU_USUARIO US ON US.ID_USU = N.COD_USU_ALTER	
              WHERE N.COD_NCM_ = :COD_NCM`;
  let binds = { COD_NCM: ncm };
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(162, token);
    let P_USU = await permi_usu(162, token);
    let result = await conectarbd(sql, binds, options_objeto);
    res.render('./cadastro/VisualizaNcm', { P_USU, result });
  } catch (error) {
    res.status(500).send(error)
  }

})
//acessos
app.get('/acessos', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = valida_acesso(2, token)
    let P_USU = await permi_usu(2, token);
    if (Acesso == 'N') return res.status(505).send('Usuário não tem permissão')
    res.render('./acesso/acesso', { P_USU });
  } catch (error) {
    res.status(500).send(error)
  }
})
app.get('/visualizaparceiro/:id', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  let ID = req.params.id;
  let sql = `SELECT PR.*,U.USU_NOME AS USU_ALTER_NOME,T.USU_NOME  AS USU_INCLU_NOME,TO_CHAR(PR.DT_INCLU,'DD/MM/YYYY HH24:MI:SS') AS DATA_INCLU,
  TO_CHAR(PR.DT_ALTER,'DD/MM/YYYY HH24:MI:SS') AS DATA_ALTER,
  TO_CHAR(TO_CHAR(PR.PARC_NASC,'yyyy-MM-dd')) AS PARCNASC,
  TO_CHAR(TO_CHAR(PR.PARC_ADMISSAO,'yyyy-MM-dd')) AS PARCADMISSAO,
  PARC_CGC_ AS PARC_CGC
              FROM PRC_PARCEIRO PR 
              LEFT JOIN USU_USUARIO U ON U.ID_USU = PR.USU_ALTER 
              LEFT JOIN USU_USUARIO T ON T.ID_USU = PR.USU_INCLU
              WHERE PR.ID_PARC = :ID   `;
  let binds = { ID: ID };
  try {
    let Acesso = valida_acesso(201, token);
    let P_USU = await permi_usu(201, token);
    let result = await conectarbd(sql, binds, options_objeto);
    if (Acesso == 'N') return res.status(505).send('Usuário não tem permissão')
    res.render('./parceiro/visualizaparceiro', { P_USU, result });
  } catch (error) {
    res.status(500).send(error)
  }


})

//Copia permissões
app.post('/copia_usuario', async (req, res) => {
  let token = req.cookies.jwt;
  jwt.verify(token, process.env.SECRET, async (error, data) => {
    if (error) { return res.status(500).send('Token inválido!') }
    else {
      let ID_F = req.body.ID_FORNECE;
      let ID_R = req.body.ID_RECEBE;
      let sql = `BEGIN COPIA_CONFIG_USU(:ID_R,:ID_F,:P_USU_LOGADO,:P_RESULTADO); END; `;
      let binds = {
        ID_F: ID_F,
        ID_R: ID_R,
        P_USU_LOGADO: data.ID_USUARIO,
        P_RESULTADO: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      };

      try {
        let result = await conectar(sql, binds)
        res.status(200).send(result.outBinds.P_RESULTADO);
      } catch (error) {
        let log = error;
        criarlogtxt(log, req.url);
        res.status(500).send('Ocorreu um erro! ' + error);
      }
    }

  })

})
//CONSULTA PERMISSOES DE TODAS AS TELAS
app.post('/consulta_acessos', auth,async (req, res) => {
  let ID = req.body.ID;
  let TABELA = req.body.TABELA
  //valida se o usuario selecionou o select
  if (TABELA == '') {
    res.status(500).send('Especifique o filtro,selecione por usuário ou grupo!')
  } else {
    let sql;
    if (TABELA == 'USU_USUARIO') {
      sql = `SELECT T.ID_TELA,T.T_NOME,CFU_ALTERA,CFU_INCLUI,CFU_DELETA,CFU_CONSULTA
   FROM
   CONFIG_USU_TELA U
   INNER JOIN T_TELA T ON T.ID_TELA = U.ID_TELA
    WHERE ID_USU = :ID`
    }
    if (TABELA == 'GRP_GRUPO') {
      sql = `SELECT T.ID_TELA,T.T_NOME,GRUP_ALTERA,GRUP_INCLUI,GRUP_DELETA,GRUP_CONSULTA
   FROM
   CONFIG_GRUPO_TELA U
   INNER JOIN T_TELA T ON T.ID_TELA = U.ID_TELA
   INNER JOIN GRP_GRUPO G ON G.ID_GRUPO = U.ID_GRUPO
    WHERE U.ID_GRUPO = :ID`
    }

    let binds = {
      ID: ID
    }
    try {
      let result = await conectarbd(sql, binds, options)
      result.length === 0 ? res.status(505).send('Usuário ou grupo não encontrado!') : res.send(result)

    } catch (error) {
      let log = error;
      criarlogtxt(log, req.url);
      res.status(500).send('Ocorreu um erro! ' + error);
    }
  }
})
app.post('/importar/dados', async (req, res) => {
  let CGC = req.body.CGC
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${CGC}`);
    const data = response.data;

    //Caso não exista uma cidade cadastrada  será inserido automaticamente pelo sistema
    if (data.municipio !== undefined) {
      let sql = `BEGIN
      DECLARE
      V_COUNT INT(5);
      BEGIN
          SELECT COUNT(*) INTO V_COUNT FROM CIDADE WHERE NOME = UPPER(:NOME);
          IF V_COUNT = 0 THEN
          INSERT INTO CIDADE(NOME, DT_INCLUSAO, DT_ALTERACAO) VALUES (:NOME, SYSDATE, SYSDATE);
          COMMIT;
       END IF; 
      END;
     END;`
      let binds = { NOME: data.municipio };
      conectar(sql, binds)
    }
    res.status(200).json(data);
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    let erro = error
    let status = erro.response.status;
    if (status == 429) {
      res.status(429).json('Erro ao obter os dados,so e permitido 3 solicitações por CNPJ a cada 60s');
    } else {
      res.status(500).json('Erro ao obter os dados,CNPJ deve ter 14 digitos');

    }

  }

})
//Rota universal para requisições mais simples,apneas para insert,delete ou update dentro de blocos begin
app.post('/rota/universal', async (req, res) => {
  let Objeto = req.body;
  let token = req.cookies.jwt;
  let novobinds;
  jwt.verify(token, process.env.SECRET, async (error, data) => {
    if (error) { return res.status(500).send('Token inválido!') }
    if (Objeto.USU_LOGADO) {
      let USU_LOGADO = data.ID_USUARIO;
      novobinds = { ...Objeto.binds, USU_LOGADO }
      try {
        await conectar(Objeto.sql, novobinds);
        res.status(200).send(Objeto.mensagem_sucess);
      } catch (error) {
        res.status(500).send('*' + error)
      }
    } else {
     
      try {
        await conectar(Objeto.sql, Objeto.binds);
        res.status(200).send(Objeto.mensagem_sucess);
      } catch (error) {
        let log = error;
        criarlogtxt(log, req.url);
        res.status(500).send(Objeto.mensagem_error + error);
      }
    }

  })

})
//Rota universal para consultas de campos que retornal apenas um valor ou array de array
app.post('/select/universal',auth, async (req, res) => {
  let Binds = req.body.binds;
  jwt.verify(req.cookies.jwt, process.env.SECRET, async (error, data) => {
    if (req.body.USU_LOGADO) {
    let USU_LOGADO = data.ID_USUARIO;
      Binds.USU_LOGADO = USU_LOGADO;
    }
    try {
      let result = await conectar(req.body.sql, Binds);
      res.status(200).send(result.rows[0][0]);
    } catch (error) {
      res.status(500).send('Ocorreu um erro! ' + error);
    }

  });
});
app.post('/select/universal/objeto',auth, async (req, res) => {
  let Binds = req.body.binds;
  console.log(req.body)
  jwt.verify(req.cookies.jwt, process.env.SECRET, async (error, data) => {
    if (req.body.USU_LOGADO) {
    let USU_LOGADO = data.ID_USUARIO;
      Binds.USU_LOGADO = USU_LOGADO;
    }
    try {
      let result = await conectarbd(req.body.sql, Binds,options_objeto);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send('Ocorreu um erro! ' + error);
    }

  });
});
app.post('/select/universal/array',auth, async (req, res) => {
  let Binds = req.body.binds;
  jwt.verify(req.cookies.jwt, process.env.SECRET, async (error, data) => {
    if (req.body.USU_LOGADO) {
    let USU_LOGADO = data.ID_USUARIO;
      Binds.USU_LOGADO = USU_LOGADO;
    }
    try {
      let result = await conectarbd(req.body.sql, Binds,options);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send('Ocorreu um erro! ' + error);
    }

  });
});
app.post('/procedure_com_saida',auth, async (req, res) => {
  let Binds = req.body.binds;
  jwt.verify(req.cookies.jwt, process.env.SECRET, async (error, data) => {
    if (req.body.USU_LOGADO) {
    let USU_LOGADO = data.ID_USUARIO;
      Binds.USU_LOGADO = USU_LOGADO;
    }
    try {
      Binds.P_RESULTADO =  { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      let result = await conectar(req.body.sql, Binds);
      res.status(200).send(result.outBinds.P_RESULTADO);
    } catch (error) {
      res.status(500).send('Ocorreu um erro! ' + error);
      console.log('error '+ error)
    }

  });
});

app.get('/dowload/img/ploads_tarefa/:src', upload.single('file'), (req, res) => {
  let src = req.params.src
  res.download(__dirname + '/public/img/uploads_tarefas/' + src)

})
//Api via cep
app.post('/api/via/cep', async (req, res) => {
  try {
    let response = await axios(`https://viacep.com.br/ws/${req.body.CEP}/json/`);
    let data = response.data;
    if (!data.erro) {
      conectarbd(`BEGIN API_CEP(:CEP,:CIDADE,:IBGE,:UF,:BAIRRO,:COMPLEMENTO); END;`, { CEP: data.cep, CIDADE: data.localidade, IBGE: data.ibge, UF: data.uf, BAIRRO: data.bairro, COMPLEMENTO: data.complemento }, options_objeto);
      res.json({ 'status': 'ok' })
    } else {
      res.status(500).send('CEP não é valido ou não existe!');
    }
  } catch (error) {
    res.status(500).send('CEP não é valido ou não existe! Error');
  }
})
//Atualiza ncm
app.post('/Api/atualiza/ncm', async (req, res) => {
  console.log('------ Inicio da rota para atualizar Ncm ------');
  // URL do arquivo JSON
  const url = 'https://val.portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json';
  try {
    const response = await axios.get(url);
    const jsonData = JSON.stringify(response.data);
    const result = await conectar(
      `DECLARE
        l_json CLOB := :dados;
      BEGIN
        processar_json_complexo(l_json);
      END;`,
      {
        dados: { val: jsonData, type: oracledb.CLOB } 
      }
    );
    console.log('------ Fim da rota para atualizar Ncm ------');
    res.send('Ncms atualizados com sucesso.');

  } catch (error) {
    console.error('Erro no JSON:', error.message);
    res.status(500).send('Erro ao atualizar NCM');
  }
});
//Atualizar cidades
app.get('/Atualiza/cidades',async(req,res)=>{
  console.log('------ Inicio da rota para atualizar Cidades ------');

const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';
try {
    let response = await axios.get(url);
    let JsonData = JSON.stringify(response.data);
    const result = await conectar(
      `DECLARE
        l_json CLOB := :dados;
      BEGIN
        processar_json_cidades(l_json);
      END;`,
      {
        dados: { val: JsonData, type: oracledb.CLOB } 
      }
    );
    console.log('------ Fim da rota para atualizar cidades ------');

    res.send('Cidades inseridas com sucesso');
} catch (error) {
  console.log('Erro ao atualizar cidades.' + error);
  res.send('Erro ao atualizar cidades.');
}
})



server.listen(80, (err) => {
  if (err) {
    console.log("Erro ao iniciar servidor" + err);
  } else {
    console.log("Servidor rodando na porta 80");
  }
});