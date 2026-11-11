# Super Atomic Box: plano

A primeira caixa da escada da Caixa Química (iniciante, 1º ano do ensino médio). Leva o aluno da
matéria que se vê ao átomo, e termina dando a deixa para o Super Molbox (o mol e a inorgânica).
Nome em português nos vídeos e na descrição: **a Super Caixa Atômica**. Mascote: **Bohr**, o gato
preto.

## Princípio didático

Começar pelo que se vê e "dar zoom" até o invisível. Cada passo nasce de uma pergunta que o passo
anterior não respondia, como na "Mol: A Chave" do Molbox: uma história, não uma lista de
conteúdos. Cada tela tem uma parte para ver (texto curto e figura), uma para mexer (ferramenta
interativa) e uma para conferir (pergunta rápida, depois o Treino).

## A escada de conteúdos

| # | Tela | Pergunta que abre | Ferramenta | Ponte |
|---|------|-------------------|------------|-------|
| 1 | Estados da matéria | O que muda no gelo quando ele derrete? | Simulador de partículas com termômetro: sólido, líquido e gás, com os nomes das mudanças de estado | "Do que são feitas as partículas?" |
| 2 | Substâncias e misturas | Água pura e água com sal são a mesma coisa? | Separar misturas (filtração, decantação, destilação) e ler a curva de aquecimento | "Se a substância é pura, o que a forma?" |
| 3 | Modelos atômicos | Como enxergar o que ninguém vê? | Linha do tempo Dalton → Thomson → Rutherford → Bohr; o experimento da folha de ouro | "O que há dentro do átomo?" |
| 4 | Partículas do átomo | Por que o carbono é carbono? | Montador de átomo: prótons, nêutrons e elétrons; mostra elemento, carga, massa, íon e isótopo | "Onde ficam os elétrons?" |
| 5 | Distribuição eletrônica | Por que os elétrons ficam em camadas? | Diagrama de Linus Pauling clicável, camadas K-L-M-N, camada de valência | A "partícula na caixa": só algumas energias são possíveis |
| 6 | Tabela periódica | Por que a tabela tem esse formato? | Tabela interativa: família e período pela distribuição, tendências pintadas (raio, eletronegatividade, energia de ionização) | "Por que os átomos se ligam?" |
| 7 | Ligações químicas | Por que o sal derrete a 801 °C e o gelo a 0 °C? | Montador de ligações: iônica (transferência), covalente (compartilhamento), metálica; regra do octeto | **Ponte para o Molbox:** "o sal que você montou se chama cloreto de sódio, e quantos cabem numa colher? Isso é o mol." |

Fechamento: um "Próxima caixa" que apresenta o Avogato e o Super Molbox.

## Visual

- **Paleta padrão (Matéria):** preto metálico, letra branca, detalhes vermelhos. O metálico fica
  nos cartões e nas bordas (gradientes suaves), nunca atrás de texto longo. O vermelho do texto é
  clareado para ter contraste AA sobre o preto.
- **Antimatéria:** o negativo: branco com letra preta e os mesmos detalhes vermelhos. É o presente
  de boas-vindas: abre quando o aluno leva a água pelos três estados no simulador.
- **Próximas paletas:** com nomes de partículas e de cientistas (Elétron, Próton, Bohr, Curie),
  abertas pelos degraus do Treino. Cada paleta abre uma pele de fantasia no avatar.
- **Bohr, o gato:** aparece no início, nas comemorações e como dica.

## Reaproveitado das outras caixas

Do Super Organic Box (mesma arquitetura, ES modules, sem build): progresso com XP, degraus e
medalhas; Treino só de alternativas, com diagnóstico do erro e botão Pular; tempo de uso; avatar
com crachá; presentes; envio ao professor (planilha); certificado; funcionamento sem internet.

## Ordem de construção

1. Casca do app, paleta Matéria e Antimatéria, início com o Bohr, sem internet. ✅
2. Tela 1: Estados da matéria, com o simulador de partículas. ✅
3. Telas 3, 4 e 5 (o coração: modelos, partículas do átomo, distribuição).
4. Treino (degraus: estados, átomo, distribuição, tabela, ligações), progresso e avatar.
5. Telas 2, 6 e 7, e a ponte para o Molbox.
