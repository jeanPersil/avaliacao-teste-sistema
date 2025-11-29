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

  if (!validarvalidade(validade)) {
    return { sucesso: false, error: "Produto está vencido" };
  }

  return { sucesso: true };
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarvalidade(dataValidade) {
  // Verifica se o campo está vazio ou nulo
  if (!dataValidade) return false;

  // Converte a string em um objeto Date
  const validade = new Date(dataValidade);
  if (isNaN(validade.getTime())) return false; // formato inválido

  // Data atual (zerando horas para comparar apenas dia/mês/ano)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Retorna true se a validade ainda não passou
  return validade >= hoje;
}

export function validarTelefoneMinimo(telefone) {
  if (!telefone || typeof telefone !== "string") {
    return false;
  }

  const apenasNumeros = telefone.replace(/\D/g, "");
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
}

export function formatarData(dataISO) {
  if (!dataISO) return "N/A";

  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR"); // "28/11/2025"
}
