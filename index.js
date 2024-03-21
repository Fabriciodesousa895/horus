const express = require("express");
const app = express();
const axios = require('axios');
const EventEmitter = require('node:events');

// const eventEmitter = new EventEmitter();
// eventEmitter.on('start', () => {
//   console.log('started');
// });
// eventEmitter.emit('start');

require('dotenv').config()
'use strict';
//view engine
app.set("view engine", "ejs");
//static public
app.use(express.static("public"));
//body-parser
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ limit: '100mb' }));
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
const upload = multer({ storage: storage })

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



//configurando cors
const cors = require('cors');
let urlencodedParser = bodyparser.urlencoded({ extended: false });
app.use(cors());
//a verificação da licença será feita a cada 60 minutos pelo servidor
const fs = require('fs');
let V_truefalse = false;
function toggleValue() {
  setInterval(() => {
    V_truefalse = !V_truefalse;
  }, 80000);
}
toggleValue();
setInterval(() => { console.log(V_truefalse); }, 50000)
//no middleware é preciso validar a licença da aplicação que está rodando,na raiz da aplicação existe um arquivo.json que informaos dados da licença
app.use(async (req, res, next) => {
  // console.log(response.data)
  console.log('Entre cliente e servidor!');
  let url = req.path;
  if (V_truefalse) {
    try {
      fs.readFile('licenca.json', 'utf-8', async (err, data) => {
        if (err) {
          res.json('Houve um erro ao ler o certificado da aplicação, por favor contactar setor de TI');
          console.log(err);
          return;
        } else {
          // faz uma requisição get para o gerenciador de licença passando o json com os dados
          const response = await axios.get(`http://localhost:8030/licenca/${data}`);
          let response_data = response.data;
          // validando o resultado da requisição
          if (response_data[0].status === 200) {
            // aplicação segue o curso,pois certificado está tubo certo
            next();
            return;
          } else {
            //quando o status for <> de 200,o usuário será redirecionado para uma rota get passando a url e a mensagem para a rota
            // res.redirect(`/certificado/validacao/${url}/${response_data[1].menssage}`);
            // res.redirect(`/certificado/validacao}`);
            // console.log(url + '<br>' + response_data[1].menssage);
            res.json(response_data[1].menssage)

          }
        }
      });
    } catch (error) {
      let log = error;
      criarlogtxt(log, req.url);
      console.log('Erro ao se comunicar com o gerenciador de licenças: ', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    next();
  }
});


app.get('/certificado/validacao', (req, res) => {
  let url = req.params.url;
  let menssage = req.params.menssage;
  res.render('certificado', { url, menssage });
  console.log(url + '<br>' + menssage);
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
      console.log('Usuário inativo por 5 minuto.');
      try {
          let sql = `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE,KILL = 'S' WHERE TOKEN = :TOKEN; COMMIT; END;`;
          let binds = {TOKEN:token};
          conectar(sql, binds);
             } catch (error) {
          let log = error;
          console.log(error);
      }
  },  TempoSessao);
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
      console.log(KILL);
      if (KILL == 'S') {

        res.redirect('/login');
        console.log('Sessão encerrada');

      }
      next()
      return;
    } catch (error) {
      console.log(error);
    }



  if (!token) {
    console.log('error');

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



//login
app.get('/login', (req, res) => {
  res.render('./usuario/login')
})

app.post('/login', async (req, res) => {
  let USU_SENHA = req.body.USU_SENHA;
  let USU_NOME = req.body.USU_NOME;
  let sql = `SELECT USU_SENHA, ID_USU FROM USU_USUARIO WHERE USU_NOME = :USU_NOME AND USU_STATUS = 'S'`;
  let binds = { USU_NOME: USU_NOME }
  let result = await conectarbd(sql, binds, options);
  //Verifica se há um token,caso haja é finalizado a sessão
  let TOKEN = req.cookies.jwt;
  if (TOKEN) {
    res.clearCookie("jwt");
    let sql2 = `BEGIN UPDATE LOG_LOGIN SET DT_SAIDA = SYSDATE WHERE TOKEN = :TOKEN; COMMIT; END;`;
    let binds2 = { TOKEN: TOKEN }
    conectar(sql2, binds2)
  }
  // Verifica se o resultado está vazio (nenhum usuário encontrado)
  if (result.length === 0) {
    return res.status(404).send('Usuário não encontrado ou está inativo');
  }

  let senha_salva = result[0][0];
  let ID_USU = result[0][1];

  // Valida a senha
  try {
    const match = await bycrypt.compare(USU_SENHA, senha_salva);
    if (match) {
      // Gera o token da sessão
      let ID_USUARIO = ID_USU;
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
          conectar(sql, binds);
        } catch (error) {
          console.log(error)
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
          CASE
          WHEN  AN.CFU_ANEXA = 'S' OR AG.GRP_ANEXA = 'S' OR U.USU_ADM = 'S' THEN 'S'
          ELSE 'N'
          END AS ANEXA,
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
      (
      SELECT CFU_ANEXA
      FROM CONFIG_USU_TELA
      WHERE ID_USU = :P_ID_USU
      AND ID_TELA = :P_ID_TELA
  ) AN,     
   (
    SELECT T.GRP_ANEXA 
    FROM CONFIG_GRUPO_TELA T 
    INNER JOIN USU_USUARIO U ON U.ID_GRUPO = T.ID_GRUPO
    WHERE ID_USU  = :P_ID_USU
    AND ID_TELA = :P_ID_TELA
) AG,
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
        try {
          let result = await conectarbd(sql, binds, options_objeto);
          let result3 = await conectar(sql3, binds3, options);
          let result4 = await conectar(sql4, binds4, options);
          let result5 = await conectar(sql5, binds5, options);
          let Objeto = {
            P_USU: result,
            T_NOME: result3.rows[0],
            T_FILTRO: result5.rows
          }
          resolve(Objeto);
          console.log(Objeto)
        } catch (error) {
          let log = error;
          console.log
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
      console.log('Token inválido');
      return;
    } else {
      let USU_LOGADO = data.ID_USUARIO;
      try {


        let Acesso = await valida_acesso(101, token);

        let P_USU = await permi_usu(101, token);

        res.render('index', { P_USU, })
      } catch (error) {
        let log = error;
        console.error('Erro:', error);
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
app.get('/monitordesessao',auth,async(req,res)=>{
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

app.get('/usuario', auth, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(1, token);
    let P_USU = await permi_usu(1, token);

    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/usuario', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
    console.log(error)
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
    res.send(error);
  }
});
//Rota pára gráfico de usuario
app.get('/visualiza/dicionario/dados/:ID', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {

    let Acesso = await valida_acesso(118, token);
    let P_USU = await permi_usu(118, token);
    let sql = `SELECT  COLUMN_NAME, CONSTRAINT_NAME,POSITION,TABLE_NAME
    FROM ALL_CONS_COLUMNS TT,TABELA_BANCO TB
    WHERE TT.TABLE_NAME = (SELECT TAB_NOME FROM TABELA_BANCO WHERE ID_TABELA = ${req.params.ID})
    AND TT.TABLE_NAME = TB.TAB_NOME
    `
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
    const result = await conectar(sql, []);
    const result2 = await conectar(sql2, []);
    const result3 = await conectar(sql3, []);
    const result4 = await conectar(sql4, []);
    const result5 = await conectar(sql5, []);
    let CONSTRAINT = result.rows
    let CAMPOS = result2.rows
    let INDEXES = result3.rows
    let TABELA_NOME = result4.rows
    let TRIGGRES = result5.rows
    Objeto = { CAMPOS, CONSTRAINT, INDEXES, TABELA_NOME, TRIGGRES }
    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./Admin/visualizadicionariodedados', { P_USU, Objeto })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
  }
})

app.get('/dash_usuario', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(121, token);
    let P_USU = await permi_usu(121, token);

    Acesso === 'N' ? res.send('Usuário não tem permissão') : res.render('./usuario/dash_usuario', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
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
    res.send(error);
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
    res.send(error);
  }
})
app.get('/comunicado/usuarios', auth, urlencodedParser, async (req, res) => {
  let token = req.cookies.jwt;
  try {
    let Acesso = await valida_acesso(224, token);
    let P_USU = await permi_usu(224, token);

    Acesso === 'N' ? res.send('Usuário nao tem,permissão!') : res.render('./Admin/comunicado', { P_USU })
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.send(error);
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
    res.send('Error:' + error)
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
  }


})
//faz a conSulta sql que o usuario digitou 
app.post('/sql/DBE_explorer', auth, urlencodedParser, async (req, res) => {

  try {
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
    res.send(objeto)
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

app.post('/dash_usuario', urlencodedParser, async (req, res) => {
  let ID_TELA = req.body.ID_TELA
  let sql = `SELECT * FROM (SELECT  TL.T_NOME,COUNT(*) AS CONSULTA
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  WHERE CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S')
    AND TL.TIPO <> 'V'
    AND TL.ID_TELA = :ID_TELA
GROUP BY  TL.T_NOME) CONSULTA,   
(SELECT COUNT(*) AS ALTERA
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  AND TL.TIPO <> 'V'
  WHERE CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_ALTERA = 'S' OR CG.GRUP_ALTERA = 'S' OR U.USU_ADM = 'S')
    AND TL.ID_TELA = :ID_TELA
  AND TL.TIPO <> 'V'
    AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S'  OR U.USU_ADM = 'S')) ALTERA,   
(SELECT  COUNT(*) AS DELETA
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  WHERE CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_DELETA = 'S' OR CG.GRUP_DELETA = 'S' OR U.USU_ADM = 'S')
    AND TL.ID_TELA = :ID_TELA
  AND TL.TIPO <> 'V'
    AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S')) DELETA,
    (SELECT COUNT(*) AS INCLUI
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  WHERE CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_INCLUI = 'S' OR CG.GRUP_INCLUI = 'S' OR U.USU_ADM = 'S')
    AND TL.ID_TELA = :ID_TELA 
  AND TL.TIPO <> 'V'
    AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S' )) INCLUI,
(   SELECT  COUNT(*) AS ANEXA
  FROM USU_USUARIO U
  LEFT JOIN CONFIG_USU_TELA CU ON CU.ID_USU = U.ID_USU
  LEFT JOIN T_TELA TL ON TL.ID_TELA = CU.ID_TELA
  LEFT JOIN CONFIG_GRUPO_TELA CG ON CG.ID_GRUPO = U.ID_GRUPO
  WHERE CG.ID_TELA = TL.ID_TELA
    AND (CU.CFU_ANEXA = 'S' OR CG.GRP_ANEXA = 'S' OR U.USU_ADM = 'S')
    AND TL.ID_TELA = :ID_TELA
  AND TL.TIPO <> 'V'
AND (CU.CFU_CONSULTA = 'S' OR CG.GRUP_CONSULTA = 'S' OR U.USU_ADM = 'S' )) ANEXA `;
  let binds = { ID_TELA: ID_TELA }
  try {

    let result = await conectar(sql, binds)

    result.rows[0] == undefined ? res.status(500).send('Registro não encontrado!') : res.send(result.rows[0]);

  } catch (error) {
    res.send(error);
    let log = error
    try {
      fs.appendFile('logdeerros.txt', `${log}`, { encoding: 'utf8' });
      console.log('Arquivo editado com sucesso.');
    } catch (err) {
      let log = error;
      criarlogtxt(log, req.url);
      console.error('Erro ao escrever no arquivo:', err);
    }
    console.log(error);
  }
})
//Salvando novo usuário
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
LEFT JOIN USU_USUARIO US ON US.ID_USU = U.ID_USU_INCLUSAO
LEFT JOIN USU_USUARIO USU ON USU.ID_USU = U.COD_USU_ALTER
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
    res.redirect(`/erroservidor/${error}`);
  }
})
//Lançador de tarefa
app.get('/lancador/tarefa', auth, async (req, res) => {
  let token = req.cookies.jwt;
  let Acesso = await valida_acesso(241, token);
  let P_USU = await permi_usu(241, token);
  res.render('./Admin/lancadortarefa', { P_USU });

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
        res.send(result[0][0])
      } catch (error) {
        let log = error;
        criarlogtxt(log, req.url);
        res.redirect(`/erroservidor/${error}`);
      }

    }
  })
})
//copia usuario campo para colocar usuario
app.post('/input_usu', async (req, res) => {
  let ID_USU = req.body.ID_USU;

  let sql = `SELECT USU_NOME FROM USU_USUARIO WHERE ID_USU = :ID_USU `;
  let binds = { ID_USU: ID_USU }

  try {
    let result = await conectarbd(sql, binds, options)
    result.length === 0 ? res.status(505).send('Usuário não encontrado!') : res.send(result[0][0])
  } catch (error) {
    let log = error;
    criarlogtxt(log, req.url);
    res.redirect(`/erroservidor/${error}`);
  }
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
    console.log(binds)

    try {
      let result = await conectar(sql, binds);
      res.send(result.outBinds.P_MENSAGEM)
    } catch (error) {
      let log = error;
      criarlogtxt(log, req.url);
      res.send('Erro : ' + error);
    }
  })
})
app.post('/delete_usu', urlencodedParser, async (req, res) => {
  let ID_USU = req.body.ID_USU;
  let sql = `BEGIN DELETA_USUARIO(:ID_USU,:P_MENSAGEM); END;`;
  let binds = { ID_USU: ID_USU, P_MENSAGEM: { dir: oracledb.BIND_OUT, type: oracledb.STRING } }
  let result = await conectar(sql, binds)
  res.send(result.outBinds.P_MENSAGEM)
})
//faz update nas configuraçõesde tela dos usuarios
app.post('/usuario_acesso', urlencodedParser, async (req, res) => {
  let objeto = req.body
  let token = req.cookies.jwt;

  jwt.verify(token, process.env.SECRET, async (err, data) => {
    if (err) { res.send('Token invãlido') } else {
      let sql;
      //verifica se o usuario está alterando um usuario
      if (objeto.TABELA == 'USU_USUARIO') {
        sql = `BEGIN
         UPDATE CONFIG_USU_TELA SET ${objeto.POSICAO} = :VALOR WHERE ID_TELA = :ID_TELA AND ID_USU = :ID;
         COMMIT;
         END;`
      }
      //verifica se o usuario está alterando um grupo
      if (objeto.TABELA == 'GRP_GRUPO') {
        sql = `BEGIN
        UPDATE CONFIG_GRUPO_TELA SET ${objeto.POSICAO} = :VALOR WHERE ID_TELA = :ID_TELA AND ID_GRUPO = :ID;
        COMMIT;
        END;`
      }
      let binds = {
        VALOR: objeto.VALOR,
        ID_TELA: objeto.ID_TELA,
        ID: objeto.ID
      }
      let result = await conectar(sql, binds)
      res.send(result);
    }

  })
})
//Cadastro de vendedor
app.get('/vendedores', auth, async (req, res) => {

  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(161, token);
    let P_USU = await permi_usu(161, token);
    res.render('./cadastro/vendedor', { P_USU });
  } catch (error) {
    res.redirect('/login')
    
  }
})
//Cadastro de produtos
app.get('/produtos', auth, async (req, res) => {
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(281, token);
    let P_USU = await permi_usu(281, token);
  
    res.render('./cadastro/produto', { P_USU })
  } catch (error) {
    console.log('error')
    res.redirect('/login')
  }
 

})
//Visualizar de produtos
app.get('/visualizaproduto/:ID', auth, async (req, res) => {

  try {
    let ID = req.params.ID;
    console.log(ID)
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(281, token);
    let P_USU = await permi_usu(281, token);
    let sql = `SELECT PRDT_NOME,
    PRDT_DESCRICAO,
    PRDT_CARACT,
    PRDT_USADO_COMO,
    PRDT_CAL_COMISSAO,
    PRDT_NCM,
    PRDT_EST_MIN,
    PRDT_EST_MAX,
    PRDT_NR_PECA,
    PRDT_MARGEM_LUCRO,
    PRDT_COMISSAO_VND,
    PRDT_COMISSAO_GER,
    PRDT_P_LIQUIDO,
    PRDT_P_BRUTO,
    PRDT_ID_CTG,
    PRDT_COD_BARRA,
    PRDT_MARCA,
    PRDT_ALTURA,
    PRDT_LARGURA,
    PRDT_DESC_MAX,
    TO_CHAR(DT_INCLU,'YYYY-MM-DD') AS DT_INCLU,
    TO_CHAR(DT_ALTER,'YYYY-MM-DD') AS DT_ALTER,
    ID_USU_ALTER,
    ID_USU_INCLUSAO FROM PRDT_PRODUTO WHERE PRDT_ID = :ID`;
    let binds = { ID: ID };
    let result = await conectarbd(sql, binds, options_objeto);
    res.render('./cadastro/visualizaproduto', { P_USU, result });

    console.log(result)
  } catch (error) {
    console.log(error)
    res.redirect('/login')
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
    res.redirect('/login')
    
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
    res.redirect('/login')
    
  }
})
//Visulaiza d ncm
app.get('/VisualizaNcm/:cod_ncm', auth, async (req, res) => {
  let ncm = req.params.cod_ncm;
  let sql = `SELECT NCM_DESC,COD_NCM_ AS COD,
             TO_CHAR(N.DT_ALTER,'DD/MM/YYYY HH24:MM:SS') AS DT_ALTER,
             TO_CHAR(N.DT_INCLU,'DD/MM/YYYY HH24:MM:SS') AS DT_INCLU ,
             US.USU_NOME AS USU_ALTER,
             U.USU_NOME AS USU_INCLUSAO
             FROM NCM N
             LEFT JOIN USU_USUARIO U ON U.ID_USU = N.ID_USU_INCLUSAO	
             LEFT JOIN USU_USUARIO US ON US.ID_USU = N.COD_USU_ALTER	
              WHERE N.COD_NCM_ = :COD_NCM`;
  let binds = { COD_NCM: ncm };
  try {
    let token = req.cookies.jwt;
    let Acesso = await valida_acesso(162, token);
    let P_USU = await permi_usu(162, token);
    let result = await conectarbd(sql, binds, options_objeto);
    console.log(result)
    res.render('./cadastro/VisualizaNcm', { P_USU, result });
  } catch (error) {
    console.log(error)
  }

})
//acessos
app.get('/acessos', urlencodedParser, auth, async (req, res) => {
  let token = req.cookies.jwt;
  let Acesso = valida_acesso(2, token)
  let P_USU = await permi_usu(2, token);
  if (Acesso == 'N') return res.status(505).send('Usuário não tem permissão')
  res.render('./acesso/acesso', { P_USU });

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
              LEFT JOIN USU_USUARIO T ON T.ID_USU = PR.USU_INCLUSAO 
              WHERE PR.ID_PARC = :ID   `;
  let binds = { ID: ID };
  try {
    let Acesso = valida_acesso(201, token);
    let P_USU = await permi_usu(201, token);
    let result = await conectarbd(sql, binds, options_objeto);
    if (Acesso == 'N') return res.status(505).send('Usuário não tem permissão')
    res.render('./parceiro/visualizaparceiro', { P_USU, result });
    console.log(result)
  } catch (error) {
    console.log(error)
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
        res.status(200).send(result.outBinds.P_RESULTADO)
      } catch (error) {
        let log = error;
        criarlogtxt(log, req.url);
        res.send('Erro no lado do servidor ' + error)
      }
    }

  })

})
//CONSULTA PERMISSOES DE TODAS AS TELAS
app.post('/consulta_acessos', async (req, res) => {
  let ID = req.body.ID;
  let TABELA = req.body.TABELA
  //valida se o usuario selecionou o select
  if (TABELA == '') {
    res.status(500).send('Especifique o filtro,selecione por usuário ou grupo!')
  } else {
    let sql;
    if (TABELA == 'USU_USUARIO') {
      sql = `SELECT T.ID_TELA,T.T_NOME,CFU_ALTERA,CFU_INCLUI,CFU_DELETA,CFU_CONSULTA,CFU_ANEXA
   FROM
   CONFIG_USU_TELA U
   INNER JOIN T_TELA T ON T.ID_TELA = U.ID_TELA
    WHERE ID_USU = :ID
    AND T.TIPO <> 'F'`
    }
    if (TABELA == 'GRP_GRUPO') {
      sql = `SELECT T.ID_TELA,T.T_NOME,GRUP_ALTERA,GRUP_INCLUI,GRUP_DELETA,GRUP_CONSULTA,GRP_ANEXA
   FROM
   CONFIG_GRUPO_TELA U
   INNER JOIN T_TELA T ON T.ID_TELA = U.ID_TELA
   INNER JOIN GRP_GRUPO G ON G.ID_GRUPO = U.ID_GRUPO
    WHERE U.ID_GRUPO = :ID
    AND T.TIPO <> 'F'`
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
      res.send('Erro no lado do servidor ' + error);
    }
  }
})
app.post('/importar/dados', async (req, res) => {
  let CGC = req.body.CGC
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${CGC}`);
    const data = response.data;

    console.log(data.municipio)
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
app.post('/rota/universal', auth, urlencodedParser, async (req, res) => {
  let Objeto = req.body;
  let token = req.cookies.jwt;
  let novobinds;
  jwt.verify(token, process.env.SECRET, async (error, data) => {
    if (error) { return res.status(500).send('Token inválido!') }
    if (Objeto.USU_LOGADO) {
      let USU_LOGADO = data.ID_USUARIO;
      novobinds = { ...Objeto.binds, USU_LOGADO }
      try {
        let result = await conectar(Objeto.sql, novobinds);
        res.status(200).send(Objeto.mensagem_sucess);
      } catch (error) {
        res.status(500).send(Objeto.mensagem_error + error)
      }
      console.log(Objeto)
    } else {
      try {
        let result = await conectar(Objeto.sql, Objeto.binds);
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
app.post('/select/universal', urlencodedParser, async (req, res) => {
  // req.on('information',(info)=>{
  // console.log(info,'-----')
  // })
  let Objeto = req.body;
  let novobinds;
  let token = req.cookies.jwt;
  jwt.verify(token, process.env.SECRET, async (error, data) => {
    if (error) {
      res.status(500).send('Token inválido,faça login e tente novamente!')
    } else {
      let USU_LOGADO = data.ID_USUARIO;

      if (Objeto.USU_LOGADO) {

        //CASO USU_LOGADO SEJA true,fazendo o sql com base no usuário logado
        novobinds = { ...Objeto.binds, USU_LOGADO }
        try {
          let result = await conectarbd(Objeto.sql, novobinds, options);
          //validando se o resultado é pra retornar em array de array
          if (Objeto.rows) {
            let result = await conectar(Objeto.sql, novobinds);
            result.length === 0 ? res.status(505).send(Objeto.mensage_error) : res.status(200).send(result.rows)

          } else {
            result.length === 0 ? res.status(505).send(Objeto.mensage_error) : res.status(200).send(result[0][0])

          }
        } catch (error) {
          res.send('Ocorreu um erro! ' + error);
          console.log(error);
        }
      } else

        try {
          let result = await conectarbd(Objeto.sql, Objeto.binds, options);
          if (Objeto.rows) {
            let result = await conectar(Objeto.sql, Objeto.binds);
            result.length === 0 ? res.status(505).send(Objeto.mensage_error) : res.status(200).send(result.rows)
          } else {
            result.length === 0 ? res.status(505).send(Objeto.mensage_error) : res.status(200).send(result[0][0])
          }
        } catch (error) {
          let log = error;
          criarlogtxt(log, req.url);
          res.send('Ocorreu um erro no lado do servidor! --' + error);
          console.log(error);
        }
    }
  })
})


app.get('/dowload/img/ploads_tarefa/:src', upload.single('file'), (req, res) => {
  let src = req.params.src
  res.download(__dirname + '/public/img/uploads_tarefas/' + src)

})


app.listen(80, (err) => {
  if (err) {
    console.log("Erro ao iniciar servidor" + err);
  } else {
    console.log("Servidor rodando, https:localhost:80/login ou no link   https://marlin-quality-nicely.ngrok-free.app/login");
  }
});

