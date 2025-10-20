import { Estoque } from "../back/services/estoque.js";

/**
 * Testes de exclusão de produto
 * Autor: Jean Lucas
 * Data: 01/10/2025
 */

describe("Testes de exclusão de produtos", () => {
  test("Exclusão de produto com sucesso", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const nome = `Produto teste ${Date.now()}`;
    const preco = 99.99;
    const quantidade = 10;
    const validade = "2025-12-31";

    await estoque.adicionarProduto(nome, preco, quantidade, validade);

    let produtos = await estoque.listarProdutos();

    let produtoid = produtos.find((p) => p.nome === nome).id;

    //=================
    // Execução
    const res = await estoque.removerProduto(produtoid);

    //=================
    // Verificação
    expect(res).toBe(true);
  });

  test("Exclusão de produto inexistente", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const produtoid = 999999; // 

    //=================
    // Execução
    let res = await estoque.removerProduto(produtoid);

    //=================
    // Verificação
    expect(res).toBe(false);
  });
});

//-----------------------------------------------------------------------------------
/**
 * Testes de exclusão de produtos 2.0
 * Autor: Iwin Lima
 * Data: 19/10/2025
 */

describe("Testes adicionais de exclusão de produtos", () => {
  
  test("Exclusão de produto com ID negativo", async () => {
    //=================
    // Criação de cenario

    const estoque = new Estoque();
    const produtoid = -1;

    //=================
    // Execução
    const res = await estoque.removerProduto(produtoid);

    //=================
    // Verificação
    expect(res).toBe(false);
  });

  test("Exclusão de produto com ID zero", async () => {
    //=================
    // Criação de cenario
    const estoque = new Estoque();
    const produtoid = 0;

    //=================
    // Execução
    const res = await estoque.removerProduto(produtoid);

    //=================
    // Verificação
    expect(res).toBe(false);
  });
});
