import { listarProduto } from "./api.js";

let paginaAtual = 1;
const limitePorPagina = 7;
let totalPaginas = 1;

function exibirProdutos(produtos) {
  const tabela = document.getElementById("tabelaDeProdutos");

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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.nome || "N/A"}</td>
      <td>R$ ${produto.preco ? produto.preco.toFixed(2) : "0.00"}</td>
      <td>${produto.quantidade || 0}</td>
      <td>${produto.validade || "N/A"}</td>
      <td>
        <button class="editar">Editar</button>
        <button class="excluir">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function atualizarPaginacao(paginacao) {
  const navPaginacao = document.querySelector(".paginacao ul");

  if (!navPaginacao || !paginacao) return;

  // Atualizar variáveis globais
  paginaAtual = paginacao.paginaAtual;
  totalPaginas = paginacao.totalPaginas;

  // Limpar paginação anterior
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
    console.log(`Carregando página ${pagina}...`);

    const resultado = await listarProduto(pagina, limite);

    if (resultado.error) {
      console.error("Erro:", resultado.error);
      exibirProdutos([]);
      return;
    }

    console.log("Produtos carregados:", resultado.produtos);
    console.log("Dados paginação:", resultado.paginacao);

    exibirProdutos(resultado.produtos);
    atualizarPaginacao(resultado.paginacao);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    exibirProdutos([]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos(1, limitePorPagina);
});
