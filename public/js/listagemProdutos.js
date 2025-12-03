import { listarProduto, excluirProduto } from "./api.js";
import { abrirModalEdicao } from "./modalEditar.js";
import { formatarData } from "./utils.js";

const tabela = document.getElementById("tabelaDeProdutos");

let paginaAtual = 1;
const limitePorPagina = 6;
let totalPaginas = 1;
let listaProdutos = [];

function exibirProdutos(produtos) {
  if (!tabela) {
    console.error("Elemento #tabelaDeProdutos não encontrado!");
    return;
  }

  tabela.innerHTML = "";

  if (!produtos || produtos.length === 0) {
    tabela.innerHTML = `<tr><td colspan="6">Nenhum produto encontrado</td></tr>`;
    return;
  }

  produtos.forEach((produto) => {
    let estoqueAviso = "";
    let validadeAviso = "";

    // ⚠ Estoque
    if (produto.quantidade == 0) {
      estoqueAviso = `<span class="aviso-zero">⚠ Sem estoque</span>`;
    } else if (produto.quantidade < 10) {
      estoqueAviso = `<span class="aviso-baixo">⚠ Quantidade baixa</span>`;
    }

    // ⚠ Validade
    const hoje = new Date();
    const validadeData = new Date(produto.validade);

    const diffDias = Math.ceil((validadeData - hoje) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      validadeAviso = `<span class="aviso-vencido">⚠ Produto vencido</span>`;
    } else if (diffDias <= 7) {
      validadeAviso = `<span class="aviso-validade-proxima">⚠ Validade próxima (${diffDias} dias)</span>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.nome || "N/A"}</td>
      <td>R$ ${produto.preco ? produto.preco.toFixed(2) : "0.00"}</td>
      <td>
        ${produto.quantidade || 0}
        <p>${estoqueAviso}</p>
      </td>
      <td>
        ${formatarData(produto.validade) || "N/A"}
        <p>${validadeAviso}</p>
      </td>
      <td>
        <button class="btn-editar" data-id="${produto.id}">Editar</button>
        <button class="btn-deletar" data-id="${produto.id}">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

tabela.addEventListener("click", async function (e) {
  if (e.target.classList.contains("btn-editar")) {
    const productId = e.target.getAttribute("data-id");
    const produto = listaProdutos.produtos.find((p) => p.id == productId);
    abrirModalEdicao(produto);
  }

  if (e.target.classList.contains("btn-deletar")) {
    const productId = e.target.getAttribute("data-id");

    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    const res = await excluirProduto(productId);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Produto excluido com sucesso!");
    window.location.reload();
  }
});

function atualizarPaginacao(paginacao) {
  const navPaginacao = document.querySelector(".paginacao ul");

  if (!navPaginacao || !paginacao) return;

  paginaAtual = paginacao.paginaAtual;
  totalPaginas = paginacao.totalPaginas;

  navPaginacao.innerHTML = "";

  // Botão Anterior
  const liAnterior = document.createElement("li");
  liAnterior.innerHTML = `
    <a href="#" class="${paginaAtual === 1 ? "disabled" : ""}" data-pagina="${
    paginaAtual - 1
  }">
      Anterior
    </a>
  `;
  navPaginacao.appendChild(liAnterior);

  // Números das páginas
  const maxBotoes = 5; // Máximo de números exibidos
  let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  // Ajustar início se estiver no final
  if (fim - inicio + 1 < maxBotoes) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  for (let i = inicio; i <= fim; i++) {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="#" class="${
        i === paginaAtual ? "active" : ""
      }" data-pagina="${i}">
        ${i}
      </a>
    `;
    navPaginacao.appendChild(li);
  }

  // Botão Próximo
  const liProximo = document.createElement("li");
  liProximo.innerHTML = `
    <a href="#" class="${
      paginaAtual === totalPaginas ? "disabled" : ""
    }" data-pagina="${paginaAtual + 1}">
      Próximo
    </a>
  `;
  navPaginacao.appendChild(liProximo);

  // Adicionar eventos de clique
  adicionarEventosPaginacao();
}

function adicionarEventosPaginacao() {
  const links = document.querySelectorAll(".paginacao a[data-pagina]");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if (this.classList.contains("disabled")) return;

      const novaPagina = parseInt(this.getAttribute("data-pagina"));
      carregarProdutos(novaPagina, limitePorPagina);
    });
  });
}

async function carregarProdutos(pagina = 1, limite = 5) {
  try {
    listaProdutos = await listarProduto(pagina, limite);
    console.log(listaProdutos);

    if (listaProdutos.error) {
      console.error("Erro:", listaProdutos.error);
      exibirProdutos([]);
      return;
    }

    exibirProdutos(listaProdutos.produtos);
    atualizarPaginacao(listaProdutos.paginacao);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    exibirProdutos([]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos(1, limitePorPagina);
});
