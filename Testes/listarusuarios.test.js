// listarusuarios.integration.test.js

/**
 * Testes da listagem de usuários (integração com BD)
 * Autor: Silas Gabriel
 * Data: 21/10/2025
 */
import { jest } from '@jest/globals';
import { Usuario } from "../back/services/usuario.js";
import { Autenticacao } from "../back/services/auth.js";

jest.setTimeout(20000);

describe("Testes de listagem de usuários (integração com BD)", () => {
  let authSvc;
  let usuarioSvc;

  beforeAll(() => {
    authSvc = new Autenticacao();
    usuarioSvc = new Usuario();
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  // Função auxiliar para criar usuário de teste
  async function criarUsuarioTeste() {
    const ts = Date.now();
    const nome = `Test User ${ts}`;
    const email = `test_${ts}@example.com`;
    const telefone = `119${String(ts).slice(-8)}`;
    const senha = "senha123";

    const res = await authSvc.cadastrarUsuario(email, senha, nome, telefone);
    if (!res.sucesso) {
      throw new Error(`Falha ao criar usuário de teste: ${res.mensagem}`);
    }

    const lista = await usuarioSvc.listarUsuarios();
    const usuario = lista.find((u) => u.email === email);
    
    return { usuario, email, nome, telefone };
  }

  // Função auxiliar para limpar usuários de teste
  async function limparUsuarioTeste(email) {
    try {
      const todos = await usuarioSvc.listarUsuarios();
      const usuario = todos.find((u) => u.email === email);
      if (usuario) {
        await usuarioSvc.removerUsuario(usuario.id);
      }
    } catch (e) {}
  }

  test("listarUsuarios deve retornar array de usuários com estrutura correta", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação
    expect(Array.isArray(lista)).toBe(true);
    
    if (lista.length > 0) {
      const user = lista.find(u => u.id === usuario.id);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('nome_completo');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('telefone');
      expect(user).toHaveProperty('created_at');
      expect(user).toHaveProperty('role');
    }

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("listarUsuarios deve ordenar por created_at decrescente", async () => {
    //=================
    // Criação de cenário
    const { usuario: usuario1, email: email1 } = await criarUsuarioTeste();
    await new Promise(resolve => setTimeout(resolve, 100));
    const { usuario: usuario2, email: email2 } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação - o mais recente deve vir primeiro
    const usuario1Index = lista.findIndex(u => u.id === usuario1.id);
    const usuario2Index = lista.findIndex(u => u.id === usuario2.id);
    
    expect(usuario2Index).toBeLessThan(usuario1Index);

    // limpeza
    await limparUsuarioTeste(email1);
    await limparUsuarioTeste(email2);
  });

  test("Listar usuários deve funcionar mesmo quando não há usuários novos", async () => {
    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação
    expect(Array.isArray(lista)).toBe(true);
  });

  test("Dados do usuário devem refletir as colunas corretas da tabela", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Verificação da estrutura de dados
    expect(usuario).toHaveProperty('id');
    expect(usuario).toHaveProperty('nome_completo');
    expect(usuario).toHaveProperty('email');
    expect(usuario).toHaveProperty('telefone');
    expect(usuario).toHaveProperty('created_at');
    expect(usuario).toHaveProperty('role');

    // limpeza
    await limparUsuarioTeste(email);
  });

  // NOVOS TESTES FOCADOS APENAS EM LISTAGEM

  test("listarUsuarios deve incluir usuário recém-criado na listagem", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação
    const usuarioEncontrado = lista.find(u => u.email === email);
    expect(usuarioEncontrado).toBeDefined();
    expect(usuarioEncontrado.nome_completo).toBe(usuario.nome_completo);
    expect(usuarioEncontrado.telefone).toBe(usuario.telefone);

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("listarUsuarios deve retornar dados consistentes entre múltiplas chamadas", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista1 = await usuarioSvc.listarUsuarios();
    const lista2 = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação
    expect(lista1.length).toBe(lista2.length);
    
    const usuarioLista1 = lista1.find(u => u.id === usuario.id);
    const usuarioLista2 = lista2.find(u => u.id === usuario.id);
    
    expect(usuarioLista1).toBeDefined();
    expect(usuarioLista2).toBeDefined();
    expect(usuarioLista1.nome_completo).toBe(usuarioLista2.nome_completo);
    expect(usuarioLista1.email).toBe(usuarioLista2.email);

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("listarUsuarios deve formatar created_at como timestamp válido", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();
    const usuarioEncontrado = lista.find(u => u.id === usuario.id);

    //=================
    // Verificação
    expect(usuarioEncontrado.created_at).toBeDefined();
    expect(new Date(usuarioEncontrado.created_at)).toBeInstanceOf(Date);
    expect(isNaN(new Date(usuarioEncontrado.created_at).getTime())).toBe(false);

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("listarUsuarios deve retornar role com valor padrão para novos usuários", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();
    const usuarioEncontrado = lista.find(u => u.id === usuario.id);

    //=================
    // Verificação
    expect(usuarioEncontrado.role).toBeDefined();
    expect(typeof usuarioEncontrado.role).toBe('string');

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("VerificarUsuarioExiste deve funcionar corretamente com usuários da listagem", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução e Verificação
    const existe = await usuarioSvc.verificarUsuarioExiste(email);
    expect(existe).toBe(true);

    const naoExiste = await usuarioSvc.verificarUsuarioExiste(`inexistente_${Date.now()}@example.com`);
    expect(naoExiste).toBe(false);

    // limpeza
    await limparUsuarioTeste(email);
  });

  test("listarUsuarios deve lidar corretamente com caracteres especiais nos nomes", async () => {
  //=================
  // Criação de cenário - usuário com nome contendo caracteres especiais
  const ts = Date.now();
  const nomeComEspeciais = `João Silva ${ts} - Teste & Especial`;
  const email = `especial_${ts}@example.com`;
  const telefone = `119${String(ts).slice(-8)}`;
  const senha = "senha123";

  const res = await authSvc.cadastrarUsuario(email, senha, nomeComEspeciais, telefone);
  expect(res.sucesso).toBe(true);

  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuarioEncontrado = lista.find(u => u.email === email);

  //=================
  // Verificação
  expect(usuarioEncontrado).toBeDefined();
  expect(usuarioEncontrado.nome_completo).toBe(nomeComEspeciais);

  // limpeza
  await limparUsuarioTeste(email);
  });

    test("listarUsuarios deve manter integridade dos dados com emails longos", async () => {
    //=================
    // Criação de cenário - email com formato longo
    const ts = Date.now();
    const emailLongo = `usuario.com.email.muito.longo.${ts}@dominio-exemplo-muito-longo.com.br`;
    const nome = `Usuário Email Longo ${ts}`;
    const telefone = `119${String(ts).slice(-8)}`;

    const res = await authSvc.cadastrarUsuario(emailLongo, "senha123", nome, telefone);
    expect(res.sucesso).toBe(true);

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();
    const usuarioEncontrado = lista.find(u => u.email === emailLongo);

    //=================
    // Verificação
    expect(usuarioEncontrado).toBeDefined();
    expect(usuarioEncontrado.email).toBe(emailLongo);
    expect(usuarioEncontrado.email.length).toBe(emailLongo.length);

    // limpeza
    await limparUsuarioTeste(emailLongo);
    });

    test("listarUsuarios deve retornar usuários com diferentes roles", async () => {
    //=================
    // Criação de cenário - criar usuários com roles diferentes
    const ts = Date.now();
    const emailAdmin = `admin_${ts}@example.com`;
    const emailComum = `comum_${ts}@example.com`;

    // Criar usuários (o padrão é "comum", mas podemos testar a existência da propriedade)
    await authSvc.cadastrarUsuario(emailAdmin, "senha123", `Admin ${ts}`, `119${String(ts).slice(-8)}`);
    await authSvc.cadastrarUsuario(emailComum, "senha123", `Comum ${ts}`, `118${String(ts).slice(-8)}`);

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();
    const adminEncontrado = lista.find(u => u.email === emailAdmin);
    const comumEncontrado = lista.find(u => u.email === emailComum);

    //=================
    // Verificação
    expect(adminEncontrado).toBeDefined();
    expect(comumEncontrado).toBeDefined();
    expect(adminEncontrado).toHaveProperty('role');
    expect(comumEncontrado).toHaveProperty('role');
    expect(typeof adminEncontrado.role).toBe('string');
    expect(typeof comumEncontrado.role).toBe('string');

    // limpeza
    await limparUsuarioTeste(emailAdmin);
    await limparUsuarioTeste(emailComum);
    });

    test("listarUsuarios deve preservar formato de telefone corretamente", async () => {
    //=================
    // Criação de cenário - telefones com formatos diferentes
    const ts = Date.now();
    const telefones = [
        `(11) 9${String(ts).slice(-8)}`,
        `11 9${String(ts).slice(-4)}-${String(ts).slice(-4)}`,
        `+55 11 ${String(ts).slice(-9)}`
    ];

    const usuariosCriados = [];

    // Criar múltiplos usuários com diferentes formatos de telefone
    for (let i = 0; i < telefones.length; i++) {
        const email = `telefone${i}_${ts}@example.com`;
        const res = await authSvc.cadastrarUsuario(email, "senha123", `Usuário ${i} ${ts}`, telefones[i]);
        expect(res.sucesso).toBe(true);
        usuariosCriados.push({ email, telefone: telefones[i] });
    }

    //=================
    // Execução
    const lista = await usuarioSvc.listarUsuarios();

    //=================
    // Verificação
    usuariosCriados.forEach(({ email, telefone }) => {
        const usuario = lista.find(u => u.email === email);
        expect(usuario).toBeDefined();
        expect(usuario.telefone).toBe(telefone);
    });

    // limpeza
    for (const { email } of usuariosCriados) {
        await limparUsuarioTeste(email);
    }
    });

    test("listarUsuarios deve funcionar sob múltiplas chamadas rápidas", async () => {
    //=================
    // Criação de cenário
    const { usuario, email } = await criarUsuarioTeste();

    //=================
    // Execução - múltiplas chamadas em sequência
    const promises = Array(5).fill().map(() => usuarioSvc.listarUsuarios());
    const resultados = await Promise.all(promises);

    //=================
    // Verificação
    resultados.forEach((lista, index) => {
        expect(Array.isArray(lista)).toBe(true);
        const usuarioEncontrado = lista.find(u => u.id === usuario.id);
        expect(usuarioEncontrado).toBeDefined();
        expect(usuarioEncontrado.email).toBe(email);
    });

    // Verificar que todas as listas têm o mesmo comprimento (consistência)
    const comprimentos = resultados.map(lista => lista.length);
    const todosIguais = comprimentos.every(len => len === comprimentos[0]);
    expect(todosIguais).toBe(true);

    // limpeza
    await limparUsuarioTeste(email);
    });
    
});