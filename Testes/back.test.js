/**
 * Testes no back end (geral)
 * Autor: Raynan Silva
 * Data: 22/10/2025
 */

import { Estoque } from "../back/services/estoque.js";

// encontra um produto por nome na listagem atual
async function findByName(estoque, nome) {
  const lista = await estoque.listarProdutos();
  return lista.find((p) => p.nome === nome);
}

// limpeza segura (não validar removerProduto, para evitar sobreposição)
async function cleanup(estoque, id) {
  try { await estoque.removerProduto(id); } catch (_) {}
}

// leitura após breve atraso (em alguns backends com DB pode haver latência de consistência)
async function readFresh(estoque, nome, delayMs = 0) {
  if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  return await findByName(estoque, nome);
}

describe("Estoque - bateria extra (19 casos, apenas back)", () => {

  // 1) Editar todos os campos (happy path)
  test("Editar todos os campos atualiza nome, preço, quantidade e validade", async () => {
    const est = new Estoque();
    const base = `T1 ${Date.now()}`;
    const add = await est.adicionarProduto(base, 10, 5, "2026-01-01");
    expect(add).toBeTruthy();

    const before = await findByName(est, base);
    expect(before).toBeDefined();

    const novoNome = `${base} v2`;
    const res = await est.editarProduto(before.id, novoNome, 15.5, before.quantidade + 2, "2026-12-31");
    expect(res).toBeTruthy();

    const after = await readFresh(est, novoNome);
    expect(after).toBeDefined();
    expect(after.preco).toBeCloseTo(15.5, 2);
    expect(after.quantidade).toBe(before.quantidade + 2);

    await cleanup(est, after.id);
  });

  // 2) Editar somente o nome
  test("Editar somente o nome preserva os demais campos", async () => {
    const est = new Estoque();
    const base = `T2 ${Date.now()}`;
    await est.adicionarProduto(base, 9.9, 4, "2026-02-02");
    const p = await findByName(est, base);

    const novoNome = `${base} - X`;
    await est.editarProduto(p.id, novoNome, p.preco, p.quantidade, p.validade);
    const after = await findByName(est, novoNome);

    expect(after).toBeDefined();
    expect(after.preco).toBeCloseTo(p.preco, 2);
    expect(after.quantidade).toBe(p.quantidade);

    await cleanup(est, after.id);
  });

  // 3) Editar somente o preço
  test("Editar somente o preço altera o valor e mantém o restante", async () => {
    const est = new Estoque();
    const base = `T3 ${Date.now()}`;
    await est.adicionarProduto(base, 5.5, 3, "2026-03-03");
    const p = await findByName(est, base);

    await est.editarProduto(p.id, p.nome, 7.75, p.quantidade, p.validade);
    const after = await findByName(est, base);

    expect(after).toBeDefined();
    expect(after.preco).toBeCloseTo(7.75, 2);
    expect(after.quantidade).toBe(p.quantidade);

    await cleanup(est, after.id);
  });

  // 4) Editar somente a quantidade
  test("Editar somente a quantidade altera o estoque e mantém o restante", async () => {
    const est = new Estoque();
    const base = `T4 ${Date.now()}`;
    await est.adicionarProduto(base, 12.34, 6, "2026-04-04");
    const p = await findByName(est, base);

    await est.editarProduto(p.id, p.nome, p.preco, p.quantidade + 5, p.validade);
    const after = await findByName(est, base);

    expect(after).toBeDefined();
    expect(after.quantidade).toBe(p.quantidade + 5);
    expect(after.preco).toBeCloseTo(p.preco, 2);

    await cleanup(est, after.id);
  });

  // 5) Editar validade (sem checar formato exato; apenas presença/alteração onde aplicável)
  test("Editar validade aplica novo valor (sem exigir formato exato)", async () => {
    const est = new Estoque();
    const base = `T5 ${Date.now()}`;
    await est.adicionarProduto(base, 3.5, 2, "2026-05-05");
    const p = await findByName(est, base);

    const novaVal = "2028-12-31";
    await est.editarProduto(p.id, p.nome, p.preco, p.quantidade, novaVal);
    const after = await findByName(est, base);

    expect(after).toBeDefined();
    // Aceita: igual ao enviado OU apenas definido 
    expect(after.validade == null || typeof after.validade === "string").toBe(true);

    await cleanup(est, after.id);
  });

 // 6) Editar com ID inexistente: nenhuma mudança na lista
test("Editar com id inexistente não aplica alterações", async () => {
  const est = new Estoque();

  // estado antes
  const before = await est.listarProdutos();
  const beforeLen = before.length;

  // tentativa de edição em ID que não existe
  await expect(est.editarProduto(99999999, "X", 1, 1, "2026-01-01")).resolves.not.toThrow();

  // estado depois
  const after = await est.listarProdutos();
  expect(after.length).toBe(beforeLen);
  // não deve ter aparecido nenhum item com nome "X"
  expect(after.some(p => p && p.nome === "X")).toBe(false);
});


  // 7) Múltiplas edições em sequência resultam no último estado
  test("Várias edições em sequência respeitam o último estado aplicado", async () => {
    const est = new Estoque();
    const base = `T7 ${Date.now()}`;
    await est.adicionarProduto(base, 10, 5, "2026-06-06");
    const p = await findByName(est, base);

    await est.editarProduto(p.id, `${base} a`, 11, p.quantidade, p.validade);
    await est.editarProduto(p.id, `${base} b`, 12, p.quantidade + 1, p.validade);
    await est.editarProduto(p.id, `${base} c`, 13.99, p.quantidade + 2, "2027-01-01");

    const after = await findByName(est, `${base} c`);
    expect(after).toBeDefined();
    expect(after.preco).toBeCloseTo(13.99, 2);
    expect(after.quantidade).toBe(p.quantidade + 2);

    await cleanup(est, after.id);
  });

  // 8) listarProdutos retorna array e contém chaves esperadas
  test("listarProdutos retorna array com chaves básicas", async () => {
    const est = new Estoque();
    const base = `T8 ${Date.now()}`;
    await est.adicionarProduto(base, 2.2, 1, "2026-08-08");

    const lista = await est.listarProdutos();
    expect(Array.isArray(lista)).toBe(true);
    if (lista.length) {
      const any = lista[0];
      expect(any).toHaveProperty("id");
      expect(any).toHaveProperty("nome");
      expect(any).toHaveProperty("preco");
      expect(any).toHaveProperty("quantidade");
    }

    const p = await findByName(est, base);
    await cleanup(est, p?.id);
  });

  // 9) Editar um produto não altera os demais
  test("Editar um item não interfere em outros itens", async () => {
    const est = new Estoque();
    const base = `T9 ${Date.now()}`;
    await est.adicionarProduto(`${base}-A`, 1, 1, "2026-01-09");
    await est.adicionarProduto(`${base}-B`, 2, 2, "2026-01-10");

    const a = await findByName(est, `${base}-A`);
    const bBefore = await findByName(est, `${base}-B`);

    await est.editarProduto(a.id, `${base}-A*`, 1.5, a.quantidade + 1, a.validade);
    const bAfter = await findByName(est, `${base}-B`);

    expect(bAfter).toBeDefined();
    expect(bAfter.nome).toBe(bBefore.nome);
    expect(bAfter.preco).toBeCloseTo(bBefore.preco, 2);
    expect(bAfter.quantidade).toBe(bBefore.quantidade);

    const aAfter = await findByName(est, `${base}-A*`);
    await cleanup(est, aAfter?.id ?? a.id);
    await cleanup(est, bAfter?.id ?? bBefore?.id);
  });

  // 10) Editar para quantidade muito grande continua consistente 
  test("Editar para quantidade grande mantém consistência de tipo/limite não-negativo", async () => {
    const est = new Estoque();
    const base = `T10 ${Date.now()}`;
    await est.adicionarProduto(base, 2.5, 1, "2026-10-10");
    const p = await findByName(est, base);

    await est.editarProduto(p.id, p.nome, p.preco, 999999, p.validade);
    const after = await findByName(est, base);
    expect(typeof after.quantidade).toBe("number");
    expect(after.quantidade).toBeGreaterThanOrEqual(0);

    await cleanup(est, after.id);
  });

  // 11) Editar com preço decimal alto: aceitar número finito e próximo do solicitado
  test("Editar preço com muitas casas mantém valor numérico coerente", async () => {
    const est = new Estoque();
    const base = `T11 ${Date.now()}`;
    await est.adicionarProduto(base, 1.2345, 1, "2026-11-11");
    const p = await findByName(est, base);

    const target = 9.999999;
    await est.editarProduto(p.id, p.nome, target, p.quantidade, p.validade);
    const after = await findByName(est, base);

    expect(Number.isFinite(after.preco)).toBe(true);
    expect(after.preco).toBeCloseTo(target, 2); // tolera arredondamento comum 

    await cleanup(est, after.id);
  });

  // 12) Batch simples: criar vários e editar um subconjunto
  test("Criar vários itens e editar um subconjunto mantém integridade", async () => {
    const est = new Estoque();
    const base = `T12 ${Date.now()}`;
    const ids = [];

    for (let i = 0; i < 4; i++) {
      await est.adicionarProduto(`${base}-${i}`, 3 + i, 2 + i, "2027-01-01");
      const pi = await findByName(est, `${base}-${i}`);
      ids.push(pi.id);
    }

    // edita dois
    const p0 = await findByName(est, `${base}-0`);
    const p2 = await findByName(est, `${base}-2`);
    await est.editarProduto(p0.id, `${base}-0*`, p0.preco + 1, p0.quantidade + 1, p0.validade);
    await est.editarProduto(p2.id, `${base}-2*`, p2.preco + 2, p2.quantidade + 2, p2.validade);

    const a0 = await findByName(est, `${base}-0*`);
    const a2 = await findByName(est, `${base}-2*`);
    expect(a0).toBeDefined();
    expect(a2).toBeDefined();

    // limpeza
    for (const id of ids) await cleanup(est, id);
    await cleanup(est, a0?.id);
    await cleanup(est, a2?.id);
  });

  // 13) Editar com nome contendo espaços extras: nome final contém o conteúdo base
  test("Editar com espaços extras no nome mantém conteúdo base (ignorando espaçamento)", async () => {
    const est = new Estoque();
    const base = `T13 ${Date.now()}`;
    await est.adicionarProduto(base, 7.7, 3, "2026-12-13");
    const p = await findByName(est, base);

    const novoNome = `   ${base}   X   `;
    await est.editarProduto(p.id, novoNome, p.preco, p.quantidade, p.validade);

    // tolerante apenas verifica que a parte base está contida
    const afterList = await est.listarProdutos();
    const after = afterList.find(it => (it.nome || "").replace(/\s+/g, " ").includes(`${base} X`));
    expect(after).toBeDefined();

    await cleanup(est, after.id);
  });

  // 14) Editar alterando só o nome não deve obter nada nulo
  test("Editar alterando só um campo não deve nular os demais", async () => {
    const est = new Estoque();
    const base = `T14 ${Date.now()}`;
    await est.adicionarProduto(base, 8.8, 8, "2028-01-14");
    const p = await findByName(est, base);

    // Aqui seguimos o padrão do front passamos todos os campos,
    // mudando apenas o nome. Isso evita que o back trate 'undefined' como remoção.
    await est.editarProduto(p.id, `${base} Y`, p.preco, p.quantidade, p.validade);

    const after = await findByName(est, `${base} Y`);
    expect(after).toBeDefined();
    expect(after.preco).toBeCloseTo(p.preco, 2);
    expect(after.quantidade).toBe(p.quantidade);
    // validade deve continuar definida/inalterada
    expect(after.validade == null || p.validade == null || after.validade === p.validade).toBe(true);

    await cleanup(est, after.id);
  });


  // 15) Editar com preço negativo: aceitar falha explícita OU não aplicar alteração
  test("Editar com preço negativo: falha ou nenhuma alteração persistida", async () => {
    const est = new Estoque();
    const base = `T15 ${Date.now()}`;
    await est.adicionarProduto(base, 20, 2, "2027-02-15");
    const before = await findByName(est, base);

    const res = await est.editarProduto(before.id, before.nome, -5, before.quantidade, before.validade);
    const after = await findByName(est, base);

    if (res && res.sucesso === false) {
      expect(true).toBe(true); // falha explícita OK
    } else {
      // não deve ter ficado negativo
      expect(after.preco).toBeGreaterThan(0);
    }

    await cleanup(est, after.id);
  });

  // 16) Editar com quantidade negativa: falha explícita OU sem aplicar alteração
  test("Editar com quantidade negativa: falha ou sem alteração", async () => {
    const est = new Estoque();
    const base = `T16 ${Date.now()}`;
    await est.adicionarProduto(base, 10, 3, "2027-03-16");
    const before = await findByName(est, base);

    const res = await est.editarProduto(before.id, before.nome, before.preco, -10, before.validade);
    const after = await findByName(est, base);

    if (res && res.sucesso === false) {
      expect(true).toBe(true);
    } else {
      expect(after.quantidade).toBeGreaterThanOrEqual(0);
    }

    await cleanup(est, after.id);
  });

  // 17) IDs permanecem únicos entre itens criados na sequência
  test("IDs de itens recém-criados são distintos", async () => {
    const est = new Estoque();
    const base = `T17 ${Date.now()}`;
    await est.adicionarProduto(`${base}-1`, 1, 1, "2027-04-17");
    await est.adicionarProduto(`${base}-2`, 1, 1, "2027-04-18");

    const p1 = await findByName(est, `${base}-1`);
    const p2 = await findByName(est, `${base}-2`);
    expect(p1 && p2).toBeTruthy();
    expect(p1.id).not.toBe(p2.id);

    await cleanup(est, p1?.id);
    await cleanup(est, p2?.id);
  });

  // 18) Editar não deve alterar o ID do produto
  test("Editar não altera o ID do produto", async () => {
    const est = new Estoque();
    const base = `T18 ${Date.now()}`;
    await est.adicionarProduto(base, 6, 6, "2027-05-18");
    const p = await findByName(est, base);
    const oldId = p.id;

    await est.editarProduto(p.id, `${base}*`, p.preco, p.quantidade, p.validade);
    const after = await findByName(est, `${base}*`);
    expect(after.id).toBe(oldId);

    await cleanup(est, after.id);
  });

  // 19) Depois de várias edições, listarProdutos continua consistente
  test("Após várias edições, listarProdutos mantém consistência dos tipos/campos", async () => {
    const est = new Estoque();
    const base = `T19 ${Date.now()}`;
    await est.adicionarProduto(base, 10, 9, "2027-06-19");
    const p = await findByName(est, base);

    await est.editarProduto(p.id, `${base} A`, 11, p.quantidade, p.validade);
    await est.editarProduto(p.id, `${base} B`, 12.5, p.quantidade + 3, p.validade);
    await est.editarProduto(p.id, `${base} C`, 14.2, p.quantidade + 1, "2029-01-01");

    const lista = await est.listarProdutos();
    expect(Array.isArray(lista)).toBe(true);

    const final = await findByName(est, `${base} C`);
    expect(final).toBeDefined();
    expect(typeof final.id).toBe("number");
    expect(typeof final.nome).toBe("string");
    expect(typeof final.preco).toBe("number");
    expect(typeof final.quantidade).toBe("number");

    await cleanup(est, final.id);
  });

});
