import { listarProduto, realizarVenda } from "./api.js";

class VendasController {
  constructor() {
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
    this.listaProdutosDestaque = document.getElementById(
      "listaProdutosDestaque"
    );

    this.selectMetodoPagamento = document.getElementById("metodoPagamento");
    this.selectParcelas = document.getElementById("parcelas");
    this.containerParcelas = document.getElementById("containerParcelas");
    this.valorParcela = document.getElementById("valorParcela");

    this.produtosDisponiveis = [];
    this.produtoSelecionado = null;
    this.totalComJurosCalculado = 0;

    this.init();
  }

  init() {
    this.carregarProdutos();
    this.configurarEventos();
  }

  configurarEventos() {
    this.formVenda.addEventListener("submit", (e) => this.handleSubmitVenda(e));
    this.selectProduto.addEventListener("change", (e) =>
      this.handleProdutoChange(e)
    );
    this.inputQuantidade.addEventListener("input", () =>
      this.atualizarResumo()
    );
    this.btnDiminuir.addEventListener("click", () =>
      this.alterarQuantidade(-1)
    );
    this.btnAumentar.addEventListener("click", () => this.alterarQuantidade(1));

    // Eventos de pagamento
    this.selectMetodoPagamento.addEventListener("change", () =>
      this.handleMetodoPagamentoChange()
    );
    this.selectParcelas.addEventListener("change", () =>
      this.calcularParcelas()
    );
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
    this.selectProduto.innerHTML =
      '<option value="">Carregando produtos...</option>';
    this.selectProduto.disabled = true;

    try {
      const resposta = await listarProduto(1, 100);

      if (resposta.error) {
        throw new Error(resposta.error);
      }

      const produtos = resposta.produtos || [];

      console.log("Produtos carregados:", produtos);
      this.produtosDisponiveis = produtos;

      this.selectProduto.innerHTML =
        '<option value="">Selecione um produto</option>';

      const produtosDisponiveis = produtos.filter((p) => p.quantidade > 0);

      if (produtosDisponiveis.length === 0) {
        this.selectProduto.innerHTML =
          '<option value="">Nenhum produto disponível</option>';
        this.selectProduto.disabled = true;
        this.mostrarMensagem(
          "Não há produtos disponíveis em estoque no momento.",
          "aviso"
        );
        return;
      }

      produtosDisponiveis.forEach((produto) => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        option.setAttribute("data-estoque", produto.quantidade);
        option.setAttribute("data-preco", produto.preco);
        this.selectProduto.appendChild(option);
      });

      this.selectProduto.disabled = false;
      this.carregarProdutosDestaque(produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      this.selectProduto.innerHTML =
        '<option value="">Erro ao carregar produtos</option>';
      this.selectProduto.disabled = true;
      this.mostrarMensagem(error.message || "Erro de conexão", "erro");
    }
  }

