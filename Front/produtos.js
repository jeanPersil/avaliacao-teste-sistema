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
    this.produtosDisponiveis = [];
    this.init();
  }

  init() {
    this.carregarProdutos();
    this.configurarEventos();
  }

  configurarEventos() {
    this.formVenda.addEventListener("submit", (e) => this.handleSubmitVenda(e));
  }

  async carregarProdutos() {
    this.selectProduto.innerHTML =
      '<option value="">Carregando produtos...</option>';
    this.selectProduto.disabled = true;

    try {
      const produtos = await this.estoqueService.listarProdutos();
      console.log(produtos);
      this.produtosDisponiveis = produtos;

      this.selectProduto.innerHTML =
        '<option value="">Selecione um produto</option>';
      produtos.forEach((produto) => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = `${produto.nome} - R$${produto.preco.toFixed(
          2
        )} (Estoque: ${produto.quantidade})`;
        this.selectProduto.appendChild(option);
      });

      this.selectProduto.disabled = false;
    } catch {
      this.selectProduto.innerHTML =
        '<option value="">Erro ao carregar produtos</option>';
      this.selectProduto.disabled = true;
    }
  }

  async handleSubmitVenda(e) {
    e.preventDefault();

    const produtoId = this.selectProduto.value;
    const quantidade = Number(this.inputQuantidade.value);

    if (!produtoId || quantidade <= 0 || isNaN(quantidade)) {
      this.mostrarMensagem(
        "Selecione um produto e insira uma quantidade válida.",
        "warning"
      );
      return;
    }

    this.btnVender.disabled = true;
    this.btnVender.textContent = "Processando...";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        this.mostrarMensagem("Usuário não autenticado.", "danger");
        return;
      }

      const resultado = await this.vendasService.registrarVenda(
        produtoId,
        quantidade,
        user.id
      );

      this.mostrarMensagem(
        resultado.mensagem,
        resultado.sucesso ? "success" : "danger"
      );
      if (resultado.sucesso) {
        await this.carregarProdutos();
        this.inputQuantidade.value = "1";
      }
    } finally {
      this.btnVender.disabled = false;
      this.btnVender.textContent = "Vender";
    }
  }

  mostrarMensagem(texto, tipo = "success") {
    this.mensagem.style.display = "block";
    this.mensagem.className = `mt-3 alert alert-${tipo}`;
    this.mensagem.textContent = texto;
    setTimeout(() => (this.mensagem.style.display = "none"), 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VendasController();
});
