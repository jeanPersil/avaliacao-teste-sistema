
import { Estoque } from "../back/services/estoque.js";
import { Vendas } from "../back/services/vendas.js";
import { supabase } from "../banco/supabaseConfig.js";

class VendasController {
  constructor() {
    this.estoqueService = new Estoque();
    this.vendasService = new Vendas();

    this.selectProduto = document.getElementById("produto");
    this.formVenda = document.getElementById("formVenda");
    this.mensagem = document.getElementById("mensagem");
    this.inputQuantidade = document.getElementById("quantidadeVenda");
    this.btnVender = document.getElementById("btnVender");
    this.btnDiminuir = document.getElementById("btnDiminuir");
    this.btnAumentar = document.getElementById("btnAumentar");
    this.infoProduto = document.getElementById("infoProdutoVenda");
    this.precoUnitario = document.getElementById("precoUnitario");
    this.quantidadeResumo = document.getElementById("quantidadeResumo");
    this.totalCompra = document.getElementById("totalCompra");
    this.listaProdutosDestaque = document.getElementById("listaProdutosDestaque");
    
    this.produtosDisponiveis = [];
    this.produtoSelecionado = null;
    
    this.init();
  }

  init() {
    this.carregarProdutos();
    this.configurarEventos();
  }

  configurarEventos() {
    this.formVenda.addEventListener("submit", (e) => this.handleSubmitVenda(e));
    this.selectProduto.addEventListener("change", (e) => this.handleProdutoChange(e));
    this.inputQuantidade.addEventListener("input", () => this.atualizarResumo());
    this.btnDiminuir.addEventListener("click", () => this.alterarQuantidade(-1));
    this.btnAumentar.addEventListener("click", () => this.alterarQuantidade(1));
  }

  alterarQuantidade(valor) {
    let quantidadeAtual = parseInt(this.inputQuantidade.value) || 1;
    let novaQuantidade = quantidadeAtual + valor;
    
    if (novaQuantidade >= 1 && novaQuantidade <= 100) {
      this.inputQuantidade.value = novaQuantidade;
      this.atualizarResumo();
    }
  }

