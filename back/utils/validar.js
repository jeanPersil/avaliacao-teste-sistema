export function validarCampos(nome, preco, quantidade, validade) {
  if (!nome || preco == null || quantidade == null || !validade) {
    return { sucesso: false, error: "Todos os campos são obrigatórios" };
  }

  if (typeof nome !== "string" || nome.trim().length === 0) {
    return { sucesso: false, error: "Nome deve ser um texto válido" };
  }

  if (typeof preco !== "number" || isNaN(preco)) {
    return { sucesso: false, error: "Preço deve ser um número válido" };
  }

  if (
    typeof quantidade !== "number" ||
    isNaN(quantidade) ||
    !Number.isInteger(quantidade)
  ) {
    return {
      sucesso: false,
      error: "Quantidade deve ser um número inteiro válido",
    };
  }

  if (preco < 0) {
    return { sucesso: false, error: "Preço não pode ser negativo" };
  }

  if (quantidade < 0) {
    return { sucesso: false, error: "Quantidade não pode ser negativa" };
  }

  return { sucesso: true };
}
