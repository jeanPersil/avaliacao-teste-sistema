import { Autenticacao } from "../back/services/auth.js";

/**
 * Testes do cadastro de usuario
 * Autor: Jean Lucas
 * Data: 26/09/2025
 */

describe("Testes de cadastro do usuario", () => {
  const auth = new Autenticacao();

  test("Cadastro de usuario com sucesso", async () => {
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
  });

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

//-----------------------------------------------------------------------------------
/**
 * Testes do cadastro de Usuario 2.0
 * Autor: Iwin Lima
 * Data: 19/10/2025
 */

describe("Testes adicionais de cadastro do usuario", () => {
  const auth = new Autenticacao();

  test("Cadastro com senha muito curta", async () => {
    //=================
    // Criação de cenario

    const email = `test_${Date.now()}@example.com`;
    const senha = "123";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro com telefone inválido", async () => {
    //=================
    // Criação de cenario

    const email = `test_${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "abc";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro sem nome", async () => {
    //=================
    // Criação de cenario

    const email = `test_${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "";
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro com nome dentro do limite", async () => {
    //=================
    // Criação de cenario

    const email = `test_${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "A".repeat(50); 
    const telefone = "1234567890";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Cadastro com email contendo espaços", async () => {
    //=================
    // Criação de cenario
    
    const email = "test user@example.com";
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

  test("Cadastro com telefone vazio", async () => {
    //=================
    // Criação de cenario

    const email = `test_${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "";

    //=================
    // Execução
    const res = await auth.cadastrarUsuario(email, senha, nome, telefone);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro com email duplicado incremental", async () => {
    //=================
    // Criação de cenario

    const baseEmail = `test_${Date.now()}@example.com`;
    const senha = "senhaSegura123";
    const nome = "Usuario teste";
    const telefone = "1234567890";

    //=================
    // Execução
    // Primeiro cadastro
    const res1 = await auth.cadastrarUsuario(baseEmail, senha, nome, telefone);

    //=================
    // Verificação
    expect(res1.sucesso).toBe(true);

    //=================
    // Execução
    // Segundo cadastro com mesmo email
    const res2 = await auth.cadastrarUsuario(baseEmail, senha, nome, telefone);

    //=================
    // Verificação
    expect(res2.sucesso).toBe(false);
  });
});
