import { Estoque } from "../back/services/estoque.js";

/**
 * Testes do cadastro de produto
 * Autor: Jean Lucas
 * Data: 01/10/2025
 */

describe("Testes de cadastro do produto", () => {
  test("Cadastro de produto com sucesso", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 99.99;
    const quantidade = 10;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nome,
      preco,
      quantidade,
      validade
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Cadastro de produto com nome duplicado", async () => {
    //=================
    // Criação de cenario

    // primeiro produto
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 99.99;
    const quantidade = 10;
    const validade = "2025-12-31";
    await estoque.adicionarProduto(nome, preco, quantidade, validade);

    // segundo produto com nome duplicado
    const nomeDuplicado = nome;
    const preco2 = 49.99;
    const quantidade2 = 5;
    const validade2 = "2025-11-30";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nomeDuplicado,
      preco2,
      quantidade2,
      validade2
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Este produto ja esta cadastrado.");
  });

  test("Cadastrar adicionar produto com quantidade negativa", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 99.99;
    const quantidade = -5; // Quantidade negativa
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nome,
      preco,
      quantidade,
      validade
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Quantidade não pode ser negativa");
  });

  test("Cadastrar adicionar produto com preço negativo", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = -10.0; // Preço negativo
    const quantidade = 5;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nome,
      preco,
      quantidade,
      validade
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Preço não pode ser negativo");
  });

  test("Cadastrar produto com quantiade não inteira", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 50.0;
    const quantidade = 3.5; // Quantidade não inteira
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nome,
      preco,
      quantidade,
      validade
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Quantidade deve ser um número inteiro válido");
  });


  test("Cadastrar produto com campos vazios", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = ""; // Nome vazio
    const preco = "";
    const quantidade = "";
    const validade = "";


    //=================
    // Execução
    const res = await estoque.adicionarProduto(
      nome,
      preco,
      quantidade,
      validade
    );

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    expect(res.mensagem).toBe("Todos os campos são obrigatórios");
  })
});

//-----------------------------------------------------------------------------------
/**
 * Testes do cadastro de produto 2.0
 * Autor: Iwin Lima
 * Data: 19/10/2025
 */


describe("Testes adicionais de cadastro do produto", () => {
  
  test("Cadastro de produto com quantidade zero", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 50.0;
    const quantidade = 0;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Cadastro de produto com preço zero", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 0;
    const quantidade = 10;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Cadastro de produto com validade no passado", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 25.50;
    const quantidade = 5;
    const validade = "2020-01-01";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro de produto com nome muito longo", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = "A".repeat(500); 
    const preco = 25.50;
    const quantidade = 5;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
    
  });

  test("Cadastro de produto com caracteres especiais no nome", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste @#${Date.now()}`; 
    const preco = 25.50;
    const quantidade = 5;
    const validade = "2025-12-31";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(true);
  });

  test("Cadastro de produto sem data de validade", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 25.50;
    const quantidade = 5;
    const validade = "";

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });

  test("Cadastro de produto com formato de data inválido", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 25.50;
    const quantidade = 5;
    const validade = "31-12-2025"; 

    //=================
    // Execução
    const res = await estoque.adicionarProduto(nome, preco, quantidade, validade);

    //=================
    // Verificação
    expect(res.sucesso).toBe(false);
  });
});
