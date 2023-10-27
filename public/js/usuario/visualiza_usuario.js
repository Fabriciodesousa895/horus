//quando o usuário clicar em uma linha da tabela irá redirecionar para outra pagina passando o ID_USU como parametro;
  tabelausuario.addEventListener('dblclick',(e)=>{
    let elementoclicado = e.target;
    let elementopai = elementoclicado.parentNode
    let conteudocelula = elementopai.cells[0]
    let ID_USU =  conteudocelula.textContent
    
    location.href = `/visualiza_usuario/${ID_USU}`

  })







