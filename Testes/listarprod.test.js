// listagemProdutos.test.js

/**
 * Testes da listagem de produtos
 * Autor: Iwin Lima
 * Data: 01/10/2025
 */

/**
 * @jest-environment jsdom
 */


import { jest } from '@jest/globals';

// --- MOCKS ---

// Funções mockadas para simular os métodos da classe Estoque (camada de serviço/backend)
const mockListarProdutos = jest.fn();
const mockExcluirProduto = jest.fn(); 

// 1. Mock do Módulo Estoque
// Substitui a dependência real do Estoque por uma versão controlada pelo Jest.
// Isso garante que os testes se concentrem apenas na lógica da ListagemProdutos, 

await jest.unstable_mockModule('../back/services/estoque.js', () => ({
    Estoque: jest.fn(() => ({
        
        listarProdutos: mockListarProdutos,
    })),
}));

// --- ISOLAMENTO DA CLASSE ---

// Armazena a função original do addEventListener
const originalAddEventListener = document.addEventListener;


document.addEventListener = jest.fn((event, callback) => {
    
    if (event !== 'DOMContentLoaded') {
        originalAddEventListener(event, callback);
    }
});


// Importa a classe principal APÓS o mock e o isolamento do addEventListener
const { ListagemProdutos } = await import('../Front/listagemProdutos.js');

// Restaura o addEventListener original após a importação 
// para que os testes de eventos (como o do botão 'Atualizar Lista') funcionem.
document.addEventListener = originalAddEventListener;


// Configura o Jest para usar timers simulados (necessário para testar o setTimeout)
// Isso permite controlar o tempo e testar funções assíncronas baseadas em tempo (e.g., remoção de alertas).
jest.useFakeTimers();

describe('ListagemProdutos', () => {
    
    // Dados de teste usados para simular o retorno da API
    const PRODUTOS_MOCK = [
        { id: 10, nome: 'Arroz', preco: 25.00, quantidade: 50, validade: '2025-01-01' },
        { id: 20, nome: 'Feijão', preco: 12.00, quantidade: 30, validade: '2025-06-30' },
    ];

    // Configura o ambiente DOM antes de CADA teste
    beforeEach(async () => {
        // Limpa a contagem de todas as funções mockadas
        jest.clearAllMocks();

        // 2. Simulação do DOM: Cria a estrutura HTML que a classe espera encontrar 
        // (incluindo IDs necessários como 'atualizarLista' e 'tabelaProdutos').
        document.body.innerHTML = `
            <div class="container">
                <button id="atualizarLista">Atualizar Lista</button>
                <button id="btnVoltarCadastro"></button>
                <table class="table">
                    <tbody id="tabelaProdutos"></tbody>
                </table>
            </div>
        `;
        
        // Configura o retorno padrão do mock para os testes que esperam dados.
        mockListarProdutos.mockResolvedValue(PRODUTOS_MOCK);
    });

    // ----------------------------------------------------------------------
    // Testes de Carregamento e Inicialização 
    // ----------------------------------------------------------------------

    /**
     * Objetivo: Garantir que a lógica de inicialização da classe chame o método 
     * de busca de produtos no backend exatamente uma vez.
     */
    test('O construtor deve instanciar Estoque e chamar carregarProdutos apenas 1 vez', async () => {
        
        expect(mockListarProdutos).toHaveBeenCalledTimes(0); 

        
        const listagem = new ListagemProdutos(); 

        
        await Promise.resolve();
        await Promise.resolve();

        // Verifica se houve exatamente UMA chamada
        expect(mockListarProdutos).toHaveBeenCalledTimes(1);
    });

    /**
     * Objetivo: Verificar se, ao receber dados válidos, o método carregarProdutos
     * renderiza as linhas corretas na tabela HTML.
     */
    test('carregarProdutos deve popular a tabela com os produtos mockados', async () => {
        const listagem = new ListagemProdutos(); 
        await listagem.carregarProdutos(); 
        
        const tabela = document.getElementById('tabelaProdutos');
        
        // Espera que o número de linhas criadas seja igual ao número de produtos mockados
        expect(tabela.children.length).toBe(PRODUTOS_MOCK.length); 
        
        // Verifica se o ID e o Nome do primeiro produto estão presentes no HTML
        expect(tabela.children[0].outerHTML).toContain('data-id="10"');
        expect(tabela.children[0].innerHTML).toContain('Arroz');
    });
    
    /**
     * Objetivo: Testar o 'estado vazio'. Se o backend não retornar produtos,
     * a tabela deve exibir a mensagem de "Nenhum produto cadastrado".
     */
    test('carregarProdutos deve exibir "Nenhum produto" se a lista for vazia', async () => {
        
        mockListarProdutos.mockResolvedValue([]);
        
        const listagem = new ListagemProdutos();
        await listagem.carregarProdutos();
        
        const tabela = document.getElementById('tabelaProdutos');
        
        // Espera apenas 1 linha (a linha da mensagem de erro)
        expect(tabela.children.length).toBe(1); 
        expect(tabela.children[0].innerHTML).toContain('Nenhum produto cadastrado');
    });

    // ----------------------------------------------------------------------
    // Testes de Interatividade (Eventos e Utilidades)
    // ----------------------------------------------------------------------

    /**
     * Objetivo: Simular o clique no botão 'Atualizar Lista' e verificar se o 
     * método carregarProdutos é chamado novamente.
     */
    test('O botão "Atualizar Lista" deve recarregar os produtos ao ser clicado', async () => {
        const listagem = new ListagemProdutos();
        await listagem.carregarProdutos(); 
        
        
        mockListarProdutos.mockClear(); 
        
        const botaoAtualizar = document.getElementById('atualizarLista');
        
        // Simula o evento de clique
        botaoAtualizar.click();
        
        // Espera que a listagem de produtos tenha sido chamada novamente (1 vez)
        expect(mockListarProdutos).toHaveBeenCalledTimes(1);
    });

    /**
     * Objetivo: Testar a função utilitária de feedback visual.
     * Verifica se a mensagem aparece no DOM e desaparece após o tempo correto (5s).
     */
    test('mostrarMensagemTemporaria deve exibir e remover a mensagem após 5 segundos', () => {
        const listagem = new ListagemProdutos();
        const mensagem = "Teste de Mensagem";
        listagem.mostrarMensagemTemporaria(mensagem, 'success'); 

        // 1. Verifica se o elemento de alerta foi injetado no DOM
        let alerta = document.querySelector('.alert');
        expect(alerta).not.toBeNull();
        
        // 2. Avança o timer do Jest para simular a passagem de 5000ms
        jest.advanceTimersByTime(5000); 

        // 3. Verifica se o elemento foi removido do DOM pelo setTimeout
        alerta = document.querySelector('.alert');
        expect(alerta).toBeNull();
    });
});