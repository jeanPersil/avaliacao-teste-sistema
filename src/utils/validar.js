export function validarCampos(nome, preco, quantidade, validade) {
  const erro = (msg) => {
    throw new Error("Campos inválidos: " + msg);
  };

  if (nome.length > 30) {
    erro("Quantidade de caracteres invalidos no campo nome");
  }

  if (nome.length < 5) {
    erro("Quantidade de caracteres invalidos no campo nome");
  }

  if (preco.length > 30) {
    erro("Quantidade de caracteres invalidos no campo preco");
  }

  if (quantidade.length > 30) {
    erro("Quantidade de caracteres invalidos no campo preco");
  }

  if (!nome || preco == null || quantidade == null || !validade) {
    erro("Todos os campos são obrigatórios");
  }

  // Validar nome
  if (typeof nome !== "string" || nome.trim().length === 0) {
    erro("Nome deve ser um texto válido");
  }

  // Validar caracteres especiais no nome
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/.test(nome)) {
    erro("Nome não pode conter caracteres especiais");
  }

  // Preço
  if (typeof preco !== "number" || isNaN(preco)) {
    erro("Preço deve ser um número válido");
  }

  if (preco < 0) {
    erro("Preço não pode ser negativo");
  }

  if (
    typeof quantidade !== "number" ||
    isNaN(quantidade) ||
    !Number.isInteger(quantidade)
  ) {
    erro("Quantidade deve ser um número inteiro válido");
  }

  if (quantidade < 0) {
    erro("Quantidade não pode ser negativa");
  }

  // Validade
  if (!validarvalidade(validade)) {
    erro("Produto está vencido");
  }

  return;
}

export function validarEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

  if (email.length > 50) {
    throw new Error(
      "Email inválido: Email com uma quantidade de caracters muito grande"
    );
  }

  if (!regex.test(email)) {
    throw new Error("Email inválido");
  }

  return true;
}

export function validarCamposCadastro(email, senha, nome, telefone) {
  if (!email || !senha || !nome || !telefone) {
    throw new error("Campos faltando");
  }

  return;
}

export function validarSenha(senha) {
  if (senha.length > 20) {
    throw new Error("Senha invalida: Senha grande");
  }

  if (senha.length < 6) {
    throw new Error("Senha invalida: Senha curta");
  }

  return;
}

function validarvalidade(dataValidade) {
  if (!dataValidade) return false;

  const validade = new Date(dataValidade);
  if (isNaN(validade.getTime())) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return validade >= hoje;
}

export function validarNomeCompleto(nome) {
  nome = nome.trim();

  if (nome.length < 5) {
    throw new Error("Nome inválido: muito curto");
  }

  if (nome.length > 50) {
    throw new Error("Nome inválido: muito longo");
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome)) {
    throw new Error("Nome inválido: use apenas letras");
  }

  const partes = nome.split(/\s+/);
  if (partes.length < 2) {
    throw new Error("Nome inválido: insira nome e sobrenome");
  }

  return true;
}

export function validarNumero(valor) {
  if (valor.length < 10 || valor.length > 11)
    throw new Error(
      "Número inválido: Digite somente os numeros do seu telefone."
    );

  if (!/^\d+$/.test(valor))
    throw new Error(
      "Número inválido: Digite somente os numeros do seu telefone."
    );

  return;
}
