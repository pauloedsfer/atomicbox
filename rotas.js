/* Decisão pura de rota: qual tela mostrar para um hash. Separada do app.js para ter teste em Node. */
const ROTAS = { "#inicio": "tela-inicio", "#materia": "tela-materia", "#modelos": "tela-modelos", "#atomo": "tela-atomo", "#distribuicao": "tela-distribuicao", "#vidrarias": "tela-vidrarias", "#treino": "tela-treino", "#progresso": "tela-progresso", "#sobre": "tela-sobre" };
const HASH_DE = Object.fromEntries(Object.entries(ROTAS).map(([h, t]) => [t, h]));
const TELAS = Object.values(ROTAS);
const TELA_PADRAO = "tela-inicio";

// Na carga, hash desconhecido cai no início. Depois da carga (hashchange), hash que não é rota
// (como #conteudo do link de pular) é ignorado: devolve null.
function telaDoHash(hash, naCarga) {
  if (ROTAS[hash]) return ROTAS[hash];
  return naCarga ? TELA_PADRAO : null;
}

export { ROTAS, HASH_DE, TELAS, TELA_PADRAO, telaDoHash };
