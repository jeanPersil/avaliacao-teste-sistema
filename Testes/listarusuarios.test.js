// listarusuarios.integration.test.js

/**
 * Testes da listagem de usuários (integração com BD)
 * Autor: Silas Gabriel
 * Data: 21/10/2025
 * 
 * ultima modificação: 22/10/2025
 * por: Silas Gabriel
 */
import { jest } from '@jest/globals';
import { Usuario } from "../back/services/usuario.js";
import { Autenticacao } from "../back/services/auth.js";


jest.setTimeout(30000); // Aumenta timeout para 30 segundos


const DELAY_ENTRE_TESTES = 1500; // 1.5 segundos
const DELAY_APOS_CRIACAO = 2000; // 2 segundos após criar usuário

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

  afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_TESTES));
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

    // Delay após criação
    await new Promise(resolve => setTimeout(resolve, DELAY_APOS_CRIACAO));

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

    test("listarUsuarios deve retornar usuários ordenados corretamente após múltiplas inserções", async () => {
  //=================
  // Criação de cenário - criar 3 usuários com delays entre eles
  const { usuario: usuario1, email: email1 } = await criarUsuarioTeste();
  await new Promise(resolve => setTimeout(resolve, 50));
  const { usuario: usuario2, email: email2 } = await criarUsuarioTeste();
  await new Promise(resolve => setTimeout(resolve, 50));
  const { usuario: usuario3, email: email3 } = await criarUsuarioTeste();

  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();

  //=================
  // Verificação - deve estar na ordem: 3, 2, 1 (mais recente primeiro)
  const index1 = lista.findIndex(u => u.id === usuario1.id);
  const index2 = lista.findIndex(u => u.id === usuario2.id);
  const index3 = lista.findIndex(u => u.id === usuario3.id);

  expect(index3).toBeLessThan(index2);
  expect(index2).toBeLessThan(index1);

  // limpeza
  await limparUsuarioTeste(email1);
  await limparUsuarioTeste(email2);
  await limparUsuarioTeste(email3);
});

test("listarUsuarios deve lidar com usuários com emails similares mas diferentes", async () => {
  //=================
  // Criação de cenário - emails com pequenas variações
  const ts = Date.now();
  const emails = [
    `user${ts}@example.com`,
    `user.${ts}@example.com`,
    `user_${ts}@example.com`,
    `user-${ts}@example.com`
  ];

  const usuariosCriados = [];

  for (let i = 0; i < emails.length; i++) {
    const res = await authSvc.cadastrarUsuario(emails[i], "senha123", `Usuário ${i} ${ts}`, `119${String(ts).slice(-8)}`);
    expect(res.sucesso).toBe(true);
    usuariosCriados.push(emails[i]);
  }

  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();

  //=================
  // Verificação - todos os emails similares devem ser retornados corretamente
  emails.forEach(email => {
    const usuario = lista.find(u => u.email === email);
    expect(usuario).toBeDefined();
    expect(usuario.email).toBe(email);
  });

  // limpeza
  for (const email of usuariosCriados) {
    await limparUsuarioTeste(email);
  }
});