  async carregarProdutos() {
    this.selectProduto.innerHTML = '<option value="">Carregando produtos...</option>';
    this.selectProduto.disabled = true;

    try {
      const produtos = await this.estoqueService.listarProdutos();
      console.log("Produtos carregados:", produtos);
      this.produtosDisponiveis = produtos;

      this.selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
      
      produtos.forEach((produto) => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        option.setAttribute('data-estoque', produto.quantidade);
        option.setAttribute('data-preco', produto.preco);
        this.selectProduto.appendChild(option);
      });

      this.selectProduto.disabled = false;
      this.carregarProdutosDestaque(produtos);
      
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      this.selectProduto.innerHTML = '<option value="">Erro ao carregar produtos</option>';
      this.selectProduto.disabled = true;
    }
  }

  carregarProdutosDestaque(produtos) {
    this.listaProdutosDestaque.innerHTML = '';
    
    // Mostra apenas produtos com estoque
    const produtosComEstoque = produtos.filter(produto => produto.quantidade > 0)
                                      .slice(0, 6); // Limita a 6 produtos
    
    produtosComEstoque.forEach(produto => {
      const produtoElement = document.createElement('div');
      produtoElement.className = 'produto-destaque';
      produtoElement.innerHTML = `
        <div class="nome">${produto.nome}</div>
        <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
        <div class="estoque">Estoque: ${produto.quantidade}</div>
      `;
      
      produtoElement.addEventListener('click', () => {
        this.selectProduto.value = produto.id;
        this.handleProdutoChange({ target: this.selectProduto });
        this.inputQuantidade.focus();
      });
      
      this.listaProdutosDestaque.appendChild(produtoElement);
    });
  }

  handleProdutoChange(e) {
    const produtoId = e.target.value;
    this.produtoSelecionado = this.produtosDisponiveis.find(p => p.id == produtoId);
    
    if (this.produtoSelecionado) {
      this.mostrarInfoProduto(this.produtoSelecionado);
      this.atualizarResumo();
    } else {
      this.limparInfoProduto();
    }
  }

  mostrarInfoProduto(produto) {
    const estoqueStatus = produto.quantidade > 5 ? 'texto-sucesso' : 'texto-aviso';
    const estoqueTexto = produto.quantidade > 5 ? 'Em estoque' : 'Estoque baixo';
    
    this.infoProduto.innerHTML = `
      <div class="info-item">
        <span class="info-label">Preço:</span>
        <span class="info-value">R$ ${produto.preco.toFixed(2)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Estoque disponível:</span>
        <span class="info-value ${estoqueStatus}">${produto.quantidade} unidades</span>
      </div>
      <div class="info-item">
        <span class="info-label">Status:</span>
        <span class="info-value ${estoqueStatus}">${estoqueTexto}</span>
      </div>
    `;
    this.infoProduto.style.display = 'block';
  }

  limparInfoProduto() {
    this.infoProduto.innerHTML = '';
    this.infoProduto.style.display = 'none';
    this.precoUnitario.textContent = 'R$ 0,00';
    this.quantidadeResumo.textContent = '0';
    this.totalCompra.textContent = 'R$ 0,00';
  }

  atualizarResumo() {
    if (!this.produtoSelecionado) return;

    const quantidade = parseInt(this.inputQuantidade.value) || 0;
    const precoUnitario = this.produtoSelecionado.preco;
    const total = precoUnitario * quantidade;

    this.precoUnitario.textContent = `R$ ${precoUnitario.toFixed(2)}`;
    this.quantidadeResumo.textContent = quantidade;
    this.totalCompra.textContent = `R$ ${total.toFixed(2)}`;

    // Validação de estoque
    if (quantidade > this.produtoSelecionado.quantidade) {
      this.totalCompra.style.color = '#dc3545';
      this.btnVender.disabled = true;
      this.btnVender.title = 'Quantidade indisponível em estoque';
    } else {
      this.totalCompra.style.color = '#28a745';
      this.btnVender.disabled = false;
      this.btnVender.title = '';
    }
  }

  async handleSubmitVenda(e) {
    e.preventDefault();

    const produtoId = this.selectProduto.value;
    const quantidade = Number(this.inputQuantidade.value);

    if (!produtoId || quantidade <= 0 || isNaN(quantidade)) {
      this.mostrarMensagem("Selecione um produto e insira uma quantidade válida.", "aviso");
      return;
    }

    if (!this.produtoSelecionado) {
      this.mostrarMensagem("Produto não encontrado.", "erro");
      return;
    }

    if (quantidade > this.produtoSelecionado.quantidade) {
      this.mostrarMensagem("Quantidade indisponível em estoque.", "erro");
      return;
    }

    // Mostrar estado de carregamento
    this.btnVender.disabled = true;
    this.btnVender.classList.add('btn-carregando');
    this.btnVender.textContent = "Processando...";

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        this.mostrarMensagem("Usuário não autenticado. Faça login novamente.", "erro");
        return;
      }

      const resultado = await this.vendasService.registrarVenda(
        produtoId,
        quantidade,
        user.id
      );

      this.mostrarMensagem(
        resultado.mensagem,
        resultado.sucesso ? "sucesso" : "erro"
      );

      if (resultado.sucesso) {
        // Resetar formulário após sucesso
        await this.carregarProdutos();
        this.selectProduto.value = "";
        this.inputQuantidade.value = "1";
        this.limparInfoProduto();
        
        // Focar no select de produtos para próxima compra
        setTimeout(() => this.selectProduto.focus(), 500);
      }
    } catch (error) {
      console.error("Erro ao processar venda:", error);
      this.mostrarMensagem("Erro inesperado ao processar a venda.", "erro");
    } finally {
      // Restaurar estado normal do botão
      this.btnVender.disabled = false;
      this.btnVender.classList.remove('btn-carregando');
      this.btnVender.textContent = "Finalizar Compra";
    }
  }

  mostrarMensagem(texto, tipo = "sucesso") {
    this.mensagem.style.display = "block";
    this.mensagem.className = `mensagem-alerta ${tipo}`;
    this.mensagem.textContent = texto;
    
    // Rolagem suave para a mensagem
    this.mensagem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
      this.mensagem.style.display = "none";
    }, 5000);
  }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new VendasController();
});

// Adicionar estilos dinâmicos para texto
const style = document.createElement('style');
style.textContent = `
  .texto-sucesso { color: #28a745; font-weight: 600; }
  .texto-aviso { color: #ffc107; font-weight: 600; }
  .texto-erro { color: #dc3545; font-weight: 600; }
`;
document.head.appendChild(style);
