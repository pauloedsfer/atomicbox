/* Super Atomic Box — o desafio "qual é a vidraria?". Funções puras.
   - Modo "desenho": a tela mostra o desenho e o aluno escolhe o nome.
   - Modo "uso": a tela mostra para que serve e o aluno escolhe o nome.
   As erradas vêm primeiro da mesma categoria (as que mais se confundem, como proveta e béquer). */
import { VIDRARIAS } from "../dados/vidrarias.js";

function indice(n, sorteio) {
  const v = Number(sorteio());
  if (!(v > 0)) return 0;
  return Math.min(n - 1, Math.floor(v * n));
}
function embaralhar(lista, sorteio) {
  const saida = [...lista];
  for (let i = saida.length - 1; i > 0; i--) {
    const k = indice(i + 1, sorteio);
    [saida[i], saida[k]] = [saida[k], saida[i]];
  }
  return saida;
}

/* `anterior`: id da vidraria da pergunta anterior, para não repetir em seguida. */
function perguntaDeVidraria(modo, sorteio = Math.random, anterior = null) {
  const candidatas = VIDRARIAS.filter((v) => v.id !== anterior);
  const alvo = candidatas[indice(candidatas.length, sorteio)];
  const mesma = embaralhar(VIDRARIAS.filter((v) => v.id !== alvo.id && v.categoria === alvo.categoria), sorteio);
  const outras = embaralhar(VIDRARIAS.filter((v) => v.id !== alvo.id && v.categoria !== alvo.categoria), sorteio);
  const erradas = [...mesma.slice(0, 2), ...outras].slice(0, 3);
  const opcoes = embaralhar([alvo, ...erradas], sorteio).map((v) => ({ id: v.id, texto: v.nome }));
  return {
    modo,
    alvo: alvo.id,
    enunciado: modo === "uso" ? `Qual vidraria ou equipamento serve para isto? ${alvo.uso}` : "Qual é o nome desta vidraria ou equipamento?",
    opcoes,
  };
}

/* O retorno para a escolha: certo ou não, e o que a escolhida faz de verdade. */
function corrigirVidraria(pergunta, id) {
  const alvo = VIDRARIAS.find((v) => v.id === pergunta.alvo);
  const escolhida = VIDRARIAS.find((v) => v.id === id);
  if (!escolhida || !pergunta.opcoes.some((o) => o.id === id)) return { certo: false, conta: false, texto: "Escolha uma das alternativas." };
  if (id === alvo.id) return { certo: true, texto: `Certo! ${alvo.nome}. ${alvo.uso}` };
  return { certo: false, texto: `Você escolheu: ${escolhida.nome}. ${escolhida.uso} A resposta é: ${alvo.nome}.` };
}

export { perguntaDeVidraria, corrigirVidraria };
