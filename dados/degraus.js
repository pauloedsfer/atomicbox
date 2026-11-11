/* Super Atomic Box — degraus e medalhas do Treino. Dados puros, entregues ao progresso
   (comum/progresso.js). O degrau 0 está sempre aberto; cada um dos outros abre com 5 acertos no
   anterior. Os degraus seguem as telas da escada: quem estudou a tela, treina o degrau. */

const DEGRAUS = [
  { id: "estados", nome: "Estados da matéria", tela: "tela-materia", descricao: "Estado físico pela temperatura, mudanças de estado e o que as partículas fazem.", acertosParaAbrir: 5 },
  { id: "modelos", nome: "Modelos atômicos", tela: "tela-modelos", descricao: "De Dalton a Bohr: quem propôs, o que explicava e a folha de ouro.", acertosParaAbrir: 5 },
  { id: "particulas", nome: "Partículas do átomo", tela: "tela-atomo", descricao: "Prótons, nêutrons e elétrons; Z, A, íons e isótopos.", acertosParaAbrir: 5 },
  { id: "distribuicao", nome: "Distribuição eletrônica", tela: "tela-distribuicao", descricao: "Diagrama de Pauling, camadas, valência e subnível mais energético.", acertosParaAbrir: 5 },
];

const MEDALHAS = [
  { id: "primeiro", nome: "Primeira partícula", condicao: (p) => p.totalAcertos >= 1, descricao: "Acertar o primeiro exercício" },
  { id: "dez", nome: "Dez em órbita", condicao: (p) => p.totalAcertos >= 10, descricao: "Acertar dez exercícios" },
  { id: "cinquenta", nome: "Meio cento atômico", condicao: (p) => p.totalAcertos >= 50, descricao: "Acertar cinquenta exercícios" },
  { id: "sequencia5", nome: "Reação em cadeia", condicao: (p) => p.melhorSequencia >= 5, descricao: "Cinco acertos seguidos" },
  { id: "sequencia15", nome: "Fissão em série", condicao: (p) => p.melhorSequencia >= 15, descricao: "Quinze acertos seguidos" },
  { id: "degrau1", nome: "Abriu a caixa", condicao: (p) => p.desbloqueado >= 1, descricao: "Abrir o degrau dos modelos atômicos" },
  { id: "degrau2", nome: "Dentro do núcleo", condicao: (p) => p.desbloqueado >= 2, descricao: "Abrir o degrau das partículas do átomo" },
  { id: "degrau3", nome: "Salto quântico", condicao: (p) => p.desbloqueado >= 3, descricao: "Abrir o degrau da distribuição eletrônica" },
  { id: "ofensiva3", nome: "Três dias seguidos", condicao: (p) => p.melhorOfensiva >= 3, descricao: "Treinar em três dias consecutivos" },
  { id: "ofensiva7", nome: "Semana inteira", condicao: (p) => p.melhorOfensiva >= 7, descricao: "Treinar em sete dias consecutivos" },
  { id: "semDica", nome: "Sem colinha", condicao: (p) => p.acertosSemDica >= 20, descricao: "Vinte acertos sem abrir a dica" },
];

export { DEGRAUS, MEDALHAS };
