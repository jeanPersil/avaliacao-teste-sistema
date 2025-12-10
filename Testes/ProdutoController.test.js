/**
 * Testes de integração/unitario no controller de Produtos
 * Autor: Jean Lucas
 * Data de atualização: 09/12/2025
 */

import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import ProdutoController from "../src/controller/produtoController.js";
import supabase from "../src/config.js";

// --- CONFIG APP ---
const app = express();
app.use(express.json());
app.use(cookieParser());

const produtoController = new ProdutoController();

app.post("/produtos", produtoController.adicionar.bind(produtoController));
app.get("/produtos", produtoController.listar.bind(produtoController));
app.put("/produtos", produtoController.editar.bind(produtoController));
app.delete("/produtos/:id", produtoController.excluir.bind(produtoController));

describe("ProdutoController - Testes de Integração de API", () => {
  const gerarNome = (sufixo) =>
    `T${Math.floor(Math.random() * 10000)} ${sufixo}`;

  const limparDados = async () => {
    await supabase.from("produtos").delete().ilike("nome", `T%`);
  };

  beforeAll(async () => await limparDados());
  afterAll(async () => await limparDados());

  test("POST /produtos - Deve criar um produto e retornar 201", async () => {
    // Criacao de cenario
    //====================
    const novoProduto = {
      nome: gerarNome("Fanta"),
      preco: 5.5,
      quantidade: 50,
      validade: "2026-10-10",
    };

    /// Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    if (response.status !== 201) {
      console.error("ERRO NO POST:", response.body);
    }

    //Verificacao
    //====================
    expect(response.status).toBe(201);

    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("nome", novoProduto.nome)
      .single();
    expect(data).toBeDefined();
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto vencido, retornando uma mensagem e o status 401", async () => {
    // Criação de cenário
    //====================

    const novoProduto = {
      nome: gerarNome("pepsi"),
      preco: 5.5,
      quantidade: 50,
      validade: "2022-10-10",
    };

    // Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Produto está vencido"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto com quantidade negativa, retornando uma mensagem e o status 401", async () => {
    // Criação de cenário
    //====================

    const novoProduto = {
      nome: gerarNome("Coca Cola"),
      preco: 5.5,
      quantidade: -10,
      validade: "2026-10-10",
    };

    // Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================

    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Quantidade não pode ser negativa"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto com preço negativo, retornando uma mensagem e o status 401", async () => {
    // Criação de cenário
    //====================

    const novoProduto = {
      nome: gerarNome("Coca Cola"),
      preco: -5.5,
      quantidade: 10,
      validade: "2026-10-10",
    };

    // Execução do cenário
    //====================

    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Preço não pode ser negativo"
    );
  });
  test("POST /produtos - deve falhar ao tentar cadastrar um produto com nome muito longo, retornando uma mensagem e o status 401", async () => {
    //Criação de cenario
    //====================

    const novoProduto = {
      nome: gerarNome(
        "Produto com nome muito longo que excede o limite permitido de cinquenta caracteres"
      ),
      preco: 10.0,
      quantidade: 5,
      validade: "2026-10-10",
    };

    // Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Quantidade de caracteres invalidos no campo nome"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto com nome contendo caracteres especiais, retornando uma mensagem e o status 401", async () => {
    //Criação de cenario
    //====================

    const novoProduto = {
      nome: gerarNome("produto#$@dois"),
      preco: 10,
      quantidade: 5,
      validade: "2026-10-10",
    };

    //Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Nome não pode conter caracteres especiais"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto ja cadastrado", async () => {
    // Criação de cenario
    const novoProduto = {
      nome: gerarNome("Red Bull"),
      preco: 8.0,
      quantidade: 20,
      validade: "2026-10-10",
    };

    // Execução (Cria o primeiro)
    await request(app).post("/produtos").send(novoProduto);

    // Tenta criar o segundo (Duplicado)
    const response = await request(app).post("/produtos").send(novoProduto); // Pode mandar o mesmo objeto, o nome é o que importa

    // Verificação
    expect(response.status).toBe(409);

    expect(response.body.details).toBe(
      "Este produto atualmente ja esta cadastrado"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto com nome muito curto, retornando uma mensagem e o status 401", async () => {
    //Criação de cenario
    //====================

    const novoProduto = {
      nome: "a",
      preco: 10,
      quantidade: 5,
      validade: "2026-10-10",
    };

    //Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Quantidade de caracteres invalidos no campo nome"
    );
  });

  test("POST /produtos - deve falhar ao tentar cadastrar um produto com campos vazios, retornando uma mensagem e o status 401", async () => {
    //Criação de cenario
    //====================

    const novoProduto = {
      nome: "pepsi",
      preco: "",
      quantidade: "",
      validade: "2026-10-10",
    };

    //Execução do cenário
    //====================
    const response = await request(app).post("/produtos").send(novoProduto);

    // Verificação do cenário
    //====================
    expect(response.status).toBe(401);
  });

  test("GET /produtos - Deve listar produtos com paginação (pagina 1, limite 5)", async () => {
    // Execução
    const response = await request(app)
      .get("/produtos")
      .query({ pagina: 1, limite: 5 });

    // Verificação
    expect(response.status).toBe(200);

    // Validando se o retorno respeitou a estrutura do seu controller
    expect(response.body).toHaveProperty("produtos");
    expect(response.body).toHaveProperty("paginacao");

    // Validando se os parametros funcionaram
    expect(response.body.paginacao.paginaAtual).toBe(1);
    expect(response.body.paginacao.limitePorPagina).toBe(5);
  });

  // =========================================
  // TESTES DE EDIÇÃO (PUT)
  // =========================================

  test("PUT /produtos - Deve editar um produto com sucesso e atualizar o banco", async () => {
    // 1. PREPARAÇÃO: Cria um produto original
    const nomeOriginal = gerarNome("Original");
    const produtoInicial = {
      nome: nomeOriginal,
      preco: 10.0,
      quantidade: 10,
      validade: "2030-01-01",
    };

    // Cria via POST primeiro
    await request(app).post("/produtos").send(produtoInicial);

    // Recupera o ID do produto criado consultando o banco
    const { data: produtoCriado } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nomeOriginal)
      .single();

    // 2. EXECUÇÃO: Tenta editar (Muda preço e nome)
    const dadosAtualizados = {
      id: produtoCriado.id, // OBRIGATÓRIO: Passar o ID no body
      nome: gerarNome("Editado"),
      preco: 50.0, // Mudou de 10 para 50
      quantidade: 20,
      validade: "2030-01-01",
    };

    const response = await request(app).put("/produtos").send(dadosAtualizados);

    // 3. VERIFICAÇÃO
    expect(response.status).toBe(200);

    // Prova Real: Busca no banco e vê se o preço mudou para 50
    const { data: produtoFinal } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", produtoCriado.id)
      .single();

    expect(produtoFinal.preco).toBe(50.0);
    expect(produtoFinal.nome).toContain("Editado");
  });

  test("PUT /produtos - Deve falhar ao tentar editar com preço negativo (Validação)", async () => {
    // 1. PREPARAÇÃO
    const nomeTeste = gerarNome("Para Erro Preco");
    await request(app).post("/produtos").send({
      nome: nomeTeste,
      preco: 10,
      quantidade: 10,
      validade: "2030-01-01",
    });

    const { data: produto } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nomeTeste)
      .single();

    // 2. EXECUÇÃO: Envia preço negativo
    const updateInvalido = {
      id: produto.id,
      nome: nomeTeste,
      preco: -50.0, // ERRO AQUI
      quantidade: 10,
      validade: "2030-01-01",
    };

    const response = await request(app).put("/produtos").send(updateInvalido);

    // 3. VERIFICAÇÃO
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Preço não pode ser negativo"
    );
  });

  test("PUT /produtos - Deve falhar ao tentar editar com quantidade negativa", async () => {
    // 1. PREPARAÇÃO
    const nomeTeste = gerarNome("Para Erro Qtd");
    await request(app).post("/produtos").send({
      nome: nomeTeste,
      preco: 10,
      quantidade: 10,
      validade: "2030-01-01",
    });

    const { data: produto } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nomeTeste)
      .single();

    // 2. EXECUÇÃO
    const response = await request(app).put("/produtos").send({
      id: produto.id,
      nome: nomeTeste,
      preco: 10,
      quantidade: -5, // ERRO AQUI
      validade: "2030-01-01",
    });

    // 3. VERIFICAÇÃO
    expect(response.status).toBe(401);
    expect(response.body.details).toBe(
      "Campos inválidos: Quantidade não pode ser negativa"
    );
  });

  test("PUT /produtos - Deve falhar ao tentar editar com nome inválido", async () => {
    // 1. PREPARAÇÃO
    const nomeTeste = gerarNome("Para Erro Nome");
    await request(app).post("/produtos").send({
      nome: nomeTeste,
      preco: 10,
      quantidade: 10,
      validade: "2030-01-01",
    });

    const { data: produto } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nomeTeste)
      .single();

    // 2. EXECUÇÃO
    const response = await request(app).put("/produtos").send({
      id: produto.id,
      nome: "a", // Nome muito curto
      preco: 10,
      quantidade: 10,
      validade: "2030-01-01",
    });

    // 3. VERIFICAÇÃO
    expect(response.status).toBe(401);
    expect(response.body.details).toContain(
      "Quantidade de caracteres invalidos"
    );
  });

  test("DELETE /produtos/:id - Deve excluir um produto existente", async () => {
    // 1. PREPARAÇÃO: Criar o produto que será "vitima" da exclusão
    const nomeParaDeletar = gerarNome("Vai Sumir");

    await request(app).post("/produtos").send({
      nome: nomeParaDeletar,
      preco: 10,
      quantidade: 5,
      validade: "2030-10-10",
    });

    // Recupera o ID gerado pelo banco
    const { data: produto } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nomeParaDeletar)
      .single();

    // Guard Clause: Se o POST falhou, o produto é null. Paramos aqui para não crashar.
    if (!produto) {
      throw new Error("Falha na preparação: Produto não foi criado.");
    }

    // 2. EXECUÇÃO: Deleta passando o ID na URL
    const response = await request(app).delete(`/produtos/${produto.id}`);

    // 3. VERIFICAÇÃO
    // Status 204 (No Content) é o padrão para "Deletado com sucesso"
    expect(response.status).toBe(204);

    // Prova Real: Tenta buscar no banco de novo
    const { data: consultaFinal } = await supabase
      .from("produtos")
      .select("id")
      .eq("id", produto.id)
      .single();

    // Deve ser nulo, pois não existe mais
    expect(consultaFinal).toBeNull();
  });
});
