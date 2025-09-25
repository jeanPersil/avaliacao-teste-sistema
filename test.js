// testeCadastro.js

// 1. Importe a classe
import { Autenticacao } from "./back/services/auth.js";

// 2. Crie uma instância
const auth = new Autenticacao();

async function executarTestes() {
  // --- TESTE 1: Cadastro BEM-SUCEDIDO ---
  console.log("--- Teste 1: Cadastro Válido ---");
  const resultadoSucesso = await auth.cadastrarUsuario(
    `teste@exemplo.com`, // Use um email único
    "senhaSegura123",
    "João da Silva",
    "999999999"
  );

  console.log("Resultado Sucesso:", resultadoSucesso);
  // Verifique: resultadoSucesso.sucesso deve ser true.
  // E verifique no dashboard do Supabase se o usuário e o perfil foram criados.

  // --- TESTE 2: Campos Obrigatórios Faltando (email) ---
  console.log("\n--- Teste 2: Campos Faltando ---");
  const resultadoFaltando = await auth.cadastrarUsuario(
    null, // email faltando
    "senhaSegura123",
    "Maria Teste"
  );

  console.log("Resultado Faltando:", resultadoFaltando);
  // Verifique: resultadoFaltando.sucesso deve ser false e a mensagem "Campos obrigatórios faltando".

  // --- TESTE 3: Email já existente (Supabase deve falhar) ---
  // Você precisaria de um email que você sabe que já foi cadastrado para este teste.
  // Exemplo:
  /*
    console.log("\n--- Teste 3: Email Existente ---");
    const resultadoExistente = await auth.cadastrarUsuario(
        "testeexistente@exemplo.com", 
        "outraSenha",
        "Nome Duplicado"
    );
    console.log("Resultado Existente:", resultadoExistente);
    // Verifique: resultadoExistente.sucesso deve ser false e a mensagem deve indicar falha na autenticação.
    */
}

executarTestes();
