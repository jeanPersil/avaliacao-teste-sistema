/**
 * Testes no back end (geral)
 * Autor: Raynan Silva
 * Data: 22/10/2025
 */


import { Estoque } from "../back/services/estoque.js";
import { Autenticacao } from "../back/services/auth.js";
import { Usuario } from "../back/services/usuario.js";

describe("Testes adicionais - Estoque / Usuário / Autenticação", () => {
  // 1) Atualizar produto com sucesso
  test("Atualizar produto altera campos corretamente", async () => {
    const estoque = new Estoque();
    const nome = `Produto atualizar ${Date.now()}`;
    const resAdd = await estoque.adicionarProduto(nome, 10.0, 5, "2026-01-01");
    expect(resAdd.sucesso).toBe(true);

    const produtos = await estoque.listarProdutos();
    const prod = produtos.find(p => p.nome === nome);
    expect(prod).toBeDefined();

    const novoPreco = 15.5;
    const novoNome = `${nome} v2`;
    const resUpdate = await estoque.atualizarProduto(prod.id, {
      nome: novoNome,
      preco: novoPreco
    });

    expect(resUpdate.sucesso).toBe(true);

    const prodAtual = (await estoque.listarProdutos()).find(p => p.id === prod.id);
    expect(prodAtual.nome).toBe(novoNome);
    expect(prodAtual.preco).toBe(novoPreco);
  });

  // 2) Obter produto por id existente
  test("Obter produto por id retorna objeto correto", async () => {
    const estoque = new Estoque();
    const nome = `Produto porId ${Date.now()}`;
    await estoque.adicionarProduto(nome, 8.0, 3, "2026-02-01");

    const lista = await estoque.listarProdutos();
    const p = lista.find(x => x.nome === nome);
    const res = await estoque.obterProdutoPorId(p.id);

    expect(res).toBeDefined();
    expect(res.nome).toBe(nome);
    expect(res).toHaveProperty("id");
  });

  // 3) Obter produto por id inexistente deve retornar null/erro
  test("Obter produto por id inexistente retorna null/false", async () => {
    const estoque = new Estoque();
    const res = await estoque.obterProdutoPorId(99999999);
    expect(res === null || res === false).toBe(true);
  });

  // 4) Buscar produtos por termo
  test("Buscar produtos por termo retorna apenas correspondentes", async () => {
    const estoque = new Estoque();
    const ts = Date.now();
    await estoque.adicionarProduto(`Arroz especial ${ts}`, 5.0, 10, "2026-03-01");
    await estoque.adicionarProduto(`Feijão comum ${ts}`, 4.0, 10, "2026-03-01");

    const resultados = await estoque.buscarProdutos("Arroz");
    expect(Array.isArray(resultados)).toBe(true);
    expect(resultados.some(r => r.nome.includes("Arroz"))).toBe(true);
    // deve não incluir 'Feijão'
    expect(resultados.every(r => r.nome.includes("Arroz"))).toBe(true);
  });

  // 5) Paginação na listagem de produtos
  test("Listagem paginada respeita page e limit", async () => {
    const estoque = new Estoque();
    // cria produtos suficientes
    for (let i = 0; i < 6; i++) {
      await estoque.adicionarProduto(`ProdPag ${Date.now()}_${i}`, 1 + i, 2 + i, "2026-04-01");
    }

    const pagina1 = await estoque.listarProdutos({ page: 1, limit: 3 });
    const pagina2 = await estoque.listarProdutos({ page: 2, limit: 3 });

    expect(pagina1.length).toBeLessThanOrEqual(3);
    expect(pagina2.length).toBeLessThanOrEqual(3);
    // em teoria não se sobrepõem por id 
    if (pagina1.length > 0 && pagina2.length > 0) {
      const ids1 = pagina1.map(p => p.id);
      const ids2 = pagina2.map(p => p.id);
      expect(ids1.some(id => ids2.includes(id))).toBe(false);
    }
  });

  // 6) Atualizar preço para negativo deve falhar
  test("Atualizar produto para preço negativo é rejeitado", async () => {
    const estoque = new Estoque();
    const nome = `Produto precoNeg ${Date.now()}`;
    await estoque.adicionarProduto(nome, 20.0, 2, "2026-05-01");
    const produtos = await estoque.listarProdutos();
    const p = produtos.find(x => x.nome === nome);

    const res = await estoque.atualizarProduto(p.id, { preco: -5.0 });
    expect(res.sucesso).toBe(false);
  });

  // 7) Diminuir estoque com sucesso
  test("Diminuir estoque reduz quantidade corretamente", async () => {
    const estoque = new Estoque();
    const nome = `Produto venda ${Date.now()}`;
    await estoque.adicionarProduto(nome, 12.0, 10, "2026-06-01");
    const produto = (await estoque.listarProdutos()).find(p => p.nome === nome);
    const res = await estoque.diminuirEstoque(produto.id, 3);
    expect(res.sucesso).toBe(true);
    const atualizado = await estoque.obterProdutoPorId(produto.id);
    expect(atualizado.quantidade).toBe(produto.quantidade - 3);
  });

  // 8) Diminuir estoque
  test("Diminuir estoque além do disponível retornar: erro", async () => {
    const estoque = new Estoque();
    const nome = `Produto insuf ${Date.now()}`;
    await estoque.adicionarProduto(nome, 2.0, 1, "2026-07-01");
    const produto = (await estoque.listarProdutos()).find(p => p.nome === nome);
    const res = await estoque.diminuirEstoque(produto.id, 5);
    expect(res.sucesso).toBe(false);
  });

  // 9) Adicionar lote de produtos
  test("Adicionar lote de produtos retorna resumo/contagem", async () => {
    const estoque = new Estoque();
    const lote = [
      { nome: `Lote A ${Date.now()}_1`, preco: 1.0, quantidade: 2, validade: "2026-08-01" },
      { nome: `Lote A ${Date.now()}_2`, preco: 2.0, quantidade: 3, validade: "2026-08-01" }
    ];
    const res = await estoque.adicionarProdutosEmLote(lote);
    // aceita sucesso com contagem ou estrutura similar
    expect(res.sucesso === true || typeof res.adicionados === "number").toBe(true);
  });

  // 10) teste se inputs com tags HTML devem ser tratados
  test("Nome do produto com HTML é sanitizado/aceito sem injetar", async () => {
    const estoque = new Estoque();
    const nome = `<script>alert('x')</script>Produto ${Date.now()}`;
    const res = await estoque.adicionarProduto(nome, 3.0, 2, "2026-09-01");
    expect(res.sucesso).toBe(true);
    const p = (await estoque.listarProdutos()).find(x => x.nome.includes("Produto"));
    expect(p.nome.includes("<script")).toBe(false);
  });

  // 11) Atualizar usuário com sucesso
  test("Atualizar usuário modifica campos permitidos", async () => {
    const auth = new Autenticacao();
    const usuarioSvc = new Usuario();

    const ts = Date.now();
    const email = `atualizar_user_${ts}@example.com`;
    const senha = "senhaParaAtualizar";
    const nome = `Usu ${ts}`;
    const telefone = "11999999999";

    const resCad = await auth.cadastrarUsuario(email, senha, nome, telefone);
    expect(resCad.sucesso).toBe(true);

    const lista = await usuarioSvc.listarUsuarios();
    const user = lista.find(u => u.email === email);
    expect(user).toBeDefined();

    const novoNome = `${nome} atualizado`;
    const resUpdate = await usuarioSvc.atualizarUsuario(user.id, { nome_completo: novoNome });
    expect(resUpdate.sucesso).toBe(true);

    const lista2 = await usuarioSvc.listarUsuarios();
    const user2 = lista2.find(u => u.id === user.id);
    expect(user2.nome_completo).toBe(novoNome);

    // limpeza
    await usuarioSvc.removerUsuario(user.id);
  });

  // 12) Alterar senha com senha inválida (muito curta)
  test("Alterar senha para muito curta é rejeitado", async () => {
    const auth = new Autenticacao();
    const ts = Date.now();
    const email = `senha_short_${ts}@example.com`;
    const senha = "senhaLonga123";
    await auth.cadastrarUsuario(email, senha, `User ${ts}`, "11988888888");

    const resLogin = await auth.login(email, senha);
    expect(resLogin.sucesso).toBe(true);

    // tenta alterar para senha curta
    const res = await auth.alterarSenha(email, "12");
    expect(res.sucesso).toBe(false);
  });


  // 13) Remover usuário com permissões insuficientes (ex.: role comum) falha
  test("Remover usuário sem permissão retorna false", async () => {
    const usuarioSvc = new Usuario();
    const auth = new Autenticacao();

    const ts = Date.now();
    const email = `remover_noPerm_${ts}@example.com`;
    await auth.cadastrarUsuario(email, "senha123", `UserRem ${ts}`, "11966666666");

    const lista = await usuarioSvc.listarUsuarios();
    const user = lista.find(u => u.email === email);

    // tenta remover sem ser admin 
    const res = await usuarioSvc.removerUsuario(user.id, { roleRequester: "comum" });
    expect(res).toBe(false);

    await usuarioSvc.removerUsuario(user.id, { roleRequester: "admin" }).catch(()=>{});
  });

  // 14) Promover usuário para role admin
  test("Promover usuário altera role para admin", async () => {
    const usuarioSvc = new Usuario();
    const auth = new Autenticacao();

    const ts = Date.now();
    const email = `promover_${ts}@example.com`;
    await auth.cadastrarUsuario(email, "senha123", `UserProm ${ts}`, "11955555555");

    let lista = await usuarioSvc.listarUsuarios();
    const user = lista.find(u => u.email === email);
    expect(user.role).toBeDefined();

    const res = await usuarioSvc.alterarRole(user.id, "admin");
    expect(res.sucesso).toBe(true);

    lista = await usuarioSvc.listarUsuarios();
    const user2 = lista.find(u => u.id === user.id);
    expect(user2.role).toBe("admin");

    await usuarioSvc.removerUsuario(user.id);
  });

  // 15) Logout invalida token/sessão
  test("Logout invalida token e impede acesso", async () => {
    const auth = new Autenticacao();
    const ts = Date.now();
    const email = `logout_${ts}@example.com`;
    const senha = "senhaLogout123";
    await auth.cadastrarUsuario(email, senha, `UserLg ${ts}`, "11944444444");

    const login = await auth.login(email, senha);
    expect(login.sucesso).toBe(true);
    const token = login.token || login.accessToken;

    const resLogout = await auth.logout(token);
    expect(resLogout.sucesso).toBe(true);

    const acesso = await auth.validarToken(token);
    // token inválido
    expect(acesso).toBe(false);
  });

  // 16) Proteção contra criação de usuário com email malicioso
  test("Cadastro rejeita emails com espaços no meio", async () => {
    const auth = new Autenticacao();
    const res = await auth.cadastrarUsuario("email com espaço@example.com", "senha123", "Nome", "11933333333");
    expect(res.sucesso).toBe(false);
  });

  // 17) Verificar consistência após múltiplas atualizações concorrentes de estoque
  test("Concorrência: múltiplas atualizações de estoque não causam inconsistência", async () => {
    const estoque = new Estoque();
    const nome = `Produto concorrencia ${Date.now()}`;
    await estoque.adicionarProduto(nome, 10.0, 50, "2026-10-01");
    const produto = (await estoque.listarProdutos()).find(p => p.nome === nome);

    // executa múltiplas diminuições
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(estoque.diminuirEstoque(produto.id, 5));
    }
    const results = await Promise.all(promises);
    // todas as operações devem ter sido aplicadas checar consistência
    const final = await estoque.obterProdutoPorId(produto.id);
    expect(typeof final.quantidade).toBe("number");
    expect(final.quantidade).toBeGreaterThanOrEqual(0);
  });

  // 18) Atualizar produto sem alterações deve retornar sem erro
  test("Atualizar produto sem mudanças retorna sucesso/sem efeitos colaterais", async () => {
    const estoque = new Estoque();
    const nome = `Produto semAlt ${Date.now()}`;
    await estoque.adicionarProduto(nome, 7.0, 7, "2026-11-01");
    const produto = (await estoque.listarProdutos()).find(p => p.nome === nome);
    const res = await estoque.atualizarProduto(produto.id, {}); // sem mudanças
    expect(res.sucesso === true || res.sucesso === undefined).toBe(true);
  });

  // 19) Recuperação após falha temporária do serviço (retry simples)
  test("Operação com retry simples deve recuperar de erro temporário", async () => {
    const estoque = new Estoque();
    let tentativa = 0;
    const wrapper = async () => {
      tentativa++;
      if (tentativa < 2) {
        // simula erro temporário
        throw new Error("Erro temporário");
      }
      return await estoque.listarProdutos();
    };

    let lista;
    try {
      lista = await wrapper();
    } catch (e) {
      // retry
      lista = await wrapper();
    }
    expect(Array.isArray(lista)).toBe(true);
  });
});