  carregarProdutosDestaque(produtos) {
    this.listaProdutosDestaque.innerHTML = "";

    const produtosComEstoque = produtos
      .filter((produto) => produto.quantidade > 0)
      .slice(0, 6);

    if (produtosComEstoque.length === 0) {
      this.listaProdutosDestaque.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #6c757d; width: 100%;">
          <p style="font-size: 16px; margin: 0;">📦 Nenhum produto disponível</p>
          <p style="font-size: 14px; margin-top: 8px;">Aguarde a reposição do estoque</p>
        </div>
      `;
      return;
    }

    produtosComEstoque.forEach((produto) => {
      const produtoElement = document.createElement("div");
      produtoElement.className = "produto-destaque";
      produtoElement.innerHTML = `
        <div class="nome">${produto.nome}</div>
        <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
        <div class="estoque">Estoque: ${produto.quantidade}</div>
      `;

      produtoElement.addEventListener("click", () => {
        this.selectProduto.value = produto.id;
        this.handleProdutoChange({ target: this.selectProduto });
        this.inputQuantidade.focus();
      });

      this.listaProdutosDestaque.appendChild(produtoElement);
    });
  }

  handleProdutoChange(e) {
    const produtoId = e.target.value;
    this.produtoSelecionado = this.produtosDisponiveis.find(
      (p) => p.id == produtoId
    );

    if (this.produtoSelecionado) {
      this.inputQuantidade.max = this.produtoSelecionado.quantidade;

      if (
        parseInt(this.inputQuantidade.value) >
        this.produtoSelecionado.quantidade
      ) {
        this.inputQuantidade.value = 1;
      }

      this.mostrarInfoProduto(this.produtoSelecionado);
      this.atualizarResumo();
    } else {
      this.limparInfoProduto();
    }
  }

  mostrarInfoProduto(produto) {
    const estoqueStatus =
      produto.quantidade > 5 ? "texto-sucesso" : "texto-aviso";
    const estoqueTexto =
      produto.quantidade > 5 ? "Em estoque" : "Estoque baixo";

    this.infoProduto.innerHTML = `
      <div class="info-item">
        <span class="info-label">Preço:</span>
        <span class="info-value">R$ ${produto.preco.toFixed(2)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Estoque disponível:</span>
        <span class="info-value ${estoqueStatus}">${
      produto.quantidade
    } unidades</span>
      </div>
      <div class="info-item">
        <span class="info-label">Status:</span>
        <span class="info-value ${estoqueStatus}">${estoqueTexto}</span>
      </div>
    `;
    this.infoProduto.style.display = "block";
  }

  limparInfoProduto() {
    this.infoProduto.innerHTML = "";
    this.infoProduto.style.display = "none";
    this.precoUnitario.textContent = "R$ 0,00";
    this.quantidadeResumo.textContent = "0";
    this.totalCompra.textContent = "R$ 0,00";
    this.containerParcelas.style.display = "none";
  }

  handleMetodoPagamentoChange() {
    const metodo = this.selectMetodoPagamento.value;

    if (metodo === "credito") {
      this.containerParcelas.style.display = "block";
      this.calcularParcelas();
    } else {
      this.containerParcelas.style.display = "none";
      this.atualizarResumo();
    }
  }

  calcularParcelas() {
    if (!this.produtoSelecionado) return;

    const quantidade = parseInt(this.inputQuantidade.value) || 0;
    const totalBase = this.produtoSelecionado.preco * quantidade;
    const numeroParcelas = parseInt(this.selectParcelas.value);

    const tabelaJuros = {
      1: 0,
      2: 1.99,
      3: 2.49,
      4: 2.99,
      5: 3.49,
      6: 3.99,
      7: 4.49,
      8: 4.99,
      9: 5.49,
      10: 5.99,
      11: 6.49,
      12: 6.99,
    };

    const taxaJuros = tabelaJuros[numeroParcelas] || 0;
    const totalComJuros = totalBase * (1 + taxaJuros / 100);
    const valorParcela = totalComJuros / numeroParcelas;

    this.totalComJurosCalculado = totalComJuros;

    this.valorParcela.textContent = `R$ ${valorParcela.toFixed(2)}`;

    // Atualiza o total principal
    this.totalCompra.textContent = `R$ ${totalComJuros.toFixed(2)}`;

    s;
    if (taxaJuros > 0) {
      this.valorParcela.style.color = "#dc3545";
      this.valorParcela.style.fontWeight = "bold";
      this.totalCompra.style.color = "#28a745";
    } else {
      this.valorParcela.style.color = "#28a745";
      this.valorParcela.style.fontWeight = "600";
      this.totalCompra.style.color = "#28a745";
    }
  }

  atualizarResumo() {
    if (!this.produtoSelecionado) return;

    let quantidade = parseInt(this.inputQuantidade.value) || 0;
    const estoqueDisponivel = this.produtoSelecionado.quantidade;

    if (quantidade > estoqueDisponivel) {
      quantidade = estoqueDisponivel;
      this.inputQuantidade.value = estoqueDisponivel;
      this.mostrarMensagem(
        `Quantidade ajustada para o máximo disponível (${estoqueDisponivel})`,
        "aviso"
      );
    }

    // Impede números negativos ou zero durante a digitação
    if (quantidade < 1) {
      quantidade = estoqueDisponivel;
      this.inputQuantidade.value = 1;
      this.mostrarMensagem(`Quantidade ajustada para o minimo: 1`, "aviso");
    }

    const precoUnitario = this.produtoSelecionado.preco;
    const totalBase = precoUnitario * quantidade;

    this.precoUnitario.textContent = `R$ ${precoUnitario.toFixed(2)}`;
    this.quantidadeResumo.textContent = quantidade;

    if (
      this.selectMetodoPagamento.value === "credito" &&
      this.containerParcelas.style.display !== "none"
    ) {
      this.calcularParcelas();
    } else {
      this.totalCompra.textContent = `R$ ${totalBase.toFixed(2)}`;
      this.totalCompra.style.color = "#28a745";
    }

    if (quantidade <= 0) {
      this.btnVender.disabled = true;
    } else {
      this.btnVender.disabled = false;
      this.btnVender.title = "";
    }
  }

  async handleSubmitVenda(e) {
    e.preventDefault();

    const produtoId = this.selectProduto.value;
    const quantidade = Number(this.inputQuantidade.value);
    const metodoPagamento = this.selectMetodoPagamento.value;

    if (!produtoId || quantidade <= 0 || isNaN(quantidade)) {
      this.mostrarMensagem(
        "Selecione um produto e insira uma quantidade válida.",
        "aviso"
      );
      return;
    }

    if (!metodoPagamento) {
      this.mostrarMensagem("Selecione um método de pagamento.", "aviso");
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

    const dadosVenda = {
      produtoId,
      quantidade,
      metodoPagamento,
      parcelas:
        metodoPagamento === "credito" ? parseInt(this.selectParcelas.value) : 1,
    };

    this.btnVender.disabled = true;
    this.btnVender.classList.add("btn-carregando");
    this.btnVender.textContent = "Processando...";

    try {
      const resultado = await realizarVenda(produtoId, quantidade);

      if (resultado && resultado.error) {
        this.mostrarMensagem(resultado.error, "erro");
      } else {
        this.mostrarMensagem(
          `🎉 Compra realizada com sucesso! ${this.getTextoPagamento(
            dadosVenda
          )}`,
          "sucesso"
        );

        await this.carregarProdutos();
        this.selectProduto.value = "";
        this.inputQuantidade.value = "1";
        this.selectMetodoPagamento.value = "";
        this.containerParcelas.style.display = "none";
        this.limparInfoProduto();

        setTimeout(() => this.selectProduto.focus(), 500);
      }
    } catch (error) {
      console.error("Erro ao processar venda:", error);
      this.mostrarMensagem("Erro inesperado ao processar a venda.", "erro");
    } finally {
      this.btnVender.disabled = false;
      this.btnVender.classList.remove("btn-carregando");
      this.btnVender.textContent = "Finalizar Compra";
    }
  }

  gerarConfirmacaoVenda(dados) {
    const quantidade = parseInt(this.inputQuantidade.value);
    const total = this.produtoSelecionado.preco * quantidade;

    let mensagem = `Confirmar compra?\n\n`;
    mensagem += `Produto: ${this.produtoSelecionado.nome}\n`;
    mensagem += `Quantidade: ${quantidade}\n`;
    mensagem += `Pagamento: ${this.getTextoMetodo(dados.metodoPagamento)}`;

    if (dados.metodoPagamento === "credito" && dados.parcelas > 1) {
      const numeroParcelas = dados.parcelas;
      const valorParcela = parseFloat(
        this.valorParcela.textContent.replace("R$ ", "")
      );
      const totalComJuros = this.totalComJurosCalculado;

      mensagem += `\n\n${numeroParcelas}x de R$ ${valorParcela.toFixed(2)}`;
      mensagem += `\nTotal: R$ ${totalComJuros.toFixed(2)}`;
    } else {
      mensagem += `\nTotal: R$ ${total.toFixed(2)}`;
    }

    return mensagem;
  }

  getTextoMetodo(metodo) {
    const metodos = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      debito: "Débito",
      credito: "Crédito",
    };
    return metodos[metodo] || metodo;
  }

  getTextoPagamento(dados) {
    if (dados.metodoPagamento === "credito" && dados.parcelas > 1) {
      const valorParcela = parseFloat(
        this.valorParcela.textContent.replace("R$ ", "")
      );
      return `Pagamento: ${dados.parcelas}x de R$ ${valorParcela.toFixed(
        2
      )} no crédito`;
    }
    return `Pagamento: ${this.getTextoMetodo(dados.metodoPagamento)}`;
  }

  mostrarMensagem(texto, tipo = "sucesso") {
    this.mensagem.style.display = "block";
    this.mensagem.className = `mensagem-alerta ${tipo}`;
    this.mensagem.textContent = texto;

    this.mensagem.scrollIntoView({ behavior: "smooth", block: "nearest" });

    setTimeout(() => {
      this.mensagem.style.display = "none";
    }, 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VendasController();
});

const style = document.createElement("style");
style.textContent = `
  .texto-sucesso { color: #28a745; font-weight: 600; }
  .texto-aviso { color: #ffc107; font-weight: 600; }
  .texto-erro { color: #dc3545; font-weight: 600; }
`;
document.head.appendChild(style);
