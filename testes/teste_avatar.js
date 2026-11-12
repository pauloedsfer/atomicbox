import { teste, igual, verdadeiro } from "./afirmar.js";
import { TITULOS, indiceDoTitulo, tituloDo, proximoTitulo, certificado, textoDoCertificado } from "../dados/titulos.js";
import { ACESSORIOS, lerAvatar } from "../dados/avatar.js";
import { DEGRAUS } from "../dados/degraus.js";
import { lerPreferencias } from "../dados/presentes.js";
import { textoDivulgacao, textoProfessor } from "../dados/compartilhar.js";
import { gerarPdf } from "../motor/pdf.js";

teste("títulos: um por degrau, e cada título depois do primeiro abre um acessório", () => {
  igual(TITULOS.length, DEGRAUS.length);
  igual(ACESSORIOS.length, TITULOS.length - 1);
  igual(tituloDo({ desbloqueado: 0 }), "Observador(a) da matéria");
  igual(indiceDoTitulo({ desbloqueado: 99 }), 6);
  verdadeiro(proximoTitulo({ desbloqueado: 2 }).includes(DEGRAUS[3].nome));
  igual(proximoTitulo({ desbloqueado: 6 }), "");
  igual(lerAvatar({ acessorios: ["oculos", "capelo"] }, indiceDoTitulo({ desbloqueado: 1 })).acessorios, ["oculos"]);
});

teste("certificado: abre com os sete degraus e 5 acertos em Ligações; o texto cita a escada", () => {
  const fechado = certificado({ desbloqueado: 3, porDegrau: {} });
  igual([fechado.liberado, fechado.faltas.length], [false, 2]);
  const quase = certificado({ desbloqueado: 6, porDegrau: { 6: { acertos: 4 } } });
  igual([quase.liberado, quase.faltas.length], [false, 1]);
  igual(certificado({ desbloqueado: 6, porDegrau: { 6: { acertos: 5 } } }).liberado, true);
  const t = textoDoCertificado({ nome: "Ana", titulo: TITULOS[6], nivel: 4, xp: 300, acertos: 60, data: "01/12/2026" });
  igual(t[1], "Ana");
  verdadeiro(t[2].includes("ligações químicas") && t[2].includes("estados da matéria"), t[2]);
  const pdf = gerarPdf({ titulo: "Certificado", blocos: t.map((x) => ({ tipo: "texto", texto: x })), rodape: "Super Atomic Box" });
  igual(String.fromCharCode(...pdf.slice(0, 8)), "%PDF-1.4");
});

teste("preferências guardam avatar, apelido, código e link sem perder a paleta", () => {
  const p = lerPreferencias(JSON.stringify({ paleta: "antimateria", estadosVistos: ["solido"], avatar: { pele: "p1" }, apelido: "x".repeat(40), codigo: "TURMA1", linkTurma: 5 }));
  igual([p.paleta, p.avatar.pele, p.apelido.length, p.codigo, p.linkTurma], ["antimateria", "p1", 18, "TURMA1", ""]);
});

teste("compartilhar: convite e texto ao professor com o nome e o link do Atomic Box", () => {
  verdadeiro(textoDivulgacao("atomic", "avatar").includes("https://caixaquimica.com.br/atomicbox/"));
  const t = textoProfessor("atomic", { codigo: "TURMA1", linha: "ABOX1;cod=TURMA1;xp=10" });
  verdadeiro(t.includes("Super Atomic Box") && t.endsWith("ABOX1;cod=TURMA1;xp=10"), t);
});
