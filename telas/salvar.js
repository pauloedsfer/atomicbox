/* Baixa um arquivo gerado no aparelho (PNG do crachá, PDF do certificado). */
function salvar({ blob, arquivo }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = arquivo;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export { salvar };
