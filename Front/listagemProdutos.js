import { Estoque } from '../back/services/estoque.js';

class ListagemProdutos {
    constructor() {
        this.estoque = new Estoque();
        this.init();
    }

    init() {
        this.carregarProdutos();
        this.configurarEventos();
    }

    configurarEventos() {
        document.getElementById('atualizarLista').addEventListener('click', () => {
            this.carregarProdutos();
        });
        
        // Adiciona evento de duplo clique na linha para editar (opcional)
        document.getElementById('tabelaProdutos').addEventListener('dblclick', (e) => {
            const linha = e.target.closest('tr');
            if (linha && linha.getAttribute('data-id')) {
                this.editarProduto(linha.getAttribute('data-id'));
            }
        });
    }

    async carregarProdutos() {
        const tabela = document.getElementById('tabelaProdutos');
        
        try {
            tabela.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"></div><br>Carregando produtos...</td></tr>';
            
            console.log('Iniciando carregamento de produtos...');
            const produtos = await this.estoque.listarProdutos();
            console.log('Produtos carregados:', produtos);
            
            if (!produtos || produtos.length === 0) {
                tabela.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum produto cadastrado.</td></tr>';
                return;
            }

            this.renderizarProdutos(produtos);
            this.adicionarEventosRemover();

        } catch (erro) {
            console.error('Erro ao carregar produtos:', erro);
            tabela.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <strong>Erro ao carregar produtos:</strong><br>
                        ${erro.message}
                        <br><br>
                        <button class="btn btn-sm btn-warning" onclick="location.reload()">
                            🔄 Tentar Novamente
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    renderizarProdutos(produtos) {
        const tabela = document.getElementById('tabelaProdutos');
        tabela.innerHTML = '';
        
        produtos.forEach(produto => {
            const linha = document.createElement('tr');
            linha.setAttribute('data-id', produto.id);
            
            // Formata a data de validade
            let dataFormatada = 'N/A';
            let classeValidade = '';
            
            if (produto.validade) {
                const dataValidade = new Date(produto.validade);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                dataFormatada = dataValidade.toLocaleDateString('pt-BR');
                
                // Adiciona classe de alerta se a validade estiver próxima ou vencida
                const diffTime = dataValidade.getTime() - hoje.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    classeValidade = 'text-danger fw-bold';
                    dataFormatada += ' ⚠ Vencido';
                } else if (diffDays <= 7) {
                    classeValidade = 'text-warning fw-bold';
                    dataFormatada += ' ⚠ Próximo';
                }
            }
            
            // Verifica estoque baixo
            const classeEstoque = produto.quantidade <= 5 ? 'text-warning fw-bold' : '';
            const textoQuantidade = produto.quantidade <= 5 ? 
                `${produto.quantidade} ⚠ Baixo` : 
                produto.quantidade;
            
            linha.innerHTML = `
                <td class="fw-bold">#${produto.id}</td>
                <td>${produto.nome}</td>
                <td>R$ ${typeof produto.preco === 'number' ? produto.preco.toFixed(2) : '0.00'}</td>
                <td class="${classeEstoque}">${textoQuantidade}</td>
                <td class="${classeValidade}">${dataFormatada}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-remover" data-id="${produto.id}" title="Remover produto">
                        🗑 Remover
                    </button>
                </td>
            `;
            
            tabela.appendChild(linha);
        });
        
        // Adiciona contador de produtos
        this.atualizarContador(produtos.length);
    }

    atualizarContador(total) {
        const header = document.querySelector('.header-actions h2');
        if (header) {
            const contadorExistente = header.querySelector('.badge');
            if (contadorExistente) {
                contadorExistente.remove();
            }
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary ms-2';
            badge.textContent = total;
            header.appendChild(badge);
        }
    }

    adicionarEventosRemover() {
        const botoesRemover = document.querySelectorAll('.btn-remover');
        
        botoesRemover.forEach(botao => {
            botao.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.target.getAttribute('data-id');
                const nomeProduto = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
                await this.removerProduto(id, nomeProduto);
            });
        });
    }

    async removerProduto(id, nomeProduto) {
        if (!confirm(`Tem certeza que deseja remover o produto "${nomeProduto}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            console.log(`Removendo produto ID: ${id}`);
            const resultado = await this.estoque.removerProduto(id);
            
            if (resultado) {
                this.mostrarMensagemTemporaria(`Produto "${nomeProduto}" removido com sucesso!`, 'success');
                this.carregarProdutos();
            } else {
                this.mostrarMensagemTemporaria('Erro ao remover produto. Tente novamente.', 'error');
            }
        } catch (erro) {
            console.error('Erro ao remover produto:', erro);
            this.mostrarMensagemTemporaria('Erro ao remover produto: ' + erro.message, 'error');
        }
    }

    editarProduto(id) {
        // Função para futura implementação de edição
        console.log('Editar produto ID:', id);
        alert(`Funcionalidade de edição para o produto ${id} será implementada em breve!`);
    }

    mostrarMensagemTemporaria(mensagem, tipo) {
        // Cria uma mensagem temporária na parte superior
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        alerta.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alerta.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alerta);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 5000);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando listagem de produtos...');
    new ListagemProdutos();
});

// Também recarrega quando a página for focada novamente
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(() => {
            const listagem = document.querySelector('.listagem-produtos');
            if (listagem) {
                console.log('Página focada - recarregando produtos...');
                // Recarrega os produtos se a listagem estiver visível
                new ListagemProdutos().carregarProdutos();
            }
        }, 1000);
    }
});