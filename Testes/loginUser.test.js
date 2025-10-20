import { Autenticacao } from "../back/services/auth.js";

/**
 * Testes do login de usuario
 * Autor: Jean Lucas
 * Data: 26/09/2025
 */

describe("Testes de login do usuario", () => {
  const auth = new Autenticacao();

  test("Teste de login com sucesso", async () => {
    //=================
    // Criação de cenario
    let email = "admin1@gmail.com";
    let senha = "admin123";

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Teste login com email invalido", async () => {
    //=================
    // Criação de cenario
    let email = "admin1.com";
    let senha = "admin123";

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Teste login com senha faltando", async () => {
    //=================
    // Criação de cenario
    let email = "admin1@gmail.com";
    let senha = "";

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Teste login com senha incorreta", async () => {
    //=================
    // Criação de cenario
    let email = "admin1@gmail.com";
    let senha = "senhaCerta"; // senha errada proposital

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Teste com conta inexistente", async () => {
    //=================
    // Criação de cenario
    let email = "contaInexistente@gmail.com";
    let senha = "senhasuperforte123";

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Teste de login com caracteres especiais/estranhos no email", async () => {
    //=================
    // Criação de cenario
    let email = "admin@@gmail.com";
    let senha = "senhafoda123";

    //=================
    // Execução
    let res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });
});

//-----------------------------------------------------------------------------------
/**
 * Testes do login do usuario 2.0
 * Autor: Iwin Lima
 * Data: 19/10/2025
 */

describe("Testes adicionais de login do usuario", () => {
  const auth = new Autenticacao();

  test("Login com email em maiúsculas", async () => {
    //=================
    // Criação de cenario
    
    const email = "ADMIN1@GMAIL.COM";
    const senha = "admin123";

    //=================
    // Execução
    const res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Login com senha contendo espaços", async () => {
    //=================
    // Criação de cenario

    const email = "admin1@gmail.com";
    const senha = "admin 123";

    //=================
    // Execução
    const res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Login com email null", async () => {
    //=================
    // Criação de cenario

    const email = null;
    const senha = "admin123";

    //=================
    // Execução
    const res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Login com senha null", async () => {
    //=================
    // Criação de cenario

    const email = "admin1@gmail.com";
    const senha = null;

    //=================
    // Execução
    const res = await auth.login(email, senha);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });
});
