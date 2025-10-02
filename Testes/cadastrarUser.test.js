import { Autenticacao } from "../back/services/auth.js";

/**
 * Testes do cadastro de usuario
 * Autor: Jean Lucas
 * Data: 26/09/2025
 */

describe("Testes de cadastro do usuario", () => {
  const auth = new Autenticacao();

  /* test("Cadastro de usuario com sucesso", async () => {
    //=================
    // Criação de cenario
    const email = `test_user${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });  */

  test("Cadastro com uma conta ja existente", async () => {
    //=================
    // Criação de cenario
    const email = "admin1@gmail.com";
    const senha = "admin123";
    const nome = "Admin brabo";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro com email faltando", async () => {
    //=================
    // Criação de cenario
    const email = "";
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro com email invalido", async () => {
    //=================
    // Criação de cenario
    const email = "emailinvalido";
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Email invalido.");
  });

  test("Cadastro sem senha", async () => {
    //=================
    // Criação de cenario
    const email = `test_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}@exemplo.com`;
    const senha = "";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Campos obrigatórios faltando");
  });
});