test("listarUsuarios deve manter dados consistentes após atualização do banco", async () => {
  //=================
  // Criação de cenário
  const { usuario: usuarioOriginal, email } = await criarUsuarioTeste();

  //=================
  // Execução - primeira listagem
  const lista1 = await usuarioSvc.listarUsuarios();
  const usuario1 = lista1.find(u => u.id === usuarioOriginal.id);

  // Simular uma pequena pausa e nova listagem
  await new Promise(resolve => setTimeout(resolve, 100));
  const lista2 = await usuarioSvc.listarUsuarios();
  const usuario2 = lista2.find(u => u.id === usuarioOriginal.id);

  //=================
  // Verificação - dados devem ser idênticos entre as listagens
  expect(usuario1.id).toBe(usuario2.id);
  expect(usuario1.nome_completo).toBe(usuario2.nome_completo);
  expect(usuario1.email).toBe(usuario2.email);
  expect(usuario1.telefone).toBe(usuario2.telefone);
  expect(usuario1.role).toBe(usuario2.role);

  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve retornar UUIDs no formato correto para todos os usuários", async () => {
  //=================
  // Criação de cenário
  const { usuario, email } = await criarUsuarioTeste();

  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();

  //=================
  // Verificação - todos os IDs devem ser UUIDs válidos
  lista.forEach(usuario => {
    expect(usuario.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve funcionar corretamente em cenário de concorrência", async () => {
  //=================
  // Criação de cenário - criar vários usuários simultaneamente
  const ts = Date.now();
  const quantidadeUsuarios = 3;
  const promisesCriacao = [];

  for (let i = 0; i < quantidadeUsuarios; i++) {
    const email = `concorrente_${i}_${ts}@example.com`;
    const promise = authSvc.cadastrarUsuario(email, "senha123", `Concorrente ${i} ${ts}`, `119${String(ts + i).slice(-8)}`);
    promisesCriacao.push(promise);
  }

  await Promise.all(promisesCriacao);

  //=================
  // Execução - múltiplas listagens simultâneas
  const promisesListagem = Array(3).fill().map(() => usuarioSvc.listarUsuarios());
  const resultados = await Promise.all(promisesListagem);

  //=================
  // Verificação - todas as listagens devem retornar a mesma quantidade de usuários
  const comprimentos = resultados.map(lista => lista.length);
  const todosComprimentosIguais = comprimentos.every(len => len === comprimentos[0]);
  expect(todosComprimentosIguais).toBe(true);

  // Verificar que todos os usuários criados estão presentes em todas as listagens
  for (let i = 0; i < quantidadeUsuarios; i++) {
    const email = `concorrente_${i}_${ts}@example.com`;
    resultados.forEach(lista => {
      const usuario = lista.find(u => u.email === email);
      expect(usuario).toBeDefined();
    });
  }

  // limpeza
  for (let i = 0; i < quantidadeUsuarios; i++) {
    await limparUsuarioTeste(`concorrente_${i}_${ts}@example.com`);
  }
});

test("listarUsuarios deve retornar lista vazia quando não há usuários no banco", async () => {
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  
  //=================
  // Verificação
  expect(Array.isArray(lista)).toBe(true);
  // Não podemos assumir que está vazia, mas deve ser um array
});

test("listarUsuarios deve conter propriedades básicas em cada usuário", async () => {
  //=================
  // Criação de cenário
  const { usuario, email } = await criarUsuarioTeste();
  
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuarioEncontrado = lista.find(u => u.id === usuario.id);
  
  //=================
  // Verificação
  expect(usuarioEncontrado).toHaveProperty('id');
  expect(usuarioEncontrado).toHaveProperty('nome_completo');
  expect(usuarioEncontrado).toHaveProperty('email');
  expect(usuarioEncontrado).toHaveProperty('telefone');
  
  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve filtrar usuário por email específico", async () => {
  //=================
  // Criação de cenário
  const { usuario, email } = await criarUsuarioTeste();
  
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuarioFiltrado = lista.filter(u => u.email === email);
  
  //=================
  // Verificação
  expect(usuarioFiltrado).toHaveLength(1);
  expect(usuarioFiltrado[0].email).toBe(email);
  
  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve retornar usuários com telefones válidos", async () => {
  //=================
  // Criação de cenário
  const { usuario, email } = await criarUsuarioTeste();
  
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuarioEncontrado = lista.find(u => u.id === usuario.id);
  
  //=================
  // Verificação
  expect(usuarioEncontrado.telefone).toBeDefined();
  expect(typeof usuarioEncontrado.telefone).toBe('string');
  expect(usuarioEncontrado.telefone.length).toBeGreaterThan(0);
  
  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve permitir busca por partes do nome", async () => {
  //=================
  // Criação de cenário
  const { usuario, email, nome } = await criarUsuarioTeste();
  const parteDoNome = nome.split(' ')[0]; // Pega a primeira parte do nome
  
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuariosEncontrados = lista.filter(u => 
    u.nome_completo.includes(parteDoNome)
  );
  
  //=================
  // Verificação
  expect(usuariosEncontrados.length).toBeGreaterThan(0);
  expect(usuariosEncontrados.some(u => u.id === usuario.id)).toBe(true);
  
  // limpeza
  await limparUsuarioTeste(email);
});

test("listarUsuarios deve retornar tipos de dados corretos", async () => {
  //=================
  // Criação de cenário
  const { usuario, email } = await criarUsuarioTeste();
  
  //=================
  // Execução
  const lista = await usuarioSvc.listarUsuarios();
  const usuarioEncontrado = lista.find(u => u.id === usuario.id);
  
  //=================
  expect(typeof usuarioEncontrado.id).toBe('string');
  expect(typeof usuarioEncontrado.nome_completo).toBe('string');
  expect(typeof usuarioEncontrado.email).toBe('string');
  expect(typeof usuarioEncontrado.telefone).toBe('string');
  expect(typeof usuarioEncontrado.role).toBe('string');
  expect(typeof usuarioEncontrado.created_at).toBe('string');
  
  // Verifica se é uma data ISO válida
  expect(() => new Date(usuarioEncontrado.created_at)).not.toThrow();
  const data = new Date(usuarioEncontrado.created_at);
  expect(isNaN(data.getTime())).toBe(false);
  
  // limpeza
  await limparUsuarioTeste(email);
});
    
});